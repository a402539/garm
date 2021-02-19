import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import CanvasLayer from 'CanvasLayer.js';

export default class Map {
    constructor(container, options) {
        this._container = container;
        this._options = options;
        const {center = [55.45, 37.37], zoom = 10} = this._options;
        this._map = L.map(this._container, {zoomControl: false}).setView(center, zoom);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            
        }).addTo(this._map);
        this._dataManager = new Worker("dataManager.js");
        this._map.on('moveend', this._moveend, this);
        this._dataManager.onmessage = msg => {
            // console.log('Main dataManager', msg.data);
           const data = msg.data || {};
           const {cmd, layerId, tileKey} = data;
           switch(cmd) {
               case 'rendered':
                   if (data.bitmap && this._layers[layerId]) {
                       this._layers[layerId].rendered(data.bitmap);
                   }
                   break;
               default:
                   console.warn('Warning: Bad message from worker ', data);
                   break;
           }
   
       };
       this._moveend();
    }
    _moveend() {
        const zoom = this._map.getZoom();
        const bounds = this._map.getBounds();
        const sw = bounds.getSouthWest();
        const ne = bounds.getNorthEast();
        const m1 = L.Projection.Mercator.project(L.latLng([sw.lat, sw.lng]));
        const m2 = L.Projection.Mercator.project(L.latLng([ne.lat, ne.lng]));
        this._dataManager.postMessage({
            cmd: 'moveend',
            zoom,
            bbox: [m1.x, m1.y, m2.x, m2.y],
            bounds: this._map.getPixelBounds(),
        });
    }
    async load (layers) {
        this._layers = layers.reduce((a, layer) => {
            const c = new CanvasLayer({dataManager: this._dataManager, layerId: layer.id});
            a[layer.id] = c;
            layer.visible = true;
            if (layer.visible) {
                c.addTo(this._map);
            }            
            return a;
        }, {});        
    }
};