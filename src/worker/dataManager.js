import Renderer from './renderer.js';
import {VectorTile} from '@mapbox/vector-tile';
import Protobuf from 'pbf';

let canvas;
let abortController;
let visibleLayers = {};

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

function getTilePromise ({layerId, z, x, y}) {
	return fetch(`/tile/${layerId}/${z}/${x}/${y}`)
	.then(res => res.blob())
	.then(blob => blob.arrayBuffer())
	.then(buf => {				
		const t = {};
		const {layers} = new VectorTile(new Protobuf(buf));								
		Object.keys(layers).forEach(k => {
			const layer = layers[k];
			t[k] = { features: [], x, y, z, extent: layer.extent, layerId };
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

}

async function getTiles (zoom, bbox, bounds) {	
	if (abortController) {
		abortController.abort();
	}
	abortController = new AbortController();	
	const boxTiles = await getBoxTiles(abortController.signal, bbox);	
	const promisesByLayers = {};
	Object.keys(boxTiles).forEach(layerId => {
		const it = boxTiles[layerId];
		let data = promisesByLayers[layerId] || {};
		let arr = data.promises || [];
		arr.push(getTilePromise(it));
		data.promises = arr;
		let tiles = data.tiles || [];
		tiles.push(it);
		data.tiles = tiles;
		promisesByLayers[it.layerId] = data;
	});
	Object.keys(promisesByLayers).forEach(layerId => {
		const pt = promisesByLayers[layerId];
		const promises = pt.promises;
		const ctx = canvas.getContext("2d");
		ctx.resetTransform();
		ctx.clearRect(0, 0, canvas.width, canvas.height);	
	
		Promise.all(promises)
		.then(tiles => {		
			tiles.forEach(layers => {
				Object.keys(layers).forEach(k => {
					const {features, x, y, z, extent} = layers[k];				
					const tw = 1 << (8 + zoom - z);
					let x0 = x * tw - bounds.min.x;
					if (x0 + tw < 0) {
						x0 += Math.pow(2, z) * tw;
					}
					const y0 = y * tw - bounds.min.y;
					ctx.resetTransform();
					const sc = tw / extent;				
					ctx.transform(sc, 0, 0, sc, x0, y0);
					features.forEach(feature => {
						if (feature.type === 3) {															
							Renderer.renderPath(ctx, feature.path);
						}
					});
				});
			});		
			bitmapToMain(layerId, canvas);
		})
		.catch(() => {});
		
	});
}

const bitmapToMain = (layerId, canvas) => {
	var imageData = canvas.transferToImageBitmap();
	self.postMessage({
		cmd: 'rendered',
		layerId,
		bitmap: imageData
	}, [ imageData ]);
};

addEventListener('tilesLoaded', getTiles);

onmessage = function(evt) {    
	const data = evt.data || {};
	const {cmd, layerId, zoom, bbox, bounds, width, height} = data;
	switch(cmd) {
		case 'addLayer':
			visibleLayers[layerId] = true;
			getTiles(zoom, bbox, bounds);
			break;
		case 'removeLayer':
			delete visibleLayers[layerId];
			if (Object.keys(visibleLayers).length) {
				getTiles(zoom, bbox, bounds);
			}
			break;
		case 'drawScreen':
			canvas = new OffscreenCanvas(width, height);
			break;
		case 'moveend':
			if (Object.keys(visibleLayers).length) {
				getTiles(zoom, bbox, bounds);
			}
			break;
		default:
			console.warn('Warning: Bad command ', data);
			break;
	}
};
