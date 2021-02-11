import './index.css';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import CanvasLayer from './CanvasLayer.js';

function getNormalizeBounds(screenBounds) { // get bounds array from -180 180 lng
    const northWest = screenBounds.getNorthWest();
    const southEast = screenBounds.getSouthEast();
    let minX = northWest.lng, maxX = southEast.lng;
    const w = (maxX - minX) / 2;
    let minX1 = 0;
    let maxX1 = 0;
    const out = [];

    if (w >= 180) {
        minX = -180; maxX = 180;
    }
    else if (maxX > 180 || minX < -180) {
        let center = ((maxX + minX) / 2) % 360;
        if (center > 180) {
            center -= 360;
        }
        else if (center < -180) {
            center += 360;
        }
        minX = center - w;
        maxX = center + w;
        if (minX < -180) {
            minX1 = minX + 360;
            maxX1 = 180;
            minX = -180;
        }
        else if (maxX > 180) {
            minX1 = -180;
            maxX1 = maxX - 360;
            maxX = 180;
        }
    }
    let m1 = L.Projection.Mercator.project(L.latLng([southEast.lat, minX]));
    let m2 = L.Projection.Mercator.project(L.latLng([northWest.lat, maxX]));
    out.push([m1.x, m1.y, m2.x, m2.y]);

    if (minX1) {
        let m11 = L.Projection.Mercator.project(L.latLng([southEast.lat, minX1]));
        let m12 = L.Projection.Mercator.project(L.latLng([northWest.lat, maxX1]));
        out.push([m11.x, m11.y, m12.x, m12.y]);
    }
    return out;
};

window.addEventListener('load', async () => {
    const map = L.map('map', {}).setView([55.45, 37.37], 10);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    const dataManager = new Worker("dataManager.js");
    
    const dateEnd = Math.floor(Date.now() / 1000);
    const testLayer = new CanvasLayer({
        // dateBegin: dateEnd - 24 * 60 * 60,
        // dateEnd,
        dataManager
    });

    testLayer.addTo(map);

    const moveend = () => {
		const zoom = map.getZoom();
        const pixelBounds = map.getPixelBounds();
        const {min, max} = pixelBounds;
        console.log('zoom:', zoom, 'bounds:[', min.x, ',', min.y, '][', max.x, ',', max.y, ']');        
		// const scale = map.scale(zoom);
		dataManager.postMessage({
			cmd: 'moveend',
			zoom,
			bbox: getNormalizeBounds(map.getBounds()),
            pixelBounds: map.getPixelBounds(),
		});
	}; 
	map.on('moveend', moveend);

	dataManager.onmessage = msg => {
		 // console.log('Main dataManager', msg.data);
		const data = msg.data || {};
		const {cmd, layerId, tileKey} = data;
		switch(cmd) {
			case 'rendered':
				if (data.bitmap) {
					testLayer.rendered(data.bitmap);
				}
				break;
			default:
				console.warn('Warning: Bad message from worker ', data);
				break;
		}

	};
 	moveend();
});