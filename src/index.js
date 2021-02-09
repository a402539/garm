import './index.css';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {VectorTile} from '@mapbox/vector-tile';
import Protobuf from 'pbf';

let abortController = new AbortController();

async function getboxtiles(xmin, ymin, xmax, ymax, tiles) {
    abortController.abort();
    abortController = new AbortController();
    const response = await fetch(`/box/${xmin.toFixed(6)},${ymin.toFixed(6)},${xmax.toFixed(6)},${ymax.toFixed(6)}`, { signal: abortController.signal });
    const items = await response.json();
    items.forEach(({x, y, z}) => {
        fetch(`/tile/${x}/${y}/${z}`)
        .then(res => res.blob())
        .then(blob => blob.arrayBuffer())
        .then(buf => {
            const {layers} = new VectorTile(new Protobuf(buf));
            const features = Object.keys(layers).reduce((a, k) => {
                geojson([x, y, z], layers[k])
                .forEach(feature => {
                    const {properties: {uid}} = feature;
                    a[uid] = feature;                    
                });                
                return a;
            }, {});

            Object.keys(tiles.cache)
            .filter(uid => !features[uid])            
            .forEach(uid => {
                const item = tiles.cache[uid];
                tiles.layer.removeLayer(item);
                delete tiles.cache[uid];
            });
            Object.keys(features)
            .forEach(uid => {
                if (!tiles.cache[uid]) {
                    tiles.cache[uid] = tiles.layer.addLayer(L.geoJSON(features[uid]));
                }
            });
        });
    });    
}

function geojson([x, y, z], layer) {
    if (!layer) return;
    const features = [];
    for (let i = 0; i < layer.length; ++i) {
        features.push (layer.feature(i).toGeoJSON(x, y, z));        
    }
    return features;
}

const renderer = L.canvas();

window.addEventListener('load', async () => {
    const map = L.map('map', {renderer}).setView([55.45, 37.37], 6);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);


    let tiles = {
        layer: L.layerGroup(),
        cache: {}
    };
    
    tiles.layer.addTo(map);

    async function tilehandler() {         
        const zoom = map.getZoom();
        const {min, max} = L.CRS.EPSG3857.getProjectedBounds(zoom);        
        await getboxtiles(min.x, min.y, max.x, max.y, tiles);
    }

    map.on('moveend', tilehandler);
    map.on('zoomend', tilehandler);
    
    await tilehandler();
});