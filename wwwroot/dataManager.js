(function () {
	'use strict';

	const WORLDWIDTHFULL = 40075016.685578496;
	const W = Math.floor(WORLDWIDTHFULL / 2);
	const DELAY = 60000;
	var CONST = {
	  DELAY,
	  WORLDWIDTHFULL,
	  W,
	  WORLDBBOX: [-W, -W, W, W],
	  HOST: 'maps.kosmosnimki.ru',
	  SCRIPTS: {
	    CheckVersion: '/Layer/CheckVersion.ashx'
	  }
	};

	const _self = self || window; // serverBase = _self.serverBase || 'maps.kosmosnimki.ru/',
	// serverProxy = serverBase + 'Plugins/ForestReport/proxy',
	// gmxProxy = '//maps.kosmosnimki.ru/ApiSave.ashx';
	// let _app = {},
	// loaderStatus = {},
	// _sessionKeys = {},


	let str = _self.location.origin || '',
	    _protocol = str.substring(0, str.indexOf('/')),
	    syncParams = {},
	    fetchOptions = {
	  // method: 'post',
	  // headers: {'Content-type': 'application/x-www-form-urlencoded'},
	  // mode: 'cors',
	  // redirect: 'follow',
	  credentials: 'include'
	};

	const COMPARS = {
	  WrapStyle: 'None',
	  ftc: 'osm',
	  srs: 3857
	};

	const setSyncParams = hash => {
	  // установка дополнительных параметров для серверных запросов
	  syncParams = hash;
	};

	const chkSignal = (signalName, signals, opt) => {
	  opt = opt || {};
	  let sObj = signals[signalName]; // console.log('sssssss', sObj, signalName)

	  if (sObj) {
	    sObj.abort();
	  }

	  sObj = signals[signalName] = new AbortController(); // sObj.signal.addEventListener('abort', (ev) => console.log('Отмена fetch:', ev));

	  opt.signal = sObj.signal;
	  signals[signalName] = sObj;
	  return opt;
	};
	/*
	const getSyncParams = (stringFlag:boolean) => {
		var res = syncParams;
		if (stringFlag) {
			// var arr = [];
			// for (var key in res) {
				// arr.push(key + '=' + res[key]);
			// }
			// res = arr.join('&');
		}
		return res;
	};
	const parseURLParams = (str) => {
		let sp = new URLSearchParams(str || location.search),
			out = {},
			arr = [];
		for (let p of sp) {
			let k = p[0], z = p[1];
			if (z) {
				if (!out[k]) {out[k] = [];}
				out[k].push(z);
			} else {
				arr.push(k);
			}
		}
		return {main: arr, keys: out};
	};
	*/


	let utils = {
	  getJson: function (queue) {
	    let params = queue.params || {};

	    if (queue.paramsArr) {
	      queue.paramsArr.forEach(it => {
	        params = Object.assign(params, it);
	      });
	    }

	    let par = Object.assign({}, params, syncParams);
	    let options = queue.options || {};
	    let opt = Object.assign({
	      method: 'post',
	      credentials: 'include',
	      headers: {
	        // 'Content-Type': 'application/json'
	        'Content-Type': 'application/x-www-form-urlencoded'
	      }
	    }, fetchOptions, options, {
	      body: utils.getFormBody(par)
	    });
	    return fetch(utils.chkProtocol(queue.url), opt).then(function (res) {
	      return utils.chkResponse(res, options.type);
	    }).then(function (res) {
	      return {
	        url: queue.url,
	        queue: queue,
	        load: true,
	        res: res
	      };
	    }).catch(function (err) {
	      return {
	        url: queue.url,
	        queue: queue,
	        load: false,
	        error: err.toString()
	      }; // handler.workerContext.postMessage(out);
	    });
	  },
	  getTileJson: function (queue) {
	    let params = queue.params || {};

	    if (queue.paramsArr) {
	      queue.paramsArr.forEach(it => {
	        params = Object.assign(params, it);
	      });
	    } // let par = Object.assign({}, fetchOptions, COMPARS, params, syncParams),


	    let par = Object.assign({}, COMPARS, params, syncParams);
	    let options = queue.options || {};
	    return fetch(queue.url + '?' + utils.getFormBody(par), fetchOptions).then(function (res) {
	      return utils.chkResponse(res, options.type);
	    });
	  },

	  /*
	  	extend: function (dest) {
	  		var i, j, len, src;
	  
	  		for (j = 1, len = arguments.length; j < len; j++) {
	  			src = arguments[j];
	  			for (i in src) {
	  				dest[i] = src[i];
	  			}
	  		}
	  		return dest;
	  	},
	  	makeTileKeys: function(it, ptiles) {
	  		var tklen = it.tilesOrder.length,
	  			arr = it.tiles,
	  			tiles = {},
	  			newTiles = {};
	  
	  		while (arr.length) {
	  			var t = arr.splice(0, tklen),
	  				tk = t.join('_'),
	  				tile = ptiles[tk];
	  			if (!tile || !tile.data) {
	  				if (!tile) {
	  					tiles[tk] = {
	  						tp: {z: t[0], x: t[1], y: t[2], v: t[3], s: t[4], d: t[5]}
	  					};
	  				} else {
	  					tiles[tk] = tile;
	  				}
	  				newTiles[tk] = true;
	  			} else {
	  				tiles[tk] = tile;
	  			}
	  		}
	  		return {tiles: tiles, newTiles: newTiles};
	  	},
	  
	  	getZoomRange: function(info) {
	  		var arr = info.properties.styles,
	  			out = [40, 0];
	  		for (var i = 0, len = arr.length; i < len; i++) {
	  			var st = arr[i];
	  			out[0] = Math.min(out[0], st.MinZoom);
	  			out[1] = Math.max(out[1], st.MaxZoom);
	  		}
	  		out[0] = out[0] === 40 ? 1 : out[0];
	  		out[1] = out[1] === 0 ? 22 : out[1];
	  		return out;
	  	},
	  */
	  chkProtocol: function (url) {
	    // return 'https:' + url;
	    return url.substr(0, _protocol.length) === _protocol ? url : _protocol + url;
	  },
	  getFormBody: function (par) {
	    return Object.keys(par).map(function (key) {
	      return encodeURIComponent(key) + '=' + encodeURIComponent(par[key]);
	    }).join('&');
	  },
	  chkResponse: function (resp, type) {
	    if (resp.status < 200 || resp.status >= 300) {
	      // error
	      return Promise.reject(resp);
	    } else {
	      var contentType = resp.headers.get('Content-Type');

	      if (type === 'bitmap') {
	        // get blob
	        return resp.blob();
	      } else if (contentType.indexOf('application/json') > -1) {
	        // application/json; charset=utf-8
	        return resp.json();
	      } else if (contentType.indexOf('text/javascript') > -1) {
	        // text/javascript; charset=utf-8
	        return resp.text(); // } else if (contentType.indexOf('application/json') > -1) {	 		// application/json; charset=utf-8
	        // ret = resp.text();
	        // } else if (contentType.indexOf('application/json') > -1) {	 		// application/json; charset=utf-8
	        // ret = resp.formData();
	        // } else if (contentType.indexOf('application/json') > -1) {	 		// application/json; charset=utf-8
	        // ret = resp.arrayBuffer();
	        // } else {
	      }
	    }

	    return resp.text();
	  }
	  /*
	  	getBitMap: function(url) {
	  		let options = {type: 'bitmap'};
	  		return fetch(url, options)
	  		.then(function(res) {
	  			return utils.chkResponse(res, options.type);
	  		// })
	  		// .then(function(blob) {
	  			// return createImageBitmap(blob, {
	  				// premultiplyAlpha: 'none',
	  				// colorSpaceConversion: 'none'
	  			// });
	  		});
	  	},
	  
	  	geoItemBounds: function(geo) {  // get item bounds array by geometry
	          if (!geo) {
	              return {
	                  bounds: null,
	                  boundsArr: []
	              };
	          }
	          var type = geo.type,
	              coords = geo.coordinates,
	              b = null,
	              i = 0,
	              len = 0,
	              bounds = null,
	              boundsArr = [];
	          if (type === 'MULTIPOLYGON' || type === 'MultiPolygon') {
	              bounds = new Bounds();
	              for (i = 0, len = coords.length; i < len; i++) {
	                  var arr1 = [];
	                  for (var j = 0, len1 = coords[i].length; j < len1; j++) {
	                      b = new Bounds(coords[i][j]);
	                      arr1.push(b);
	                      if (j === 0) { bounds.extendBounds(b); }
	                  }
	                  boundsArr.push(arr1);
	              }
	          } else if (type === 'POLYGON' || type === 'Polygon') {
	              bounds = new Bounds();
	              for (i = 0, len = coords.length; i < len; i++) {
	                  b = new Bounds(coords[i]);
	                  boundsArr.push(b);
	                  if (i === 0) { bounds.extendBounds(b); }
	              }
	          } else if (type === 'POINT' || type === 'Point') {
	              bounds = new Bounds([coords]);
	          } else if (type === 'MULTIPOINT' || type === 'MultiPoint') {
	              bounds = new Bounds();
	              for (i = 0, len = coords.length; i < len; i++) {
	                  b = new Bounds([coords[i]]);
	                  bounds.extendBounds(b);
	              }
	          } else if (type === 'LINESTRING' || type === 'LineString') {
	              bounds = new Bounds(coords);
	              //boundsArr.push(bounds);
	          } else if (type === 'MULTILINESTRING' || type === 'MultiLineString') {
	              bounds = new Bounds();
	              for (i = 0, len = coords.length; i < len; i++) {
	                  b = new Bounds(coords[i]);
	                  bounds.extendBounds(b);
	                  //boundsArr.push(b);
	              }
	          }
	          return {
	              bounds: bounds,
	              boundsArr: boundsArr
	          };
	      }
	  */

	};
	/*
	const requestSessionKey = (serverHost, apiKey) => {
		let keys = _sessionKeys;
		if (!(serverHost in keys)) {
			keys[serverHost] = new Promise(function(resolve, reject) {
				if (apiKey) {
					utils.getJson({
						url: '//' + serverHost + '/ApiKey.ashx',
						params: {WrapStyle: 'None', Key: apiKey}
					})
						.then(function(json) {
							let res = json.res;
							if (res.Status === 'ok' && res.Result) {
								resolve(res.Result.Key !== 'null' ? '' : res.Result.Key);
							} else {
								reject(json);
							}
						})
						.catch(function() {
							resolve('');
						});
				} else {
					resolve('');
				}
			});
		}
		return keys[serverHost];
	};
	let _maps = {};
	const getMapTree = (pars) => {
		pars = pars || {};
		let hostName = pars.hostName || serverBase,
			id = pars.mapId;
		return utils.getJson({
			url: '//' + hostName + '/Map/GetMapFolder',
			// options: {},
			params: {
				srs: 3857, 
				skipTiles: 'All',

				mapId: id,
				folderId: 'root',
				visibleItemOnly: false
			}
		})
			.then(function(json) {
				let out = parseTree(json.res);
				_maps[hostName] = _maps[hostName] || {};
				_maps[hostName][id] = out;
				return parseTree(out);
			});
	};
	const getReq = url => {
		return fetch(url, {
				method: 'get',
				mode: 'cors',
				credentials: 'include'
			// headers: {'Accept': 'application/json'},
			// body: JSON.stringify(params)	// TODO: сервер почему то не хочет работать так https://googlechrome.github.io/samples/fetch-api/fetch-post.html
			})
			.then(res => res.json())
			.catch(err => console.warn(err));
	};

	// const getLayerItems = (params) => {
		// params = params || {};

		// let url = `${serverBase}VectorLayer/Search.ashx`;
		// url += '?layer=' + params.layerID;
		// if (params.id) { '&query=gmx_id=' + params.id; }

		// url += '&out_cs=EPSG:4326';
		// url += '&geometry=true';
		// return getReq(url);
	// };
	// const getReportsCount = () => {
		// return getReq(serverProxy + '?path=/rest/v1/get-current-user-info');
	// };

	let dataSources = {},
		loaderStatus1 = {};

	const addDataSource = (pars) => {
		pars = pars || {};

		let id = pars.id;
		if (id) {
			let hostName = pars.hostName;
			
		} else {
			console.warn('Warning: Specify layer \'id\' and \'hostName\`', pars);
		}
	console.log('addDataSource:', pars);
		return;
	};

	const removeDataSource = (pars) => {
		pars = pars || {};

		let id = pars.id;
		if (id) {
			let hostName = pars.hostName;
			
		} else {
			console.warn('Warning: Specify layer \'id\' and \'hostName\`', pars);
		}
	console.log('removeDataSource:', pars);
		//Requests.removeDataSource({id: message.layerID, hostName: message.hostName}).then((json) => {
		return;
	};
	let _maps = {};
	const getMapTree = (pars) => {
		pars = pars || {};
		let hostName = pars.hostName || 'maps.kosmosnimki.ru',
			id = pars.mapID;
		return utils.getJson({
			url: '//' + hostName + '/Map/GetMapFolder',
			// options: {},
			params: {
				srs: 3857, 
				skipTiles: 'All',

				mapId: id,
				folderId: 'root',
				visibleItemOnly: false
			}
		})
			// .then(function(json) {
				// let out = parseTree(json.res);
				// _maps[hostName] = _maps[hostName] || {};
				// _maps[hostName][id] = out;
				// return parseTree(out);
			// });
	};

	const _iterateNodeChilds = (node, level, out) => {
		level = level || 0;
		out = out || {
			layers: []
		};
		
		if (node) {
			let type = node.type,
				content = node.content,
				props = content.properties;
			if (type === 'layer') {
				let ph = utils.parseLayerProps(props);
				ph.level = level;
				if (content.geometry) { ph.geometry = content.geometry; }
				out.layers.push(ph);
			} else if (type === 'group') {
				let childs = content.children || [];
				out.layers.push({ level: level, group: true, childsLen: childs.length, properties: props });
				childs.map((it) => {
					_iterateNodeChilds(it, level + 1, out);
				});
			}
			
		} else {
			return out;
		}
		return out;
	};

	const parseTree = (json) => {
		let out = {};
		if (json.Status === 'error') {
			out = json;
		} else if (json.Result && json.Result.content) {
			out = _iterateNodeChilds(json.Result);
			out.mapAttr = out.layers.shift();
		}
	// console.log('______json_out_______', out, json)
		return out;
	};
	*/

	const Bounds = function (arr) {
	  this.min = {
	    x: Number.MAX_VALUE,
	    y: Number.MAX_VALUE
	  };
	  this.max = {
	    x: -Number.MAX_VALUE,
	    y: -Number.MAX_VALUE
	  };
	  this.extendArray(arr);
	};

	Bounds.prototype = {
	  extend: function (x, y) {
	    if (x < this.min.x) {
	      this.min.x = x;
	    }

	    if (x > this.max.x) {
	      this.max.x = x;
	    }

	    if (y < this.min.y) {
	      this.min.y = y;
	    }

	    if (y > this.max.y) {
	      this.max.y = y;
	    }

	    return this;
	  },
	  extendBounds: function (bounds) {
	    return this.extendArray([[bounds.min.x, bounds.min.y], [bounds.max.x, bounds.max.y]]);
	  },
	  extendArray: function (arr) {
	    if (!arr || !arr.length) {
	      return this;
	    }

	    var i, len;

	    if (typeof arr[0] === 'number') {
	      for (i = 0, len = arr.length; i < len; i += 2) {
	        this.extend(arr[i], arr[i + 1]);
	      }
	    } else {
	      for (i = 0, len = arr.length; i < len; i++) {
	        this.extend(arr[i][0], arr[i][1]);
	      }
	    }

	    return this;
	  },
	  addBuffer: function (dxmin, dymin, dxmax, dymax) {
	    this.min.x -= dxmin;
	    this.min.y -= dymin || dxmin;
	    this.max.x += dxmax || dxmin;
	    this.max.y += dymax || dymin || dxmin;
	    return this;
	  },
	  contains: function (point) {
	    // ([x, y]) -> Boolean
	    var min = this.min,
	        max = this.max,
	        x = point[0],
	        y = point[1];
	    return x >= min.x && x <= max.x && y >= min.y && y <= max.y;
	  },
	  containsWithDelta: function (point, dx, dy) {
	    // ([x, y]) -> Boolean
	    var min = this.min,
	        max = this.max,
	        x = point[0],
	        y = point[1];
	    dx = dx || 0;
	    dy = dy || dx;
	    return x >= min.x - dx && x <= max.x + dx && y >= min.y - dy && y <= max.y + dy;
	  },
	  getCenter: function () {
	    var min = this.min,
	        max = this.max;
	    return [(min.x + max.x) / 2, (min.y + max.y) / 2];
	  },
	  addOffset: function (offset) {
	    this.min.x += offset[0];
	    this.max.x += offset[0];
	    this.min.y += offset[1];
	    this.max.y += offset[1];
	    return this;
	  },
	  intersects: function (bounds) {
	    // (Bounds) -> Boolean
	    var min = this.min,
	        max = this.max,
	        min2 = bounds.min,
	        max2 = bounds.max;
	    return max2.x > min.x && min2.x < max.x && max2.y > min.y && min2.y < max.y;
	  },
	  intersectsWithDelta: function (bounds, dx, dy) {
	    // (Bounds, dx, dy) -> Boolean
	    var min = this.min,
	        max = this.max,
	        x = dx || 0,
	        y = dy || x,
	        min2 = bounds.min,
	        max2 = bounds.max;
	    return max2.x + x > min.x && min2.x - x < max.x && max2.y + y > min.y && min2.y - y < max.y;
	  },
	  isEqual: function (bounds) {
	    // (Bounds) -> Boolean
	    var min = this.min,
	        max = this.max,
	        min2 = bounds.min,
	        max2 = bounds.max;
	    return max2.x === max.x && min2.x === min.x && max2.y === max.y && min2.y === min.y;
	  },
	  isNodeIntersect: function (coords) {
	    for (var i = 0, len = coords.length; i < len; i++) {
	      if (this.contains(coords[i])) {
	        return {
	          num: i,
	          point: coords[i]
	        };
	      }
	    }

	    return null;
	  }
	}; // bounds: function(arr) {
	// return new Bounds(arr);
	// },

	var Request = {
	  bounds: arr => new Bounds(arr),
	  getTileBounds: function (coords, delta) {
	    var tileSize = CONST.WORLDWIDTHFULL / Math.pow(2, coords.z),
	        minx = coords.x * tileSize - CONST.W,
	        miny = CONST.W - tileSize - coords.y * tileSize;
	    delta = delta || 0;
	    return new Bounds([[minx - delta, miny - delta], [minx + tileSize + delta, miny + tileSize + delta]]);
	  },
	  // geoItemBounds: utils.geoItemBounds,
	  chkSignal,
	  COMPARS,
	  setSyncParams,
	  // getSyncParams,
	  // parseURLParams,
	  // getMapTree,
	  // extend: utils.extend,
	  // getBitMap: utils.getBitMap,
	  getFormBody: utils.getFormBody,
	  getTileJson: utils.getTileJson,
	  getJson: utils.getJson // addDataSource,
	  // removeDataSource,
	  // getReportsCount,
	  // getLayerItems

	};

	const TILE_PREFIX = 'gmxAPI._vectorTileReceiver(';
	function load_tiles (pars) {
	  pars = pars || {};

	  if (!pars.signals) {
	    pars.signals = {};
	  }

	  if (!pars.tilesPromise) {
	    pars.tilesPromise = {};
	  } // return new Promise((resolve) => {


	  let tilesOrder = pars.tilesOrder,
	      pb = pars.tiles,
	      tilesPromise = {};

	  for (let i = 0, len = pb.length; i < len; i += tilesOrder.length) {
	    let arr = pb.slice(i, i + tilesOrder.length),
	        tkey = arr.join('_'),
	        tHash = tilesOrder.reduce((p, c, j) => {
	      p[c] = arr[j];
	      return p;
	    }, {});

	    if (pars.tilesPromise[tkey]) {
	      tilesPromise[tkey] = pars.tilesPromise[tkey];
	    } else {
	      tilesPromise[tkey] = Request.getTileJson({
	        url: '//' + pars.hostName + '/TileSender.ashx',
	        options: Request.chkSignal(tkey, pars.signals, {}),
	        paramsArr: [tHash, {
	          r: 'j',
	          ModeKey: 'tile',
	          LayerName: pars.id
	        }]
	      }).then(json => {
	        delete pars.signals[tkey];

	        if (typeof json === 'string') {
	          if (json.substr(0, TILE_PREFIX.length) === TILE_PREFIX) {
	            json = json.replace(TILE_PREFIX, '');
	            json = JSON.parse(json.substr(0, json.length - 1));
	          }
	        }

	        json.bounds = Request.bounds([[json.bbox[0], json.bbox[1]], [json.bbox[2], json.bbox[3]]]);
	        json.boundsVtile = Request.getTileBounds(json, 0);
	        return json;
	      }).catch(err => {
	        console.warn('Bad vector tile:', tkey, err);
	      });
	    }
	  }

	  Object.keys(pars.signals).forEach(k => {
	    if (!tilesPromise[k]) {
	      pars.signals[k].abort();
	      delete pars.signals[k];
	    }
	  }); // pars.tilesPromise = tilesPromise;

	  return tilesPromise; // return out;
	  // Promise.all(arr).then((out) => {
	  // resolve(out);
	  // });
	  // });

	  /*
	  */
	}

	var Renderer = {
	  render2d: (options, coords) => {
	    const {
	      scale,
	      canvas
	    } = options;
	    const ctx = canvas.getContext("2d"); // console.log('coords', coords);

	    ctx.beginPath();
	    ctx.strokeStyle = 'black';
	    ctx.fillStyle = 'red'; // ctx.moveTo(coords[0], coords[1]);

	    ctx.arc(coords[0], coords[1], 14 / (2 * scale), 0, 2 * Math.PI); // ctx.arc(155, 166, 14, 0, 2 * Math.PI);

	    ctx.stroke();
	    ctx.fill();
	    return true;
	  },
	  render2dEmpty: options => {
	    const {
	      coords,
	      canvas
	    } = options; // const gl = canvas.getContext("webgl");

	    const {
	      x,
	      y,
	      z
	    } = coords;
	    const tileKey = [x, y, z].join(':');
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
	      ctx.arc(128, 128, 128, 0, Math.PI * 2, false); // ctx.stroke();        

	      ctx.font = '25px serif';
	      let textMetrics = ctx.measureText(tileKey);
	      ctx.fillText(tileKey, 128 - textMetrics.width / 2, 100);
	      ctx.stroke(); // console.log('render', tileKey);
	    }

	    requestAnimationFrame(render);
	    return true;
	  }
	};

	const hosts = {};
	let bbox = null;
	let zoom = 3;
	let scale = 1;
	let intervalID;
	let timeoutID;
	const utils$1 = {
	  now: function () {
	    if (timeoutID) {
	      clearTimeout(timeoutID);
	    }

	    timeoutID = setTimeout(chkVersion, 0);
	  },
	  stop: function () {
	    // console.log('stop:', intervalID, CONST.DELAY);
	    if (intervalID) {
	      clearInterval(intervalID);
	    }

	    intervalID = null;
	  },
	  start: function (msec) {
	    // console.log('start:', intervalID, msec);
	    utils$1.stop();
	    intervalID = setInterval(chkVersion, msec || CONST.DELAY);
	  },
	  addSource: attr => {
	    let id = attr.id || attr.layerId;

	    if (id) {
	      let hostName = attr.hostName || CONST.HOST;

	      if (!hosts[hostName]) {
	        hosts[hostName] = {
	          ids: {},
	          signals: {}
	        };

	        if (attr.apiKey) {
	          hosts[hostName].apiKeyPromise = Request.getJson({
	            url: '//' + hostName + '/ApiKey.ashx',
	            paramsArr: [Request.COMPARS, {
	              Key: attr.apiKey
	            }]
	          }).then(json => {
	            // console.log('/ApiKey.ashx', json);
	            let res = json.res;

	            if (res.Status === 'ok' && res.Result) {
	              hosts[hostName].Key = res.Result.Key;
	              return hosts[hostName].Key;
	            }
	          });
	        }
	      }

	      hosts[hostName].ids[id] = attr;

	      if (!intervalID) {
	        utils$1.start(0);
	      }

	      utils$1.now();
	    } else {
	      console.warn('Warning: Specify source `id` and `hostName`', attr);
	    }
	  },
	  removeSource: attr => {
	    attr = attr || {};
	    let id = attr.id;

	    if (id) {
	      let hostName = attr.hostName || CONST.HOST;

	      if (hosts[hostName]) {
	        let pt = hosts[hostName].ids[id];
	        console.log('signals:', pt.signals, pt);

	        if (pt.signals) {
	          Object.values(pt.signals).forEach(it => {
	            it.abort();
	          });
	        }

	        delete hosts[hostName].ids[id];

	        if (Object.keys(hosts[hostName].ids).length === 0) {
	          delete hosts[hostName];
	        }

	        if (Object.keys(hosts).length === 0) {
	          utils$1.stop();
	        }
	      }
	    } else {
	      console.warn('Warning: Specify layer id and hostName', attr);
	    }
	  },
	  getTileAttributes: function (prop) {
	    let tileAttributeIndexes = {};
	    let tileAttributeTypes = {};

	    if (prop.attributes) {
	      let attrs = prop.attributes,
	          attrTypes = prop.attrTypes || null;

	      if (prop.identityField) {
	        tileAttributeIndexes[prop.identityField] = 0;
	      }

	      for (let a = 0; a < attrs.length; a++) {
	        let key = attrs[a];
	        tileAttributeIndexes[key] = a + 1;
	        tileAttributeTypes[key] = attrTypes ? attrTypes[a] : 'string';
	      }
	    }

	    return {
	      tileAttributeTypes: tileAttributeTypes,
	      tileAttributeIndexes: tileAttributeIndexes
	    };
	  },
	  chkHost: hostName => {
	    const hostLayers = hosts[hostName];
	    const ids = hostLayers.ids;
	    const arr = [];

	    for (let name in ids) {
	      let pt = ids[name];
	      let pars = {
	        Name: name,
	        Version: 'v' in pt ? pt.v : -1
	      };

	      if (pt.dateBegin) {
	        pars.dateBegin = pt.dateBegin;
	      }

	      if (pt.dateEnd) {
	        pars.dateEnd = pt.dateEnd;
	      }

	      arr.push(pars);
	    }

	    return Request.getJson({
	      url: '//' + hostName + CONST.SCRIPTS.CheckVersion,
	      options: Request.chkSignal('chkVersion', hostLayers.signals, undefined),
	      paramsArr: [Request.COMPARS, {
	        layers: JSON.stringify(arr),
	        bboxes: JSON.stringify(bbox || [CONST.WORLDBBOX]),
	        // generalizedTiles: false,
	        zoom: zoom
	      }]
	    }).then(json => {
	      delete hostLayers.signals.chkVersion;
	      return json;
	    }).catch(err => {
	      console.error(err); // resolve('');
	    });
	  }
	};

	const chkVersion = () => {
	  // console.log('dataManager chkVersion', hosts);
	  for (let host in hosts) {
	    utils$1.chkHost(host).then(json => {
	      if (json.error) ; else {
	        let hostLayers = hosts[host];
	        let ids = hostLayers.ids;
	        let res = json.res;

	        if (res.Status === 'ok' && res.Result) {
	          res.Result.forEach(it => {
	            let pt = ids[it.name];
	            let props = it.properties;

	            if (props) {
	              pt.v = props.LayerVersion;
	              pt.properties = props;
	              pt.geometry = it.geometry;

	              if (!pt.tileAttributeIndexes) {
	                pt = Object.assign(pt, utils$1.getTileAttributes(props));
	              }
	            }

	            pt.hostName = host;
	            pt.tiles = it.tiles; // pt.tiles = it.tiles.slice(0, 12);

	            pt.tilesOrder = it.tilesOrder;
	            pt.tilesPromise = load_tiles(pt);
	            let event = new Event('tilesLoaded', {
	              bubbles: true
	            }); // (2)

	            event.detail = pt;
	            dispatchEvent(event);
	          });
	        } else if (res.Status === 'error') {
	          console.warn('Error: ', res);
	        }
	      }
	    });
	  }

	  self.postMessage({
	    cmd: 'chkVersion',
	    now: Date.now(),
	    res: 'done'
	  });
	};
	/*
	const repaintScreenTiles = (vt, pt, clearFlag) => {
		let done = false;
		if(pt.screen) {
			Object.keys(pt.screen).forEach(tileKey => {
				let st = pt.screen[tileKey];
				if (st.coords.z === zoom) {
					st.scale = scale;
					let delta = 14 / scale;
					let bounds = st.bounds;
					const ctx = st.canvas.getContext("2d");
					ctx.resetTransform();
					ctx.transform(scale, 0, 0, -scale, -bounds.min.x * scale, bounds.max.y * scale);

					if(vt.bounds.intersectsWithDelta(bounds, delta)) {
						vt.values.forEach(it => {
							const coords = it[it.length - 1].coordinates;
							if (bounds.containsWithDelta(coords, delta)) {
								Renderer.render2d(st, coords);
								done = true;
							}
						});
					}
				// } else if (clearFlag) {
					// delete pt.screen[tileKey];
				}
			});
		} else if(pt.screenAll) {
			const ctx = pt.screenAll.canvas.getContext("2d");
			ctx.resetTransform();
			ctx.transform(scale, 0, 0, -scale, -bbox[0][0] * scale, bbox[0][3] * scale);
					pt.screenAll.scale = scale;
						vt.values.forEach(it => {
							const coords = it[it.length - 1].coordinates;
							// if (bounds.containsWithDelta(coords, delta)) {
								Renderer.render2d(pt.screenAll, coords);
								done = true;
							// }
						});
		}
		return done;
	};
	*/


	const recheckVectorTiles = (pt, clearFlag) => {

	  if (pt.tilesPromise) {
	    if (pt.screenAll) {
	      const canvas = pt.screenAll.canvas;
	      const ctx = canvas.getContext("2d");
	      ctx.resetTransform();
	      ctx.clearRect(0, 0, canvas.width, canvas.height);
	      ctx.transform(scale, 0, 0, -scale, -bbox[0][0] * scale, bbox[0][3] * scale);
	      pt.screenAll.scale = scale;
	      let delta = 14 / scale;
	      let bounds = Request.bounds(bbox[0]); // let bounds = Request.bounds([[bbox[0][0], bbox[0][1]], [bbox[0][2], bbox[0][3]]]);

	      console.log('pt.tilesPromise', Object.keys(pt.tilesPromise).length);
	      Promise.all(Object.values(pt.tilesPromise)).then(res => {
	        res.forEach(vt => {
	          if (bounds.intersectsWithDelta(vt.bounds, delta)) {
	            vt.values.forEach(it => {
	              const coords = it[it.length - 1].coordinates;

	              if (bounds.containsWithDelta(coords, delta)) {
	                Renderer.render2d(pt.screenAll, coords);
	              }
	            });
	          }
	        });
	      }).then(res => {
	        bitmapToMain(pt.screenAll.id, canvas);
	      });
	      // Promise.all(Object.values(pt.tilesPromise)).then((res) => {
	      // res.forEach(vt => {
	      // done = repaintScreenTiles(vt, pt, clearFlag);
	      // });
	      // });
	    }
	  }
	  // tileKey,
	  // layerId: pt.id,
	  // cmd: 'render',
	  // res: 'done'
	  // });

	};

	const bitmapToMain = (layerId, canvas) => {
	  var imageData = canvas.transferToImageBitmap();
	  self.postMessage({
	    cmd: 'rendered',
	    layerId: layerId,
	    bitmap: imageData
	  }, [imageData]);
	};

	const redrawScreen = clearFlag => {
	  for (let host in hosts) {
	    let hostLayers = hosts[host];
	    let ids = hostLayers.ids;

	    for (let id in ids) {
	      let pt = ids[id];
	      recheckVectorTiles(pt);
	    }
	  }
	};

	addEventListener('tilesLoaded', redrawScreen);

	onmessage = function (evt) {
	  // console.log('dataManager', evt.data);
	  const data = evt.data || {};
	  const {
	    cmd
	  } = data; // let worker: Worker;

	  switch (cmd) {
	    case 'addSource':
	      utils$1.addSource(data);
	      break;

	    case 'addLayer':
	      data.worker = new Worker("renderer.js");
	      utils$1.addSource(data);
	      break;

	    case 'drawScreen':
	      let id1 = data.id;

	      if (id1) {
	        let hostName = data.hostName || CONST.HOST;

	        if (hosts[hostName]) {
	          let it = hosts[hostName].ids[id1];
	          it.screenAll = {
	            canvas: new OffscreenCanvas(data.width, data.height),
	            id: id1
	          };
	          redrawScreen();
	        }
	      }

	      break;

	    case 'drawTile':
	      let id = data.id;
	      const {
	        x,
	        y,
	        z
	      } = data.coords;
	      const tileKey = [x, y, z].join(':');

	      if (id) {
	        let hostName = data.hostName || CONST.HOST;

	        if (hosts[hostName]) {
	          let it = hosts[hostName].ids[id];

	          if (!it.screen) {
	            it.screen = {};
	          }

	          let bounds = Request.getTileBounds(data.coords, 0);
	          it.screen[tileKey] = {
	            bounds: bounds,
	            coords: data.coords,
	            canvas: data.canvas
	          };
	        }
	      }

	      break;

	    case 'moveend':
	      console.log('moveend', data);
	      zoom = data.zoom;
	      scale = data.scale;
	      bbox = data.bbox;
	      redrawScreen();
	      break;

	    default:
	      console.warn('Warning: Bad command ', data);
	      break;
	  }

	  requestAnimationFrame(chkVersion);
	};

}());
//# sourceMappingURL=dataManager.js.map
