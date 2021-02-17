const svgToMiniDataURI = require('mini-svg-data-uri');
const fs = require('fs-extra');
const path = require('path');
const cfg = require("./svg.config.json");

const bg = Object.keys(cfg.src).reduce ((a, className) => {
	const dir = cfg.src[className];
	const files = fs.readdirSync(dir);	
	files.forEach(f => {
		const n = f.replace(/\.svg$/, '');
		const s = fs.readFileSync(path.join(dir, f)).toString('utf8');
		const u = svgToMiniDataURI(s);
		a.push(`.${className}.${n} {background-image: url("${u}");}`);
	});
	return a;
}, []);

fs.writeFileSync(cfg.dst, bg.join('\r\n'));