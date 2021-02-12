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
        this._dataManager = new Worker("dataManager.js");
        this._map.on('moveend', this._moveend, this);
    }
    _moveend() {
        const zoom = this._map.getZoom();
        const sbbox = this._map.getBounds();
        const sw = sbbox.getSouthWest();
        const ne = sbbox.getNorthEast();
        const m1 = L.Projection.Mercator.project(L.latLng([sw.lat, sw.lng]));
        const m2 = L.Projection.Mercator.project(L.latLng([ne.lat, ne.lng]));
        this._dataManager.postMessage({
            cmd: 'moveend',
            zoom,
            bbox: [m1.x, m1.y, m2.x, m2.y],
            bounds: map.getPixelBounds(),
        });
    }
    async load (id) {
        const response = await fetch(`maps/${id}`);
        const {id, name, layers} = await response.json();
        layers.forEach(layer => {
            const canvasLayer = new CanvasLayer({dataManager, layerId: layer.id});
            if (layer.visible) {
                canvasLayer.addTo(map);
            }            
        });
    }
};