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
		let ctx = tile.getContext('2d');
                
        fetch(`tile/${this.options.layerId}/${z}/${x}/${y}`)
        .then(resp => resp.blob())
        // .then(blob => blob.arrayBuffer())
        .then(buf => {
			var image = new Image(255, 255);;
				// document.body.appendChild(image);
			image.onload = function(){
				ctx.drawImage(image, 0, 0);
				
			}
			image.src = URL.createObjectURL(buf);
			done('', tile);

			// ctx.drawImage(, 0, 0);
			console.log(buf);
		});        

        return tile;
    }
});