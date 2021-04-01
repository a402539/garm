import Renderer from './renderer.js';
import {VectorTile} from '@mapbox/vector-tile';
import Protobuf from 'pbf';

self.document = {
  createElement(type) {
    if (type === 'canvas') {
      return new OffscreenCanvas(0, 0);
    } else {
      console.log('CreateElement called with type = ', type);

      return {
        style: {},
      };
    }
  },

  addEventListener() { },
};

self.window = {
  console: self.console,
  addEventListener() { },
  navigator: {},
  document: self.document,
  removeEventListener: function () { },
  WebGLRenderingContext: {}
};

importScripts(
  'pixiv5_worker.js'
);

let canvas;
let abortController;
let visibleLayers = {};
let cwidth, cheight;
let renderNum = 0;
let moveendNum = 0;
let appPixi;

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

function getTilePromise (layerId, z, x, y, pixi) {
	return fetch(`/tile/${layerId}/${z}/${x}/${y}`)
	.then(res => res.blob())
	.then(blob => blob.arrayBuffer())
	.then(buf => {				
		const t = {x, y, z, layers: {}, extent: 0};
		const pathRes = new Path2D();
		const {layers} = new VectorTile(new Protobuf(buf));								
		Object.keys(layers).forEach(k => {
			const layer = layers[k];
			const path = new Path2D();
			if (t.extent !== layer.extent) {
				// console.log('t.extent = layer.extent:', t.extent, layer.extent);
				t.extent = layer.extent;
			}
			t.layers[k] = { features: [], x, y, z, extent: layer.extent, layerId, path };
			for (let i = 0; i < layer.length; ++i) {
				const vf = layer.feature(i);							
				const properties = vf.properties;
				const coordinates = vf.loadGeometry();
				const path1 = new Path2D();
				let grp;
				if (pixi) {
					grp = new PIXI.Graphics();
					if (vf.type !== 2) {
						grp.beginFill(0xFF0000, 0.01);
					}
					grp.lineStyle(2, 0x0000FF, 1);
					coordinates[0].forEach((p, i) => {
						if (i) {
							grp.lineTo(p.x, p.y);
						}
						else {
							if (vf.type === 1) {
								grp.drawCircle(p.x, p.y, 5);
							} else {
								grp.moveTo(p.x, p.y);
							}
						}
					});
					if (vf.type !== 2) {
						grp.closePath();
						grp.endFill();
					}
				} else {
					coordinates[0].forEach((p, i) => {
						if (i) {
							path1.lineTo(p.x, p.y);
						}
						else {
							if (vf.type === 1) {
								path1.arc(p.x, p.y, 5, 0, 2 * Math.PI);
							} else {
								path1.moveTo(p.x, p.y);
							}
						}
					});
					// path1.closePath();
					path.addPath(path1);
				}
				t.layers[k].features.push({type: vf.type, properties, coordinates, path: path1, graphics: grp});
			}					
		});				
		return t;
	});

}

async function getTiles (zoom, bbox, bounds) {	
	moveendNum++;
	if (abortController) {
		abortController.abort();
	}
	abortController = new AbortController();	
	const layersArr = await getBoxTiles(abortController.signal, bbox);
	layersArr.forEach(layerItem => {
		const {layerId, tiles} = layerItem;
		if (!layerId) {
			return;
		}
		const layerData = visibleLayers[layerId];
		const promises = layerData.promises || {};
		tiles.forEach(({z, x, y}) => {		
			const tKey = `${x}:${y}:${z}`;
			if (!promises[tKey]) {
				promises[tKey] = getTilePromise(layerId, z, x, y, layerData.appPixi);
			}
		});
		layerData.promises = promises;
		let tm = Date.now();
		let cnt = 0;
		let ctx;
		if (layerData.appPixi) {
			layerData.appPixi.stage.removeChildren();
			ctx = new PIXI.Graphics();
		} else {
			const canvas = layerData.canvas;
			ctx = canvas.getContext("2d");
			ctx.resetTransform();
			ctx.clearRect(0, 0, cwidth, cheight);
			ctx.strokeStyle = 'blue';
			ctx.fillStyle = 'rgba(255, 0, 0, 0.1)';
		}

		// Promise.all(Object.values(promises))
			// promise.then(tiles => {		
				// tiles.forEach(tile => {
		Object.values(promises).forEach(promise => {
			promise.then(tile => {		
				// if (renderNum === moveendNum) {
					const {layers, x, y, z, extent, path1} = tile;
					const tw = 1 << (8 + zoom - z);
					let x0 = x * tw - bounds.min.x;
					if (x0 + tw < 0) {
						x0 += Math.pow(2, z) * tw;
					}
					const y0 = y * tw - bounds.min.y;
					const sc = tw / extent;
					if (!layerData.appPixi) {
						ctx.resetTransform();
						ctx.transform(sc, 0, 0, sc, x0, y0);
						ctx.lineWidth = 1 / sc;
					} else {
								// ctx.position.x = x0;
								// ctx.position.y = y0;
								// ctx.scale.x = sc;
								// ctx.scale.y = sc;
					}
					Object.keys(layers).forEach(k => {
						const {features} = layers[k];
						features.forEach(feature => {
							if (layerData.appPixi) {
								const graphics = feature.graphics;
								graphics.position.x = x0;
								graphics.position.y = y0;
								graphics.scale.x = sc;
								graphics.scale.y = sc;
			layerData.appPixi.stage.addChild(graphics);
								// Renderer.renderPixi(ctx, feature);
							} else {
								Renderer.renderPath(ctx, feature);
							}
							cnt++;
						});
					});
		
					console.log('tile tm:', x, y, z, Object.keys(promises).length, cnt, Date.now() - tm);
					// bitmapToMain(layerId, canvas);
					// console.log('tm:', Date.now() - tm);
				// } else {
					// console.log('----- отмена rendering:', renderNum, moveendNum, layerId, x, y, z);
				// }
				
			})
			.catch(() => {});
		});
		// if (layerData.appPixi) {
			// layerData.appPixi.stage.addChild(ctx);
		// }
		renderNum++;
		console.log('layer tm:', renderNum, Object.keys(promises).length, cnt, Date.now() - tm);
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
			break;
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
	switch(cmd) {
		case 'addLayer':
			visibleLayers[layerId] = {
				canvas
			};
			if (webGL === 'pixi') {
				visibleLayers[layerId].appPixi = new PIXI.Application({
					width: width,
					height: height,
					view: canvas,
					transparent: true,
					antialias: true
				});
			}
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
			break;
		case 'moveend':
			getTiles(zoom, bbox, bounds);
			break;
		case 'eventCheck':
			//chkEvent(data);
			break;
		default:
			console.warn('Warning: Bad command ', data);
			break;
	}
};
