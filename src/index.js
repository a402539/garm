import './index.css';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import CanvasLayer from './CanvasLayer.js';
import Map from 'app/Map.js';

window.addEventListener('load', async () => {
    const map = new Map(document.getElementById('map'), {center: [55.45, 37.37], zoom: 10});

    
    
    const dateEnd = Math.floor(Date.now() / 1000);
    const testLayer = new CanvasLayer({
        // dateBegin: dateEnd - 24 * 60 * 60,
        // dateEnd,
        dataManager
    });

    testLayer.addTo(map);

   
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