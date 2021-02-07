import './index.css';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {VectorTile} from '@mapbox/vector-tile';
import Protobuf from 'pbf';

async function getboxtiles(xmin, ymin, xmax, ymax, layer) {
    const response = await fetch(`/box/${xmin.toFixed(6)},${ymin.toFixed(6)},${xmax.toFixed(6)},${ymax.toFixed(6)}`);
    const tiles = await response.json();
    tiles.forEach(({x, y, z}) => {
        fetch(`/tile/${x}/${y}/${z}`)
        .then(res => res.blob())
        .then(blob => blob.arrayBuffer())
        .then(buf => {
            const {layers} = new VectorTile(new Protobuf(buf));
            Object.keys(layers).reduce((b,k) => {
                const g = geojson([x, y, z], layers[k]);
                layer.addData(g);
            }, []);
        });                        
    });    
}

let cache = {};

function geojson([x, y, z], layer) {
    if (!layer) return;       
    for (let i = 0; i < layer.length; ++i) {
        const f = layer.feature(i).toGeoJSON(x, y, z);
        const {properties: {uid}} = f;
        cache[uid] = f;
    }    
}

const renderer = L.canvas();

window.addEventListener('load', async () => {
    const map = L.map('map', {renderer}).setView([55.45, 37.37], 6);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    const tiles = L.geoJSON();
    tiles.addTo(map);

    async function tilehandler() { 
        tiles.clearLayers();               
        const zoom = map.getZoom();
        const {min, max} = L.CRS.EPSG3857.getProjectedBounds(zoom);        
        await getboxtiles(min.x, min.y, max.x, max.y, tiles);
    }

    map.on('moveend', tilehandler);
    map.on('zoomend', tilehandler);
    
    await tilehandler();
});