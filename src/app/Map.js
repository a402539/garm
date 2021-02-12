import './index.css';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import CanvasLayer from 'CanvasLayer.js';

export default class Map {
    constructor(container, options) {
        this._container = container;
        this._options = options;
        const {center = [55.45, 37.37], zoom = 10} = this._options;
        this._map = L.map('map', {}).setView(center, zoom);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(this._map);
    }
    async load (id) {
        const response = await fetch(`maps/${id}`);
        const {id, name, layers} = await response.json();
        layers.forEach(layer => {
            const canvasLayer = new CanvasLayer({dataManager});
            canvasLayer.addTo(map);    
        });


        

    }
};