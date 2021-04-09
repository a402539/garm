import Renderer from './renderer.js';
import Webgl from '../WebGL.js';
import {VectorTile} from '@mapbox/vector-tile';
import Protobuf from 'pbf';
import earcut from 'earcut';

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

async function getTiles (zoom, bbox, bounds) {	
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
		let rt = 0;
		let last = tiles.length - 1;
		tiles.forEach(({z, x, y}) => {		
			const tKey = `${x}:${y}:${z}`;
			fetch(`/tile/${layerId}/${z}/${x}/${y}`, {signal: abortController.signal})
				.then(res => res.blob())
				.then(blob => blob.arrayBuffer())
				.then(buf => {
					self.postMessage({
						cmd: 'rendered',
						layerId,
						last: rt === last,
						rt: rt,
						z, x, y,
						bitmap: buf
					}, [ buf ]);
					rt++;
				});
		});
		self.postMessage({ cmd: 'rendered', layerId });
	});
}

onmessage = function(evt) {    
	const data = evt.data || {};
	const {cmd, layerId, zoom, bbox, bounds} = data;
	// console.warn(' command ', data);
	switch(cmd) {
		case 'addLayer':
			visibleLayers[layerId] = {};
			getTiles(zoom, bbox, bounds);
			break;
		case 'removeLayer':
			delete visibleLayers[layerId];
			if (Object.keys(visibleLayers).length) {
				getTiles(zoom, bbox, bounds);
			}
			break;
		case 'moveend':
			getTiles(zoom, bbox, bounds);
			break;
		default:
			console.warn('Warning: Bad command ', data);
			break;
	}
};
