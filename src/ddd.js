import './ddd.css';
import * as d3 from 'd3';
import {VectorTile} from '@mapbox/vector-tile';
import Protobuf from 'pbf';
import {tile} from 'd3-tile';

function geojson([x, y, z], layer, filter = () => true) {
    if (!layer) return;
    const features = [];
    for (let i = 0; i < layer.length; ++i) {
        const f = layer.feature(i).toGeoJSON(x, y, z);
        if (filter.call(null, f, i, features)) {
          features.push(f);
        }
    }
    return {type: "FeatureCollection", features};
}

window.addEventListener('load', async () => {    
    
    const canvas = document.querySelector('canvas');

    const width = canvas.width;
    const height = canvas.height;

    const context = canvas.getContext('2d');

    // const land = topojson.feature(world, world.objects.land);

    const projection = d3.geoMercator()
        .center([100, 0])
        .scale(Math.pow(2, 8) / (2 * Math.PI))
        .translate([width / 2, height / 2])
        .precision(0);

    const d3t = tile()
        .size([width, height])
        .scale(projection.scale() * 2 * Math.PI)
        .translate(projection([0, 0]));

    const tiles = await Promise.all(d3t().map(async d => {
        const buf = await d3.buffer(`tile/${d[2]}/${d[0]}/${d[1]}`);
        d.layers = new VectorTile(new Protobuf(buf)).layers;
        return d;
    }));

    const path = d3.geoPath(projection, context);

    // context.save();

    tiles.forEach(d => {
        context.beginPath();
        const feature = geojson(d, d.layers.ls8, d => true);
        path(feature);
        context.lineWidth = 1;
        context.strokeStyle = "#FF0000";
        context.stroke();
        // context.restore();
    });
            
    

});