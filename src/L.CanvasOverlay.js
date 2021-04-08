import Webgl from './WebGL.js';

/**
 * Leaflet canvas overlay class
 */
export default L.Layer.extend({

  initialize: function(options) {
    // this._userDrawFunc = userDrawFunc;
    L.setOptions(this, options);
  },

  params:function(options){
    L.setOptions(this, options);
    return this;
  },

  drawing: function(userDrawFunc) {
    this._userDrawFunc = userDrawFunc;
    return this;
  },

  canvas: function() {
    return this._canvas;
  },

  redraw: function() {
    if (!this._frame) {
      this._frame = L.Util.requestAnimFrame(this._redraw, this);
    }
    return this;
  },

  onAdd: function(map) {
    this._map = map;
    var pane = map._panes.overlayPane;
    this._canvas = L.DomUtil.create('canvas', 'leaflet-heatmap-layer', pane);
    this._canvas1 = L.DomUtil.create('canvas', 'leaflet-heatmap-layer', pane);

    var size = this._map.getSize();
    this._canvas.width = size.x;
    this._canvas.height = size.y;
    this._canvas1.width = size.x;
    this._canvas1.height = size.y;

    var animated = this._map.options.zoomAnimation && L.Browser.any3d;
    L.DomUtil.addClass(this._canvas, 'leaflet-zoom-' + (animated ? 'animated' : 'hide'));
    L.DomUtil.addClass(this._canvas1, 'leaflet-zoom-' + (animated ? 'animated' : 'hide'));

    map.on('mousedown', this._mousedown, this);
    map.on('zoomstart', this._copyScreen, this);
    map.on('zoomend', this._zoomend, this);
    map.on('moveend', this._reset, this);
    map.on('resize', this._resize, this);

    if (animated) {
      map.on('zoomanim', this._animateZoom, this);
    }
	this._resetDataManager();

    this._reset();
  },

  onRemove: function(map) {
    map.getPanes().overlayPane.removeChild(this._canvas);

    map.off('mousedown', this._mousedown, this);
    map.off('zoomstart', this._copyScreen, this);
    map.off('zoomend', this._zoomend, this);
    map.off('moveend', this._reset, this);
    map.off('resize', this._resize, this);

    if (map.options.zoomAnimation && L.Browser.any3d) {
      map.off('zoomanim', this._animateZoom, this);
    }

    this_canvas = null;
  },

  addTo: function(map) {
    map.addLayer(this);
    return this;
  },

  _resize: function(resizeEvent) {
    this._canvas.width = this._canvas1.width = resizeEvent.newSize.x;
    this._canvas.height = this._canvas1.height = resizeEvent.newSize.y;
	this._resetDataManager();
  },

  _copyScreen: function() {
	var ctx = this._canvas1.getContext('2d');
	ctx.clearRect(0, 0, this._canvas1.width, this._canvas1.height)
	ctx.drawImage(this._canvas, 0, 0);
  },

  _mousedown: function() {
	this._copyScreen();
	this._topLeft = this._map.containerPointToLayerPoint([0, 0]);
	// console.log('_viewreset', this._topLeft);
  },

  _zoomend: function(ev) {
	// console.log('_zoomend', ev);
	this._skeepReset = true;
	this._canvas.style.display = 'none';
	this._canvas1.style.display = 'block';
  },

  _reset: function(ev) {
	if (!this._skeepReset) {
		var topLeft = this._map.containerPointToLayerPoint([0, 0]);
		// console.log('moveend', ev, topLeft);
		L.DomUtil.setPosition(this._canvas, topLeft);
		L.DomUtil.setPosition(this._canvas1, this._topLeft);
		this._canvas.style.display = 'none';
		this._canvas1.style.display = 'block';
		// L.DomUtil.setPosition(this._canvas1, topLeft);
	}
	this._skeepReset = false;
    this._redraw();
  },
  rendered: function (data) {
	// console.log('rendered', data);
	if (data.bitmap) {
		let	verts = new Float32Array(data.bitmap);
        const map = this._map;
		const bounds = map.getPixelBounds();
		const zoom = map.getZoom();
		Webgl.redraw(zoom, bounds, this._rt, verts);
		this._rt = 1;
		this._canvas.style.display = 'block';
	} else {
		this._rt = 0;
		var topLeft = this._map.containerPointToLayerPoint([0, 0]);
		L.DomUtil.setPosition(this._canvas, topLeft);
		// var ctx = this._canvas.getContext('2d');
		// ctx.clearRect(0, 0, this._canvas.width, this._canvas.height);
	}
	if (data.last) {
		this._canvas1.style.display = 'none';
		// this._canvas.style.display = 'block';
	}
    this._frame = null;
	// this.redraw();
  },

  _resetDataManager: function(cmd) {
	const bounds = this._map.getBounds();
	const sw = bounds.getSouthWest();
	const ne = bounds.getNorthEast();
	const m1 = L.Projection.Mercator.project(L.latLng([sw.lat, sw.lng]));
	const m2 = L.Projection.Mercator.project(L.latLng([ne.lat, ne.lng]));

	this.options.dataManager.postMessage({
		cmd: 'addLayer',
		layerId: this.options.layerId,
		width: this._canvas.width,
		height: this._canvas.height,
		zoom: this._map.getZoom(),
		bbox: [m1.x, m1.y, m2.x, m2.y],
		bounds: this._map.getPixelBounds()
	});
	Webgl.init(this._canvas);
    return this;
  },

  _redraw: function () {
	const bounds = this._map.getBounds();
	const sw = bounds.getSouthWest();
	const ne = bounds.getNorthEast();
	const m1 = L.Projection.Mercator.project(L.latLng([sw.lat, sw.lng]));
	const m2 = L.Projection.Mercator.project(L.latLng([ne.lat, ne.lng]));

	this.options.dataManager.postMessage({
		cmd: 'drawScreen',
		layerId: this.options.layerId,
		width: this._canvas.width,
		height: this._canvas.height,
		zoom: this._map.getZoom(),
		bbox: [m1.x, m1.y, m2.x, m2.y],
		bounds: this._map.getPixelBounds(),
	});

    this._frame = null;
  },
  _animateZoom: function (e) {
	this._copyScreen();
	let map = this._map;
	let point = map._latLngBoundsToNewLayerBounds(map.getBounds(), e.zoom, e.center).min;
	let scale = map.getZoomScale(e.zoom);
	// console.log('_animateZoom', point, scale);
	L.DomUtil.setTransform(this._canvas, point, scale);
	L.DomUtil.setTransform(this._canvas1, point, scale);
  }
});


/**
 * A wrapper function to create a canvas overlay object.
 *
 * @param {String} userDrawFunc the custom draw callback
 * @param {Array} options an array of options for the overlay
 * @return {Object} a canvas overlay object
 */
// L.canvasOverlay = function (userDrawFunc, options) {
  // return new L.CanvasOverlay(userDrawFunc, options);
// };