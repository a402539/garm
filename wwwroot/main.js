(function () {
  'use strict';

  // https://github.com/python/cpython/blob/a74eea238f5baba15797e2e8b570d153bc8690a7/Modules/mathmodule.c#L1423
  class Adder {
    constructor() {
      this._partials = new Float64Array(32);
      this._n = 0;
    }
    add(x) {
      const p = this._partials;
      let i = 0;
      for (let j = 0; j < this._n && j < 32; j++) {
        const y = p[j],
          hi = x + y,
          lo = Math.abs(x) < Math.abs(y) ? x - (hi - y) : y - (hi - x);
        if (lo) p[i++] = lo;
        x = hi;
      }
      p[i] = x;
      this._n = i + 1;
      return this;
    }
    valueOf() {
      const p = this._partials;
      let n = this._n, x, y, lo, hi = 0;
      if (n > 0) {
        hi = p[--n];
        while (n > 0) {
          x = hi;
          y = p[--n];
          hi = x + y;
          lo = y - (hi - x);
          if (lo) break;
        }
        if (n > 0 && ((lo < 0 && p[n - 1] < 0) || (lo > 0 && p[n - 1] > 0))) {
          y = lo * 2;
          x = hi + y;
          if (y == x - hi) hi = x;
        }
      }
      return hi;
    }
  }

  function* flatten(arrays) {
    for (const array of arrays) {
      yield* array;
    }
  }

  function merge(arrays) {
    return Array.from(flatten(arrays));
  }

  var noop = {value: () => {}};

  function dispatch() {
    for (var i = 0, n = arguments.length, _ = {}, t; i < n; ++i) {
      if (!(t = arguments[i] + "") || (t in _) || /[\s.]/.test(t)) throw new Error("illegal type: " + t);
      _[t] = [];
    }
    return new Dispatch(_);
  }

  function Dispatch(_) {
    this._ = _;
  }

  function parseTypenames(typenames, types) {
    return typenames.trim().split(/^|\s+/).map(function(t) {
      var name = "", i = t.indexOf(".");
      if (i >= 0) name = t.slice(i + 1), t = t.slice(0, i);
      if (t && !types.hasOwnProperty(t)) throw new Error("unknown type: " + t);
      return {type: t, name: name};
    });
  }

  Dispatch.prototype = dispatch.prototype = {
    constructor: Dispatch,
    on: function(typename, callback) {
      var _ = this._,
          T = parseTypenames(typename + "", _),
          t,
          i = -1,
          n = T.length;

      // If no callback was specified, return the callback of the given type and name.
      if (arguments.length < 2) {
        while (++i < n) if ((t = (typename = T[i]).type) && (t = get(_[t], typename.name))) return t;
        return;
      }

      // If a type was specified, set the callback for the given type and name.
      // Otherwise, if a null callback was specified, remove callbacks of the given name.
      if (callback != null && typeof callback !== "function") throw new Error("invalid callback: " + callback);
      while (++i < n) {
        if (t = (typename = T[i]).type) _[t] = set(_[t], typename.name, callback);
        else if (callback == null) for (t in _) _[t] = set(_[t], typename.name, null);
      }

      return this;
    },
    copy: function() {
      var copy = {}, _ = this._;
      for (var t in _) copy[t] = _[t].slice();
      return new Dispatch(copy);
    },
    call: function(type, that) {
      if ((n = arguments.length - 2) > 0) for (var args = new Array(n), i = 0, n, t; i < n; ++i) args[i] = arguments[i + 2];
      if (!this._.hasOwnProperty(type)) throw new Error("unknown type: " + type);
      for (t = this._[type], i = 0, n = t.length; i < n; ++i) t[i].value.apply(that, args);
    },
    apply: function(type, that, args) {
      if (!this._.hasOwnProperty(type)) throw new Error("unknown type: " + type);
      for (var t = this._[type], i = 0, n = t.length; i < n; ++i) t[i].value.apply(that, args);
    }
  };

  function get(type, name) {
    for (var i = 0, n = type.length, c; i < n; ++i) {
      if ((c = type[i]).name === name) {
        return c.value;
      }
    }
  }

  function set(type, name, callback) {
    for (var i = 0, n = type.length; i < n; ++i) {
      if (type[i].name === name) {
        type[i] = noop, type = type.slice(0, i).concat(type.slice(i + 1));
        break;
      }
    }
    if (callback != null) type.push({name: name, value: callback});
    return type;
  }

  dispatch("start", "end", "cancel", "interrupt");

  function responseArrayBuffer(response) {
    if (!response.ok) throw new Error(response.status + " " + response.statusText);
    return response.arrayBuffer();
  }

  function buffer(input, init) {
    return fetch(input, init).then(responseArrayBuffer);
  }

  var epsilon = 1e-6;
  var epsilon2 = 1e-12;
  var pi = Math.PI;
  var halfPi = pi / 2;
  var quarterPi = pi / 4;
  var tau = pi * 2;

  var degrees = 180 / pi;
  var radians = pi / 180;

  var abs = Math.abs;
  var atan = Math.atan;
  var atan2 = Math.atan2;
  var cos = Math.cos;
  var exp = Math.exp;
  var log = Math.log;
  var sin = Math.sin;
  var sign = Math.sign || function(x) { return x > 0 ? 1 : x < 0 ? -1 : 0; };
  var sqrt = Math.sqrt;
  var tan = Math.tan;

  function acos(x) {
    return x > 1 ? 0 : x < -1 ? pi : Math.acos(x);
  }

  function asin(x) {
    return x > 1 ? halfPi : x < -1 ? -halfPi : Math.asin(x);
  }

  function noop$1() {}

  function streamGeometry(geometry, stream) {
    if (geometry && streamGeometryType.hasOwnProperty(geometry.type)) {
      streamGeometryType[geometry.type](geometry, stream);
    }
  }

  var streamObjectType = {
    Feature: function(object, stream) {
      streamGeometry(object.geometry, stream);
    },
    FeatureCollection: function(object, stream) {
      var features = object.features, i = -1, n = features.length;
      while (++i < n) streamGeometry(features[i].geometry, stream);
    }
  };

  var streamGeometryType = {
    Sphere: function(object, stream) {
      stream.sphere();
    },
    Point: function(object, stream) {
      object = object.coordinates;
      stream.point(object[0], object[1], object[2]);
    },
    MultiPoint: function(object, stream) {
      var coordinates = object.coordinates, i = -1, n = coordinates.length;
      while (++i < n) object = coordinates[i], stream.point(object[0], object[1], object[2]);
    },
    LineString: function(object, stream) {
      streamLine(object.coordinates, stream, 0);
    },
    MultiLineString: function(object, stream) {
      var coordinates = object.coordinates, i = -1, n = coordinates.length;
      while (++i < n) streamLine(coordinates[i], stream, 0);
    },
    Polygon: function(object, stream) {
      streamPolygon(object.coordinates, stream);
    },
    MultiPolygon: function(object, stream) {
      var coordinates = object.coordinates, i = -1, n = coordinates.length;
      while (++i < n) streamPolygon(coordinates[i], stream);
    },
    GeometryCollection: function(object, stream) {
      var geometries = object.geometries, i = -1, n = geometries.length;
      while (++i < n) streamGeometry(geometries[i], stream);
    }
  };

  function streamLine(coordinates, stream, closed) {
    var i = -1, n = coordinates.length - closed, coordinate;
    stream.lineStart();
    while (++i < n) coordinate = coordinates[i], stream.point(coordinate[0], coordinate[1], coordinate[2]);
    stream.lineEnd();
  }

  function streamPolygon(coordinates, stream) {
    var i = -1, n = coordinates.length;
    stream.polygonStart();
    while (++i < n) streamLine(coordinates[i], stream, 1);
    stream.polygonEnd();
  }

  function geoStream(object, stream) {
    if (object && streamObjectType.hasOwnProperty(object.type)) {
      streamObjectType[object.type](object, stream);
    } else {
      streamGeometry(object, stream);
    }
  }

  function spherical(cartesian) {
    return [atan2(cartesian[1], cartesian[0]), asin(cartesian[2])];
  }

  function cartesian(spherical) {
    var lambda = spherical[0], phi = spherical[1], cosPhi = cos(phi);
    return [cosPhi * cos(lambda), cosPhi * sin(lambda), sin(phi)];
  }

  function cartesianDot(a, b) {
    return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
  }

  function cartesianCross(a, b) {
    return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
  }

  // TODO return a
  function cartesianAddInPlace(a, b) {
    a[0] += b[0], a[1] += b[1], a[2] += b[2];
  }

  function cartesianScale(vector, k) {
    return [vector[0] * k, vector[1] * k, vector[2] * k];
  }

  // TODO return d
  function cartesianNormalizeInPlace(d) {
    var l = sqrt(d[0] * d[0] + d[1] * d[1] + d[2] * d[2]);
    d[0] /= l, d[1] /= l, d[2] /= l;
  }

  function compose(a, b) {

    function compose(x, y) {
      return x = a(x, y), b(x[0], x[1]);
    }

    if (a.invert && b.invert) compose.invert = function(x, y) {
      return x = b.invert(x, y), x && a.invert(x[0], x[1]);
    };

    return compose;
  }

  function rotationIdentity(lambda, phi) {
    return [abs(lambda) > pi ? lambda + Math.round(-lambda / tau) * tau : lambda, phi];
  }

  rotationIdentity.invert = rotationIdentity;

  function rotateRadians(deltaLambda, deltaPhi, deltaGamma) {
    return (deltaLambda %= tau) ? (deltaPhi || deltaGamma ? compose(rotationLambda(deltaLambda), rotationPhiGamma(deltaPhi, deltaGamma))
      : rotationLambda(deltaLambda))
      : (deltaPhi || deltaGamma ? rotationPhiGamma(deltaPhi, deltaGamma)
      : rotationIdentity);
  }

  function forwardRotationLambda(deltaLambda) {
    return function(lambda, phi) {
      return lambda += deltaLambda, [lambda > pi ? lambda - tau : lambda < -pi ? lambda + tau : lambda, phi];
    };
  }

  function rotationLambda(deltaLambda) {
    var rotation = forwardRotationLambda(deltaLambda);
    rotation.invert = forwardRotationLambda(-deltaLambda);
    return rotation;
  }

  function rotationPhiGamma(deltaPhi, deltaGamma) {
    var cosDeltaPhi = cos(deltaPhi),
        sinDeltaPhi = sin(deltaPhi),
        cosDeltaGamma = cos(deltaGamma),
        sinDeltaGamma = sin(deltaGamma);

    function rotation(lambda, phi) {
      var cosPhi = cos(phi),
          x = cos(lambda) * cosPhi,
          y = sin(lambda) * cosPhi,
          z = sin(phi),
          k = z * cosDeltaPhi + x * sinDeltaPhi;
      return [
        atan2(y * cosDeltaGamma - k * sinDeltaGamma, x * cosDeltaPhi - z * sinDeltaPhi),
        asin(k * cosDeltaGamma + y * sinDeltaGamma)
      ];
    }

    rotation.invert = function(lambda, phi) {
      var cosPhi = cos(phi),
          x = cos(lambda) * cosPhi,
          y = sin(lambda) * cosPhi,
          z = sin(phi),
          k = z * cosDeltaGamma - y * sinDeltaGamma;
      return [
        atan2(y * cosDeltaGamma + z * sinDeltaGamma, x * cosDeltaPhi + k * sinDeltaPhi),
        asin(k * cosDeltaPhi - x * sinDeltaPhi)
      ];
    };

    return rotation;
  }

  function rotation(rotate) {
    rotate = rotateRadians(rotate[0] * radians, rotate[1] * radians, rotate.length > 2 ? rotate[2] * radians : 0);

    function forward(coordinates) {
      coordinates = rotate(coordinates[0] * radians, coordinates[1] * radians);
      return coordinates[0] *= degrees, coordinates[1] *= degrees, coordinates;
    }

    forward.invert = function(coordinates) {
      coordinates = rotate.invert(coordinates[0] * radians, coordinates[1] * radians);
      return coordinates[0] *= degrees, coordinates[1] *= degrees, coordinates;
    };

    return forward;
  }

  // Generates a circle centered at [0°, 0°], with a given radius and precision.
  function circleStream(stream, radius, delta, direction, t0, t1) {
    if (!delta) return;
    var cosRadius = cos(radius),
        sinRadius = sin(radius),
        step = direction * delta;
    if (t0 == null) {
      t0 = radius + direction * tau;
      t1 = radius - step / 2;
    } else {
      t0 = circleRadius(cosRadius, t0);
      t1 = circleRadius(cosRadius, t1);
      if (direction > 0 ? t0 < t1 : t0 > t1) t0 += direction * tau;
    }
    for (var point, t = t0; direction > 0 ? t > t1 : t < t1; t -= step) {
      point = spherical([cosRadius, -sinRadius * cos(t), -sinRadius * sin(t)]);
      stream.point(point[0], point[1]);
    }
  }

  // Returns the signed angle of a cartesian point relative to [cosRadius, 0, 0].
  function circleRadius(cosRadius, point) {
    point = cartesian(point), point[0] -= cosRadius;
    cartesianNormalizeInPlace(point);
    var radius = acos(-point[1]);
    return ((-point[2] < 0 ? -radius : radius) + tau - epsilon) % tau;
  }

  function clipBuffer() {
    var lines = [],
        line;
    return {
      point: function(x, y, m) {
        line.push([x, y, m]);
      },
      lineStart: function() {
        lines.push(line = []);
      },
      lineEnd: noop$1,
      rejoin: function() {
        if (lines.length > 1) lines.push(lines.pop().concat(lines.shift()));
      },
      result: function() {
        var result = lines;
        lines = [];
        line = null;
        return result;
      }
    };
  }

  function pointEqual(a, b) {
    return abs(a[0] - b[0]) < epsilon && abs(a[1] - b[1]) < epsilon;
  }

  function Intersection(point, points, other, entry) {
    this.x = point;
    this.z = points;
    this.o = other; // another intersection
    this.e = entry; // is an entry?
    this.v = false; // visited
    this.n = this.p = null; // next & previous
  }

  // A generalized polygon clipping algorithm: given a polygon that has been cut
  // into its visible line segments, and rejoins the segments by interpolating
  // along the clip edge.
  function clipRejoin(segments, compareIntersection, startInside, interpolate, stream) {
    var subject = [],
        clip = [],
        i,
        n;

    segments.forEach(function(segment) {
      if ((n = segment.length - 1) <= 0) return;
      var n, p0 = segment[0], p1 = segment[n], x;

      if (pointEqual(p0, p1)) {
        if (!p0[2] && !p1[2]) {
          stream.lineStart();
          for (i = 0; i < n; ++i) stream.point((p0 = segment[i])[0], p0[1]);
          stream.lineEnd();
          return;
        }
        // handle degenerate cases by moving the point
        p1[0] += 2 * epsilon;
      }

      subject.push(x = new Intersection(p0, segment, null, true));
      clip.push(x.o = new Intersection(p0, null, x, false));
      subject.push(x = new Intersection(p1, segment, null, false));
      clip.push(x.o = new Intersection(p1, null, x, true));
    });

    if (!subject.length) return;

    clip.sort(compareIntersection);
    link(subject);
    link(clip);

    for (i = 0, n = clip.length; i < n; ++i) {
      clip[i].e = startInside = !startInside;
    }

    var start = subject[0],
        points,
        point;

    while (1) {
      // Find first unvisited intersection.
      var current = start,
          isSubject = true;
      while (current.v) if ((current = current.n) === start) return;
      points = current.z;
      stream.lineStart();
      do {
        current.v = current.o.v = true;
        if (current.e) {
          if (isSubject) {
            for (i = 0, n = points.length; i < n; ++i) stream.point((point = points[i])[0], point[1]);
          } else {
            interpolate(current.x, current.n.x, 1, stream);
          }
          current = current.n;
        } else {
          if (isSubject) {
            points = current.p.z;
            for (i = points.length - 1; i >= 0; --i) stream.point((point = points[i])[0], point[1]);
          } else {
            interpolate(current.x, current.p.x, -1, stream);
          }
          current = current.p;
        }
        current = current.o;
        points = current.z;
        isSubject = !isSubject;
      } while (!current.v);
      stream.lineEnd();
    }
  }

  function link(array) {
    if (!(n = array.length)) return;
    var n,
        i = 0,
        a = array[0],
        b;
    while (++i < n) {
      a.n = b = array[i];
      b.p = a;
      a = b;
    }
    a.n = b = array[0];
    b.p = a;
  }

  function longitude(point) {
    if (abs(point[0]) <= pi)
      return point[0];
    else
      return sign(point[0]) * ((abs(point[0]) + pi) % tau - pi);
  }

  function polygonContains(polygon, point) {
    var lambda = longitude(point),
        phi = point[1],
        sinPhi = sin(phi),
        normal = [sin(lambda), -cos(lambda), 0],
        angle = 0,
        winding = 0;

    var sum = new Adder();

    if (sinPhi === 1) phi = halfPi + epsilon;
    else if (sinPhi === -1) phi = -halfPi - epsilon;

    for (var i = 0, n = polygon.length; i < n; ++i) {
      if (!(m = (ring = polygon[i]).length)) continue;
      var ring,
          m,
          point0 = ring[m - 1],
          lambda0 = longitude(point0),
          phi0 = point0[1] / 2 + quarterPi,
          sinPhi0 = sin(phi0),
          cosPhi0 = cos(phi0);

      for (var j = 0; j < m; ++j, lambda0 = lambda1, sinPhi0 = sinPhi1, cosPhi0 = cosPhi1, point0 = point1) {
        var point1 = ring[j],
            lambda1 = longitude(point1),
            phi1 = point1[1] / 2 + quarterPi,
            sinPhi1 = sin(phi1),
            cosPhi1 = cos(phi1),
            delta = lambda1 - lambda0,
            sign = delta >= 0 ? 1 : -1,
            absDelta = sign * delta,
            antimeridian = absDelta > pi,
            k = sinPhi0 * sinPhi1;

        sum.add(atan2(k * sign * sin(absDelta), cosPhi0 * cosPhi1 + k * cos(absDelta)));
        angle += antimeridian ? delta + sign * tau : delta;

        // Are the longitudes either side of the point’s meridian (lambda),
        // and are the latitudes smaller than the parallel (phi)?
        if (antimeridian ^ lambda0 >= lambda ^ lambda1 >= lambda) {
          var arc = cartesianCross(cartesian(point0), cartesian(point1));
          cartesianNormalizeInPlace(arc);
          var intersection = cartesianCross(normal, arc);
          cartesianNormalizeInPlace(intersection);
          var phiArc = (antimeridian ^ delta >= 0 ? -1 : 1) * asin(intersection[2]);
          if (phi > phiArc || phi === phiArc && (arc[0] || arc[1])) {
            winding += antimeridian ^ delta >= 0 ? 1 : -1;
          }
        }
      }
    }

    // First, determine whether the South pole is inside or outside:
    //
    // It is inside if:
    // * the polygon winds around it in a clockwise direction.
    // * the polygon does not (cumulatively) wind around it, but has a negative
    //   (counter-clockwise) area.
    //
    // Second, count the (signed) number of times a segment crosses a lambda
    // from the point to the South pole.  If it is zero, then the point is the
    // same side as the South pole.

    return (angle < -epsilon || angle < epsilon && sum < -epsilon2) ^ (winding & 1);
  }

  function clip(pointVisible, clipLine, interpolate, start) {
    return function(sink) {
      var line = clipLine(sink),
          ringBuffer = clipBuffer(),
          ringSink = clipLine(ringBuffer),
          polygonStarted = false,
          polygon,
          segments,
          ring;

      var clip = {
        point: point,
        lineStart: lineStart,
        lineEnd: lineEnd,
        polygonStart: function() {
          clip.point = pointRing;
          clip.lineStart = ringStart;
          clip.lineEnd = ringEnd;
          segments = [];
          polygon = [];
        },
        polygonEnd: function() {
          clip.point = point;
          clip.lineStart = lineStart;
          clip.lineEnd = lineEnd;
          segments = merge(segments);
          var startInside = polygonContains(polygon, start);
          if (segments.length) {
            if (!polygonStarted) sink.polygonStart(), polygonStarted = true;
            clipRejoin(segments, compareIntersection, startInside, interpolate, sink);
          } else if (startInside) {
            if (!polygonStarted) sink.polygonStart(), polygonStarted = true;
            sink.lineStart();
            interpolate(null, null, 1, sink);
            sink.lineEnd();
          }
          if (polygonStarted) sink.polygonEnd(), polygonStarted = false;
          segments = polygon = null;
        },
        sphere: function() {
          sink.polygonStart();
          sink.lineStart();
          interpolate(null, null, 1, sink);
          sink.lineEnd();
          sink.polygonEnd();
        }
      };

      function point(lambda, phi) {
        if (pointVisible(lambda, phi)) sink.point(lambda, phi);
      }

      function pointLine(lambda, phi) {
        line.point(lambda, phi);
      }

      function lineStart() {
        clip.point = pointLine;
        line.lineStart();
      }

      function lineEnd() {
        clip.point = point;
        line.lineEnd();
      }

      function pointRing(lambda, phi) {
        ring.push([lambda, phi]);
        ringSink.point(lambda, phi);
      }

      function ringStart() {
        ringSink.lineStart();
        ring = [];
      }

      function ringEnd() {
        pointRing(ring[0][0], ring[0][1]);
        ringSink.lineEnd();

        var clean = ringSink.clean(),
            ringSegments = ringBuffer.result(),
            i, n = ringSegments.length, m,
            segment,
            point;

        ring.pop();
        polygon.push(ring);
        ring = null;

        if (!n) return;

        // No intersections.
        if (clean & 1) {
          segment = ringSegments[0];
          if ((m = segment.length - 1) > 0) {
            if (!polygonStarted) sink.polygonStart(), polygonStarted = true;
            sink.lineStart();
            for (i = 0; i < m; ++i) sink.point((point = segment[i])[0], point[1]);
            sink.lineEnd();
          }
          return;
        }

        // Rejoin connected segments.
        // TODO reuse ringBuffer.rejoin()?
        if (n > 1 && clean & 2) ringSegments.push(ringSegments.pop().concat(ringSegments.shift()));

        segments.push(ringSegments.filter(validSegment));
      }

      return clip;
    };
  }

  function validSegment(segment) {
    return segment.length > 1;
  }

  // Intersections are sorted along the clip edge. For both antimeridian cutting
  // and circle clipping, the same comparison is used.
  function compareIntersection(a, b) {
    return ((a = a.x)[0] < 0 ? a[1] - halfPi - epsilon : halfPi - a[1])
         - ((b = b.x)[0] < 0 ? b[1] - halfPi - epsilon : halfPi - b[1]);
  }

  var clipAntimeridian = clip(
    function() { return true; },
    clipAntimeridianLine,
    clipAntimeridianInterpolate,
    [-pi, -halfPi]
  );

  // Takes a line and cuts into visible segments. Return values: 0 - there were
  // intersections or the line was empty; 1 - no intersections; 2 - there were
  // intersections, and the first and last segments should be rejoined.
  function clipAntimeridianLine(stream) {
    var lambda0 = NaN,
        phi0 = NaN,
        sign0 = NaN,
        clean; // no intersections

    return {
      lineStart: function() {
        stream.lineStart();
        clean = 1;
      },
      point: function(lambda1, phi1) {
        var sign1 = lambda1 > 0 ? pi : -pi,
            delta = abs(lambda1 - lambda0);
        if (abs(delta - pi) < epsilon) { // line crosses a pole
          stream.point(lambda0, phi0 = (phi0 + phi1) / 2 > 0 ? halfPi : -halfPi);
          stream.point(sign0, phi0);
          stream.lineEnd();
          stream.lineStart();
          stream.point(sign1, phi0);
          stream.point(lambda1, phi0);
          clean = 0;
        } else if (sign0 !== sign1 && delta >= pi) { // line crosses antimeridian
          if (abs(lambda0 - sign0) < epsilon) lambda0 -= sign0 * epsilon; // handle degeneracies
          if (abs(lambda1 - sign1) < epsilon) lambda1 -= sign1 * epsilon;
          phi0 = clipAntimeridianIntersect(lambda0, phi0, lambda1, phi1);
          stream.point(sign0, phi0);
          stream.lineEnd();
          stream.lineStart();
          stream.point(sign1, phi0);
          clean = 0;
        }
        stream.point(lambda0 = lambda1, phi0 = phi1);
        sign0 = sign1;
      },
      lineEnd: function() {
        stream.lineEnd();
        lambda0 = phi0 = NaN;
      },
      clean: function() {
        return 2 - clean; // if intersections, rejoin first and last segments
      }
    };
  }

  function clipAntimeridianIntersect(lambda0, phi0, lambda1, phi1) {
    var cosPhi0,
        cosPhi1,
        sinLambda0Lambda1 = sin(lambda0 - lambda1);
    return abs(sinLambda0Lambda1) > epsilon
        ? atan((sin(phi0) * (cosPhi1 = cos(phi1)) * sin(lambda1)
            - sin(phi1) * (cosPhi0 = cos(phi0)) * sin(lambda0))
            / (cosPhi0 * cosPhi1 * sinLambda0Lambda1))
        : (phi0 + phi1) / 2;
  }

  function clipAntimeridianInterpolate(from, to, direction, stream) {
    var phi;
    if (from == null) {
      phi = direction * halfPi;
      stream.point(-pi, phi);
      stream.point(0, phi);
      stream.point(pi, phi);
      stream.point(pi, 0);
      stream.point(pi, -phi);
      stream.point(0, -phi);
      stream.point(-pi, -phi);
      stream.point(-pi, 0);
      stream.point(-pi, phi);
    } else if (abs(from[0] - to[0]) > epsilon) {
      var lambda = from[0] < to[0] ? pi : -pi;
      phi = direction * lambda / 2;
      stream.point(-lambda, phi);
      stream.point(0, phi);
      stream.point(lambda, phi);
    } else {
      stream.point(to[0], to[1]);
    }
  }

  function clipCircle(radius) {
    var cr = cos(radius),
        delta = 6 * radians,
        smallRadius = cr > 0,
        notHemisphere = abs(cr) > epsilon; // TODO optimise for this common case

    function interpolate(from, to, direction, stream) {
      circleStream(stream, radius, delta, direction, from, to);
    }

    function visible(lambda, phi) {
      return cos(lambda) * cos(phi) > cr;
    }

    // Takes a line and cuts into visible segments. Return values used for polygon
    // clipping: 0 - there were intersections or the line was empty; 1 - no
    // intersections 2 - there were intersections, and the first and last segments
    // should be rejoined.
    function clipLine(stream) {
      var point0, // previous point
          c0, // code for previous point
          v0, // visibility of previous point
          v00, // visibility of first point
          clean; // no intersections
      return {
        lineStart: function() {
          v00 = v0 = false;
          clean = 1;
        },
        point: function(lambda, phi) {
          var point1 = [lambda, phi],
              point2,
              v = visible(lambda, phi),
              c = smallRadius
                ? v ? 0 : code(lambda, phi)
                : v ? code(lambda + (lambda < 0 ? pi : -pi), phi) : 0;
          if (!point0 && (v00 = v0 = v)) stream.lineStart();
          if (v !== v0) {
            point2 = intersect(point0, point1);
            if (!point2 || pointEqual(point0, point2) || pointEqual(point1, point2))
              point1[2] = 1;
          }
          if (v !== v0) {
            clean = 0;
            if (v) {
              // outside going in
              stream.lineStart();
              point2 = intersect(point1, point0);
              stream.point(point2[0], point2[1]);
            } else {
              // inside going out
              point2 = intersect(point0, point1);
              stream.point(point2[0], point2[1], 2);
              stream.lineEnd();
            }
            point0 = point2;
          } else if (notHemisphere && point0 && smallRadius ^ v) {
            var t;
            // If the codes for two points are different, or are both zero,
            // and there this segment intersects with the small circle.
            if (!(c & c0) && (t = intersect(point1, point0, true))) {
              clean = 0;
              if (smallRadius) {
                stream.lineStart();
                stream.point(t[0][0], t[0][1]);
                stream.point(t[1][0], t[1][1]);
                stream.lineEnd();
              } else {
                stream.point(t[1][0], t[1][1]);
                stream.lineEnd();
                stream.lineStart();
                stream.point(t[0][0], t[0][1], 3);
              }
            }
          }
          if (v && (!point0 || !pointEqual(point0, point1))) {
            stream.point(point1[0], point1[1]);
          }
          point0 = point1, v0 = v, c0 = c;
        },
        lineEnd: function() {
          if (v0) stream.lineEnd();
          point0 = null;
        },
        // Rejoin first and last segments if there were intersections and the first
        // and last points were visible.
        clean: function() {
          return clean | ((v00 && v0) << 1);
        }
      };
    }

    // Intersects the great circle between a and b with the clip circle.
    function intersect(a, b, two) {
      var pa = cartesian(a),
          pb = cartesian(b);

      // We have two planes, n1.p = d1 and n2.p = d2.
      // Find intersection line p(t) = c1 n1 + c2 n2 + t (n1 ⨯ n2).
      var n1 = [1, 0, 0], // normal
          n2 = cartesianCross(pa, pb),
          n2n2 = cartesianDot(n2, n2),
          n1n2 = n2[0], // cartesianDot(n1, n2),
          determinant = n2n2 - n1n2 * n1n2;

      // Two polar points.
      if (!determinant) return !two && a;

      var c1 =  cr * n2n2 / determinant,
          c2 = -cr * n1n2 / determinant,
          n1xn2 = cartesianCross(n1, n2),
          A = cartesianScale(n1, c1),
          B = cartesianScale(n2, c2);
      cartesianAddInPlace(A, B);

      // Solve |p(t)|^2 = 1.
      var u = n1xn2,
          w = cartesianDot(A, u),
          uu = cartesianDot(u, u),
          t2 = w * w - uu * (cartesianDot(A, A) - 1);

      if (t2 < 0) return;

      var t = sqrt(t2),
          q = cartesianScale(u, (-w - t) / uu);
      cartesianAddInPlace(q, A);
      q = spherical(q);

      if (!two) return q;

      // Two intersection points.
      var lambda0 = a[0],
          lambda1 = b[0],
          phi0 = a[1],
          phi1 = b[1],
          z;

      if (lambda1 < lambda0) z = lambda0, lambda0 = lambda1, lambda1 = z;

      var delta = lambda1 - lambda0,
          polar = abs(delta - pi) < epsilon,
          meridian = polar || delta < epsilon;

      if (!polar && phi1 < phi0) z = phi0, phi0 = phi1, phi1 = z;

      // Check that the first point is between a and b.
      if (meridian
          ? polar
            ? phi0 + phi1 > 0 ^ q[1] < (abs(q[0] - lambda0) < epsilon ? phi0 : phi1)
            : phi0 <= q[1] && q[1] <= phi1
          : delta > pi ^ (lambda0 <= q[0] && q[0] <= lambda1)) {
        var q1 = cartesianScale(u, (-w + t) / uu);
        cartesianAddInPlace(q1, A);
        return [q, spherical(q1)];
      }
    }

    // Generates a 4-bit vector representing the location of a point relative to
    // the small circle's bounding box.
    function code(lambda, phi) {
      var r = smallRadius ? radius : pi - radius,
          code = 0;
      if (lambda < -r) code |= 1; // left
      else if (lambda > r) code |= 2; // right
      if (phi < -r) code |= 4; // below
      else if (phi > r) code |= 8; // above
      return code;
    }

    return clip(visible, clipLine, interpolate, smallRadius ? [0, -radius] : [-pi, radius - pi]);
  }

  function clipLine(a, b, x0, y0, x1, y1) {
    var ax = a[0],
        ay = a[1],
        bx = b[0],
        by = b[1],
        t0 = 0,
        t1 = 1,
        dx = bx - ax,
        dy = by - ay,
        r;

    r = x0 - ax;
    if (!dx && r > 0) return;
    r /= dx;
    if (dx < 0) {
      if (r < t0) return;
      if (r < t1) t1 = r;
    } else if (dx > 0) {
      if (r > t1) return;
      if (r > t0) t0 = r;
    }

    r = x1 - ax;
    if (!dx && r < 0) return;
    r /= dx;
    if (dx < 0) {
      if (r > t1) return;
      if (r > t0) t0 = r;
    } else if (dx > 0) {
      if (r < t0) return;
      if (r < t1) t1 = r;
    }

    r = y0 - ay;
    if (!dy && r > 0) return;
    r /= dy;
    if (dy < 0) {
      if (r < t0) return;
      if (r < t1) t1 = r;
    } else if (dy > 0) {
      if (r > t1) return;
      if (r > t0) t0 = r;
    }

    r = y1 - ay;
    if (!dy && r < 0) return;
    r /= dy;
    if (dy < 0) {
      if (r > t1) return;
      if (r > t0) t0 = r;
    } else if (dy > 0) {
      if (r < t0) return;
      if (r < t1) t1 = r;
    }

    if (t0 > 0) a[0] = ax + t0 * dx, a[1] = ay + t0 * dy;
    if (t1 < 1) b[0] = ax + t1 * dx, b[1] = ay + t1 * dy;
    return true;
  }

  var clipMax = 1e9, clipMin = -clipMax;

  // TODO Use d3-polygon’s polygonContains here for the ring check?
  // TODO Eliminate duplicate buffering in clipBuffer and polygon.push?

  function clipRectangle(x0, y0, x1, y1) {

    function visible(x, y) {
      return x0 <= x && x <= x1 && y0 <= y && y <= y1;
    }

    function interpolate(from, to, direction, stream) {
      var a = 0, a1 = 0;
      if (from == null
          || (a = corner(from, direction)) !== (a1 = corner(to, direction))
          || comparePoint(from, to) < 0 ^ direction > 0) {
        do stream.point(a === 0 || a === 3 ? x0 : x1, a > 1 ? y1 : y0);
        while ((a = (a + direction + 4) % 4) !== a1);
      } else {
        stream.point(to[0], to[1]);
      }
    }

    function corner(p, direction) {
      return abs(p[0] - x0) < epsilon ? direction > 0 ? 0 : 3
          : abs(p[0] - x1) < epsilon ? direction > 0 ? 2 : 1
          : abs(p[1] - y0) < epsilon ? direction > 0 ? 1 : 0
          : direction > 0 ? 3 : 2; // abs(p[1] - y1) < epsilon
    }

    function compareIntersection(a, b) {
      return comparePoint(a.x, b.x);
    }

    function comparePoint(a, b) {
      var ca = corner(a, 1),
          cb = corner(b, 1);
      return ca !== cb ? ca - cb
          : ca === 0 ? b[1] - a[1]
          : ca === 1 ? a[0] - b[0]
          : ca === 2 ? a[1] - b[1]
          : b[0] - a[0];
    }

    return function(stream) {
      var activeStream = stream,
          bufferStream = clipBuffer(),
          segments,
          polygon,
          ring,
          x__, y__, v__, // first point
          x_, y_, v_, // previous point
          first,
          clean;

      var clipStream = {
        point: point,
        lineStart: lineStart,
        lineEnd: lineEnd,
        polygonStart: polygonStart,
        polygonEnd: polygonEnd
      };

      function point(x, y) {
        if (visible(x, y)) activeStream.point(x, y);
      }

      function polygonInside() {
        var winding = 0;

        for (var i = 0, n = polygon.length; i < n; ++i) {
          for (var ring = polygon[i], j = 1, m = ring.length, point = ring[0], a0, a1, b0 = point[0], b1 = point[1]; j < m; ++j) {
            a0 = b0, a1 = b1, point = ring[j], b0 = point[0], b1 = point[1];
            if (a1 <= y1) { if (b1 > y1 && (b0 - a0) * (y1 - a1) > (b1 - a1) * (x0 - a0)) ++winding; }
            else { if (b1 <= y1 && (b0 - a0) * (y1 - a1) < (b1 - a1) * (x0 - a0)) --winding; }
          }
        }

        return winding;
      }

      // Buffer geometry within a polygon and then clip it en masse.
      function polygonStart() {
        activeStream = bufferStream, segments = [], polygon = [], clean = true;
      }

      function polygonEnd() {
        var startInside = polygonInside(),
            cleanInside = clean && startInside,
            visible = (segments = merge(segments)).length;
        if (cleanInside || visible) {
          stream.polygonStart();
          if (cleanInside) {
            stream.lineStart();
            interpolate(null, null, 1, stream);
            stream.lineEnd();
          }
          if (visible) {
            clipRejoin(segments, compareIntersection, startInside, interpolate, stream);
          }
          stream.polygonEnd();
        }
        activeStream = stream, segments = polygon = ring = null;
      }

      function lineStart() {
        clipStream.point = linePoint;
        if (polygon) polygon.push(ring = []);
        first = true;
        v_ = false;
        x_ = y_ = NaN;
      }

      // TODO rather than special-case polygons, simply handle them separately.
      // Ideally, coincident intersection points should be jittered to avoid
      // clipping issues.
      function lineEnd() {
        if (segments) {
          linePoint(x__, y__);
          if (v__ && v_) bufferStream.rejoin();
          segments.push(bufferStream.result());
        }
        clipStream.point = point;
        if (v_) activeStream.lineEnd();
      }

      function linePoint(x, y) {
        var v = visible(x, y);
        if (polygon) ring.push([x, y]);
        if (first) {
          x__ = x, y__ = y, v__ = v;
          first = false;
          if (v) {
            activeStream.lineStart();
            activeStream.point(x, y);
          }
        } else {
          if (v && v_) activeStream.point(x, y);
          else {
            var a = [x_ = Math.max(clipMin, Math.min(clipMax, x_)), y_ = Math.max(clipMin, Math.min(clipMax, y_))],
                b = [x = Math.max(clipMin, Math.min(clipMax, x)), y = Math.max(clipMin, Math.min(clipMax, y))];
            if (clipLine(a, b, x0, y0, x1, y1)) {
              if (!v_) {
                activeStream.lineStart();
                activeStream.point(a[0], a[1]);
              }
              activeStream.point(b[0], b[1]);
              if (!v) activeStream.lineEnd();
              clean = false;
            } else if (v) {
              activeStream.lineStart();
              activeStream.point(x, y);
              clean = false;
            }
          }
        }
        x_ = x, y_ = y, v_ = v;
      }

      return clipStream;
    };
  }

  var identity = x => x;

  var areaSum = new Adder(),
      areaRingSum = new Adder(),
      x00,
      y00,
      x0,
      y0;

  var areaStream = {
    point: noop$1,
    lineStart: noop$1,
    lineEnd: noop$1,
    polygonStart: function() {
      areaStream.lineStart = areaRingStart;
      areaStream.lineEnd = areaRingEnd;
    },
    polygonEnd: function() {
      areaStream.lineStart = areaStream.lineEnd = areaStream.point = noop$1;
      areaSum.add(abs(areaRingSum));
      areaRingSum = new Adder();
    },
    result: function() {
      var area = areaSum / 2;
      areaSum = new Adder();
      return area;
    }
  };

  function areaRingStart() {
    areaStream.point = areaPointFirst;
  }

  function areaPointFirst(x, y) {
    areaStream.point = areaPoint;
    x00 = x0 = x, y00 = y0 = y;
  }

  function areaPoint(x, y) {
    areaRingSum.add(y0 * x - x0 * y);
    x0 = x, y0 = y;
  }

  function areaRingEnd() {
    areaPoint(x00, y00);
  }

  var x0$1 = Infinity,
      y0$1 = x0$1,
      x1 = -x0$1,
      y1 = x1;

  var boundsStream = {
    point: boundsPoint,
    lineStart: noop$1,
    lineEnd: noop$1,
    polygonStart: noop$1,
    polygonEnd: noop$1,
    result: function() {
      var bounds = [[x0$1, y0$1], [x1, y1]];
      x1 = y1 = -(y0$1 = x0$1 = Infinity);
      return bounds;
    }
  };

  function boundsPoint(x, y) {
    if (x < x0$1) x0$1 = x;
    if (x > x1) x1 = x;
    if (y < y0$1) y0$1 = y;
    if (y > y1) y1 = y;
  }

  // TODO Enforce positive area for exterior, negative area for interior?

  var X0 = 0,
      Y0 = 0,
      Z0 = 0,
      X1 = 0,
      Y1 = 0,
      Z1 = 0,
      X2 = 0,
      Y2 = 0,
      Z2 = 0,
      x00$1,
      y00$1,
      x0$2,
      y0$2;

  var centroidStream = {
    point: centroidPoint,
    lineStart: centroidLineStart,
    lineEnd: centroidLineEnd,
    polygonStart: function() {
      centroidStream.lineStart = centroidRingStart;
      centroidStream.lineEnd = centroidRingEnd;
    },
    polygonEnd: function() {
      centroidStream.point = centroidPoint;
      centroidStream.lineStart = centroidLineStart;
      centroidStream.lineEnd = centroidLineEnd;
    },
    result: function() {
      var centroid = Z2 ? [X2 / Z2, Y2 / Z2]
          : Z1 ? [X1 / Z1, Y1 / Z1]
          : Z0 ? [X0 / Z0, Y0 / Z0]
          : [NaN, NaN];
      X0 = Y0 = Z0 =
      X1 = Y1 = Z1 =
      X2 = Y2 = Z2 = 0;
      return centroid;
    }
  };

  function centroidPoint(x, y) {
    X0 += x;
    Y0 += y;
    ++Z0;
  }

  function centroidLineStart() {
    centroidStream.point = centroidPointFirstLine;
  }

  function centroidPointFirstLine(x, y) {
    centroidStream.point = centroidPointLine;
    centroidPoint(x0$2 = x, y0$2 = y);
  }

  function centroidPointLine(x, y) {
    var dx = x - x0$2, dy = y - y0$2, z = sqrt(dx * dx + dy * dy);
    X1 += z * (x0$2 + x) / 2;
    Y1 += z * (y0$2 + y) / 2;
    Z1 += z;
    centroidPoint(x0$2 = x, y0$2 = y);
  }

  function centroidLineEnd() {
    centroidStream.point = centroidPoint;
  }

  function centroidRingStart() {
    centroidStream.point = centroidPointFirstRing;
  }

  function centroidRingEnd() {
    centroidPointRing(x00$1, y00$1);
  }

  function centroidPointFirstRing(x, y) {
    centroidStream.point = centroidPointRing;
    centroidPoint(x00$1 = x0$2 = x, y00$1 = y0$2 = y);
  }

  function centroidPointRing(x, y) {
    var dx = x - x0$2,
        dy = y - y0$2,
        z = sqrt(dx * dx + dy * dy);

    X1 += z * (x0$2 + x) / 2;
    Y1 += z * (y0$2 + y) / 2;
    Z1 += z;

    z = y0$2 * x - x0$2 * y;
    X2 += z * (x0$2 + x);
    Y2 += z * (y0$2 + y);
    Z2 += z * 3;
    centroidPoint(x0$2 = x, y0$2 = y);
  }

  function PathContext(context) {
    this._context = context;
  }

  PathContext.prototype = {
    _radius: 4.5,
    pointRadius: function(_) {
      return this._radius = _, this;
    },
    polygonStart: function() {
      this._line = 0;
    },
    polygonEnd: function() {
      this._line = NaN;
    },
    lineStart: function() {
      this._point = 0;
    },
    lineEnd: function() {
      if (this._line === 0) this._context.closePath();
      this._point = NaN;
    },
    point: function(x, y) {
      switch (this._point) {
        case 0: {
          this._context.moveTo(x, y);
          this._point = 1;
          break;
        }
        case 1: {
          this._context.lineTo(x, y);
          break;
        }
        default: {
          this._context.moveTo(x + this._radius, y);
          this._context.arc(x, y, this._radius, 0, tau);
          break;
        }
      }
    },
    result: noop$1
  };

  var lengthSum = new Adder(),
      lengthRing,
      x00$2,
      y00$2,
      x0$3,
      y0$3;

  var lengthStream = {
    point: noop$1,
    lineStart: function() {
      lengthStream.point = lengthPointFirst;
    },
    lineEnd: function() {
      if (lengthRing) lengthPoint(x00$2, y00$2);
      lengthStream.point = noop$1;
    },
    polygonStart: function() {
      lengthRing = true;
    },
    polygonEnd: function() {
      lengthRing = null;
    },
    result: function() {
      var length = +lengthSum;
      lengthSum = new Adder();
      return length;
    }
  };

  function lengthPointFirst(x, y) {
    lengthStream.point = lengthPoint;
    x00$2 = x0$3 = x, y00$2 = y0$3 = y;
  }

  function lengthPoint(x, y) {
    x0$3 -= x, y0$3 -= y;
    lengthSum.add(sqrt(x0$3 * x0$3 + y0$3 * y0$3));
    x0$3 = x, y0$3 = y;
  }

  function PathString() {
    this._string = [];
  }

  PathString.prototype = {
    _radius: 4.5,
    _circle: circle(4.5),
    pointRadius: function(_) {
      if ((_ = +_) !== this._radius) this._radius = _, this._circle = null;
      return this;
    },
    polygonStart: function() {
      this._line = 0;
    },
    polygonEnd: function() {
      this._line = NaN;
    },
    lineStart: function() {
      this._point = 0;
    },
    lineEnd: function() {
      if (this._line === 0) this._string.push("Z");
      this._point = NaN;
    },
    point: function(x, y) {
      switch (this._point) {
        case 0: {
          this._string.push("M", x, ",", y);
          this._point = 1;
          break;
        }
        case 1: {
          this._string.push("L", x, ",", y);
          break;
        }
        default: {
          if (this._circle == null) this._circle = circle(this._radius);
          this._string.push("M", x, ",", y, this._circle);
          break;
        }
      }
    },
    result: function() {
      if (this._string.length) {
        var result = this._string.join("");
        this._string = [];
        return result;
      } else {
        return null;
      }
    }
  };

  function circle(radius) {
    return "m0," + radius
        + "a" + radius + "," + radius + " 0 1,1 0," + -2 * radius
        + "a" + radius + "," + radius + " 0 1,1 0," + 2 * radius
        + "z";
  }

  function index(projection, context) {
    var pointRadius = 4.5,
        projectionStream,
        contextStream;

    function path(object) {
      if (object) {
        if (typeof pointRadius === "function") contextStream.pointRadius(+pointRadius.apply(this, arguments));
        geoStream(object, projectionStream(contextStream));
      }
      return contextStream.result();
    }

    path.area = function(object) {
      geoStream(object, projectionStream(areaStream));
      return areaStream.result();
    };

    path.measure = function(object) {
      geoStream(object, projectionStream(lengthStream));
      return lengthStream.result();
    };

    path.bounds = function(object) {
      geoStream(object, projectionStream(boundsStream));
      return boundsStream.result();
    };

    path.centroid = function(object) {
      geoStream(object, projectionStream(centroidStream));
      return centroidStream.result();
    };

    path.projection = function(_) {
      return arguments.length ? (projectionStream = _ == null ? (projection = null, identity) : (projection = _).stream, path) : projection;
    };

    path.context = function(_) {
      if (!arguments.length) return context;
      contextStream = _ == null ? (context = null, new PathString) : new PathContext(context = _);
      if (typeof pointRadius !== "function") contextStream.pointRadius(pointRadius);
      return path;
    };

    path.pointRadius = function(_) {
      if (!arguments.length) return pointRadius;
      pointRadius = typeof _ === "function" ? _ : (contextStream.pointRadius(+_), +_);
      return path;
    };

    return path.projection(projection).context(context);
  }

  function transformer(methods) {
    return function(stream) {
      var s = new TransformStream;
      for (var key in methods) s[key] = methods[key];
      s.stream = stream;
      return s;
    };
  }

  function TransformStream() {}

  TransformStream.prototype = {
    constructor: TransformStream,
    point: function(x, y) { this.stream.point(x, y); },
    sphere: function() { this.stream.sphere(); },
    lineStart: function() { this.stream.lineStart(); },
    lineEnd: function() { this.stream.lineEnd(); },
    polygonStart: function() { this.stream.polygonStart(); },
    polygonEnd: function() { this.stream.polygonEnd(); }
  };

  function fit(projection, fitBounds, object) {
    var clip = projection.clipExtent && projection.clipExtent();
    projection.scale(150).translate([0, 0]);
    if (clip != null) projection.clipExtent(null);
    geoStream(object, projection.stream(boundsStream));
    fitBounds(boundsStream.result());
    if (clip != null) projection.clipExtent(clip);
    return projection;
  }

  function fitExtent(projection, extent, object) {
    return fit(projection, function(b) {
      var w = extent[1][0] - extent[0][0],
          h = extent[1][1] - extent[0][1],
          k = Math.min(w / (b[1][0] - b[0][0]), h / (b[1][1] - b[0][1])),
          x = +extent[0][0] + (w - k * (b[1][0] + b[0][0])) / 2,
          y = +extent[0][1] + (h - k * (b[1][1] + b[0][1])) / 2;
      projection.scale(150 * k).translate([x, y]);
    }, object);
  }

  function fitSize(projection, size, object) {
    return fitExtent(projection, [[0, 0], size], object);
  }

  function fitWidth(projection, width, object) {
    return fit(projection, function(b) {
      var w = +width,
          k = w / (b[1][0] - b[0][0]),
          x = (w - k * (b[1][0] + b[0][0])) / 2,
          y = -k * b[0][1];
      projection.scale(150 * k).translate([x, y]);
    }, object);
  }

  function fitHeight(projection, height, object) {
    return fit(projection, function(b) {
      var h = +height,
          k = h / (b[1][1] - b[0][1]),
          x = -k * b[0][0],
          y = (h - k * (b[1][1] + b[0][1])) / 2;
      projection.scale(150 * k).translate([x, y]);
    }, object);
  }

  var maxDepth = 16, // maximum depth of subdivision
      cosMinDistance = cos(30 * radians); // cos(minimum angular distance)

  function resample(project, delta2) {
    return +delta2 ? resample$1(project, delta2) : resampleNone(project);
  }

  function resampleNone(project) {
    return transformer({
      point: function(x, y) {
        x = project(x, y);
        this.stream.point(x[0], x[1]);
      }
    });
  }

  function resample$1(project, delta2) {

    function resampleLineTo(x0, y0, lambda0, a0, b0, c0, x1, y1, lambda1, a1, b1, c1, depth, stream) {
      var dx = x1 - x0,
          dy = y1 - y0,
          d2 = dx * dx + dy * dy;
      if (d2 > 4 * delta2 && depth--) {
        var a = a0 + a1,
            b = b0 + b1,
            c = c0 + c1,
            m = sqrt(a * a + b * b + c * c),
            phi2 = asin(c /= m),
            lambda2 = abs(abs(c) - 1) < epsilon || abs(lambda0 - lambda1) < epsilon ? (lambda0 + lambda1) / 2 : atan2(b, a),
            p = project(lambda2, phi2),
            x2 = p[0],
            y2 = p[1],
            dx2 = x2 - x0,
            dy2 = y2 - y0,
            dz = dy * dx2 - dx * dy2;
        if (dz * dz / d2 > delta2 // perpendicular projected distance
            || abs((dx * dx2 + dy * dy2) / d2 - 0.5) > 0.3 // midpoint close to an end
            || a0 * a1 + b0 * b1 + c0 * c1 < cosMinDistance) { // angular distance
          resampleLineTo(x0, y0, lambda0, a0, b0, c0, x2, y2, lambda2, a /= m, b /= m, c, depth, stream);
          stream.point(x2, y2);
          resampleLineTo(x2, y2, lambda2, a, b, c, x1, y1, lambda1, a1, b1, c1, depth, stream);
        }
      }
    }
    return function(stream) {
      var lambda00, x00, y00, a00, b00, c00, // first point
          lambda0, x0, y0, a0, b0, c0; // previous point

      var resampleStream = {
        point: point,
        lineStart: lineStart,
        lineEnd: lineEnd,
        polygonStart: function() { stream.polygonStart(); resampleStream.lineStart = ringStart; },
        polygonEnd: function() { stream.polygonEnd(); resampleStream.lineStart = lineStart; }
      };

      function point(x, y) {
        x = project(x, y);
        stream.point(x[0], x[1]);
      }

      function lineStart() {
        x0 = NaN;
        resampleStream.point = linePoint;
        stream.lineStart();
      }

      function linePoint(lambda, phi) {
        var c = cartesian([lambda, phi]), p = project(lambda, phi);
        resampleLineTo(x0, y0, lambda0, a0, b0, c0, x0 = p[0], y0 = p[1], lambda0 = lambda, a0 = c[0], b0 = c[1], c0 = c[2], maxDepth, stream);
        stream.point(x0, y0);
      }

      function lineEnd() {
        resampleStream.point = point;
        stream.lineEnd();
      }

      function ringStart() {
        lineStart();
        resampleStream.point = ringPoint;
        resampleStream.lineEnd = ringEnd;
      }

      function ringPoint(lambda, phi) {
        linePoint(lambda00 = lambda, phi), x00 = x0, y00 = y0, a00 = a0, b00 = b0, c00 = c0;
        resampleStream.point = linePoint;
      }

      function ringEnd() {
        resampleLineTo(x0, y0, lambda0, a0, b0, c0, x00, y00, lambda00, a00, b00, c00, maxDepth, stream);
        resampleStream.lineEnd = lineEnd;
        lineEnd();
      }

      return resampleStream;
    };
  }

  var transformRadians = transformer({
    point: function(x, y) {
      this.stream.point(x * radians, y * radians);
    }
  });

  function transformRotate(rotate) {
    return transformer({
      point: function(x, y) {
        var r = rotate(x, y);
        return this.stream.point(r[0], r[1]);
      }
    });
  }

  function scaleTranslate(k, dx, dy, sx, sy) {
    function transform(x, y) {
      x *= sx; y *= sy;
      return [dx + k * x, dy - k * y];
    }
    transform.invert = function(x, y) {
      return [(x - dx) / k * sx, (dy - y) / k * sy];
    };
    return transform;
  }

  function scaleTranslateRotate(k, dx, dy, sx, sy, alpha) {
    if (!alpha) return scaleTranslate(k, dx, dy, sx, sy);
    var cosAlpha = cos(alpha),
        sinAlpha = sin(alpha),
        a = cosAlpha * k,
        b = sinAlpha * k,
        ai = cosAlpha / k,
        bi = sinAlpha / k,
        ci = (sinAlpha * dy - cosAlpha * dx) / k,
        fi = (sinAlpha * dx + cosAlpha * dy) / k;
    function transform(x, y) {
      x *= sx; y *= sy;
      return [a * x - b * y + dx, dy - b * x - a * y];
    }
    transform.invert = function(x, y) {
      return [sx * (ai * x - bi * y + ci), sy * (fi - bi * x - ai * y)];
    };
    return transform;
  }

  function projection(project) {
    return projectionMutator(function() { return project; })();
  }

  function projectionMutator(projectAt) {
    var project,
        k = 150, // scale
        x = 480, y = 250, // translate
        lambda = 0, phi = 0, // center
        deltaLambda = 0, deltaPhi = 0, deltaGamma = 0, rotate, // pre-rotate
        alpha = 0, // post-rotate angle
        sx = 1, // reflectX
        sy = 1, // reflectX
        theta = null, preclip = clipAntimeridian, // pre-clip angle
        x0 = null, y0, x1, y1, postclip = identity, // post-clip extent
        delta2 = 0.5, // precision
        projectResample,
        projectTransform,
        projectRotateTransform,
        cache,
        cacheStream;

    function projection(point) {
      return projectRotateTransform(point[0] * radians, point[1] * radians);
    }

    function invert(point) {
      point = projectRotateTransform.invert(point[0], point[1]);
      return point && [point[0] * degrees, point[1] * degrees];
    }

    projection.stream = function(stream) {
      return cache && cacheStream === stream ? cache : cache = transformRadians(transformRotate(rotate)(preclip(projectResample(postclip(cacheStream = stream)))));
    };

    projection.preclip = function(_) {
      return arguments.length ? (preclip = _, theta = undefined, reset()) : preclip;
    };

    projection.postclip = function(_) {
      return arguments.length ? (postclip = _, x0 = y0 = x1 = y1 = null, reset()) : postclip;
    };

    projection.clipAngle = function(_) {
      return arguments.length ? (preclip = +_ ? clipCircle(theta = _ * radians) : (theta = null, clipAntimeridian), reset()) : theta * degrees;
    };

    projection.clipExtent = function(_) {
      return arguments.length ? (postclip = _ == null ? (x0 = y0 = x1 = y1 = null, identity) : clipRectangle(x0 = +_[0][0], y0 = +_[0][1], x1 = +_[1][0], y1 = +_[1][1]), reset()) : x0 == null ? null : [[x0, y0], [x1, y1]];
    };

    projection.scale = function(_) {
      return arguments.length ? (k = +_, recenter()) : k;
    };

    projection.translate = function(_) {
      return arguments.length ? (x = +_[0], y = +_[1], recenter()) : [x, y];
    };

    projection.center = function(_) {
      return arguments.length ? (lambda = _[0] % 360 * radians, phi = _[1] % 360 * radians, recenter()) : [lambda * degrees, phi * degrees];
    };

    projection.rotate = function(_) {
      return arguments.length ? (deltaLambda = _[0] % 360 * radians, deltaPhi = _[1] % 360 * radians, deltaGamma = _.length > 2 ? _[2] % 360 * radians : 0, recenter()) : [deltaLambda * degrees, deltaPhi * degrees, deltaGamma * degrees];
    };

    projection.angle = function(_) {
      return arguments.length ? (alpha = _ % 360 * radians, recenter()) : alpha * degrees;
    };

    projection.reflectX = function(_) {
      return arguments.length ? (sx = _ ? -1 : 1, recenter()) : sx < 0;
    };

    projection.reflectY = function(_) {
      return arguments.length ? (sy = _ ? -1 : 1, recenter()) : sy < 0;
    };

    projection.precision = function(_) {
      return arguments.length ? (projectResample = resample(projectTransform, delta2 = _ * _), reset()) : sqrt(delta2);
    };

    projection.fitExtent = function(extent, object) {
      return fitExtent(projection, extent, object);
    };

    projection.fitSize = function(size, object) {
      return fitSize(projection, size, object);
    };

    projection.fitWidth = function(width, object) {
      return fitWidth(projection, width, object);
    };

    projection.fitHeight = function(height, object) {
      return fitHeight(projection, height, object);
    };

    function recenter() {
      var center = scaleTranslateRotate(k, 0, 0, sx, sy, alpha).apply(null, project(lambda, phi)),
          transform = scaleTranslateRotate(k, x - center[0], y - center[1], sx, sy, alpha);
      rotate = rotateRadians(deltaLambda, deltaPhi, deltaGamma);
      projectTransform = compose(project, transform);
      projectRotateTransform = compose(rotate, projectTransform);
      projectResample = resample(projectTransform, delta2);
      return reset();
    }

    function reset() {
      cache = cacheStream = null;
      return projection;
    }

    return function() {
      project = projectAt.apply(this, arguments);
      projection.invert = project.invert && invert;
      return recenter();
    };
  }

  function mercatorRaw(lambda, phi) {
    return [lambda, log(tan((halfPi + phi) / 2))];
  }

  mercatorRaw.invert = function(x, y) {
    return [x, 2 * atan(exp(y)) - halfPi];
  };

  function mercator() {
    return mercatorProjection(mercatorRaw)
        .scale(961 / tau);
  }

  function mercatorProjection(project) {
    var m = projection(project),
        center = m.center,
        scale = m.scale,
        translate = m.translate,
        clipExtent = m.clipExtent,
        x0 = null, y0, x1, y1; // clip extent

    m.scale = function(_) {
      return arguments.length ? (scale(_), reclip()) : scale();
    };

    m.translate = function(_) {
      return arguments.length ? (translate(_), reclip()) : translate();
    };

    m.center = function(_) {
      return arguments.length ? (center(_), reclip()) : center();
    };

    m.clipExtent = function(_) {
      return arguments.length ? ((_ == null ? x0 = y0 = x1 = y1 = null : (x0 = +_[0][0], y0 = +_[0][1], x1 = +_[1][0], y1 = +_[1][1])), reclip()) : x0 == null ? null : [[x0, y0], [x1, y1]];
    };

    function reclip() {
      var k = pi * scale(),
          t = m(rotation(m.rotate()).invert([0, 0]));
      return clipExtent(x0 == null
          ? [[t[0] - k, t[1] - k], [t[0] + k, t[1] + k]] : project === mercatorRaw
          ? [[Math.max(t[0] - k, x0), y0], [Math.min(t[0] + k, x1), y1]]
          : [[x0, Math.max(t[1] - k, y0)], [x1, Math.min(t[1] + k, y1)]]);
    }

    return reclip();
  }

  var pointGeometry = Point;

  /**
   * A standalone point geometry with useful accessor, comparison, and
   * modification methods.
   *
   * @class Point
   * @param {Number} x the x-coordinate. this could be longitude or screen
   * pixels, or any other sort of unit.
   * @param {Number} y the y-coordinate. this could be latitude or screen
   * pixels, or any other sort of unit.
   * @example
   * var point = new Point(-77, 38);
   */
  function Point(x, y) {
      this.x = x;
      this.y = y;
  }

  Point.prototype = {

      /**
       * Clone this point, returning a new point that can be modified
       * without affecting the old one.
       * @return {Point} the clone
       */
      clone: function() { return new Point(this.x, this.y); },

      /**
       * Add this point's x & y coordinates to another point,
       * yielding a new point.
       * @param {Point} p the other point
       * @return {Point} output point
       */
      add:     function(p) { return this.clone()._add(p); },

      /**
       * Subtract this point's x & y coordinates to from point,
       * yielding a new point.
       * @param {Point} p the other point
       * @return {Point} output point
       */
      sub:     function(p) { return this.clone()._sub(p); },

      /**
       * Multiply this point's x & y coordinates by point,
       * yielding a new point.
       * @param {Point} p the other point
       * @return {Point} output point
       */
      multByPoint:    function(p) { return this.clone()._multByPoint(p); },

      /**
       * Divide this point's x & y coordinates by point,
       * yielding a new point.
       * @param {Point} p the other point
       * @return {Point} output point
       */
      divByPoint:     function(p) { return this.clone()._divByPoint(p); },

      /**
       * Multiply this point's x & y coordinates by a factor,
       * yielding a new point.
       * @param {Point} k factor
       * @return {Point} output point
       */
      mult:    function(k) { return this.clone()._mult(k); },

      /**
       * Divide this point's x & y coordinates by a factor,
       * yielding a new point.
       * @param {Point} k factor
       * @return {Point} output point
       */
      div:     function(k) { return this.clone()._div(k); },

      /**
       * Rotate this point around the 0, 0 origin by an angle a,
       * given in radians
       * @param {Number} a angle to rotate around, in radians
       * @return {Point} output point
       */
      rotate:  function(a) { return this.clone()._rotate(a); },

      /**
       * Rotate this point around p point by an angle a,
       * given in radians
       * @param {Number} a angle to rotate around, in radians
       * @param {Point} p Point to rotate around
       * @return {Point} output point
       */
      rotateAround:  function(a,p) { return this.clone()._rotateAround(a,p); },

      /**
       * Multiply this point by a 4x1 transformation matrix
       * @param {Array<Number>} m transformation matrix
       * @return {Point} output point
       */
      matMult: function(m) { return this.clone()._matMult(m); },

      /**
       * Calculate this point but as a unit vector from 0, 0, meaning
       * that the distance from the resulting point to the 0, 0
       * coordinate will be equal to 1 and the angle from the resulting
       * point to the 0, 0 coordinate will be the same as before.
       * @return {Point} unit vector point
       */
      unit:    function() { return this.clone()._unit(); },

      /**
       * Compute a perpendicular point, where the new y coordinate
       * is the old x coordinate and the new x coordinate is the old y
       * coordinate multiplied by -1
       * @return {Point} perpendicular point
       */
      perp:    function() { return this.clone()._perp(); },

      /**
       * Return a version of this point with the x & y coordinates
       * rounded to integers.
       * @return {Point} rounded point
       */
      round:   function() { return this.clone()._round(); },

      /**
       * Return the magitude of this point: this is the Euclidean
       * distance from the 0, 0 coordinate to this point's x and y
       * coordinates.
       * @return {Number} magnitude
       */
      mag: function() {
          return Math.sqrt(this.x * this.x + this.y * this.y);
      },

      /**
       * Judge whether this point is equal to another point, returning
       * true or false.
       * @param {Point} other the other point
       * @return {boolean} whether the points are equal
       */
      equals: function(other) {
          return this.x === other.x &&
                 this.y === other.y;
      },

      /**
       * Calculate the distance from this point to another point
       * @param {Point} p the other point
       * @return {Number} distance
       */
      dist: function(p) {
          return Math.sqrt(this.distSqr(p));
      },

      /**
       * Calculate the distance from this point to another point,
       * without the square root step. Useful if you're comparing
       * relative distances.
       * @param {Point} p the other point
       * @return {Number} distance
       */
      distSqr: function(p) {
          var dx = p.x - this.x,
              dy = p.y - this.y;
          return dx * dx + dy * dy;
      },

      /**
       * Get the angle from the 0, 0 coordinate to this point, in radians
       * coordinates.
       * @return {Number} angle
       */
      angle: function() {
          return Math.atan2(this.y, this.x);
      },

      /**
       * Get the angle from this point to another point, in radians
       * @param {Point} b the other point
       * @return {Number} angle
       */
      angleTo: function(b) {
          return Math.atan2(this.y - b.y, this.x - b.x);
      },

      /**
       * Get the angle between this point and another point, in radians
       * @param {Point} b the other point
       * @return {Number} angle
       */
      angleWith: function(b) {
          return this.angleWithSep(b.x, b.y);
      },

      /*
       * Find the angle of the two vectors, solving the formula for
       * the cross product a x b = |a||b|sin(θ) for θ.
       * @param {Number} x the x-coordinate
       * @param {Number} y the y-coordinate
       * @return {Number} the angle in radians
       */
      angleWithSep: function(x, y) {
          return Math.atan2(
              this.x * y - this.y * x,
              this.x * x + this.y * y);
      },

      _matMult: function(m) {
          var x = m[0] * this.x + m[1] * this.y,
              y = m[2] * this.x + m[3] * this.y;
          this.x = x;
          this.y = y;
          return this;
      },

      _add: function(p) {
          this.x += p.x;
          this.y += p.y;
          return this;
      },

      _sub: function(p) {
          this.x -= p.x;
          this.y -= p.y;
          return this;
      },

      _mult: function(k) {
          this.x *= k;
          this.y *= k;
          return this;
      },

      _div: function(k) {
          this.x /= k;
          this.y /= k;
          return this;
      },

      _multByPoint: function(p) {
          this.x *= p.x;
          this.y *= p.y;
          return this;
      },

      _divByPoint: function(p) {
          this.x /= p.x;
          this.y /= p.y;
          return this;
      },

      _unit: function() {
          this._div(this.mag());
          return this;
      },

      _perp: function() {
          var y = this.y;
          this.y = this.x;
          this.x = -y;
          return this;
      },

      _rotate: function(angle) {
          var cos = Math.cos(angle),
              sin = Math.sin(angle),
              x = cos * this.x - sin * this.y,
              y = sin * this.x + cos * this.y;
          this.x = x;
          this.y = y;
          return this;
      },

      _rotateAround: function(angle, p) {
          var cos = Math.cos(angle),
              sin = Math.sin(angle),
              x = p.x + cos * (this.x - p.x) - sin * (this.y - p.y),
              y = p.y + sin * (this.x - p.x) + cos * (this.y - p.y);
          this.x = x;
          this.y = y;
          return this;
      },

      _round: function() {
          this.x = Math.round(this.x);
          this.y = Math.round(this.y);
          return this;
      }
  };

  /**
   * Construct a point from an array if necessary, otherwise if the input
   * is already a Point, or an unknown type, return it unchanged
   * @param {Array<Number>|Point|*} a any kind of input value
   * @return {Point} constructed point, or passed-through value.
   * @example
   * // this
   * var point = Point.convert([0, 1]);
   * // is equivalent to
   * var point = new Point(0, 1);
   */
  Point.convert = function (a) {
      if (a instanceof Point) {
          return a;
      }
      if (Array.isArray(a)) {
          return new Point(a[0], a[1]);
      }
      return a;
  };

  var vectortilefeature = VectorTileFeature;

  function VectorTileFeature(pbf, end, extent, keys, values) {
      // Public
      this.properties = {};
      this.extent = extent;
      this.type = 0;

      // Private
      this._pbf = pbf;
      this._geometry = -1;
      this._keys = keys;
      this._values = values;

      pbf.readFields(readFeature, this, end);
  }

  function readFeature(tag, feature, pbf) {
      if (tag == 1) feature.id = pbf.readVarint();
      else if (tag == 2) readTag(pbf, feature);
      else if (tag == 3) feature.type = pbf.readVarint();
      else if (tag == 4) feature._geometry = pbf.pos;
  }

  function readTag(pbf, feature) {
      var end = pbf.readVarint() + pbf.pos;

      while (pbf.pos < end) {
          var key = feature._keys[pbf.readVarint()],
              value = feature._values[pbf.readVarint()];
          feature.properties[key] = value;
      }
  }

  VectorTileFeature.types = ['Unknown', 'Point', 'LineString', 'Polygon'];

  VectorTileFeature.prototype.loadGeometry = function() {
      var pbf = this._pbf;
      pbf.pos = this._geometry;

      var end = pbf.readVarint() + pbf.pos,
          cmd = 1,
          length = 0,
          x = 0,
          y = 0,
          lines = [],
          line;

      while (pbf.pos < end) {
          if (length <= 0) {
              var cmdLen = pbf.readVarint();
              cmd = cmdLen & 0x7;
              length = cmdLen >> 3;
          }

          length--;

          if (cmd === 1 || cmd === 2) {
              x += pbf.readSVarint();
              y += pbf.readSVarint();

              if (cmd === 1) { // moveTo
                  if (line) lines.push(line);
                  line = [];
              }

              line.push(new pointGeometry(x, y));

          } else if (cmd === 7) {

              // Workaround for https://github.com/mapbox/mapnik-vector-tile/issues/90
              if (line) {
                  line.push(line[0].clone()); // closePolygon
              }

          } else {
              throw new Error('unknown command ' + cmd);
          }
      }

      if (line) lines.push(line);

      return lines;
  };

  VectorTileFeature.prototype.bbox = function() {
      var pbf = this._pbf;
      pbf.pos = this._geometry;

      var end = pbf.readVarint() + pbf.pos,
          cmd = 1,
          length = 0,
          x = 0,
          y = 0,
          x1 = Infinity,
          x2 = -Infinity,
          y1 = Infinity,
          y2 = -Infinity;

      while (pbf.pos < end) {
          if (length <= 0) {
              var cmdLen = pbf.readVarint();
              cmd = cmdLen & 0x7;
              length = cmdLen >> 3;
          }

          length--;

          if (cmd === 1 || cmd === 2) {
              x += pbf.readSVarint();
              y += pbf.readSVarint();
              if (x < x1) x1 = x;
              if (x > x2) x2 = x;
              if (y < y1) y1 = y;
              if (y > y2) y2 = y;

          } else if (cmd !== 7) {
              throw new Error('unknown command ' + cmd);
          }
      }

      return [x1, y1, x2, y2];
  };

  VectorTileFeature.prototype.toGeoJSON = function(x, y, z) {
      var size = this.extent * Math.pow(2, z),
          x0 = this.extent * x,
          y0 = this.extent * y,
          coords = this.loadGeometry(),
          type = VectorTileFeature.types[this.type],
          i, j;

      function project(line) {
          for (var j = 0; j < line.length; j++) {
              var p = line[j], y2 = 180 - (p.y + y0) * 360 / size;
              line[j] = [
                  (p.x + x0) * 360 / size - 180,
                  360 / Math.PI * Math.atan(Math.exp(y2 * Math.PI / 180)) - 90
              ];
          }
      }

      switch (this.type) {
      case 1:
          var points = [];
          for (i = 0; i < coords.length; i++) {
              points[i] = coords[i][0];
          }
          coords = points;
          project(coords);
          break;

      case 2:
          for (i = 0; i < coords.length; i++) {
              project(coords[i]);
          }
          break;

      case 3:
          coords = classifyRings(coords);
          for (i = 0; i < coords.length; i++) {
              for (j = 0; j < coords[i].length; j++) {
                  project(coords[i][j]);
              }
          }
          break;
      }

      if (coords.length === 1) {
          coords = coords[0];
      } else {
          type = 'Multi' + type;
      }

      var result = {
          type: "Feature",
          geometry: {
              type: type,
              coordinates: coords
          },
          properties: this.properties
      };

      if ('id' in this) {
          result.id = this.id;
      }

      return result;
  };

  // classifies an array of rings into polygons with outer rings and holes

  function classifyRings(rings) {
      var len = rings.length;

      if (len <= 1) return [rings];

      var polygons = [],
          polygon,
          ccw;

      for (var i = 0; i < len; i++) {
          var area = signedArea(rings[i]);
          if (area === 0) continue;

          if (ccw === undefined) ccw = area < 0;

          if (ccw === area < 0) {
              if (polygon) polygons.push(polygon);
              polygon = [rings[i]];

          } else {
              polygon.push(rings[i]);
          }
      }
      if (polygon) polygons.push(polygon);

      return polygons;
  }

  function signedArea(ring) {
      var sum = 0;
      for (var i = 0, len = ring.length, j = len - 1, p1, p2; i < len; j = i++) {
          p1 = ring[i];
          p2 = ring[j];
          sum += (p2.x - p1.x) * (p1.y + p2.y);
      }
      return sum;
  }

  var vectortilelayer = VectorTileLayer;

  function VectorTileLayer(pbf, end) {
      // Public
      this.version = 1;
      this.name = null;
      this.extent = 4096;
      this.length = 0;

      // Private
      this._pbf = pbf;
      this._keys = [];
      this._values = [];
      this._features = [];

      pbf.readFields(readLayer, this, end);

      this.length = this._features.length;
  }

  function readLayer(tag, layer, pbf) {
      if (tag === 15) layer.version = pbf.readVarint();
      else if (tag === 1) layer.name = pbf.readString();
      else if (tag === 5) layer.extent = pbf.readVarint();
      else if (tag === 2) layer._features.push(pbf.pos);
      else if (tag === 3) layer._keys.push(pbf.readString());
      else if (tag === 4) layer._values.push(readValueMessage(pbf));
  }

  function readValueMessage(pbf) {
      var value = null,
          end = pbf.readVarint() + pbf.pos;

      while (pbf.pos < end) {
          var tag = pbf.readVarint() >> 3;

          value = tag === 1 ? pbf.readString() :
              tag === 2 ? pbf.readFloat() :
              tag === 3 ? pbf.readDouble() :
              tag === 4 ? pbf.readVarint64() :
              tag === 5 ? pbf.readVarint() :
              tag === 6 ? pbf.readSVarint() :
              tag === 7 ? pbf.readBoolean() : null;
      }

      return value;
  }

  // return feature `i` from this layer as a `VectorTileFeature`
  VectorTileLayer.prototype.feature = function(i) {
      if (i < 0 || i >= this._features.length) throw new Error('feature index out of bounds');

      this._pbf.pos = this._features[i];

      var end = this._pbf.readVarint() + this._pbf.pos;
      return new vectortilefeature(this._pbf, end, this.extent, this._keys, this._values);
  };

  var vectortile = VectorTile;

  function VectorTile(pbf, end) {
      this.layers = pbf.readFields(readTile, {}, end);
  }

  function readTile(tag, layers, pbf) {
      if (tag === 3) {
          var layer = new vectortilelayer(pbf, pbf.readVarint() + pbf.pos);
          if (layer.length) layers[layer.name] = layer;
      }
  }

  var VectorTile$1 = vectortile;

  /*! ieee754. BSD-3-Clause License. Feross Aboukhadijeh <https://feross.org/opensource> */
  var read = function (buffer, offset, isLE, mLen, nBytes) {
    var e, m;
    var eLen = (nBytes * 8) - mLen - 1;
    var eMax = (1 << eLen) - 1;
    var eBias = eMax >> 1;
    var nBits = -7;
    var i = isLE ? (nBytes - 1) : 0;
    var d = isLE ? -1 : 1;
    var s = buffer[offset + i];

    i += d;

    e = s & ((1 << (-nBits)) - 1);
    s >>= (-nBits);
    nBits += eLen;
    for (; nBits > 0; e = (e * 256) + buffer[offset + i], i += d, nBits -= 8) {}

    m = e & ((1 << (-nBits)) - 1);
    e >>= (-nBits);
    nBits += mLen;
    for (; nBits > 0; m = (m * 256) + buffer[offset + i], i += d, nBits -= 8) {}

    if (e === 0) {
      e = 1 - eBias;
    } else if (e === eMax) {
      return m ? NaN : ((s ? -1 : 1) * Infinity)
    } else {
      m = m + Math.pow(2, mLen);
      e = e - eBias;
    }
    return (s ? -1 : 1) * m * Math.pow(2, e - mLen)
  };

  var write = function (buffer, value, offset, isLE, mLen, nBytes) {
    var e, m, c;
    var eLen = (nBytes * 8) - mLen - 1;
    var eMax = (1 << eLen) - 1;
    var eBias = eMax >> 1;
    var rt = (mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0);
    var i = isLE ? 0 : (nBytes - 1);
    var d = isLE ? 1 : -1;
    var s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0;

    value = Math.abs(value);

    if (isNaN(value) || value === Infinity) {
      m = isNaN(value) ? 1 : 0;
      e = eMax;
    } else {
      e = Math.floor(Math.log(value) / Math.LN2);
      if (value * (c = Math.pow(2, -e)) < 1) {
        e--;
        c *= 2;
      }
      if (e + eBias >= 1) {
        value += rt / c;
      } else {
        value += rt * Math.pow(2, 1 - eBias);
      }
      if (value * c >= 2) {
        e++;
        c /= 2;
      }

      if (e + eBias >= eMax) {
        m = 0;
        e = eMax;
      } else if (e + eBias >= 1) {
        m = ((value * c) - 1) * Math.pow(2, mLen);
        e = e + eBias;
      } else {
        m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen);
        e = 0;
      }
    }

    for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8) {}

    e = (e << mLen) | m;
    eLen += mLen;
    for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8) {}

    buffer[offset + i - d] |= s * 128;
  };

  var ieee754 = {
  	read: read,
  	write: write
  };

  var pbf = Pbf;



  function Pbf(buf) {
      this.buf = ArrayBuffer.isView && ArrayBuffer.isView(buf) ? buf : new Uint8Array(buf || 0);
      this.pos = 0;
      this.type = 0;
      this.length = this.buf.length;
  }

  Pbf.Varint  = 0; // varint: int32, int64, uint32, uint64, sint32, sint64, bool, enum
  Pbf.Fixed64 = 1; // 64-bit: double, fixed64, sfixed64
  Pbf.Bytes   = 2; // length-delimited: string, bytes, embedded messages, packed repeated fields
  Pbf.Fixed32 = 5; // 32-bit: float, fixed32, sfixed32

  var SHIFT_LEFT_32 = (1 << 16) * (1 << 16),
      SHIFT_RIGHT_32 = 1 / SHIFT_LEFT_32;

  // Threshold chosen based on both benchmarking and knowledge about browser string
  // data structures (which currently switch structure types at 12 bytes or more)
  var TEXT_DECODER_MIN_LENGTH = 12;
  var utf8TextDecoder = typeof TextDecoder === 'undefined' ? null : new TextDecoder('utf8');

  Pbf.prototype = {

      destroy: function() {
          this.buf = null;
      },

      // === READING =================================================================

      readFields: function(readField, result, end) {
          end = end || this.length;

          while (this.pos < end) {
              var val = this.readVarint(),
                  tag = val >> 3,
                  startPos = this.pos;

              this.type = val & 0x7;
              readField(tag, result, this);

              if (this.pos === startPos) this.skip(val);
          }
          return result;
      },

      readMessage: function(readField, result) {
          return this.readFields(readField, result, this.readVarint() + this.pos);
      },

      readFixed32: function() {
          var val = readUInt32(this.buf, this.pos);
          this.pos += 4;
          return val;
      },

      readSFixed32: function() {
          var val = readInt32(this.buf, this.pos);
          this.pos += 4;
          return val;
      },

      // 64-bit int handling is based on github.com/dpw/node-buffer-more-ints (MIT-licensed)

      readFixed64: function() {
          var val = readUInt32(this.buf, this.pos) + readUInt32(this.buf, this.pos + 4) * SHIFT_LEFT_32;
          this.pos += 8;
          return val;
      },

      readSFixed64: function() {
          var val = readUInt32(this.buf, this.pos) + readInt32(this.buf, this.pos + 4) * SHIFT_LEFT_32;
          this.pos += 8;
          return val;
      },

      readFloat: function() {
          var val = ieee754.read(this.buf, this.pos, true, 23, 4);
          this.pos += 4;
          return val;
      },

      readDouble: function() {
          var val = ieee754.read(this.buf, this.pos, true, 52, 8);
          this.pos += 8;
          return val;
      },

      readVarint: function(isSigned) {
          var buf = this.buf,
              val, b;

          b = buf[this.pos++]; val  =  b & 0x7f;        if (b < 0x80) return val;
          b = buf[this.pos++]; val |= (b & 0x7f) << 7;  if (b < 0x80) return val;
          b = buf[this.pos++]; val |= (b & 0x7f) << 14; if (b < 0x80) return val;
          b = buf[this.pos++]; val |= (b & 0x7f) << 21; if (b < 0x80) return val;
          b = buf[this.pos];   val |= (b & 0x0f) << 28;

          return readVarintRemainder(val, isSigned, this);
      },

      readVarint64: function() { // for compatibility with v2.0.1
          return this.readVarint(true);
      },

      readSVarint: function() {
          var num = this.readVarint();
          return num % 2 === 1 ? (num + 1) / -2 : num / 2; // zigzag encoding
      },

      readBoolean: function() {
          return Boolean(this.readVarint());
      },

      readString: function() {
          var end = this.readVarint() + this.pos;
          var pos = this.pos;
          this.pos = end;

          if (end - pos >= TEXT_DECODER_MIN_LENGTH && utf8TextDecoder) {
              // longer strings are fast with the built-in browser TextDecoder API
              return readUtf8TextDecoder(this.buf, pos, end);
          }
          // short strings are fast with our custom implementation
          return readUtf8(this.buf, pos, end);
      },

      readBytes: function() {
          var end = this.readVarint() + this.pos,
              buffer = this.buf.subarray(this.pos, end);
          this.pos = end;
          return buffer;
      },

      // verbose for performance reasons; doesn't affect gzipped size

      readPackedVarint: function(arr, isSigned) {
          if (this.type !== Pbf.Bytes) return arr.push(this.readVarint(isSigned));
          var end = readPackedEnd(this);
          arr = arr || [];
          while (this.pos < end) arr.push(this.readVarint(isSigned));
          return arr;
      },
      readPackedSVarint: function(arr) {
          if (this.type !== Pbf.Bytes) return arr.push(this.readSVarint());
          var end = readPackedEnd(this);
          arr = arr || [];
          while (this.pos < end) arr.push(this.readSVarint());
          return arr;
      },
      readPackedBoolean: function(arr) {
          if (this.type !== Pbf.Bytes) return arr.push(this.readBoolean());
          var end = readPackedEnd(this);
          arr = arr || [];
          while (this.pos < end) arr.push(this.readBoolean());
          return arr;
      },
      readPackedFloat: function(arr) {
          if (this.type !== Pbf.Bytes) return arr.push(this.readFloat());
          var end = readPackedEnd(this);
          arr = arr || [];
          while (this.pos < end) arr.push(this.readFloat());
          return arr;
      },
      readPackedDouble: function(arr) {
          if (this.type !== Pbf.Bytes) return arr.push(this.readDouble());
          var end = readPackedEnd(this);
          arr = arr || [];
          while (this.pos < end) arr.push(this.readDouble());
          return arr;
      },
      readPackedFixed32: function(arr) {
          if (this.type !== Pbf.Bytes) return arr.push(this.readFixed32());
          var end = readPackedEnd(this);
          arr = arr || [];
          while (this.pos < end) arr.push(this.readFixed32());
          return arr;
      },
      readPackedSFixed32: function(arr) {
          if (this.type !== Pbf.Bytes) return arr.push(this.readSFixed32());
          var end = readPackedEnd(this);
          arr = arr || [];
          while (this.pos < end) arr.push(this.readSFixed32());
          return arr;
      },
      readPackedFixed64: function(arr) {
          if (this.type !== Pbf.Bytes) return arr.push(this.readFixed64());
          var end = readPackedEnd(this);
          arr = arr || [];
          while (this.pos < end) arr.push(this.readFixed64());
          return arr;
      },
      readPackedSFixed64: function(arr) {
          if (this.type !== Pbf.Bytes) return arr.push(this.readSFixed64());
          var end = readPackedEnd(this);
          arr = arr || [];
          while (this.pos < end) arr.push(this.readSFixed64());
          return arr;
      },

      skip: function(val) {
          var type = val & 0x7;
          if (type === Pbf.Varint) while (this.buf[this.pos++] > 0x7f) {}
          else if (type === Pbf.Bytes) this.pos = this.readVarint() + this.pos;
          else if (type === Pbf.Fixed32) this.pos += 4;
          else if (type === Pbf.Fixed64) this.pos += 8;
          else throw new Error('Unimplemented type: ' + type);
      },

      // === WRITING =================================================================

      writeTag: function(tag, type) {
          this.writeVarint((tag << 3) | type);
      },

      realloc: function(min) {
          var length = this.length || 16;

          while (length < this.pos + min) length *= 2;

          if (length !== this.length) {
              var buf = new Uint8Array(length);
              buf.set(this.buf);
              this.buf = buf;
              this.length = length;
          }
      },

      finish: function() {
          this.length = this.pos;
          this.pos = 0;
          return this.buf.subarray(0, this.length);
      },

      writeFixed32: function(val) {
          this.realloc(4);
          writeInt32(this.buf, val, this.pos);
          this.pos += 4;
      },

      writeSFixed32: function(val) {
          this.realloc(4);
          writeInt32(this.buf, val, this.pos);
          this.pos += 4;
      },

      writeFixed64: function(val) {
          this.realloc(8);
          writeInt32(this.buf, val & -1, this.pos);
          writeInt32(this.buf, Math.floor(val * SHIFT_RIGHT_32), this.pos + 4);
          this.pos += 8;
      },

      writeSFixed64: function(val) {
          this.realloc(8);
          writeInt32(this.buf, val & -1, this.pos);
          writeInt32(this.buf, Math.floor(val * SHIFT_RIGHT_32), this.pos + 4);
          this.pos += 8;
      },

      writeVarint: function(val) {
          val = +val || 0;

          if (val > 0xfffffff || val < 0) {
              writeBigVarint(val, this);
              return;
          }

          this.realloc(4);

          this.buf[this.pos++] =           val & 0x7f  | (val > 0x7f ? 0x80 : 0); if (val <= 0x7f) return;
          this.buf[this.pos++] = ((val >>>= 7) & 0x7f) | (val > 0x7f ? 0x80 : 0); if (val <= 0x7f) return;
          this.buf[this.pos++] = ((val >>>= 7) & 0x7f) | (val > 0x7f ? 0x80 : 0); if (val <= 0x7f) return;
          this.buf[this.pos++] =   (val >>> 7) & 0x7f;
      },

      writeSVarint: function(val) {
          this.writeVarint(val < 0 ? -val * 2 - 1 : val * 2);
      },

      writeBoolean: function(val) {
          this.writeVarint(Boolean(val));
      },

      writeString: function(str) {
          str = String(str);
          this.realloc(str.length * 4);

          this.pos++; // reserve 1 byte for short string length

          var startPos = this.pos;
          // write the string directly to the buffer and see how much was written
          this.pos = writeUtf8(this.buf, str, this.pos);
          var len = this.pos - startPos;

          if (len >= 0x80) makeRoomForExtraLength(startPos, len, this);

          // finally, write the message length in the reserved place and restore the position
          this.pos = startPos - 1;
          this.writeVarint(len);
          this.pos += len;
      },

      writeFloat: function(val) {
          this.realloc(4);
          ieee754.write(this.buf, val, this.pos, true, 23, 4);
          this.pos += 4;
      },

      writeDouble: function(val) {
          this.realloc(8);
          ieee754.write(this.buf, val, this.pos, true, 52, 8);
          this.pos += 8;
      },

      writeBytes: function(buffer) {
          var len = buffer.length;
          this.writeVarint(len);
          this.realloc(len);
          for (var i = 0; i < len; i++) this.buf[this.pos++] = buffer[i];
      },

      writeRawMessage: function(fn, obj) {
          this.pos++; // reserve 1 byte for short message length

          // write the message directly to the buffer and see how much was written
          var startPos = this.pos;
          fn(obj, this);
          var len = this.pos - startPos;

          if (len >= 0x80) makeRoomForExtraLength(startPos, len, this);

          // finally, write the message length in the reserved place and restore the position
          this.pos = startPos - 1;
          this.writeVarint(len);
          this.pos += len;
      },

      writeMessage: function(tag, fn, obj) {
          this.writeTag(tag, Pbf.Bytes);
          this.writeRawMessage(fn, obj);
      },

      writePackedVarint:   function(tag, arr) { if (arr.length) this.writeMessage(tag, writePackedVarint, arr);   },
      writePackedSVarint:  function(tag, arr) { if (arr.length) this.writeMessage(tag, writePackedSVarint, arr);  },
      writePackedBoolean:  function(tag, arr) { if (arr.length) this.writeMessage(tag, writePackedBoolean, arr);  },
      writePackedFloat:    function(tag, arr) { if (arr.length) this.writeMessage(tag, writePackedFloat, arr);    },
      writePackedDouble:   function(tag, arr) { if (arr.length) this.writeMessage(tag, writePackedDouble, arr);   },
      writePackedFixed32:  function(tag, arr) { if (arr.length) this.writeMessage(tag, writePackedFixed32, arr);  },
      writePackedSFixed32: function(tag, arr) { if (arr.length) this.writeMessage(tag, writePackedSFixed32, arr); },
      writePackedFixed64:  function(tag, arr) { if (arr.length) this.writeMessage(tag, writePackedFixed64, arr);  },
      writePackedSFixed64: function(tag, arr) { if (arr.length) this.writeMessage(tag, writePackedSFixed64, arr); },

      writeBytesField: function(tag, buffer) {
          this.writeTag(tag, Pbf.Bytes);
          this.writeBytes(buffer);
      },
      writeFixed32Field: function(tag, val) {
          this.writeTag(tag, Pbf.Fixed32);
          this.writeFixed32(val);
      },
      writeSFixed32Field: function(tag, val) {
          this.writeTag(tag, Pbf.Fixed32);
          this.writeSFixed32(val);
      },
      writeFixed64Field: function(tag, val) {
          this.writeTag(tag, Pbf.Fixed64);
          this.writeFixed64(val);
      },
      writeSFixed64Field: function(tag, val) {
          this.writeTag(tag, Pbf.Fixed64);
          this.writeSFixed64(val);
      },
      writeVarintField: function(tag, val) {
          this.writeTag(tag, Pbf.Varint);
          this.writeVarint(val);
      },
      writeSVarintField: function(tag, val) {
          this.writeTag(tag, Pbf.Varint);
          this.writeSVarint(val);
      },
      writeStringField: function(tag, str) {
          this.writeTag(tag, Pbf.Bytes);
          this.writeString(str);
      },
      writeFloatField: function(tag, val) {
          this.writeTag(tag, Pbf.Fixed32);
          this.writeFloat(val);
      },
      writeDoubleField: function(tag, val) {
          this.writeTag(tag, Pbf.Fixed64);
          this.writeDouble(val);
      },
      writeBooleanField: function(tag, val) {
          this.writeVarintField(tag, Boolean(val));
      }
  };

  function readVarintRemainder(l, s, p) {
      var buf = p.buf,
          h, b;

      b = buf[p.pos++]; h  = (b & 0x70) >> 4;  if (b < 0x80) return toNum(l, h, s);
      b = buf[p.pos++]; h |= (b & 0x7f) << 3;  if (b < 0x80) return toNum(l, h, s);
      b = buf[p.pos++]; h |= (b & 0x7f) << 10; if (b < 0x80) return toNum(l, h, s);
      b = buf[p.pos++]; h |= (b & 0x7f) << 17; if (b < 0x80) return toNum(l, h, s);
      b = buf[p.pos++]; h |= (b & 0x7f) << 24; if (b < 0x80) return toNum(l, h, s);
      b = buf[p.pos++]; h |= (b & 0x01) << 31; if (b < 0x80) return toNum(l, h, s);

      throw new Error('Expected varint not more than 10 bytes');
  }

  function readPackedEnd(pbf) {
      return pbf.type === Pbf.Bytes ?
          pbf.readVarint() + pbf.pos : pbf.pos + 1;
  }

  function toNum(low, high, isSigned) {
      if (isSigned) {
          return high * 0x100000000 + (low >>> 0);
      }

      return ((high >>> 0) * 0x100000000) + (low >>> 0);
  }

  function writeBigVarint(val, pbf) {
      var low, high;

      if (val >= 0) {
          low  = (val % 0x100000000) | 0;
          high = (val / 0x100000000) | 0;
      } else {
          low  = ~(-val % 0x100000000);
          high = ~(-val / 0x100000000);

          if (low ^ 0xffffffff) {
              low = (low + 1) | 0;
          } else {
              low = 0;
              high = (high + 1) | 0;
          }
      }

      if (val >= 0x10000000000000000 || val < -0x10000000000000000) {
          throw new Error('Given varint doesn\'t fit into 10 bytes');
      }

      pbf.realloc(10);

      writeBigVarintLow(low, high, pbf);
      writeBigVarintHigh(high, pbf);
  }

  function writeBigVarintLow(low, high, pbf) {
      pbf.buf[pbf.pos++] = low & 0x7f | 0x80; low >>>= 7;
      pbf.buf[pbf.pos++] = low & 0x7f | 0x80; low >>>= 7;
      pbf.buf[pbf.pos++] = low & 0x7f | 0x80; low >>>= 7;
      pbf.buf[pbf.pos++] = low & 0x7f | 0x80; low >>>= 7;
      pbf.buf[pbf.pos]   = low & 0x7f;
  }

  function writeBigVarintHigh(high, pbf) {
      var lsb = (high & 0x07) << 4;

      pbf.buf[pbf.pos++] |= lsb         | ((high >>>= 3) ? 0x80 : 0); if (!high) return;
      pbf.buf[pbf.pos++]  = high & 0x7f | ((high >>>= 7) ? 0x80 : 0); if (!high) return;
      pbf.buf[pbf.pos++]  = high & 0x7f | ((high >>>= 7) ? 0x80 : 0); if (!high) return;
      pbf.buf[pbf.pos++]  = high & 0x7f | ((high >>>= 7) ? 0x80 : 0); if (!high) return;
      pbf.buf[pbf.pos++]  = high & 0x7f | ((high >>>= 7) ? 0x80 : 0); if (!high) return;
      pbf.buf[pbf.pos++]  = high & 0x7f;
  }

  function makeRoomForExtraLength(startPos, len, pbf) {
      var extraLen =
          len <= 0x3fff ? 1 :
          len <= 0x1fffff ? 2 :
          len <= 0xfffffff ? 3 : Math.floor(Math.log(len) / (Math.LN2 * 7));

      // if 1 byte isn't enough for encoding message length, shift the data to the right
      pbf.realloc(extraLen);
      for (var i = pbf.pos - 1; i >= startPos; i--) pbf.buf[i + extraLen] = pbf.buf[i];
  }

  function writePackedVarint(arr, pbf)   { for (var i = 0; i < arr.length; i++) pbf.writeVarint(arr[i]);   }
  function writePackedSVarint(arr, pbf)  { for (var i = 0; i < arr.length; i++) pbf.writeSVarint(arr[i]);  }
  function writePackedFloat(arr, pbf)    { for (var i = 0; i < arr.length; i++) pbf.writeFloat(arr[i]);    }
  function writePackedDouble(arr, pbf)   { for (var i = 0; i < arr.length; i++) pbf.writeDouble(arr[i]);   }
  function writePackedBoolean(arr, pbf)  { for (var i = 0; i < arr.length; i++) pbf.writeBoolean(arr[i]);  }
  function writePackedFixed32(arr, pbf)  { for (var i = 0; i < arr.length; i++) pbf.writeFixed32(arr[i]);  }
  function writePackedSFixed32(arr, pbf) { for (var i = 0; i < arr.length; i++) pbf.writeSFixed32(arr[i]); }
  function writePackedFixed64(arr, pbf)  { for (var i = 0; i < arr.length; i++) pbf.writeFixed64(arr[i]);  }
  function writePackedSFixed64(arr, pbf) { for (var i = 0; i < arr.length; i++) pbf.writeSFixed64(arr[i]); }

  // Buffer code below from https://github.com/feross/buffer, MIT-licensed

  function readUInt32(buf, pos) {
      return ((buf[pos]) |
          (buf[pos + 1] << 8) |
          (buf[pos + 2] << 16)) +
          (buf[pos + 3] * 0x1000000);
  }

  function writeInt32(buf, val, pos) {
      buf[pos] = val;
      buf[pos + 1] = (val >>> 8);
      buf[pos + 2] = (val >>> 16);
      buf[pos + 3] = (val >>> 24);
  }

  function readInt32(buf, pos) {
      return ((buf[pos]) |
          (buf[pos + 1] << 8) |
          (buf[pos + 2] << 16)) +
          (buf[pos + 3] << 24);
  }

  function readUtf8(buf, pos, end) {
      var str = '';
      var i = pos;

      while (i < end) {
          var b0 = buf[i];
          var c = null; // codepoint
          var bytesPerSequence =
              b0 > 0xEF ? 4 :
              b0 > 0xDF ? 3 :
              b0 > 0xBF ? 2 : 1;

          if (i + bytesPerSequence > end) break;

          var b1, b2, b3;

          if (bytesPerSequence === 1) {
              if (b0 < 0x80) {
                  c = b0;
              }
          } else if (bytesPerSequence === 2) {
              b1 = buf[i + 1];
              if ((b1 & 0xC0) === 0x80) {
                  c = (b0 & 0x1F) << 0x6 | (b1 & 0x3F);
                  if (c <= 0x7F) {
                      c = null;
                  }
              }
          } else if (bytesPerSequence === 3) {
              b1 = buf[i + 1];
              b2 = buf[i + 2];
              if ((b1 & 0xC0) === 0x80 && (b2 & 0xC0) === 0x80) {
                  c = (b0 & 0xF) << 0xC | (b1 & 0x3F) << 0x6 | (b2 & 0x3F);
                  if (c <= 0x7FF || (c >= 0xD800 && c <= 0xDFFF)) {
                      c = null;
                  }
              }
          } else if (bytesPerSequence === 4) {
              b1 = buf[i + 1];
              b2 = buf[i + 2];
              b3 = buf[i + 3];
              if ((b1 & 0xC0) === 0x80 && (b2 & 0xC0) === 0x80 && (b3 & 0xC0) === 0x80) {
                  c = (b0 & 0xF) << 0x12 | (b1 & 0x3F) << 0xC | (b2 & 0x3F) << 0x6 | (b3 & 0x3F);
                  if (c <= 0xFFFF || c >= 0x110000) {
                      c = null;
                  }
              }
          }

          if (c === null) {
              c = 0xFFFD;
              bytesPerSequence = 1;

          } else if (c > 0xFFFF) {
              c -= 0x10000;
              str += String.fromCharCode(c >>> 10 & 0x3FF | 0xD800);
              c = 0xDC00 | c & 0x3FF;
          }

          str += String.fromCharCode(c);
          i += bytesPerSequence;
      }

      return str;
  }

  function readUtf8TextDecoder(buf, pos, end) {
      return utf8TextDecoder.decode(buf.subarray(pos, end));
  }

  function writeUtf8(buf, str, pos) {
      for (var i = 0, c, lead; i < str.length; i++) {
          c = str.charCodeAt(i); // code point

          if (c > 0xD7FF && c < 0xE000) {
              if (lead) {
                  if (c < 0xDC00) {
                      buf[pos++] = 0xEF;
                      buf[pos++] = 0xBF;
                      buf[pos++] = 0xBD;
                      lead = c;
                      continue;
                  } else {
                      c = lead - 0xD800 << 10 | c - 0xDC00 | 0x10000;
                      lead = null;
                  }
              } else {
                  if (c > 0xDBFF || (i + 1 === str.length)) {
                      buf[pos++] = 0xEF;
                      buf[pos++] = 0xBF;
                      buf[pos++] = 0xBD;
                  } else {
                      lead = c;
                  }
                  continue;
              }
          } else if (lead) {
              buf[pos++] = 0xEF;
              buf[pos++] = 0xBF;
              buf[pos++] = 0xBD;
              lead = null;
          }

          if (c < 0x80) {
              buf[pos++] = c;
          } else {
              if (c < 0x800) {
                  buf[pos++] = c >> 0x6 | 0xC0;
              } else {
                  if (c < 0x10000) {
                      buf[pos++] = c >> 0xC | 0xE0;
                  } else {
                      buf[pos++] = c >> 0x12 | 0xF0;
                      buf[pos++] = c >> 0xC & 0x3F | 0x80;
                  }
                  buf[pos++] = c >> 0x6 & 0x3F | 0x80;
              }
              buf[pos++] = c & 0x3F | 0x80;
          }
      }
      return pos;
  }

  function defaultScale(t) {
    return t.k;
  }

  function defaultTranslate(t) {
    return [t.x, t.y];
  }

  function constant(x) {
    return function() {
      return x;
    };
  }

  function tile() {
    let x0 = 0, y0 = 0, x1 = 960, y1 = 500;
    let clampX = true, clampY = true;
    let tileSize = 256;
    let scale = defaultScale;
    let translate = defaultTranslate;
    let zoomDelta = 0;

    function tile() {
      const scale_ = +scale.apply(this, arguments);
      const translate_ = translate.apply(this, arguments);
      const z = Math.log2(scale_ / tileSize);
      const z0 = Math.round(Math.max(z + zoomDelta, 0));
      const k = Math.pow(2, z - z0) * tileSize;
      const x = +translate_[0] - scale_ / 2;
      const y = +translate_[1] - scale_ / 2;
      const xmin = Math.max(clampX ? 0 : -Infinity, Math.floor((x0 - x) / k));
      const xmax = Math.min(clampX ? 1 << z0 : Infinity, Math.ceil((x1 - x) / k));
      const ymin = Math.max(clampY ? 0 : -Infinity, Math.floor((y0 - y) / k));
      const ymax = Math.min(clampY ? 1 << z0 : Infinity, Math.ceil((y1 - y) / k));
      const tiles = [];
      for (let y = ymin; y < ymax; ++y) {
        for (let x = xmin; x < xmax; ++x) {
          tiles.push([x, y, z0]);
        }
      }
      tiles.translate = [x / k, y / k];
      tiles.scale = k;
      return tiles;
    }

    tile.size = function(_) {
      return arguments.length ? (x0 = y0 = 0, x1 = +_[0], y1 = +_[1], tile) : [x1 - x0, y1 - y0];
    };

    tile.extent = function(_) {
      return arguments.length ? (x0 = +_[0][0], y0 = +_[0][1], x1 = +_[1][0], y1 = +_[1][1], tile) : [[x0, y0], [x1, y1]];
    };

    tile.scale = function(_) {
      return arguments.length ? (scale = typeof _ === "function" ? _ : constant(+_), tile) : scale;
    };

    tile.translate = function(_) {
      return arguments.length ? (translate = typeof _ === "function" ? _ : constant([+_[0], +_[1]]), tile) : translate;
    };

    tile.zoomDelta = function(_) {
      return arguments.length ? (zoomDelta = +_, tile) : zoomDelta;
    };

    tile.tileSize = function(_) {
      return arguments.length ? (tileSize = +_, tile) : tileSize;
    };

    tile.clamp = function(_) {
      return arguments.length ? (clampX = clampY = !!_, tile) : clampX && clampY;
    };

    tile.clampX = function(_) {
      return arguments.length ? (clampX = !!_, tile) : clampX;
    };

    tile.clampY = function(_) {
      return arguments.length ? (clampY = !!_, tile) : clampY;
    };

    return tile;
  }

  function geojson([x, y, z], layer, filter = () => true) {
    if (!layer) return;
    const features = [];

    for (let i = 0; i < layer.length; ++i) {
      const f = layer.feature(i).toGeoJSON(x, y, z);

      if (filter.call(null, f, i, features)) {
        features.push(f);
      }
    }

    return {
      type: "FeatureCollection",
      features
    };
  }

  window.addEventListener('load', async () => {
    const canvas = document.querySelector('canvas');
    const width = canvas.width;
    const height = canvas.height;
    const context = canvas.getContext('2d'); // const land = topojson.feature(world, world.objects.land);

    const projection = mercator().center([100, 0]).scale(Math.pow(2, 8) / (2 * Math.PI)).translate([width / 2, height / 2]).precision(0);
    const d3t = tile().size([width, height]).scale(projection.scale() * 2 * Math.PI).translate(projection([0, 0]));
    const tiles = await Promise.all(d3t().map(async d => {
      const buf = await buffer(`tile/${d[2]}/${d[0]}/${d[1]}`);
      d.layers = new VectorTile$1(new pbf(buf)).layers;
      return d;
    }));
    const path = index(projection, context); // context.save();

    tiles.forEach(d => {
      context.beginPath();
      const feature = geojson(d, d.layers.ls8, d => true);
      path(feature);
      context.lineWidth = 1;
      context.strokeStyle = "#FF0000";
      context.stroke(); // context.restore();
    });
  });

}());
//# sourceMappingURL=main.js.map
