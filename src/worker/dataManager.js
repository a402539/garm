import CONST from './const.js';
import Request from './Request.js';
import load_tiles from './TilesLoader.js';
import Renderer from './renderer2d.js';
import {VectorTile} from '@mapbox/vector-tile';
import Protobuf from 'pbf';

const hosts = {};
let bbox = null;
let zoom = 3;
let scale = 1;
let screen;
let origin;
let pixelBounds;

let intervalID;
let timeoutID;

const utils = {
	now: function() {
		if (timeoutID) { clearTimeout(timeoutID); }
		timeoutID = setTimeout(chkVersion, 0);
    },

    stop: function() {
		// console.log('stop:', intervalID, CONST.DELAY);
        if (intervalID) { clearInterval(intervalID); }
        intervalID = null;
    },

    start: function(msec) {
		// console.log('start:', intervalID, msec);
        utils.stop();
        intervalID = setInterval(chkVersion, msec || CONST.DELAY);
    },
	addSource: (attr) => {
		let id = attr.id || attr.layerId;
		if (id) {
			let hostName = attr.hostName || CONST.HOST;
			if (!hosts[hostName]) {
				hosts[hostName] = {ids: {}, signals: {}};
				if (attr.apiKey) {
					hosts[hostName].apiKeyPromise = Request.getJson({
						url: '//' + hostName + '/ApiKey.ashx',
						paramsArr: [Request.COMPARS, {
							Key: attr.apiKey
						}]
					})
                    .then((json) => {
						// console.log('/ApiKey.ashx', json);
						let res = json.res;
						if (res.Status === 'ok' && res.Result) {
							hosts[hostName].Key = res.Result.Key;
							return hosts[hostName].Key;
						}
					});
				}

			}
			hosts[hostName].ids[id] = attr;
			if (!intervalID) { utils.start(0); }
			utils.now();
		} else {
			console.warn('Warning: Specify source `id` and `hostName`', attr);
		}
    },
	removeSource: (attr) => {
		attr = attr || {};

		let id = attr.id;
		if (id) {
			let hostName = attr.hostName || CONST.HOST;
			if (hosts[hostName]) {
				let pt = hosts[hostName].ids[id];
	console.log('signals:', pt.signals, pt);
				if (pt.signals) {
					Object.values(pt.signals).forEach((it) => {
						it.abort();
					});
				}
				delete hosts[hostName].ids[id];
				if (Object.keys(hosts[hostName].ids).length === 0) { delete hosts[hostName]; }
				if (Object.keys(hosts).length === 0) { utils.stop(); }
			}
		} else {
			console.warn('Warning: Specify layer id and hostName', attr);
		}
    },
    getTileAttributes: function(prop) {
        let tileAttributeIndexes = {};
        let tileAttributeTypes = {};
        if (prop.attributes) {
            let attrs = prop.attributes,
                attrTypes = prop.attrTypes || null;
            if (prop.identityField) { tileAttributeIndexes[prop.identityField] = 0; }
            for (let a = 0; a < attrs.length; a++) {
                let key = attrs[a];
                tileAttributeIndexes[key] = a + 1;
                tileAttributeTypes[key] = attrTypes ? attrTypes[a] : 'string';
            }
        }
        return {
            tileAttributeTypes: tileAttributeTypes,
            tileAttributeIndexes: tileAttributeIndexes
        };
    },
	chkHost: (hostName) => {
		const hostLayers = hosts[hostName];
		const ids = hostLayers.ids;
		const arr = [];

		for (let name in ids) {
			let pt = ids[name];
			let	pars = { Name: name, Version: 'v' in pt ? pt.v : -1 };
			if (pt.dateBegin) {
				pars.dateBegin = pt.dateBegin;
			}
			if (pt.dateEnd) {
				pars.dateEnd = pt.dateEnd;
			}
			arr.push(pars);
		}

		return Request.getJson({
			url: '//' + hostName + CONST.SCRIPTS.CheckVersion,
			options: Request.chkSignal('chkVersion', hostLayers.signals, undefined),
			paramsArr: [Request.COMPARS, {
				layers: JSON.stringify(arr),
				bboxes: JSON.stringify(bbox || [CONST.WORLDBBOX]),
				// generalizedTiles: false,
				zoom: zoom
			}]
		}).then(json => {
			delete hostLayers.signals.chkVersion;
			return json;
		})
		.catch(err => {
			console.error(err);
			// resolve('');
		});
	},
};

let abortController = new AbortController();

async function getTiles () {
	
	abortController.abort();
	abortController = new AbortController();
	const [xmin, ymin, xmax, ymax] = bbox[0];
	const response = await fetch(`/box/${xmin.toFixed(6)},${ymin.toFixed(6)},${xmax.toFixed(6)},${ymax.toFixed(6)}`, { signal: abortController.signal });
	const items = await response.json();

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
						t[k].features.push({type: vf.type, coordinates});							
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
				// console.log('offsetx:', x0 - min.x, 'offsety:', y0 - min.y);
				// ctx.transform(scale, 0, 0, -scale, -bbox[0][0] * scale, bbox[0][3] * scale);
				// features.forEach(feature => {
				// 	if (feature.type === 3) {															
				// 		Renderer.render2dpbf(screen, feature.coordinates);
				// 	}
				// });
				// bitmapToMain(screen.id, screen.canvas);
			});						
		});		
	})
	.catch(() => {});
}

const R = 6378137;
const d = Math.PI / 180;
const max = 85.0511287798;

function ringToMerc(ring) {
	return ring.map(coord => {
		var sin = Math.sin(Math.max(Math.min(max, coord[1]), -max) * d);
		return [
			R * coord[0] * d,
			R * Math.log((1 + sin) / (1 - sin)) / 2
		];

	})
}

function geojson([x, y, z], layer) {
    if (!layer) return;
    const features = [];
    for (let i = 0; i < layer.length; ++i) {
        features.push (layer.feature(i).toGeoJSON(x, y, z));        
    }
    return features;
}

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
			origin = data.origin;
			pixelBounds = data.bounds;
			redrawScreen(true);
			break;
		default:
			console.warn('Warning: Bad command ', data);
			break;
	}

    requestAnimationFrame(chkVersion);     
};
