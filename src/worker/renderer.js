export default {	
	renderPath: (ctx, feature) => {
		// ctx.beginPath();
		// ctx.strokeStyle = 'blue';
		// ctx.fillStyle = 'rgba(255, 0, 0, 0.01)';
		if (feature.type !== 2) {
			ctx.fill(feature.path);
		}
		ctx.stroke(feature.path);
		return true;
	},
	renderPixi: (graphics, feature) => {
		if (feature.type !== 2) {
			graphics.beginFill(0xFF0000, 0.5);
		}
		graphics.lineStyle(2, 0x0000FF, 1);
		feature.coordinates[0].forEach((p, i) => {
			if (i) {
				graphics.lineTo(p.x, p.y);
			}
			else {
				if (feature.type === 1) {
					graphics.drawCircle(p.x, p.y, 5);
				} else {
					graphics.moveTo(p.x, p.y);
				}
			}
		});

		// graphics.beginFill(0x650A5A, 1);
		// graphics.drawCircle(250, 250, 50);
		// graphics.endFill();
		if (feature.type !== 2) {
			graphics.closePath();
			graphics.endFill();
		}
	}
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