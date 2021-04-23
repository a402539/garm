import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {Component} from '@scanex/components';
import TileGrid from './TileGrid.js';

export default class Map extends Component {
    constructor(container, options) {
        super(container, options);                
    }
    render(element, options) {
        element.classList.add('map');
        this._options = options;
        this._layers = {};
        const {center = [55.751357, 37.618968], zoom = 10} = this._options;
        this._map = L.map(element, {zoomControl: false}).setView(center, zoom);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {            
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',            
        }).addTo(this._map);            
    }     
    addLayer(layerId) {
        if (!this._layers[layerId]) {
            const layer = new TileGrid({layerId});    
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