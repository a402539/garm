import L from 'leaflet';
import WebGL from 'WebGL.js';

export default L.GridLayer.extend({
    createTile: function(coords, done){
        let error;

        // create a <canvas> element for drawing
        let tile = L.DomUtil.create('canvas', 'leaflet-tile');

        // setup tile width and height according to the options
        let size = this.getTileSize();
        tile.width = size.x;
        tile.height = size.y;
        
        const {z, x, y} = coords;
                
        fetch(`tile/${this.options.layerId}/${z}/${x}/${y}`)
        .then(blob => console.log(blob));        

        return tile;
    }
});