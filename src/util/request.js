import {VectorTile} from '@mapbox/vector-tile';
import Protobuf from 'pbf';

export default async function (layerId, z, x, y) {
    const response = await fetch(`tile/${layerId}/${z}/${x}/${y}`);
    const blob = await response.blob();
    const buf = await blob.arrayBuffer();
    const pbf = new Protobuf(buf);
    const {layers} = new VectorTile(pbf);
    let result = {};
    for (const [id, vt] of Object.entries(layers)) {
        result[id] = [];
        for (let i = 0; i < vt.length; ++i) {
            const f = vt.feature(i);
            const coordinates = f.loadGeometry().reduce((a,r) => a.concat(...r.map(({x,y}) => [x, y])), []);
            const r = Math.floor(Math.random() * 255);
            const g = Math.floor(Math.random() * 255);
            const b = Math.floor(Math.random() * 255);
            const style = `rgb(${[r,g,b].join(',')})`;
            result[id].push({coordinates, style});
        }
    }
    return result;    
};