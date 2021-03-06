import L from 'leaflet';

export default L.Layer.extend({
	initialize: function (options) {
		L.setOptions(this, options);
	},

	onAdd: function (map) {
		if (!this._canvas) {
			this._div = L.DomUtil.create('div', 'leaflet-image-layer leaflet-zoom-animated', this.getPane());
			// this._canvas1 = L.DomUtil.create('canvas', 'leaflet-canvas-overlay', this._div.parentNode);
			this._canvas = L.DomUtil.create('canvas', 'leaflet-canvas-overlay', this._div);
			// this._canvas.style.zIndex = 1;
			this._setSize();
			// this._canvasBox = this._canvas.getBoundingClientRect();
			// L.DomEvent.on(this._canvas, 'mousemove', this._mousemove, this);

			const bounds = map.getBounds();
			const sw = bounds.getSouthWest();
			const ne = bounds.getNorthEast();
			const m1 = L.Projection.Mercator.project(L.latLng([sw.lat, sw.lng]));
			const m2 = L.Projection.Mercator.project(L.latLng([ne.lat, ne.lng]));
			const offscreen = this._canvas.transferControlToOffscreen();
			this.options.dataManager.postMessage({
				cmd: 'addLayer',
				layerId: this.options.layerId,
				canvas: offscreen,
				zoom: map.getZoom(),
				bbox: [m1.x, m1.y, m2.x, m2.y],
				bounds: map.getPixelBounds(),
				dateBegin: this.options.dateBegin,
				dateEnd: this.options.dateEnd,
			}, [offscreen]);
		}
		this._repaint();
	},
	onRemove: function(map) {
		this._div.parentNode.removeChild(this._div);
		this.options.dataManager.postMessage({
			cmd: 'removeLayer',
			layerId: this.options.layerId
		});
		
	},
	mouseOver: function (items) {
		// console.log('mouseover', items);
	},
	_repaint: function () {
		this.options.dataManager.postMessage({
			cmd: 'drawScreen',
			layerId: this.options.layerId,
			width: this._canvas.width,
			height: this._canvas.height,
		});
	},

	getEvents: function () {
		let events = {
			viewreset: this._onresize
		};

		if (this._zoomAnimated) {
			events.zoomanim = this._animateZoom;
		}
		return events;
	},

	_setSize: function () {
		let mapSize = this._map.getSize();
		let min = this._map.containerPointToLayerPoint(mapSize).round();
		let size = new L.Bounds(min, min.add(mapSize).round()).getSize();
		this._canvas.width = size.x;
		this._canvas.height = size.y;
	},
	rendered: function (bitmap) {
		L.DomUtil.setPosition(this._div, this._map._getMapPanePos().multiplyBy(-1));
		if (bitmap) {
			let ctx = this._canvas.getContext('2d');
			ctx.clearRect(0, 0, this._canvas.width, this._canvas.height);
			ctx.drawImage(bitmap, 0, 0, this._canvas.width, this._canvas.height);
		}
	},
	_animateZoom: function (e) {
        let map = this._map;
		L.DomUtil.setTransform(this._div,
		    map._latLngBoundsToNewLayerBounds(map.getBounds(), e.zoom, e.center).min,
			map.getZoomScale(e.zoom)
		);
	},

	_onresize: function () {
		let size = this._map.getSize();
		this._canvas.width = size.x; this._canvas.height = size.y;
		this._repaint();
	}
});