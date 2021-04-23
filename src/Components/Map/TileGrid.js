import L from 'leaflet';

let tiles = {};

const tileKey = (z, x, y) => [z, x, y].join(':');

function cleanup(key) {
    const request = tiles[key];
    request && request.terminate();
    delete tiles[key];
}

export default L.GridLayer.extend({
    initialize: function(options) { 
        this.options = L.setOptions(this, options);
        this.on('tileunload', e => {
            const {coords} = e;
            const {z, x, y} = coords;
            const key = tileKey(z, x, y);
            cleanup(key);
        }, this);
    },
    createTile: function(coords, done){
        // create a <canvas> element for drawing
        let tile = L.DomUtil.create('canvas', 'leaflet-tile');

        // setup tile width and height according to the options
        let size = this.getTileSize();
        tile.width = size.x;
        tile.height = size.y;

        const {layerId} = this.options;
        const {z, x, y} = coords;
        let ctx = tile.getContext('bitmaprenderer');
        const request = new Worker('tile.js');
        const key = tileKey(z, x, y);
        tiles[key] = request;
        request.addEventListener('message', e => {
            const {status} = e.data;
            if (status === 'ready') {
                cleanup(key);
                const {bitmap} = e.data
                ctx.transferFromImageBitmap(bitmap);
                done(null, tile);
            }            
            else if (status === 'error') {
                const {error} = e.data;
                cleanup(key);
                done(error, tile);
            }
        });
        request.postMessage({layerId, z, x, y});
        return tile;
    },   
});