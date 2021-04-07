import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {Component} from '@scanex/components';
import CanvasLayer from 'CanvasLayer.js';
import CanvasOverlay from 'L.CanvasOverlay.js';
import GridLayer from 'GridLayer.js';

export default class Map extends Component {
    constructor(container, options) {
        super(container, options);                
    }
    render(element, options) {        
        this._dataManager = new Worker("dataManager.js");
        this._dataManager.onmessage = msg => {
            // console.log('Main dataManager', msg.data);
           const data = msg.data || {};
           const {cmd, layerId, items} = data;
           switch(cmd) {
               case 'rendered':
                   if (this._layers[layerId]) {
                       this._layers[layerId].rendered(data.bitmap);
                   }
                   break;
               case 'mouseover':
					this._map.getContainer().style.cursor = items ? 'pointer' : '';
					if (this._layers[layerId]) {
						this._layers[layerId].mouseOver(items);
					}
                   break;
               default:
                   console.warn(translate('worker.message.bad'), data);
                   break;
           }
        };
        element.classList.add('map');
        this._options = options;
        this._layers = {};
        const {center = [55.751357, 37.618968], zoom = 10} = this._options;
        this._map = L.map(element, {zoomControl: false}).setView(center, zoom);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {            
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',            
        }).addTo(this._map);
        
        this._map
			// .on('click', this._eventCheck, this)
			// .on('click dblclick mousedown mouseup mousemove contextmenu', this._eventCheck, this)
			.on('moveend', this._moveend, this);        
        this._moveend();
    }
    _eventCheck(ev) {
		const orig = ev.originalEvent;        
        const msg = {            
			type: ev.type,
			latlng: ev.latlng,
			zoom: this._map.getZoom(),
			// mapMousePos: this._map._getMapPanePos().add(ev.layerPoint),
			mapMousePos: this._map.getPixelOrigin().add(ev.layerPoint),
			containerPoint: ev.containerPoint,
			originalEvent: {
				altKey: orig.altKey,
				ctrlKey: orig.ctrlKey,
				shiftKey: orig.shiftKey,
				clientX: orig.clientX,
				clientY: orig.clientY
			},
            cmd: 'eventCheck',
        };                
        this._dataManager.postMessage(msg);
	}

	_moveend() {
        const zoom = this._map.getZoom();
        const bounds = this._map.getBounds();
        const sw = bounds.getSouthWest();
        const ne = bounds.getNorthEast();
        const m1 = L.Projection.Mercator.project(L.latLng([sw.lat, sw.lng]));
        const m2 = L.Projection.Mercator.project(L.latLng([ne.lat, ne.lng])); 

        const msg = {            
            zoom,
            bbox: [m1.x, m1.y, m2.x, m2.y],
            bounds: this._map.getPixelBounds(),
            cmd: 'moveend',
        };
        this._dataManager.postMessage(msg);
    }    
    addLayer(layerId) {
        if (!this._layers[layerId]) {
            // const layer = new CanvasOverlay({dataManager: this._dataManager, layerId, webGL: true});
			// var glLayer = L.canvasOverlay()
            // .drawing(drawingOnCanvas)
            // .addTo(leafletMap);

            const layer = new GridLayer({layerId});
            // const layer = new CanvasLayer({dataManager: this._dataManager, layerId, webGL: 'pixi'});
            this._layers[layerId] = layer;
            this._map.addLayer(layer);
        }
    }
    removeLayer(layerId) {
        const layer = this._layers[layerId];
        layer && this._map.removeLayer(layer) && delete this._layers[layerId];
    }
    expand() {
        this.element.classList.remove('collapsed');
        this.element.classList.add('expanded');
    }
    collapse() {
        this.element.classList.remove('expanded');
        this.element.classList.add('collapsed');
    }   
};