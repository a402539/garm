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
				scale = Math.pow(2, zoom - z);
				const tw = 256 * scale;
				const x0 = x * tw - pixelBounds.min.x;
				const y0 = y * tw - pixelBounds.min.y;
				ctx.resetTransform();
				const sc = tw / extent;
				console.log('offsetx:', x, y, z, extent, x0, y0, tw, sc);

				ctx.transform(sc, 0, 0, sc, x0, y0);
				features.forEach(feature => {
					if (feature.type === 3) {															
						Renderer.render2dpbf(screen, feature.path);
					}
				});
			});						
		});		
		bitmapToMain(screen.canvas);
	})
	.catch(() => {});
}

const bitmapToMain = (canvas) => {
	var imageData = canvas.transferToImageBitmap();
	self.postMessage({
		cmd: 'rendered',
		bitmap: imageData
	}, [ imageData ]);
};

addEventListener('tilesLoaded', getTiles);

onmessage = function(evt) {    
    // console.log('dataManager', evt.data);
	const data = evt.data || {};
	const {cmd} = data;
	// let worker: Worker;
	switch(cmd) {
		case 'drawScreen':
			screen = {
				canvas: new OffscreenCanvas(data.width, data.height)
			};
			break;
		case 'moveend':
			// console.log('moveend', data);
			zoom = data.zoom;
			scale = data.scale;
			bbox = data.bbox;
			pixelBounds = data.pixelBounds;
			getTiles();
			break;
		default:
			console.warn('Warning: Bad command ', data);
			break;
	}
};
