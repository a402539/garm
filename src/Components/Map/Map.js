import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {Component} from '@scanex/components';

export default class Map extends Component {
    constructor(container, options) {
        super(container, options);        
    }
    _render(element, options) {
        element.classList.add('map');
        this._options = options;
        const {center = [55.751357, 37.618968], zoom = 10} = this._options;
        this._map = L.map(element, {zoomControl: false}).setView(center, zoom);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',            
        }).addTo(this._map);
        
        this._map.on('moveend', this._moveend, this);        
        this._moveend();
    }
    _moveend() {
        const zoom = this._map.getZoom();
        const bounds = this._map.getBounds();
        const sw = bounds.getSouthWest();
        const ne = bounds.getNorthEast();
        const m1 = L.Projection.Mercator.project(L.latLng([sw.lat, sw.lng]));
        const m2 = L.Projection.Mercator.project(L.latLng([ne.lat, ne.lng]));        

        let event = document.createEvent('Event');
        event.initEvent('moveend', false, false);
        event.detail = {            
            zoom,
            bbox: [m1.x, m1.y, m2.x, m2.y],
            bounds: this._map.getPixelBounds(),
        };
        this.dispatchEvent(event);
    }    
    addLayer(layer) {
        layer.addTo(this._map);
    }    
};