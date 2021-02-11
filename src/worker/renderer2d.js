export default {	
	render2d: (options, coords) => {
		const {scale, canvas} = options;        
		const ctx = canvas.getContext("2d");
// console.log('coords', coords);
		ctx.beginPath();
		ctx.strokeStyle = 'black';
		ctx.fillStyle = 'red';
		// ctx.moveTo(coords[0], coords[1]);
		ctx.arc(coords[0], coords[1], 14 / (2 * scale), 0, 2 * Math.PI);
		// ctx.arc(155, 166, 14, 0, 2 * Math.PI);
		ctx.stroke();
		ctx.fill();
		return true;
	},
	render2dRing: (options, ring) => {
		const {scale, canvas} = options;        
		const ctx = canvas.getContext("2d");
		ctx.beginPath();
		ctx.lineWidth = 1 / scale;
		ctx.strokeStyle = 'red';
		ctx.fillStyle = 'blue';
		//ctx.globalAlpha = 0.5;
		ring.forEach((coord, i) => {
			if (i) {
				ctx.lineTo(coord[0], coord[1]);
			}
			else {
				ctx.moveTo(coord[0], coord[1]);
			}
		});
		//ctx.fill();
		ctx.stroke();
// console.log('coords', coords);
		return true;
	},
	render2dpbf: (options, coordinates, sc, x0, y0, tw) => {
		const {scale, canvas} = options;        
		const ctx = canvas.getContext("2d");
		ctx.beginPath();
		ctx.lineWidth = 1;// / scale;
		ctx.strokeStyle = 'red';
		ctx.fillStyle = 'blue';
		//ctx.globalAlpha = 0.5;
		ctx.moveTo(x0, y0);
		ctx.lineTo(x0 + tw, y0);
		ctx.lineTo(x0 + tw, y0 + tw);
		ctx.lineTo(x0, y0 + tw);
		ctx.lineTo(x0, y0);
		ctx.closePath();
		ctx.stroke();

		ctx.beginPath();
		ctx.strokeStyle = 'blue';
		coordinates.forEach((p, i) => {
			if (p.x < 0) {
				//console.log('rrrrrrr', p)
			}
			if (i) {
					ctx.lineTo(x0 + p.x * sc, y0 + p.y * sc);
			}
			else {
				ctx.moveTo(x0 + p.x * sc, y0 + p.y * sc);
			}
		});
		//ctx.fill();
		ctx.stroke();
// console.log('coords', coords);
		return true;
	},
	render2dEmpty: (options) => {
		const {coords, canvas} = options;        
		// const gl = canvas.getContext("webgl");
		const {x, y, z} = coords;
		const tileKey = [x,y,z].join(':');
		const ctx = canvas.getContext("2d");
		function render() {
			// ... some drawing using the gl context ...
			//requestAnimationFrame(render);
			ctx.beginPath();
			ctx.strokeStyle = 'black';
			ctx.rect(0, 0, 255, 255);
			ctx.moveTo(0, 0);
			ctx.lineTo(255, 255);
			ctx.moveTo(255, 0);
			ctx.lineTo(0, 255);
			ctx.stroke();

			ctx.beginPath();
			ctx.strokeStyle = 'red';
			ctx.arc(128, 128, 128, 0, Math.PI * 2, false);
			// ctx.stroke();        
			ctx.font = '25px serif';
			let textMetrics = ctx.measureText(tileKey);

			ctx.fillText(tileKey, 128 - textMetrics.width / 2, 100);
			ctx.stroke();

			// console.log('render', tileKey);
		}
		requestAnimationFrame(render);
		return true;
	},	
};