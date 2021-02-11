import Renderer from './renderer2d.js';
import {VectorTile} from '@mapbox/vector-tile';
import Protobuf from 'pbf';

let canvas;
let abortController;

async function getBoxTiles(signal, bbox) {
	const [xmin, ymin, xmax, ymax] = bbox;
	const response = await fetch(`/box/${[xmin,ymin,xmax,ymax].map(v => v.toFixed(6)).join(',')}`, { signal });
	return response.json();
}

async function collectTiles (signal, boxes) {	
	try {
		const parts = await Promise.all(boxes.map(box => getBoxTiles(signal, box)));
		return parts.reduce((a,p) => a.concat(p), []);
	}
	catch {
		return [];
	}
}

async function getTiles (zoom, bbox, bounds) {	
	if (abortController) {
		abortController.abort();
	}
	abortController = new AbortController();	
	const items = await collectTiles(abortController.signal, bbox);	

	const ctx = canvas.getContext("2d");
	ctx.resetTransform();
	ctx.clearRect(0, 0, canvas.width, canvas.height);	

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
				const tw = 1 << (8 + zoom - z);
				const x0 = x * tw - bounds.min.x;
				const y0 = y * tw - bounds.min.y;
				ctx.resetTransform();
				const sc = tw / extent;
				// console.log('offsetx:', x, y, z, extent, x0, y0, tw, sc);
				ctx.transform(sc, 0, 0, sc, x0, y0);
				features.forEach(feature => {
					if (feature.type === 3) {															
						Renderer.render2dpbf(canvas, feature.path);
					}
				});
			});
		});		
		bitmapToMain(canvas);
	})
	.catch(() => {});
}

const bitmapToMain = canvas => {
	var imageData = canvas.transferToImageBitmap();
	self.postMessage({
		cmd: 'rendered',
		bitmap: imageData
	}, [ imageData ]);
};

addEventListener('tilesLoaded', getTiles);

onmessage = function(evt) {    
	const data = evt.data || {};
	const {cmd, zoom, bbox, bounds, width, height} = data;	
	switch(cmd) {
		case 'drawScreen':
			canvas = new OffscreenCanvas(width, height);
			break;
		case 'moveend':						
			getTiles(zoom, bbox, bounds);
			break;
		default:
			console.warn('Warning: Bad command ', data);
			break;
	}
};
