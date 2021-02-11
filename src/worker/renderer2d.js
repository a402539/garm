export default {	
	render2dpbf: (canvas, path2d) => {		
		const ctx = canvas.getContext("2d");
		ctx.beginPath();
		ctx.strokeStyle = 'blue';
		ctx.stroke(path2d);
		return true;
	},
/*
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
*/
};