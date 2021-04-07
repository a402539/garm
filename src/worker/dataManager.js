import Renderer from './renderer.js';
import Webgl from '../WebGL.js';
import {VectorTile} from '@mapbox/vector-tile';
import Protobuf from 'pbf';
import earcut from 'earcut';

let canvas;
let abortController;
let visibleLayers = {};
let cwidth, cheight;
let renderNum = 0;
let moveendNum = 0;

async function getBoxTiles(signal, bbox) {
	const [xmin, ymin, xmax, ymax] = bbox;
	const response = await fetch('/box', {
		signal,
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({
			xmin, ymin,
			xmax, ymax,
			layers: Object.keys(visibleLayers),
		}),
	});
	return response.json();
}

function isValidArray(x) {
	return /Int(8|16|32)Array|Uint(8|8Clamped|16|32)Array|Float(32|64)Array|ArrayBuffer/gi.test({}.toString.call(x))
}
function concatArrayBuffer (arr) {
	return arr.reduce(function(cbuf, buf, i) {
		if (i === 0) return cbuf
		if (!isValidArray(buf)) return cbuf

		var tmp = new Uint8Array(cbuf.byteLength + buf.byteLength)
		tmp.set(new Uint8Array(cbuf), 0)
		tmp.set(new Uint8Array(buf), cbuf.byteLength)

		return tmp.buffer
	}, arr[0]);
}

// function concatFloat32Array (verts1, verts2) {
	// var verts3 = new Float32Array(verts1.length + verts2.length);
	// verts3.set(verts1);
	// verts3.set(verts2, verts1.length);
	// return verts3;
// }



async function getTiles (zoom, bbox, bounds) {	
	if (abortController) {
		abortController.abort();
		// moveendNum--;
	}
	abortController = new AbortController();	
	moveendNum++;
	const layersArr = await getBoxTiles(abortController.signal, bbox);
	console.log(layersArr);
	return;
	layersArr.forEach(layerItem => {		
	// self.postMessage({
		// cmd: 'tiles',
		// tiles
	// });

		const layerData = visibleLayers[layerId];
		const canvas = layerData.canvas;
		if (layerData.webGL && !layerData.glHash) {
			layerData.glHash = Webgl.init(canvas);
			// layerData.glHash = initWebGL(canvas);
		}
		// const glHash = layerData.glHash;
		const gl = Webgl.gl;
		// layerData.glHash.gl.clear(layerData.glHash.gl.COLOR_BUFFER_BIT);
		layerData.tm = Date.now();
		let rt = 0;
/*
		tiles.forEach(({z, x, y}, i) => {		
			const tKey = `${x}:${y}:${z}`;
			fetch(`/tile/${layerId}/${z}/${x}/${y}`)
				.then(res => res.blob())
				.then(blob => blob.arrayBuffer())
				.then(buf => {
					let	verts = new Float32Array(buf);
					// requestAnimationFrame(ev => {
					// layerData.glHash.verts = verts;
					if (rt === 0) {
					// requestAnimationFrame(ev => {
						// layerData.glHash.verts = new Float32Array(buf);
						Webgl.redraw(zoom, bounds, 0, verts);
					// });
					} else {
						Webgl.drawTriangles(verts);
						// setVert(glHash);
	// const vertBuffer = gl.createBuffer();
	// gl.bindBuffer(gl.ARRAY_BUFFER, vertBuffer);
	// gl.bufferData(gl.ARRAY_BUFFER, verts, gl.STATIC_DRAW);
						// gl.drawArrays(gl.TRIANGLES, 0, verts.length / 5);
					}
						rt++;
// console.log('arr1:', rt, tKey, renderNum, moveendNum, layerData.glHash.verts.length, Date.now() - layerData.tm);
console.log('arr1:', rt, tKey, renderNum, moveendNum, verts.length, Date.now() - layerData.tm);
					// });
				});
		});
*/

		let controller = new AbortController();
		const promise = (z, x, y, nm) => {		
			const tKey = `${x}:${y}:${z}`;
			return fetch(`/tile/${layerId}/${z}/${x}/${y}`, {signal: controller.signal})
				.then(res => {
					if (nm !== moveendNum) {
						controller.abort();
						return null;
					}
					return res;
				})
				.then(res => res.blob())
				.then(blob => blob.arrayBuffer())
				.then(buf => {
					return { buf, nm }
				})
				.catch((error) => {
					console.log('error:', nm, moveendNum, error);
					 // Do something with the error object
				})
   };
		const promises = tiles.map(({z, x, y}) => {		
			return promise(z, x, y, moveendNum);
		});
		Promise.all(promises).then(items => {
			if (items && items.length && items[0].nm !== moveendNum) {
				return;
			}
			const arr = items.map(it => it.buf);
			const arrayBuffer = concatArrayBuffer(arr);
			var verts = new Float32Array(arrayBuffer);
			Webgl.redraw(zoom, bounds, 0, verts);
			console.log('arr1:', renderNum, moveendNum, items.length, verts.length, Date.now() - layerData.tm);
		});
		renderNum++;
		// console.log('layer tm:', renderNum, cnt, Date.now() - tm);
		bitmapToMain(layerId, canvas);

	});
}

const getItemsByPoint = (layerData, p, zoom) => {
	if (!canvas || canvas.width !== cwidth || canvas.height !== cheight) {
		canvas = new OffscreenCanvas(cwidth, cheight);
	}
	const ctx = canvas.getContext("2d");
	const promises = Object.values(layerData.promises) || [];
	return Promise.all(promises)
	.then(tiles => {		
		let items = [];
		let tm = Date.now();
		tiles.forEach(it => {
			const {layers, x, y, z, extent} = it;
			const tw = 1 << (8 + zoom - z);
			const y0 = y * tw;
			if (p.y < y0 || p.y > y0 + tw) {
				return;
			}
			let x0 = x * tw;
			if (p.x < x0 || p.x > x0 + tw) {
				return;
			}

			const sc = tw / extent;
			const xx = (p.x - x0) / sc;
			const yy = (p.y - y0) / sc;
			Object.keys(layers).forEach(k => {
				const {features} = layers[k];
				features.forEach(feature => {
					if (feature.path) {
						if (feature.type === 3 || feature.type === 2) {
							if (ctx.isPointInPath(feature.path, xx, yy)) {
								items.push(feature.properties);
							}
						}
					}
				});
			});
		});
		return items.length ? items : null;
	});
}

const chkEvent = ev => {
	switch(ev.type) {
		case 'mousemove':
			let items;
			const point = ev.containerPoint;
			for (let layerId in visibleLayers) {
				const layerData = visibleLayers[layerId];
				const canvas = layerData.canvas;

				const ctx = canvas.getContext('2d');
				const p = ctx.getImageData(point.x, point.y, 1, 1).data;
				if (p[3]) {
					getItemsByPoint(layerData, ev.mapMousePos, ev.zoom).then(items => {
						self.postMessage({
							cmd: 'mouseover',
							layerId,
							items
						});
					});
				} else {
					self.postMessage({
						cmd: 'mouseover',
						layerId
					});
				}
			}
			break;
		default:
			console.warn('Warning: Bad event ', ev);
			break;
	}
}

const bitmapToMain = (layerId, canvas) => {
	// var imageData = canvas.transferToImageBitmap();
	// self.postMessage({
		// cmd: 'rendered',
		// layerId,
		// bitmap: imageData
	// }, [ imageData ]);
	self.postMessage({
		cmd: 'rendered',
		layerId
	});
};

addEventListener('tilesLoaded', getTiles);

onmessage = function(evt) {    
	const data = evt.data || {};
	const {cmd, layerId, zoom, bbox, bounds, width, height, canvas, webGL} = data;
			// console.warn(' command ', data);
	switch(cmd) {
		case 'addLayer':
			visibleLayers[layerId] = {
				canvas
			};
			visibleLayers[layerId].webGL = webGL;
			getTiles(zoom, bbox, bounds);
			break;
		case 'removeLayer':
			delete visibleLayers[layerId];
			if (Object.keys(visibleLayers).length) {
				getTiles(zoom, bbox, bounds);
			}
			break;
		case 'drawScreen':
			cwidth = width;
			cheight = height;
			getTiles(zoom, bbox, bounds);
			break;
		case 'moveend':
			// getTiles(zoom, bbox, bounds);
			break;
		case 'eventCheck':
			// chkEvent(data);
			break;
		default:
			console.warn('Warning: Bad command ', data);
			break;
	}
};
