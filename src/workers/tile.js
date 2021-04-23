import get from 'util/request.js';
import render from 'util/render.js';

onmessage = function(e) {    
    const {layerId, z, x, y} = e.data;
    const offscreen = new OffscreenCanvas(256, 256);
    let ctx = offscreen.getContext('2d');
    get(layerId, z, x, y)
    .then(res => {        
        for (let [_, features] of Object.entries(res)) {
            for (let {coordinates, style} of features) {                
                render(ctx, coordinates, style);
                // postMessage({status: 'feature', coordinates, style});
            }
        }
        const bitmap = offscreen.transferToImageBitmap();
        postMessage({status: 'ready', bitmap});
    })
    .catch(error => {
        postMessage({status: 'error', error});
    });
};