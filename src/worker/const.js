const WORLDWIDTHFULL = 40075016.685578496;
const W = Math.floor(WORLDWIDTHFULL / 2);
const DELAY = 60000;
export default {
	DELAY,	
	WORLDWIDTHFULL,
	W,
	WORLDBBOX: [-W, -W, W, W],
    HOST: 'maps.kosmosnimki.ru',
	SCRIPTS: {
		CheckVersion: '/Layer/CheckVersion.ashx'
	},
};