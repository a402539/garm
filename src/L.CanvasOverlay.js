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
    L.DomUtil.addClass(this._canvas, 'leaflet-zoom-'
      + (animated ? 'animated' : 'hide'));

    // map._panes.overlayPane.appendChild(this._canvas);

    map.on('mousedown', this._mousedown, this);
    // map.on('movestart', this._movestart, this);
    map.on('moveend', this._reset, this);
    map.on('resize', this._resize, this);

    if (map.options.zoomAnimation && L.Browser.any3d) {
      map.on('zoomanim', this._animateZoom, this);
    }
	const bounds = map.getBounds();
	const sw = bounds.getSouthWest();
	const ne = bounds.getNorthEast();
	const m1 = L.Projection.Mercator.project(L.latLng([sw.lat, sw.lng]));
	const m2 = L.Projection.Mercator.project(L.latLng([ne.lat, ne.lng]));
	Webgl.init(this._canvas);

	// const offscreen = this._canvas.transferControlToOffscreen();
	this.options.dataManager.postMessage({
		cmd: 'addLayer',
		layerId: this.options.layerId,
		webGL: this.options.webGL,
		// canvas: offscreen,
		width: this._canvas.width,
		height: this._canvas.height,
		zoom: map.getZoom(),
		bbox: [m1.x, m1.y, m2.x, m2.y],
		bounds: map.getPixelBounds(),
		dateBegin: this.options.dateBegin,
		dateEnd: this.options.dateEnd,
	// }, [offscreen]);
	});

    this._reset();
  },

  onRemove: function(map) {
    map.getPanes().overlayPane.removeChild(this._canvas);

    map.off('mousedown', this._mousedown, this);
    // map.off('movestart', this._movestart, this);
    map.off('moveend', this._reset, this);
    map.off('resize', this._resize, this);

    if (map.options.zoomAnimation) {
      map.off('zoomanim', this._animateZoom, this);
    }

    this_canvas = null;
  },

  addTo: function(map) {
    map.addLayer(this);
    return this;
  },

  _resize: function(resizeEvent) {
    this._canvas.width = resizeEvent.newSize.x;
    this._canvas.height = resizeEvent.newSize.y;
  },

  _mousedown: function() {
	this._canvas1.getContext('2d').drawImage(this._canvas, 0, 0);
	this._canvas1.style.display = 'block';
	this._canvas.style.display = 'none';

    var topLeft = this._map.containerPointToLayerPoint([0, 0]);
    L.DomUtil.setPosition(this._canvas1, topLeft);
	console.log('_viewreset', topLeft);
  },

  _movestart: function() {
	this._canvas1.getContext('2d').drawImage(this._canvas, 0, 0);
	this._canvas1.style.display = 'block';
	this._canvas.style.display = 'none';

    var topLeft = this._map.containerPointToLayerPoint([0, 0]);
    L.DomUtil.setPosition(this._canvas1, topLeft);
	console.log('_movestart', topLeft);
  },

  _reset: function() {
    var topLeft = this._map.containerPointToLayerPoint([0, 0]);
	console.log('moveend', topLeft);
    L.DomUtil.setPosition(this._canvas, topLeft);
	this._canvas1.style.display = 'none';
	this._canvas.style.display = 'block';
    L.DomUtil.setPosition(this._canvas1, topLeft);
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
	} else {
		this._rt = 0;
	}
    this._frame = null;
	// this.redraw();
  },

  _redraw: function () {
    // var size = this._map.getSize();
    // var bounds = this._map.getBounds();
    // var zoomScale = (size.x * 180) / (20037508.34 * (bounds.getEast()
      // - bounds.getWest())); // resolution = 1/zoomScale
    // var zoom = this._map.getZoom();

    // if (this._userDrawFunc) {
      // this._userDrawFunc(this, {
        // canvas: this._canvas,
        // bounds: bounds,
        // size: size,
        // zoomScale: zoomScale,
        // zoom: zoom,
        // options: this.options
      // });
    // }
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
	let map = this._map;
	L.DomUtil.setTransform(this._canvas,
		map._latLngBoundsToNewLayerBounds(map.getBounds(), e.zoom, e.center).min,
		map.getZoomScale(e.zoom)
	);
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