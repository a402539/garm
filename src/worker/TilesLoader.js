import Request from './Request.js';

const TILE_PREFIX = 'gmxAPI._vectorTileReceiver(';

export default function (pars) {
	pars = pars || {};
	if (!pars.signals) { pars.signals = {}; }
	if (!pars.tilesPromise) { pars.tilesPromise = {}; }
	
	// return new Promise((resolve) => {
		let tilesOrder = pars.tilesOrder,
			pb = pars.tiles,
			tilesPromise = {};
		for (let i = 0, len = pb.length; i < len; i += tilesOrder.length) {
			let arr = pb.slice(i, i + tilesOrder.length),
				tkey = arr.join('_'),
				tHash = tilesOrder.reduce((p, c, j) => { p[c] = arr[j]; return p; }, {});

			if (pars.tilesPromise[tkey]) {
				tilesPromise[tkey] = pars.tilesPromise[tkey];
			} else {
				tilesPromise[tkey] = Request.getTileJson({
					url: '//' + pars.hostName + '/TileSender.ashx',
					options: Request.chkSignal(tkey, pars.signals, {}),
					paramsArr: [tHash, {
						r: 'j',
						ModeKey: 'tile',
						LayerName: pars.id,
					}]
				}).then(json => {
					delete pars.signals[tkey];
					if (typeof(json) === 'string') {
						if (json.substr(0, TILE_PREFIX.length) === TILE_PREFIX) {
							json = json.replace(TILE_PREFIX, '');
							json = JSON.parse(json.substr(0, json.length -1));
						}
					}
					json.bounds = Request.bounds([[json.bbox[0], json.bbox[1]], [json.bbox[2], json.bbox[3]]]);
					json.boundsVtile = Request.getTileBounds(json, 0);
					return json;
				})
				.catch(err => {
					console.warn('Bad vector tile:', tkey, err);
				})
			}
		}
		Object.keys(pars.signals).forEach(k => {
			if (!tilesPromise[k]) {
				pars.signals[k].abort();
				delete pars.signals[k];
			}
		});
		// pars.tilesPromise = tilesPromise;
		return tilesPromise;
		// return out;
		// Promise.all(arr).then((out) => {
			// resolve(out);
		// });
	// });
/*
*/
};