import './index.css';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {VectorTile} from '@mapbox/vector-tile';
import Protobuf from 'pbf';

let abortController = new AbortController();
let fg;

async function getboxtiles(xmin, ymin, xmax, ymax, tiles) {
    abortController.abort();
    abortController = new AbortController();
    const response = await fetch(`/box/${xmin.toFixed(6)},${ymin.toFixed(6)},${xmax.toFixed(6)},${ymax.toFixed(6)}`, { signal: abortController.signal });
    const items = await response.json();
   // const items = [{x: 1, y: 0, z: 1}];
    console.log('ccc', items);

    if (fg && fg._map) {
        tiles.layer.removeLayer(fg);
    }
    fg = drawTileNums(items);
    tiles.layer.addLayer(fg);

    items.forEach(({x, y, z}) => {
        fetch(`/tile/${z}/${x}/${y}`)
        .then(res => res.blob())
        .then(blob => blob.arrayBuffer())
        .then(buf => {
            const {layers} = new VectorTile(new Protobuf(buf));
            const features = Object.keys(layers).reduce((a, k) => {
                geojson([x, y, z], layers[k])
                .forEach(feature => {
                   // console.log('hhh', feature);
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

const ww = 40075016.685578496;
const w = ww / 2;
function drawTileNums(arr) {
    let out = [];
    for (let i = 0, len = arr.length; i < len; i++) {
        let pt = arr[i];
        let tileSize = ww / Math.pow(2, pt.z);
        let minx = pt.x * tileSize - w;
        let miny = w - pt.y * tileSize;
        
        let latLngBounds = L.latLngBounds([
            L.CRS.EPSG3857.unproject({x: minx, y: miny}),
            L.CRS.EPSG3857.unproject({x: minx + tileSize, y: miny - tileSize})
        ]);
        out.push(L.rectangle(latLngBounds, {color: "#ff0000", weight: 1, pointerEvents: 'none'}));
    }
    return L.featureGroup(out);
}
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
    } else if (maxX > 180 || minX < -180) {
        let center = ((maxX + minX) / 2) % 360;
        if (center > 180) { center -= 360; }
        else if (center < -180) { center += 360; }
        minX = center - w; maxX = center + w;
        if (minX < -180) {
            minX1 = minX + 360; maxX1 = 180; minX = -180;
        } else if (maxX > 180) {
            minX1 = -180; maxX1 = maxX - 360; maxX = 180;
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
    const map = L.map('map', {renderer}).setView([55.45, 37.37], 10);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);


    let tiles = {
        layer: L.layerGroup(),
        cache: {}
    };
    
    tiles.layer.addTo(map);

    async function tilehandler() {         
        const bb = map.getBounds();
        const arrBbox = getNormalizeBounds(bb);
        console.log('ggg', arrBbox);
       // const {min, max} = L.CRS.EPSG3857.getProjectedBounds(zoom);        
        await getboxtiles(arrBbox[0][0], arrBbox[0][1], arrBbox[0][2], arrBbox[0][3], tiles);
    }

    map.on('moveend', tilehandler);
    map.on('zoomend', tilehandler);
    
    await tilehandler();
});