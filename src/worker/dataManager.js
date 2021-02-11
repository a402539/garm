import CONST from './const.js';
import load_tiles from './TilesLoader.js';
import Renderer from './renderer2d.js';
import {VectorTile} from '@mapbox/vector-tile';
import Protobuf from 'pbf';

const hosts = {};
let bbox = null;
let zoom = 3;
let scale = 1;
let screen;
let pixelBounds;

let abortController = new AbortController();

async function getTiles () {
	
	abortController.abort();
	abortController = new AbortController();
	const [xmin, ymin, xmax, ymax] = bbox[0];
	const response = await fetch(`/box/${xmin.toFixed(6)},${ymin.toFixed(6)},${xmax.toFixed(6)},${ymax.toFixed(6)}`, { signal: abortController.signal });
	const items = await response.json();

	// const items = [{x: 0, y: 0, z: 2}, {x: 3, y: 0, z: 2}];

	const canvas = screen.canvas;
	const ctx = canvas.getContext("2d");
	ctx.resetTransform();
	ctx.clearRect(0, 0, canvas.width, canvas.height);	
	screen.scale = scale;
	// let bounds = Request.bounds(bbox[0]);

	Promise.all(
		items.map(({x, y, z}) => {
			return fetch(`/tile/${z}/${x}/${y}`)
			.then(res => res.blob())
			.then(blob => blob.arrayBuffer())
			.then(buf => {				
				const t = {};
				const {layers} = new VectorTile(new Protobuf(buf));								
				Object.keys(layers).forEach(k => {
					const layer = layers[k];
					t[k] = { features: [], x, y, z, extent: layer.extent };
					for (let i = 0; i < layer.length; ++i) {
						const vf = layer.feature(i);							
						const coordinates = vf.loadGeometry();
						const path = new Path2D();
						coordinates[0].forEach((p, i) => {
							if (i) {
								path.lineTo(p.x, p.y);
							}
							else {
								path.moveTo(p.x, p.y);
							}
				

						});
						t[k].features.push({type: vf.type, path});							
					}					
				});				
				return t;				
			});
		})
	)
	.then(tiles => {		
		tiles.forEach(layers => {
			Object.keys(layers).forEach(k => {
				const {features, x, y, z, extent} = layers[k];
				const s = tw / extent;
				const tw = 1 << (8 + zoom - z);
				const x0 = x * tw - pixelBounds.min.x;
				const y0 = y * tw - pixelBounds.min.y;
				ctx.resetTransform();				
				ctx.transform(s, 0, 0, s, x0, y0);
				features.forEach(feature => {
					if (feature.type === 3) {															
						Renderer.render2dpbf(screen, feature.path, s, x0, y0, tw);
					}
				});
			});
		});		
		bitmapToMain(screen.id, screen.canvas);
	})
	.catch(() => {});
}

const R = 6378137;
const d = Math.PI / 180;
const max = 85.0511287798;

const chkVersion = () => {	

	getTiles();
	
	return;

    // console.log('dataManager chkVersion', hosts);
	for (let host in hosts) {
		utils.chkHost(host).then((json) => {
			if (json.error) {
				// console.warn('chkVersion:', json);
			} else {
				let hostLayers = hosts[host];
				let	ids = hostLayers.ids;
				let	res = json.res;
				if (res.Status === 'ok' && res.Result) {
					res.Result.forEach((it) => {
						let pt = ids[it.name];
						let	props = it.properties;
						if (props) {
							pt.v = props.LayerVersion;
							pt.properties = props;
							pt.geometry = it.geometry;
							if (!pt.tileAttributeIndexes) {
								pt = Object.assign(pt, utils.getTileAttributes(props));
							}
						}
						pt.hostName = host;
						pt.tiles = it.tiles;
						// pt.tiles = it.tiles.slice(0, 12);
						pt.tilesOrder = it.tilesOrder;
						pt.tilesPromise = load_tiles(pt);
						let event = new Event('tilesLoaded', {bubbles: true}); // (2)
						event.detail = pt;
						dispatchEvent(event);
					});
				} else if (res.Status === 'error') {
					console.warn('Error: ', res);
				}
			}
		});
	}
	self.postMessage({
		cmd: 'chkVersion',
		now: Date.now(),
		res: 'done'
	});
};
/*
const repaintScreenTiles = (vt, pt, clearFlag) => {
	let done = false;
	if(pt.screen) {
		Object.keys(pt.screen).forEach(tileKey => {
			let st = pt.screen[tileKey];
			if (st.coords.z === zoom) {
				st.scale = scale;
				let delta = 14 / scale;
				let bounds = st.bounds;
				const ctx = st.canvas.getContext("2d");
				ctx.resetTransform();
				ctx.transform(scale, 0, 0, -scale, -bounds.min.x * scale, bounds.max.y * scale);

				if(vt.bounds.intersectsWithDelta(bounds, delta)) {
					vt.values.forEach(it => {
						const coords = it[it.length - 1].coordinates;
						if (bounds.containsWithDelta(coords, delta)) {
							Renderer.render2d(st, coords);
							done = true;
						}
					});
				}
			// } else if (clearFlag) {
				// delete pt.screen[tileKey];
			}
		});
	} else if(pt.screenAll) {
		const ctx = pt.screenAll.canvas.getContext("2d");
		ctx.resetTransform();
		ctx.transform(scale, 0, 0, -scale, -bbox[0][0] * scale, bbox[0][3] * scale);
				pt.screenAll.scale = scale;
					vt.values.forEach(it => {
						const coords = it[it.length - 1].coordinates;
						// if (bounds.containsWithDelta(coords, delta)) {
							Renderer.render2d(pt.screenAll, coords);
							done = true;
						// }
					});
	}
	return done;
};
*/

const recheckVectorTiles = (pt, clearFlag) => {
	let done = false;
	if(pt.tilesPromise) {
		if(pt.screenAll) {
			const canvas = pt.screenAll.canvas;
			const ctx = canvas.getContext("2d");
			ctx.resetTransform();
			ctx.clearRect(0, 0, canvas.width, canvas.height);
			ctx.transform(scale, 0, 0, -scale, -bbox[0][0] * scale, bbox[0][3] * scale);
			pt.screenAll.scale = scale;
			let delta = 14 / scale;
			let bounds = Request.bounds(bbox[0]);
			// let bounds = Request.bounds([[bbox[0][0], bbox[0][1]], [bbox[0][2], bbox[0][3]]]);
			console.log('pt.tilesPromise', Object.keys(pt.tilesPromise).length);
			
			Promise.all(Object.values(pt.tilesPromise)).then((res) => {
				res.forEach(vt => {
					if (bounds.intersectsWithDelta(vt.bounds, delta)) {
						vt.values.forEach(it => {
							const coords = it[it.length - 1].coordinates;
							if (bounds.containsWithDelta(coords, delta)) {
								Renderer.render2d(pt.screenAll, coords);
							}
						});
					}
				});
			}).then((res) => {
				bitmapToMain(pt.screenAll.id, canvas);
			});
			done = true;
		// } else {
			// Promise.all(Object.values(pt.tilesPromise)).then((res) => {
				// res.forEach(vt => {
					// done = repaintScreenTiles(vt, pt, clearFlag);
				// });
			// });
		}
	}
	if(!done) {
		// Renderer.render2dEmpty(st);
	}
	// self.postMessage({
		// tileKey,
		// layerId: pt.id,
		// cmd: 'render',
		// res: 'done'
	// });
};

const bitmapToMain = (layerId, canvas) => {
	var imageData = canvas.transferToImageBitmap();
	self.postMessage({
		cmd: 'rendered',
		layerId: layerId,
		bitmap: imageData
	}, [ imageData ]);
};

const redrawScreen = (clearFlag) => {
	for (let host in hosts) {
		let hostLayers = hosts[host];
		let	ids = hostLayers.ids;
		for (let id in ids) {
			let pt = ids[id];
			recheckVectorTiles(pt, clearFlag);
		}
	}
};

addEventListener('tilesLoaded', redrawScreen);

onmessage = function(evt) {    
    // console.log('dataManager', evt.data);
	const data = evt.data || {};
	const {cmd} = data;
	// let worker: Worker;
	switch(cmd) {
		case 'addSource':
			utils.addSource(data);
			break;
		case 'addLayer':
			data.worker = new Worker("renderer.js");
			utils.addSource(data);			
			break;
		case 'drawScreen':
			let id1 = data.id;
			if (id1) {
				let hostName = data.hostName || CONST.HOST;
				if (hosts[hostName]) {
					let it = hosts[hostName].ids[id1];
					it.screenAll = {
						canvas: new OffscreenCanvas(data.width, data.height),
						id: id1,
					};
					screen = it.screenAll;
					redrawScreen(true);
				}
			}
			break;
		case 'drawTile':
			let id = data.id;
			const {x, y, z} = data.coords;
			const tileKey = [x,y,z].join(':');

			if (id) {
				let hostName = data.hostName || CONST.HOST;
				if (hosts[hostName]) {
					let it = hosts[hostName].ids[id];
					if (!it.screen) { it.screen = {}; }
					let bounds = Request.getTileBounds(data.coords, 0);
					it.screen[tileKey] = {
						bounds: bounds,
						coords: data.coords,
						canvas: data.canvas
					};
				}
			}
			break;
		case 'moveend':
			// console.log('moveend', data);
			zoom = data.zoom;
			scale = data.scale;
			bbox = data.bbox;
			pixelBounds = data.pixelBounds;
			redrawScreen(true);
			break;
		default:
			console.warn('Warning: Bad command ', data);
			break;
	}

    requestAnimationFrame(chkVersion);     
};
