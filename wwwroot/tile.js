function _typeof(obj) {
  "@babel/helpers - typeof";

  if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
    _typeof = function (obj) {
      return typeof obj;
    };
  } else {
    _typeof = function (obj) {
      return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
    };
  }

  return _typeof(obj);
}

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) {
  try {
    var info = gen[key](arg);
    var value = info.value;
  } catch (error) {
    reject(error);
    return;
  }

  if (info.done) {
    resolve(value);
  } else {
    Promise.resolve(value).then(_next, _throw);
  }
}

function _asyncToGenerator(fn) {
  return function () {
    var self = this,
        args = arguments;
    return new Promise(function (resolve, reject) {
      var gen = fn.apply(self, args);

      function _next(value) {
        asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value);
      }

      function _throw(err) {
        asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err);
      }

      _next(undefined);
    });
  };
}

function _slicedToArray(arr, i) {
  return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest();
}

function _toConsumableArray(arr) {
  return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread();
}

function _arrayWithoutHoles(arr) {
  if (Array.isArray(arr)) return _arrayLikeToArray(arr);
}

function _arrayWithHoles(arr) {
  if (Array.isArray(arr)) return arr;
}

function _iterableToArray(iter) {
  if (typeof Symbol !== "undefined" && Symbol.iterator in Object(iter)) return Array.from(iter);
}

function _iterableToArrayLimit(arr, i) {
  if (typeof Symbol === "undefined" || !(Symbol.iterator in Object(arr))) return;
  var _arr = [];
  var _n = true;
  var _d = false;
  var _e = undefined;

  try {
    for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
      _arr.push(_s.value);

      if (i && _arr.length === i) break;
    }
  } catch (err) {
    _d = true;
    _e = err;
  } finally {
    try {
      if (!_n && _i["return"] != null) _i["return"]();
    } finally {
      if (_d) throw _e;
    }
  }

  return _arr;
}

function _unsupportedIterableToArray(o, minLen) {
  if (!o) return;
  if (typeof o === "string") return _arrayLikeToArray(o, minLen);
  var n = Object.prototype.toString.call(o).slice(8, -1);
  if (n === "Object" && o.constructor) n = o.constructor.name;
  if (n === "Map" || n === "Set") return Array.from(o);
  if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
}

function _arrayLikeToArray(arr, len) {
  if (len == null || len > arr.length) len = arr.length;

  for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i];

  return arr2;
}

function _nonIterableSpread() {
  throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}

function _nonIterableRest() {
  throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}

function _createForOfIteratorHelper(o, allowArrayLike) {
  var it;

  if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) {
    if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") {
      if (it) o = it;
      var i = 0;

      var F = function () {};

      return {
        s: F,
        n: function () {
          if (i >= o.length) return {
            done: true
          };
          return {
            done: false,
            value: o[i++]
          };
        },
        e: function (e) {
          throw e;
        },
        f: F
      };
    }

    throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
  }

  var normalCompletion = true,
      didErr = false,
      err;
  return {
    s: function () {
      it = o[Symbol.iterator]();
    },
    n: function () {
      var step = it.next();
      normalCompletion = step.done;
      return step;
    },
    e: function (e) {
      didErr = true;
      err = e;
    },
    f: function () {
      try {
        if (!normalCompletion && it.return != null) it.return();
      } finally {
        if (didErr) throw err;
      }
    }
  };
}

var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

function createCommonjsModule(fn) {
  var module = { exports: {} };
	return fn(module, module.exports), module.exports;
}

var check = function (it) {
  return it && it.Math == Math && it;
};

// https://github.com/zloirock/core-js/issues/86#issuecomment-115759028
var global$1 =
  /* global globalThis -- safe */
  check(typeof globalThis == 'object' && globalThis) ||
  check(typeof window == 'object' && window) ||
  check(typeof self == 'object' && self) ||
  check(typeof commonjsGlobal == 'object' && commonjsGlobal) ||
  // eslint-disable-next-line no-new-func -- fallback
  (function () { return this; })() || Function('return this')();

var fails = function (exec) {
  try {
    return !!exec();
  } catch (error) {
    return true;
  }
};

// Detect IE8's incomplete defineProperty implementation
var descriptors = !fails(function () {
  return Object.defineProperty({}, 1, { get: function () { return 7; } })[1] != 7;
});

var nativePropertyIsEnumerable$1 = {}.propertyIsEnumerable;
var getOwnPropertyDescriptor$2 = Object.getOwnPropertyDescriptor;

// Nashorn ~ JDK8 bug
var NASHORN_BUG = getOwnPropertyDescriptor$2 && !nativePropertyIsEnumerable$1.call({ 1: 2 }, 1);

// `Object.prototype.propertyIsEnumerable` method implementation
// https://tc39.es/ecma262/#sec-object.prototype.propertyisenumerable
var f$7 = NASHORN_BUG ? function propertyIsEnumerable(V) {
  var descriptor = getOwnPropertyDescriptor$2(this, V);
  return !!descriptor && descriptor.enumerable;
} : nativePropertyIsEnumerable$1;

var objectPropertyIsEnumerable = {
	f: f$7
};

var createPropertyDescriptor = function (bitmap, value) {
  return {
    enumerable: !(bitmap & 1),
    configurable: !(bitmap & 2),
    writable: !(bitmap & 4),
    value: value
  };
};

var toString$1 = {}.toString;

var classofRaw = function (it) {
  return toString$1.call(it).slice(8, -1);
};

var split = ''.split;

// fallback for non-array-like ES3 and non-enumerable old V8 strings
var indexedObject = fails(function () {
  // throws an error in rhino, see https://github.com/mozilla/rhino/issues/346
  // eslint-disable-next-line no-prototype-builtins -- safe
  return !Object('z').propertyIsEnumerable(0);
}) ? function (it) {
  return classofRaw(it) == 'String' ? split.call(it, '') : Object(it);
} : Object;

// `RequireObjectCoercible` abstract operation
// https://tc39.es/ecma262/#sec-requireobjectcoercible
var requireObjectCoercible = function (it) {
  if (it == undefined) throw TypeError("Can't call method on " + it);
  return it;
};

// toObject with fallback for non-array-like ES3 strings



var toIndexedObject = function (it) {
  return indexedObject(requireObjectCoercible(it));
};

var isObject = function (it) {
  return typeof it === 'object' ? it !== null : typeof it === 'function';
};

// `ToPrimitive` abstract operation
// https://tc39.es/ecma262/#sec-toprimitive
// instead of the ES6 spec version, we didn't implement @@toPrimitive case
// and the second argument - flag - preferred type is a string
var toPrimitive = function (input, PREFERRED_STRING) {
  if (!isObject(input)) return input;
  var fn, val;
  if (PREFERRED_STRING && typeof (fn = input.toString) == 'function' && !isObject(val = fn.call(input))) return val;
  if (typeof (fn = input.valueOf) == 'function' && !isObject(val = fn.call(input))) return val;
  if (!PREFERRED_STRING && typeof (fn = input.toString) == 'function' && !isObject(val = fn.call(input))) return val;
  throw TypeError("Can't convert object to primitive value");
};

var hasOwnProperty = {}.hasOwnProperty;

var has$1 = function (it, key) {
  return hasOwnProperty.call(it, key);
};

var document$3 = global$1.document;
// typeof document.createElement is 'object' in old IE
var EXISTS = isObject(document$3) && isObject(document$3.createElement);

var documentCreateElement = function (it) {
  return EXISTS ? document$3.createElement(it) : {};
};

// Thank's IE8 for his funny defineProperty
var ie8DomDefine = !descriptors && !fails(function () {
  return Object.defineProperty(documentCreateElement('div'), 'a', {
    get: function () { return 7; }
  }).a != 7;
});

var nativeGetOwnPropertyDescriptor$1 = Object.getOwnPropertyDescriptor;

// `Object.getOwnPropertyDescriptor` method
// https://tc39.es/ecma262/#sec-object.getownpropertydescriptor
var f$6 = descriptors ? nativeGetOwnPropertyDescriptor$1 : function getOwnPropertyDescriptor(O, P) {
  O = toIndexedObject(O);
  P = toPrimitive(P, true);
  if (ie8DomDefine) try {
    return nativeGetOwnPropertyDescriptor$1(O, P);
  } catch (error) { /* empty */ }
  if (has$1(O, P)) return createPropertyDescriptor(!objectPropertyIsEnumerable.f.call(O, P), O[P]);
};

var objectGetOwnPropertyDescriptor = {
	f: f$6
};

var anObject = function (it) {
  if (!isObject(it)) {
    throw TypeError(String(it) + ' is not an object');
  } return it;
};

var nativeDefineProperty$1 = Object.defineProperty;

// `Object.defineProperty` method
// https://tc39.es/ecma262/#sec-object.defineproperty
var f$5 = descriptors ? nativeDefineProperty$1 : function defineProperty(O, P, Attributes) {
  anObject(O);
  P = toPrimitive(P, true);
  anObject(Attributes);
  if (ie8DomDefine) try {
    return nativeDefineProperty$1(O, P, Attributes);
  } catch (error) { /* empty */ }
  if ('get' in Attributes || 'set' in Attributes) throw TypeError('Accessors not supported');
  if ('value' in Attributes) O[P] = Attributes.value;
  return O;
};

var objectDefineProperty = {
	f: f$5
};

var createNonEnumerableProperty = descriptors ? function (object, key, value) {
  return objectDefineProperty.f(object, key, createPropertyDescriptor(1, value));
} : function (object, key, value) {
  object[key] = value;
  return object;
};

var setGlobal = function (key, value) {
  try {
    createNonEnumerableProperty(global$1, key, value);
  } catch (error) {
    global$1[key] = value;
  } return value;
};

var SHARED = '__core-js_shared__';
var store$1 = global$1[SHARED] || setGlobal(SHARED, {});

var sharedStore = store$1;

var functionToString = Function.toString;

// this helper broken in `3.4.1-3.4.4`, so we can't use `shared` helper
if (typeof sharedStore.inspectSource != 'function') {
  sharedStore.inspectSource = function (it) {
    return functionToString.call(it);
  };
}

var inspectSource = sharedStore.inspectSource;

var WeakMap$1 = global$1.WeakMap;

var nativeWeakMap = typeof WeakMap$1 === 'function' && /native code/.test(inspectSource(WeakMap$1));

var shared = createCommonjsModule(function (module) {
(module.exports = function (key, value) {
  return sharedStore[key] || (sharedStore[key] = value !== undefined ? value : {});
})('versions', []).push({
  version: '3.9.1',
  mode: 'global',
  copyright: '© 2021 Denis Pushkarev (zloirock.ru)'
});
});

var id = 0;
var postfix = Math.random();

var uid = function (key) {
  return 'Symbol(' + String(key === undefined ? '' : key) + ')_' + (++id + postfix).toString(36);
};

var keys$1 = shared('keys');

var sharedKey = function (key) {
  return keys$1[key] || (keys$1[key] = uid(key));
};

var hiddenKeys$1 = {};

var WeakMap = global$1.WeakMap;
var set$2, get$2, has;

var enforce = function (it) {
  return has(it) ? get$2(it) : set$2(it, {});
};

var getterFor = function (TYPE) {
  return function (it) {
    var state;
    if (!isObject(it) || (state = get$2(it)).type !== TYPE) {
      throw TypeError('Incompatible receiver, ' + TYPE + ' required');
    } return state;
  };
};

if (nativeWeakMap) {
  var store = sharedStore.state || (sharedStore.state = new WeakMap());
  var wmget = store.get;
  var wmhas = store.has;
  var wmset = store.set;
  set$2 = function (it, metadata) {
    metadata.facade = it;
    wmset.call(store, it, metadata);
    return metadata;
  };
  get$2 = function (it) {
    return wmget.call(store, it) || {};
  };
  has = function (it) {
    return wmhas.call(store, it);
  };
} else {
  var STATE = sharedKey('state');
  hiddenKeys$1[STATE] = true;
  set$2 = function (it, metadata) {
    metadata.facade = it;
    createNonEnumerableProperty(it, STATE, metadata);
    return metadata;
  };
  get$2 = function (it) {
    return has$1(it, STATE) ? it[STATE] : {};
  };
  has = function (it) {
    return has$1(it, STATE);
  };
}

var internalState = {
  set: set$2,
  get: get$2,
  has: has,
  enforce: enforce,
  getterFor: getterFor
};

var redefine = createCommonjsModule(function (module) {
var getInternalState = internalState.get;
var enforceInternalState = internalState.enforce;
var TEMPLATE = String(String).split('String');

(module.exports = function (O, key, value, options) {
  var unsafe = options ? !!options.unsafe : false;
  var simple = options ? !!options.enumerable : false;
  var noTargetGet = options ? !!options.noTargetGet : false;
  var state;
  if (typeof value == 'function') {
    if (typeof key == 'string' && !has$1(value, 'name')) {
      createNonEnumerableProperty(value, 'name', key);
    }
    state = enforceInternalState(value);
    if (!state.source) {
      state.source = TEMPLATE.join(typeof key == 'string' ? key : '');
    }
  }
  if (O === global$1) {
    if (simple) O[key] = value;
    else setGlobal(key, value);
    return;
  } else if (!unsafe) {
    delete O[key];
  } else if (!noTargetGet && O[key]) {
    simple = true;
  }
  if (simple) O[key] = value;
  else createNonEnumerableProperty(O, key, value);
// add fake Function#toString for correct work wrapped methods / constructors with methods like LoDash isNative
})(Function.prototype, 'toString', function toString() {
  return typeof this == 'function' && getInternalState(this).source || inspectSource(this);
});
});

var path = global$1;

var aFunction$1 = function (variable) {
  return typeof variable == 'function' ? variable : undefined;
};

var getBuiltIn = function (namespace, method) {
  return arguments.length < 2 ? aFunction$1(path[namespace]) || aFunction$1(global$1[namespace])
    : path[namespace] && path[namespace][method] || global$1[namespace] && global$1[namespace][method];
};

var ceil = Math.ceil;
var floor$2 = Math.floor;

// `ToInteger` abstract operation
// https://tc39.es/ecma262/#sec-tointeger
var toInteger = function (argument) {
  return isNaN(argument = +argument) ? 0 : (argument > 0 ? floor$2 : ceil)(argument);
};

var min$3 = Math.min;

// `ToLength` abstract operation
// https://tc39.es/ecma262/#sec-tolength
var toLength = function (argument) {
  return argument > 0 ? min$3(toInteger(argument), 0x1FFFFFFFFFFFFF) : 0; // 2 ** 53 - 1 == 9007199254740991
};

var max$1 = Math.max;
var min$2 = Math.min;

// Helper for a popular repeating case of the spec:
// Let integer be ? ToInteger(index).
// If integer < 0, let result be max((length + integer), 0); else let result be min(integer, length).
var toAbsoluteIndex = function (index, length) {
  var integer = toInteger(index);
  return integer < 0 ? max$1(integer + length, 0) : min$2(integer, length);
};

// `Array.prototype.{ indexOf, includes }` methods implementation
var createMethod$4 = function (IS_INCLUDES) {
  return function ($this, el, fromIndex) {
    var O = toIndexedObject($this);
    var length = toLength(O.length);
    var index = toAbsoluteIndex(fromIndex, length);
    var value;
    // Array#includes uses SameValueZero equality algorithm
    // eslint-disable-next-line no-self-compare -- NaN check
    if (IS_INCLUDES && el != el) while (length > index) {
      value = O[index++];
      // eslint-disable-next-line no-self-compare -- NaN check
      if (value != value) return true;
    // Array#indexOf ignores holes, Array#includes - not
    } else for (;length > index; index++) {
      if ((IS_INCLUDES || index in O) && O[index] === el) return IS_INCLUDES || index || 0;
    } return !IS_INCLUDES && -1;
  };
};

var arrayIncludes = {
  // `Array.prototype.includes` method
  // https://tc39.es/ecma262/#sec-array.prototype.includes
  includes: createMethod$4(true),
  // `Array.prototype.indexOf` method
  // https://tc39.es/ecma262/#sec-array.prototype.indexof
  indexOf: createMethod$4(false)
};

var indexOf = arrayIncludes.indexOf;


var objectKeysInternal = function (object, names) {
  var O = toIndexedObject(object);
  var i = 0;
  var result = [];
  var key;
  for (key in O) !has$1(hiddenKeys$1, key) && has$1(O, key) && result.push(key);
  // Don't enum bug & hidden keys
  while (names.length > i) if (has$1(O, key = names[i++])) {
    ~indexOf(result, key) || result.push(key);
  }
  return result;
};

// IE8- don't enum bug keys
var enumBugKeys = [
  'constructor',
  'hasOwnProperty',
  'isPrototypeOf',
  'propertyIsEnumerable',
  'toLocaleString',
  'toString',
  'valueOf'
];

var hiddenKeys = enumBugKeys.concat('length', 'prototype');

// `Object.getOwnPropertyNames` method
// https://tc39.es/ecma262/#sec-object.getownpropertynames
var f$4 = Object.getOwnPropertyNames || function getOwnPropertyNames(O) {
  return objectKeysInternal(O, hiddenKeys);
};

var objectGetOwnPropertyNames = {
	f: f$4
};

var f$3 = Object.getOwnPropertySymbols;

var objectGetOwnPropertySymbols = {
	f: f$3
};

// all object keys, includes non-enumerable and symbols
var ownKeys = getBuiltIn('Reflect', 'ownKeys') || function ownKeys(it) {
  var keys = objectGetOwnPropertyNames.f(anObject(it));
  var getOwnPropertySymbols = objectGetOwnPropertySymbols.f;
  return getOwnPropertySymbols ? keys.concat(getOwnPropertySymbols(it)) : keys;
};

var copyConstructorProperties = function (target, source) {
  var keys = ownKeys(source);
  var defineProperty = objectDefineProperty.f;
  var getOwnPropertyDescriptor = objectGetOwnPropertyDescriptor.f;
  for (var i = 0; i < keys.length; i++) {
    var key = keys[i];
    if (!has$1(target, key)) defineProperty(target, key, getOwnPropertyDescriptor(source, key));
  }
};

var replacement = /#|\.prototype\./;

var isForced = function (feature, detection) {
  var value = data[normalize(feature)];
  return value == POLYFILL ? true
    : value == NATIVE ? false
    : typeof detection == 'function' ? fails(detection)
    : !!detection;
};

var normalize = isForced.normalize = function (string) {
  return String(string).replace(replacement, '.').toLowerCase();
};

var data = isForced.data = {};
var NATIVE = isForced.NATIVE = 'N';
var POLYFILL = isForced.POLYFILL = 'P';

var isForced_1 = isForced;

var getOwnPropertyDescriptor$1 = objectGetOwnPropertyDescriptor.f;






/*
  options.target      - name of the target object
  options.global      - target is the global object
  options.stat        - export as static methods of target
  options.proto       - export as prototype methods of target
  options.real        - real prototype method for the `pure` version
  options.forced      - export even if the native feature is available
  options.bind        - bind methods to the target, required for the `pure` version
  options.wrap        - wrap constructors to preventing global pollution, required for the `pure` version
  options.unsafe      - use the simple assignment of property instead of delete + defineProperty
  options.sham        - add a flag to not completely full polyfills
  options.enumerable  - export as enumerable property
  options.noTargetGet - prevent calling a getter on target
*/
var _export = function (options, source) {
  var TARGET = options.target;
  var GLOBAL = options.global;
  var STATIC = options.stat;
  var FORCED, target, key, targetProperty, sourceProperty, descriptor;
  if (GLOBAL) {
    target = global$1;
  } else if (STATIC) {
    target = global$1[TARGET] || setGlobal(TARGET, {});
  } else {
    target = (global$1[TARGET] || {}).prototype;
  }
  if (target) for (key in source) {
    sourceProperty = source[key];
    if (options.noTargetGet) {
      descriptor = getOwnPropertyDescriptor$1(target, key);
      targetProperty = descriptor && descriptor.value;
    } else targetProperty = target[key];
    FORCED = isForced_1(GLOBAL ? key : TARGET + (STATIC ? '.' : '#') + key, options.forced);
    // contained in target
    if (!FORCED && targetProperty !== undefined) {
      if (typeof sourceProperty === typeof targetProperty) continue;
      copyConstructorProperties(sourceProperty, targetProperty);
    }
    // add a flag to not completely full polyfills
    if (options.sham || (targetProperty && targetProperty.sham)) {
      createNonEnumerableProperty(sourceProperty, 'sham', true);
    }
    // extend global
    redefine(target, key, sourceProperty, options);
  }
};

// `Object.keys` method
// https://tc39.es/ecma262/#sec-object.keys
var objectKeys = Object.keys || function keys(O) {
  return objectKeysInternal(O, enumBugKeys);
};

var propertyIsEnumerable = objectPropertyIsEnumerable.f;

// `Object.{ entries, values }` methods implementation
var createMethod$3 = function (TO_ENTRIES) {
  return function (it) {
    var O = toIndexedObject(it);
    var keys = objectKeys(O);
    var length = keys.length;
    var i = 0;
    var result = [];
    var key;
    while (length > i) {
      key = keys[i++];
      if (!descriptors || propertyIsEnumerable.call(O, key)) {
        result.push(TO_ENTRIES ? [key, O[key]] : O[key]);
      }
    }
    return result;
  };
};

var objectToArray = {
  // `Object.entries` method
  // https://tc39.es/ecma262/#sec-object.entries
  entries: createMethod$3(true),
  // `Object.values` method
  // https://tc39.es/ecma262/#sec-object.values
  values: createMethod$3(false)
};

var $entries = objectToArray.entries;

// `Object.entries` method
// https://tc39.es/ecma262/#sec-object.entries
_export({ target: 'Object', stat: true }, {
  entries: function entries(O) {
    return $entries(O);
  }
});

var engineIsNode = classofRaw(global$1.process) == 'process';

var engineUserAgent = getBuiltIn('navigator', 'userAgent') || '';

var process$3 = global$1.process;
var versions = process$3 && process$3.versions;
var v8 = versions && versions.v8;
var match, version;

if (v8) {
  match = v8.split('.');
  version = match[0] + match[1];
} else if (engineUserAgent) {
  match = engineUserAgent.match(/Edge\/(\d+)/);
  if (!match || match[1] >= 74) {
    match = engineUserAgent.match(/Chrome\/(\d+)/);
    if (match) version = match[1];
  }
}

var engineV8Version = version && +version;

var nativeSymbol = !!Object.getOwnPropertySymbols && !fails(function () {
  /* global Symbol -- required for testing */
  return !Symbol.sham &&
    // Chrome 38 Symbol has incorrect toString conversion
    // Chrome 38-40 symbols are not inherited from DOM collections prototypes to instances
    (engineIsNode ? engineV8Version === 38 : engineV8Version > 37 && engineV8Version < 41);
});

var useSymbolAsUid = nativeSymbol
  /* global Symbol -- safe */
  && !Symbol.sham
  && typeof Symbol.iterator == 'symbol';

// `IsArray` abstract operation
// https://tc39.es/ecma262/#sec-isarray
var isArray = Array.isArray || function isArray(arg) {
  return classofRaw(arg) == 'Array';
};

// `ToObject` abstract operation
// https://tc39.es/ecma262/#sec-toobject
var toObject = function (argument) {
  return Object(requireObjectCoercible(argument));
};

// `Object.defineProperties` method
// https://tc39.es/ecma262/#sec-object.defineproperties
var objectDefineProperties = descriptors ? Object.defineProperties : function defineProperties(O, Properties) {
  anObject(O);
  var keys = objectKeys(Properties);
  var length = keys.length;
  var index = 0;
  var key;
  while (length > index) objectDefineProperty.f(O, key = keys[index++], Properties[key]);
  return O;
};

var html = getBuiltIn('document', 'documentElement');

var GT = '>';
var LT = '<';
var PROTOTYPE$2 = 'prototype';
var SCRIPT = 'script';
var IE_PROTO$1 = sharedKey('IE_PROTO');

var EmptyConstructor = function () { /* empty */ };

var scriptTag = function (content) {
  return LT + SCRIPT + GT + content + LT + '/' + SCRIPT + GT;
};

// Create object with fake `null` prototype: use ActiveX Object with cleared prototype
var NullProtoObjectViaActiveX = function (activeXDocument) {
  activeXDocument.write(scriptTag(''));
  activeXDocument.close();
  var temp = activeXDocument.parentWindow.Object;
  activeXDocument = null; // avoid memory leak
  return temp;
};

// Create object with fake `null` prototype: use iframe Object with cleared prototype
var NullProtoObjectViaIFrame = function () {
  // Thrash, waste and sodomy: IE GC bug
  var iframe = documentCreateElement('iframe');
  var JS = 'java' + SCRIPT + ':';
  var iframeDocument;
  iframe.style.display = 'none';
  html.appendChild(iframe);
  // https://github.com/zloirock/core-js/issues/475
  iframe.src = String(JS);
  iframeDocument = iframe.contentWindow.document;
  iframeDocument.open();
  iframeDocument.write(scriptTag('document.F=Object'));
  iframeDocument.close();
  return iframeDocument.F;
};

// Check for document.domain and active x support
// No need to use active x approach when document.domain is not set
// see https://github.com/es-shims/es5-shim/issues/150
// variation of https://github.com/kitcambridge/es5-shim/commit/4f738ac066346
// avoid IE GC bug
var activeXDocument;
var NullProtoObject = function () {
  try {
    /* global ActiveXObject -- old IE */
    activeXDocument = document.domain && new ActiveXObject('htmlfile');
  } catch (error) { /* ignore */ }
  NullProtoObject = activeXDocument ? NullProtoObjectViaActiveX(activeXDocument) : NullProtoObjectViaIFrame();
  var length = enumBugKeys.length;
  while (length--) delete NullProtoObject[PROTOTYPE$2][enumBugKeys[length]];
  return NullProtoObject();
};

hiddenKeys$1[IE_PROTO$1] = true;

// `Object.create` method
// https://tc39.es/ecma262/#sec-object.create
var objectCreate = Object.create || function create(O, Properties) {
  var result;
  if (O !== null) {
    EmptyConstructor[PROTOTYPE$2] = anObject(O);
    result = new EmptyConstructor();
    EmptyConstructor[PROTOTYPE$2] = null;
    // add "__proto__" for Object.getPrototypeOf polyfill
    result[IE_PROTO$1] = O;
  } else result = NullProtoObject();
  return Properties === undefined ? result : objectDefineProperties(result, Properties);
};

var nativeGetOwnPropertyNames$1 = objectGetOwnPropertyNames.f;

var toString = {}.toString;

var windowNames = typeof window == 'object' && window && Object.getOwnPropertyNames
  ? Object.getOwnPropertyNames(window) : [];

var getWindowNames = function (it) {
  try {
    return nativeGetOwnPropertyNames$1(it);
  } catch (error) {
    return windowNames.slice();
  }
};

// fallback for IE11 buggy Object.getOwnPropertyNames with iframe and window
var f$2 = function getOwnPropertyNames(it) {
  return windowNames && toString.call(it) == '[object Window]'
    ? getWindowNames(it)
    : nativeGetOwnPropertyNames$1(toIndexedObject(it));
};

var objectGetOwnPropertyNamesExternal = {
	f: f$2
};

var WellKnownSymbolsStore$1 = shared('wks');
var Symbol$1 = global$1.Symbol;
var createWellKnownSymbol = useSymbolAsUid ? Symbol$1 : Symbol$1 && Symbol$1.withoutSetter || uid;

var wellKnownSymbol = function (name) {
  if (!has$1(WellKnownSymbolsStore$1, name) || !(nativeSymbol || typeof WellKnownSymbolsStore$1[name] == 'string')) {
    if (nativeSymbol && has$1(Symbol$1, name)) {
      WellKnownSymbolsStore$1[name] = Symbol$1[name];
    } else {
      WellKnownSymbolsStore$1[name] = createWellKnownSymbol('Symbol.' + name);
    }
  } return WellKnownSymbolsStore$1[name];
};

var f$1 = wellKnownSymbol;

var wellKnownSymbolWrapped = {
	f: f$1
};

var defineProperty$5 = objectDefineProperty.f;

var defineWellKnownSymbol = function (NAME) {
  var Symbol = path.Symbol || (path.Symbol = {});
  if (!has$1(Symbol, NAME)) defineProperty$5(Symbol, NAME, {
    value: wellKnownSymbolWrapped.f(NAME)
  });
};

var defineProperty$4 = objectDefineProperty.f;



var TO_STRING_TAG$4 = wellKnownSymbol('toStringTag');

var setToStringTag = function (it, TAG, STATIC) {
  if (it && !has$1(it = STATIC ? it : it.prototype, TO_STRING_TAG$4)) {
    defineProperty$4(it, TO_STRING_TAG$4, { configurable: true, value: TAG });
  }
};

var aFunction = function (it) {
  if (typeof it != 'function') {
    throw TypeError(String(it) + ' is not a function');
  } return it;
};

// optional / simple context binding
var functionBindContext = function (fn, that, length) {
  aFunction(fn);
  if (that === undefined) return fn;
  switch (length) {
    case 0: return function () {
      return fn.call(that);
    };
    case 1: return function (a) {
      return fn.call(that, a);
    };
    case 2: return function (a, b) {
      return fn.call(that, a, b);
    };
    case 3: return function (a, b, c) {
      return fn.call(that, a, b, c);
    };
  }
  return function (/* ...args */) {
    return fn.apply(that, arguments);
  };
};

var SPECIES$5 = wellKnownSymbol('species');

// `ArraySpeciesCreate` abstract operation
// https://tc39.es/ecma262/#sec-arrayspeciescreate
var arraySpeciesCreate = function (originalArray, length) {
  var C;
  if (isArray(originalArray)) {
    C = originalArray.constructor;
    // cross-realm fallback
    if (typeof C == 'function' && (C === Array || isArray(C.prototype))) C = undefined;
    else if (isObject(C)) {
      C = C[SPECIES$5];
      if (C === null) C = undefined;
    }
  } return new (C === undefined ? Array : C)(length === 0 ? 0 : length);
};

var push = [].push;

// `Array.prototype.{ forEach, map, filter, some, every, find, findIndex, filterOut }` methods implementation
var createMethod$2 = function (TYPE) {
  var IS_MAP = TYPE == 1;
  var IS_FILTER = TYPE == 2;
  var IS_SOME = TYPE == 3;
  var IS_EVERY = TYPE == 4;
  var IS_FIND_INDEX = TYPE == 6;
  var IS_FILTER_OUT = TYPE == 7;
  var NO_HOLES = TYPE == 5 || IS_FIND_INDEX;
  return function ($this, callbackfn, that, specificCreate) {
    var O = toObject($this);
    var self = indexedObject(O);
    var boundFunction = functionBindContext(callbackfn, that, 3);
    var length = toLength(self.length);
    var index = 0;
    var create = specificCreate || arraySpeciesCreate;
    var target = IS_MAP ? create($this, length) : IS_FILTER || IS_FILTER_OUT ? create($this, 0) : undefined;
    var value, result;
    for (;length > index; index++) if (NO_HOLES || index in self) {
      value = self[index];
      result = boundFunction(value, index, O);
      if (TYPE) {
        if (IS_MAP) target[index] = result; // map
        else if (result) switch (TYPE) {
          case 3: return true;              // some
          case 5: return value;             // find
          case 6: return index;             // findIndex
          case 2: push.call(target, value); // filter
        } else switch (TYPE) {
          case 4: return false;             // every
          case 7: push.call(target, value); // filterOut
        }
      }
    }
    return IS_FIND_INDEX ? -1 : IS_SOME || IS_EVERY ? IS_EVERY : target;
  };
};

var arrayIteration = {
  // `Array.prototype.forEach` method
  // https://tc39.es/ecma262/#sec-array.prototype.foreach
  forEach: createMethod$2(0),
  // `Array.prototype.map` method
  // https://tc39.es/ecma262/#sec-array.prototype.map
  map: createMethod$2(1),
  // `Array.prototype.filter` method
  // https://tc39.es/ecma262/#sec-array.prototype.filter
  filter: createMethod$2(2),
  // `Array.prototype.some` method
  // https://tc39.es/ecma262/#sec-array.prototype.some
  some: createMethod$2(3),
  // `Array.prototype.every` method
  // https://tc39.es/ecma262/#sec-array.prototype.every
  every: createMethod$2(4),
  // `Array.prototype.find` method
  // https://tc39.es/ecma262/#sec-array.prototype.find
  find: createMethod$2(5),
  // `Array.prototype.findIndex` method
  // https://tc39.es/ecma262/#sec-array.prototype.findIndex
  findIndex: createMethod$2(6),
  // `Array.prototype.filterOut` method
  // https://github.com/tc39/proposal-array-filtering
  filterOut: createMethod$2(7)
};

var $forEach$2 = arrayIteration.forEach;

var HIDDEN = sharedKey('hidden');
var SYMBOL = 'Symbol';
var PROTOTYPE$1 = 'prototype';
var TO_PRIMITIVE = wellKnownSymbol('toPrimitive');
var setInternalState$4 = internalState.set;
var getInternalState$4 = internalState.getterFor(SYMBOL);
var ObjectPrototype$3 = Object[PROTOTYPE$1];
var $Symbol = global$1.Symbol;
var $stringify = getBuiltIn('JSON', 'stringify');
var nativeGetOwnPropertyDescriptor = objectGetOwnPropertyDescriptor.f;
var nativeDefineProperty = objectDefineProperty.f;
var nativeGetOwnPropertyNames = objectGetOwnPropertyNamesExternal.f;
var nativePropertyIsEnumerable = objectPropertyIsEnumerable.f;
var AllSymbols = shared('symbols');
var ObjectPrototypeSymbols = shared('op-symbols');
var StringToSymbolRegistry = shared('string-to-symbol-registry');
var SymbolToStringRegistry = shared('symbol-to-string-registry');
var WellKnownSymbolsStore = shared('wks');
var QObject = global$1.QObject;
// Don't use setters in Qt Script, https://github.com/zloirock/core-js/issues/173
var USE_SETTER = !QObject || !QObject[PROTOTYPE$1] || !QObject[PROTOTYPE$1].findChild;

// fallback for old Android, https://code.google.com/p/v8/issues/detail?id=687
var setSymbolDescriptor = descriptors && fails(function () {
  return objectCreate(nativeDefineProperty({}, 'a', {
    get: function () { return nativeDefineProperty(this, 'a', { value: 7 }).a; }
  })).a != 7;
}) ? function (O, P, Attributes) {
  var ObjectPrototypeDescriptor = nativeGetOwnPropertyDescriptor(ObjectPrototype$3, P);
  if (ObjectPrototypeDescriptor) delete ObjectPrototype$3[P];
  nativeDefineProperty(O, P, Attributes);
  if (ObjectPrototypeDescriptor && O !== ObjectPrototype$3) {
    nativeDefineProperty(ObjectPrototype$3, P, ObjectPrototypeDescriptor);
  }
} : nativeDefineProperty;

var wrap = function (tag, description) {
  var symbol = AllSymbols[tag] = objectCreate($Symbol[PROTOTYPE$1]);
  setInternalState$4(symbol, {
    type: SYMBOL,
    tag: tag,
    description: description
  });
  if (!descriptors) symbol.description = description;
  return symbol;
};

var isSymbol = useSymbolAsUid ? function (it) {
  return typeof it == 'symbol';
} : function (it) {
  return Object(it) instanceof $Symbol;
};

var $defineProperty = function defineProperty(O, P, Attributes) {
  if (O === ObjectPrototype$3) $defineProperty(ObjectPrototypeSymbols, P, Attributes);
  anObject(O);
  var key = toPrimitive(P, true);
  anObject(Attributes);
  if (has$1(AllSymbols, key)) {
    if (!Attributes.enumerable) {
      if (!has$1(O, HIDDEN)) nativeDefineProperty(O, HIDDEN, createPropertyDescriptor(1, {}));
      O[HIDDEN][key] = true;
    } else {
      if (has$1(O, HIDDEN) && O[HIDDEN][key]) O[HIDDEN][key] = false;
      Attributes = objectCreate(Attributes, { enumerable: createPropertyDescriptor(0, false) });
    } return setSymbolDescriptor(O, key, Attributes);
  } return nativeDefineProperty(O, key, Attributes);
};

var $defineProperties = function defineProperties(O, Properties) {
  anObject(O);
  var properties = toIndexedObject(Properties);
  var keys = objectKeys(properties).concat($getOwnPropertySymbols(properties));
  $forEach$2(keys, function (key) {
    if (!descriptors || $propertyIsEnumerable.call(properties, key)) $defineProperty(O, key, properties[key]);
  });
  return O;
};

var $create = function create(O, Properties) {
  return Properties === undefined ? objectCreate(O) : $defineProperties(objectCreate(O), Properties);
};

var $propertyIsEnumerable = function propertyIsEnumerable(V) {
  var P = toPrimitive(V, true);
  var enumerable = nativePropertyIsEnumerable.call(this, P);
  if (this === ObjectPrototype$3 && has$1(AllSymbols, P) && !has$1(ObjectPrototypeSymbols, P)) return false;
  return enumerable || !has$1(this, P) || !has$1(AllSymbols, P) || has$1(this, HIDDEN) && this[HIDDEN][P] ? enumerable : true;
};

var $getOwnPropertyDescriptor = function getOwnPropertyDescriptor(O, P) {
  var it = toIndexedObject(O);
  var key = toPrimitive(P, true);
  if (it === ObjectPrototype$3 && has$1(AllSymbols, key) && !has$1(ObjectPrototypeSymbols, key)) return;
  var descriptor = nativeGetOwnPropertyDescriptor(it, key);
  if (descriptor && has$1(AllSymbols, key) && !(has$1(it, HIDDEN) && it[HIDDEN][key])) {
    descriptor.enumerable = true;
  }
  return descriptor;
};

var $getOwnPropertyNames = function getOwnPropertyNames(O) {
  var names = nativeGetOwnPropertyNames(toIndexedObject(O));
  var result = [];
  $forEach$2(names, function (key) {
    if (!has$1(AllSymbols, key) && !has$1(hiddenKeys$1, key)) result.push(key);
  });
  return result;
};

var $getOwnPropertySymbols = function getOwnPropertySymbols(O) {
  var IS_OBJECT_PROTOTYPE = O === ObjectPrototype$3;
  var names = nativeGetOwnPropertyNames(IS_OBJECT_PROTOTYPE ? ObjectPrototypeSymbols : toIndexedObject(O));
  var result = [];
  $forEach$2(names, function (key) {
    if (has$1(AllSymbols, key) && (!IS_OBJECT_PROTOTYPE || has$1(ObjectPrototype$3, key))) {
      result.push(AllSymbols[key]);
    }
  });
  return result;
};

// `Symbol` constructor
// https://tc39.es/ecma262/#sec-symbol-constructor
if (!nativeSymbol) {
  $Symbol = function Symbol() {
    if (this instanceof $Symbol) throw TypeError('Symbol is not a constructor');
    var description = !arguments.length || arguments[0] === undefined ? undefined : String(arguments[0]);
    var tag = uid(description);
    var setter = function (value) {
      if (this === ObjectPrototype$3) setter.call(ObjectPrototypeSymbols, value);
      if (has$1(this, HIDDEN) && has$1(this[HIDDEN], tag)) this[HIDDEN][tag] = false;
      setSymbolDescriptor(this, tag, createPropertyDescriptor(1, value));
    };
    if (descriptors && USE_SETTER) setSymbolDescriptor(ObjectPrototype$3, tag, { configurable: true, set: setter });
    return wrap(tag, description);
  };

  redefine($Symbol[PROTOTYPE$1], 'toString', function toString() {
    return getInternalState$4(this).tag;
  });

  redefine($Symbol, 'withoutSetter', function (description) {
    return wrap(uid(description), description);
  });

  objectPropertyIsEnumerable.f = $propertyIsEnumerable;
  objectDefineProperty.f = $defineProperty;
  objectGetOwnPropertyDescriptor.f = $getOwnPropertyDescriptor;
  objectGetOwnPropertyNames.f = objectGetOwnPropertyNamesExternal.f = $getOwnPropertyNames;
  objectGetOwnPropertySymbols.f = $getOwnPropertySymbols;

  wellKnownSymbolWrapped.f = function (name) {
    return wrap(wellKnownSymbol(name), name);
  };

  if (descriptors) {
    // https://github.com/tc39/proposal-Symbol-description
    nativeDefineProperty($Symbol[PROTOTYPE$1], 'description', {
      configurable: true,
      get: function description() {
        return getInternalState$4(this).description;
      }
    });
    {
      redefine(ObjectPrototype$3, 'propertyIsEnumerable', $propertyIsEnumerable, { unsafe: true });
    }
  }
}

_export({ global: true, wrap: true, forced: !nativeSymbol, sham: !nativeSymbol }, {
  Symbol: $Symbol
});

$forEach$2(objectKeys(WellKnownSymbolsStore), function (name) {
  defineWellKnownSymbol(name);
});

_export({ target: SYMBOL, stat: true, forced: !nativeSymbol }, {
  // `Symbol.for` method
  // https://tc39.es/ecma262/#sec-symbol.for
  'for': function (key) {
    var string = String(key);
    if (has$1(StringToSymbolRegistry, string)) return StringToSymbolRegistry[string];
    var symbol = $Symbol(string);
    StringToSymbolRegistry[string] = symbol;
    SymbolToStringRegistry[symbol] = string;
    return symbol;
  },
  // `Symbol.keyFor` method
  // https://tc39.es/ecma262/#sec-symbol.keyfor
  keyFor: function keyFor(sym) {
    if (!isSymbol(sym)) throw TypeError(sym + ' is not a symbol');
    if (has$1(SymbolToStringRegistry, sym)) return SymbolToStringRegistry[sym];
  },
  useSetter: function () { USE_SETTER = true; },
  useSimple: function () { USE_SETTER = false; }
});

_export({ target: 'Object', stat: true, forced: !nativeSymbol, sham: !descriptors }, {
  // `Object.create` method
  // https://tc39.es/ecma262/#sec-object.create
  create: $create,
  // `Object.defineProperty` method
  // https://tc39.es/ecma262/#sec-object.defineproperty
  defineProperty: $defineProperty,
  // `Object.defineProperties` method
  // https://tc39.es/ecma262/#sec-object.defineproperties
  defineProperties: $defineProperties,
  // `Object.getOwnPropertyDescriptor` method
  // https://tc39.es/ecma262/#sec-object.getownpropertydescriptors
  getOwnPropertyDescriptor: $getOwnPropertyDescriptor
});

_export({ target: 'Object', stat: true, forced: !nativeSymbol }, {
  // `Object.getOwnPropertyNames` method
  // https://tc39.es/ecma262/#sec-object.getownpropertynames
  getOwnPropertyNames: $getOwnPropertyNames,
  // `Object.getOwnPropertySymbols` method
  // https://tc39.es/ecma262/#sec-object.getownpropertysymbols
  getOwnPropertySymbols: $getOwnPropertySymbols
});

// Chrome 38 and 39 `Object.getOwnPropertySymbols` fails on primitives
// https://bugs.chromium.org/p/v8/issues/detail?id=3443
_export({ target: 'Object', stat: true, forced: fails(function () { objectGetOwnPropertySymbols.f(1); }) }, {
  getOwnPropertySymbols: function getOwnPropertySymbols(it) {
    return objectGetOwnPropertySymbols.f(toObject(it));
  }
});

// `JSON.stringify` method behavior with symbols
// https://tc39.es/ecma262/#sec-json.stringify
if ($stringify) {
  var FORCED_JSON_STRINGIFY = !nativeSymbol || fails(function () {
    var symbol = $Symbol();
    // MS Edge converts symbol values to JSON as {}
    return $stringify([symbol]) != '[null]'
      // WebKit converts symbol values to JSON as null
      || $stringify({ a: symbol }) != '{}'
      // V8 throws on boxed symbols
      || $stringify(Object(symbol)) != '{}';
  });

  _export({ target: 'JSON', stat: true, forced: FORCED_JSON_STRINGIFY }, {
    // eslint-disable-next-line no-unused-vars -- required for `.length`
    stringify: function stringify(it, replacer, space) {
      var args = [it];
      var index = 1;
      var $replacer;
      while (arguments.length > index) args.push(arguments[index++]);
      $replacer = replacer;
      if (!isObject(replacer) && it === undefined || isSymbol(it)) return; // IE8 returns string on undefined
      if (!isArray(replacer)) replacer = function (key, value) {
        if (typeof $replacer == 'function') value = $replacer.call(this, key, value);
        if (!isSymbol(value)) return value;
      };
      args[1] = replacer;
      return $stringify.apply(null, args);
    }
  });
}

// `Symbol.prototype[@@toPrimitive]` method
// https://tc39.es/ecma262/#sec-symbol.prototype-@@toprimitive
if (!$Symbol[PROTOTYPE$1][TO_PRIMITIVE]) {
  createNonEnumerableProperty($Symbol[PROTOTYPE$1], TO_PRIMITIVE, $Symbol[PROTOTYPE$1].valueOf);
}
// `Symbol.prototype[@@toStringTag]` property
// https://tc39.es/ecma262/#sec-symbol.prototype-@@tostringtag
setToStringTag($Symbol, SYMBOL);

hiddenKeys$1[HIDDEN] = true;

var defineProperty$3 = objectDefineProperty.f;


var NativeSymbol = global$1.Symbol;

if (descriptors && typeof NativeSymbol == 'function' && (!('description' in NativeSymbol.prototype) ||
  // Safari 12 bug
  NativeSymbol().description !== undefined
)) {
  var EmptyStringDescriptionStore = {};
  // wrap Symbol constructor for correct work with undefined description
  var SymbolWrapper = function Symbol() {
    var description = arguments.length < 1 || arguments[0] === undefined ? undefined : String(arguments[0]);
    var result = this instanceof SymbolWrapper
      ? new NativeSymbol(description)
      // in Edge 13, String(Symbol(undefined)) === 'Symbol(undefined)'
      : description === undefined ? NativeSymbol() : NativeSymbol(description);
    if (description === '') EmptyStringDescriptionStore[result] = true;
    return result;
  };
  copyConstructorProperties(SymbolWrapper, NativeSymbol);
  var symbolPrototype = SymbolWrapper.prototype = NativeSymbol.prototype;
  symbolPrototype.constructor = SymbolWrapper;

  var symbolToString = symbolPrototype.toString;
  var native = String(NativeSymbol('test')) == 'Symbol(test)';
  var regexp = /^Symbol\((.*)\)[^)]+$/;
  defineProperty$3(symbolPrototype, 'description', {
    configurable: true,
    get: function description() {
      var symbol = isObject(this) ? this.valueOf() : this;
      var string = symbolToString.call(symbol);
      if (has$1(EmptyStringDescriptionStore, symbol)) return '';
      var desc = native ? string.slice(7, -1) : string.replace(regexp, '$1');
      return desc === '' ? undefined : desc;
    }
  });

  _export({ global: true, forced: true }, {
    Symbol: SymbolWrapper
  });
}

var TO_STRING_TAG$3 = wellKnownSymbol('toStringTag');
var test$1 = {};

test$1[TO_STRING_TAG$3] = 'z';

var toStringTagSupport = String(test$1) === '[object z]';

var TO_STRING_TAG$2 = wellKnownSymbol('toStringTag');
// ES3 wrong here
var CORRECT_ARGUMENTS = classofRaw(function () { return arguments; }()) == 'Arguments';

// fallback for IE11 Script Access Denied error
var tryGet = function (it, key) {
  try {
    return it[key];
  } catch (error) { /* empty */ }
};

// getting tag from ES6+ `Object.prototype.toString`
var classof = toStringTagSupport ? classofRaw : function (it) {
  var O, tag, result;
  return it === undefined ? 'Undefined' : it === null ? 'Null'
    // @@toStringTag case
    : typeof (tag = tryGet(O = Object(it), TO_STRING_TAG$2)) == 'string' ? tag
    // builtinTag case
    : CORRECT_ARGUMENTS ? classofRaw(O)
    // ES3 arguments fallback
    : (result = classofRaw(O)) == 'Object' && typeof O.callee == 'function' ? 'Arguments' : result;
};

// `Object.prototype.toString` method implementation
// https://tc39.es/ecma262/#sec-object.prototype.tostring
var objectToString = toStringTagSupport ? {}.toString : function toString() {
  return '[object ' + classof(this) + ']';
};

// `Object.prototype.toString` method
// https://tc39.es/ecma262/#sec-object.prototype.tostring
if (!toStringTagSupport) {
  redefine(Object.prototype, 'toString', objectToString, { unsafe: true });
}

// `Symbol.iterator` well-known symbol
// https://tc39.es/ecma262/#sec-symbol.iterator
defineWellKnownSymbol('iterator');

// `String.prototype.{ codePointAt, at }` methods implementation
var createMethod$1 = function (CONVERT_TO_STRING) {
  return function ($this, pos) {
    var S = String(requireObjectCoercible($this));
    var position = toInteger(pos);
    var size = S.length;
    var first, second;
    if (position < 0 || position >= size) return CONVERT_TO_STRING ? '' : undefined;
    first = S.charCodeAt(position);
    return first < 0xD800 || first > 0xDBFF || position + 1 === size
      || (second = S.charCodeAt(position + 1)) < 0xDC00 || second > 0xDFFF
        ? CONVERT_TO_STRING ? S.charAt(position) : first
        : CONVERT_TO_STRING ? S.slice(position, position + 2) : (first - 0xD800 << 10) + (second - 0xDC00) + 0x10000;
  };
};

var stringMultibyte = {
  // `String.prototype.codePointAt` method
  // https://tc39.es/ecma262/#sec-string.prototype.codepointat
  codeAt: createMethod$1(false),
  // `String.prototype.at` method
  // https://github.com/mathiasbynens/String.prototype.at
  charAt: createMethod$1(true)
};

var correctPrototypeGetter = !fails(function () {
  function F() { /* empty */ }
  F.prototype.constructor = null;
  return Object.getPrototypeOf(new F()) !== F.prototype;
});

var IE_PROTO = sharedKey('IE_PROTO');
var ObjectPrototype$2 = Object.prototype;

// `Object.getPrototypeOf` method
// https://tc39.es/ecma262/#sec-object.getprototypeof
var objectGetPrototypeOf = correctPrototypeGetter ? Object.getPrototypeOf : function (O) {
  O = toObject(O);
  if (has$1(O, IE_PROTO)) return O[IE_PROTO];
  if (typeof O.constructor == 'function' && O instanceof O.constructor) {
    return O.constructor.prototype;
  } return O instanceof Object ? ObjectPrototype$2 : null;
};

var ITERATOR$6 = wellKnownSymbol('iterator');
var BUGGY_SAFARI_ITERATORS$1 = false;

var returnThis$2 = function () { return this; };

// `%IteratorPrototype%` object
// https://tc39.es/ecma262/#sec-%iteratorprototype%-object
var IteratorPrototype$2, PrototypeOfArrayIteratorPrototype, arrayIterator;

if ([].keys) {
  arrayIterator = [].keys();
  // Safari 8 has buggy iterators w/o `next`
  if (!('next' in arrayIterator)) BUGGY_SAFARI_ITERATORS$1 = true;
  else {
    PrototypeOfArrayIteratorPrototype = objectGetPrototypeOf(objectGetPrototypeOf(arrayIterator));
    if (PrototypeOfArrayIteratorPrototype !== Object.prototype) IteratorPrototype$2 = PrototypeOfArrayIteratorPrototype;
  }
}

var NEW_ITERATOR_PROTOTYPE = IteratorPrototype$2 == undefined || fails(function () {
  var test = {};
  // FF44- legacy iterators case
  return IteratorPrototype$2[ITERATOR$6].call(test) !== test;
});

if (NEW_ITERATOR_PROTOTYPE) IteratorPrototype$2 = {};

// 25.1.2.1.1 %IteratorPrototype%[@@iterator]()
if (!has$1(IteratorPrototype$2, ITERATOR$6)) {
  createNonEnumerableProperty(IteratorPrototype$2, ITERATOR$6, returnThis$2);
}

var iteratorsCore = {
  IteratorPrototype: IteratorPrototype$2,
  BUGGY_SAFARI_ITERATORS: BUGGY_SAFARI_ITERATORS$1
};

var iterators = {};

var IteratorPrototype$1 = iteratorsCore.IteratorPrototype;





var returnThis$1 = function () { return this; };

var createIteratorConstructor = function (IteratorConstructor, NAME, next) {
  var TO_STRING_TAG = NAME + ' Iterator';
  IteratorConstructor.prototype = objectCreate(IteratorPrototype$1, { next: createPropertyDescriptor(1, next) });
  setToStringTag(IteratorConstructor, TO_STRING_TAG, false);
  iterators[TO_STRING_TAG] = returnThis$1;
  return IteratorConstructor;
};

var aPossiblePrototype = function (it) {
  if (!isObject(it) && it !== null) {
    throw TypeError("Can't set " + String(it) + ' as a prototype');
  } return it;
};

/* eslint-disable no-proto -- safe */

// `Object.setPrototypeOf` method
// https://tc39.es/ecma262/#sec-object.setprototypeof
// Works with __proto__ only. Old v8 can't work with null proto objects.
var objectSetPrototypeOf = Object.setPrototypeOf || ('__proto__' in {} ? function () {
  var CORRECT_SETTER = false;
  var test = {};
  var setter;
  try {
    setter = Object.getOwnPropertyDescriptor(Object.prototype, '__proto__').set;
    setter.call(test, []);
    CORRECT_SETTER = test instanceof Array;
  } catch (error) { /* empty */ }
  return function setPrototypeOf(O, proto) {
    anObject(O);
    aPossiblePrototype(proto);
    if (CORRECT_SETTER) setter.call(O, proto);
    else O.__proto__ = proto;
    return O;
  };
}() : undefined);

var IteratorPrototype = iteratorsCore.IteratorPrototype;
var BUGGY_SAFARI_ITERATORS = iteratorsCore.BUGGY_SAFARI_ITERATORS;
var ITERATOR$5 = wellKnownSymbol('iterator');
var KEYS = 'keys';
var VALUES = 'values';
var ENTRIES = 'entries';

var returnThis = function () { return this; };

var defineIterator = function (Iterable, NAME, IteratorConstructor, next, DEFAULT, IS_SET, FORCED) {
  createIteratorConstructor(IteratorConstructor, NAME, next);

  var getIterationMethod = function (KIND) {
    if (KIND === DEFAULT && defaultIterator) return defaultIterator;
    if (!BUGGY_SAFARI_ITERATORS && KIND in IterablePrototype) return IterablePrototype[KIND];
    switch (KIND) {
      case KEYS: return function keys() { return new IteratorConstructor(this, KIND); };
      case VALUES: return function values() { return new IteratorConstructor(this, KIND); };
      case ENTRIES: return function entries() { return new IteratorConstructor(this, KIND); };
    } return function () { return new IteratorConstructor(this); };
  };

  var TO_STRING_TAG = NAME + ' Iterator';
  var INCORRECT_VALUES_NAME = false;
  var IterablePrototype = Iterable.prototype;
  var nativeIterator = IterablePrototype[ITERATOR$5]
    || IterablePrototype['@@iterator']
    || DEFAULT && IterablePrototype[DEFAULT];
  var defaultIterator = !BUGGY_SAFARI_ITERATORS && nativeIterator || getIterationMethod(DEFAULT);
  var anyNativeIterator = NAME == 'Array' ? IterablePrototype.entries || nativeIterator : nativeIterator;
  var CurrentIteratorPrototype, methods, KEY;

  // fix native
  if (anyNativeIterator) {
    CurrentIteratorPrototype = objectGetPrototypeOf(anyNativeIterator.call(new Iterable()));
    if (IteratorPrototype !== Object.prototype && CurrentIteratorPrototype.next) {
      if (objectGetPrototypeOf(CurrentIteratorPrototype) !== IteratorPrototype) {
        if (objectSetPrototypeOf) {
          objectSetPrototypeOf(CurrentIteratorPrototype, IteratorPrototype);
        } else if (typeof CurrentIteratorPrototype[ITERATOR$5] != 'function') {
          createNonEnumerableProperty(CurrentIteratorPrototype, ITERATOR$5, returnThis);
        }
      }
      // Set @@toStringTag to native iterators
      setToStringTag(CurrentIteratorPrototype, TO_STRING_TAG, true);
    }
  }

  // fix Array#{values, @@iterator}.name in V8 / FF
  if (DEFAULT == VALUES && nativeIterator && nativeIterator.name !== VALUES) {
    INCORRECT_VALUES_NAME = true;
    defaultIterator = function values() { return nativeIterator.call(this); };
  }

  // define iterator
  if (IterablePrototype[ITERATOR$5] !== defaultIterator) {
    createNonEnumerableProperty(IterablePrototype, ITERATOR$5, defaultIterator);
  }
  iterators[NAME] = defaultIterator;

  // export additional methods
  if (DEFAULT) {
    methods = {
      values: getIterationMethod(VALUES),
      keys: IS_SET ? defaultIterator : getIterationMethod(KEYS),
      entries: getIterationMethod(ENTRIES)
    };
    if (FORCED) for (KEY in methods) {
      if (BUGGY_SAFARI_ITERATORS || INCORRECT_VALUES_NAME || !(KEY in IterablePrototype)) {
        redefine(IterablePrototype, KEY, methods[KEY]);
      }
    } else _export({ target: NAME, proto: true, forced: BUGGY_SAFARI_ITERATORS || INCORRECT_VALUES_NAME }, methods);
  }

  return methods;
};

var charAt = stringMultibyte.charAt;



var STRING_ITERATOR = 'String Iterator';
var setInternalState$3 = internalState.set;
var getInternalState$3 = internalState.getterFor(STRING_ITERATOR);

// `String.prototype[@@iterator]` method
// https://tc39.es/ecma262/#sec-string.prototype-@@iterator
defineIterator(String, 'String', function (iterated) {
  setInternalState$3(this, {
    type: STRING_ITERATOR,
    string: String(iterated),
    index: 0
  });
// `%StringIteratorPrototype%.next` method
// https://tc39.es/ecma262/#sec-%stringiteratorprototype%.next
}, function next() {
  var state = getInternalState$3(this);
  var string = state.string;
  var index = state.index;
  var point;
  if (index >= string.length) return { value: undefined, done: true };
  point = charAt(string, index);
  state.index += point.length;
  return { value: point, done: false };
});

var UNSCOPABLES = wellKnownSymbol('unscopables');
var ArrayPrototype$1 = Array.prototype;

// Array.prototype[@@unscopables]
// https://tc39.es/ecma262/#sec-array.prototype-@@unscopables
if (ArrayPrototype$1[UNSCOPABLES] == undefined) {
  objectDefineProperty.f(ArrayPrototype$1, UNSCOPABLES, {
    configurable: true,
    value: objectCreate(null)
  });
}

// add a key to Array.prototype[@@unscopables]
var addToUnscopables = function (key) {
  ArrayPrototype$1[UNSCOPABLES][key] = true;
};

var ARRAY_ITERATOR = 'Array Iterator';
var setInternalState$2 = internalState.set;
var getInternalState$2 = internalState.getterFor(ARRAY_ITERATOR);

// `Array.prototype.entries` method
// https://tc39.es/ecma262/#sec-array.prototype.entries
// `Array.prototype.keys` method
// https://tc39.es/ecma262/#sec-array.prototype.keys
// `Array.prototype.values` method
// https://tc39.es/ecma262/#sec-array.prototype.values
// `Array.prototype[@@iterator]` method
// https://tc39.es/ecma262/#sec-array.prototype-@@iterator
// `CreateArrayIterator` internal method
// https://tc39.es/ecma262/#sec-createarrayiterator
var es_array_iterator = defineIterator(Array, 'Array', function (iterated, kind) {
  setInternalState$2(this, {
    type: ARRAY_ITERATOR,
    target: toIndexedObject(iterated), // target
    index: 0,                          // next index
    kind: kind                         // kind
  });
// `%ArrayIteratorPrototype%.next` method
// https://tc39.es/ecma262/#sec-%arrayiteratorprototype%.next
}, function () {
  var state = getInternalState$2(this);
  var target = state.target;
  var kind = state.kind;
  var index = state.index++;
  if (!target || index >= target.length) {
    state.target = undefined;
    return { value: undefined, done: true };
  }
  if (kind == 'keys') return { value: index, done: false };
  if (kind == 'values') return { value: target[index], done: false };
  return { value: [index, target[index]], done: false };
}, 'values');

// argumentsList[@@iterator] is %ArrayProto_values%
// https://tc39.es/ecma262/#sec-createunmappedargumentsobject
// https://tc39.es/ecma262/#sec-createmappedargumentsobject
iterators.Arguments = iterators.Array;

// https://tc39.es/ecma262/#sec-array.prototype-@@unscopables
addToUnscopables('keys');
addToUnscopables('values');
addToUnscopables('entries');

// iterable DOM collections
// flag - `iterable` interface - 'entries', 'keys', 'values', 'forEach' methods
var domIterables = {
  CSSRuleList: 0,
  CSSStyleDeclaration: 0,
  CSSValueList: 0,
  ClientRectList: 0,
  DOMRectList: 0,
  DOMStringList: 0,
  DOMTokenList: 1,
  DataTransferItemList: 0,
  FileList: 0,
  HTMLAllCollection: 0,
  HTMLCollection: 0,
  HTMLFormElement: 0,
  HTMLSelectElement: 0,
  MediaList: 0,
  MimeTypeArray: 0,
  NamedNodeMap: 0,
  NodeList: 1,
  PaintRequestList: 0,
  Plugin: 0,
  PluginArray: 0,
  SVGLengthList: 0,
  SVGNumberList: 0,
  SVGPathSegList: 0,
  SVGPointList: 0,
  SVGStringList: 0,
  SVGTransformList: 0,
  SourceBufferList: 0,
  StyleSheetList: 0,
  TextTrackCueList: 0,
  TextTrackList: 0,
  TouchList: 0
};

var ITERATOR$4 = wellKnownSymbol('iterator');
var TO_STRING_TAG$1 = wellKnownSymbol('toStringTag');
var ArrayValues = es_array_iterator.values;

for (var COLLECTION_NAME$1 in domIterables) {
  var Collection$1 = global$1[COLLECTION_NAME$1];
  var CollectionPrototype$1 = Collection$1 && Collection$1.prototype;
  if (CollectionPrototype$1) {
    // some Chrome versions have non-configurable methods on DOMTokenList
    if (CollectionPrototype$1[ITERATOR$4] !== ArrayValues) try {
      createNonEnumerableProperty(CollectionPrototype$1, ITERATOR$4, ArrayValues);
    } catch (error) {
      CollectionPrototype$1[ITERATOR$4] = ArrayValues;
    }
    if (!CollectionPrototype$1[TO_STRING_TAG$1]) {
      createNonEnumerableProperty(CollectionPrototype$1, TO_STRING_TAG$1, COLLECTION_NAME$1);
    }
    if (domIterables[COLLECTION_NAME$1]) for (var METHOD_NAME in es_array_iterator) {
      // some Chrome versions have non-configurable methods on DOMTokenList
      if (CollectionPrototype$1[METHOD_NAME] !== es_array_iterator[METHOD_NAME]) try {
        createNonEnumerableProperty(CollectionPrototype$1, METHOD_NAME, es_array_iterator[METHOD_NAME]);
      } catch (error) {
        CollectionPrototype$1[METHOD_NAME] = es_array_iterator[METHOD_NAME];
      }
    }
  }
}

// `Symbol.asyncIterator` well-known symbol
// https://tc39.es/ecma262/#sec-symbol.asynciterator
defineWellKnownSymbol('asyncIterator');

// `Symbol.toStringTag` well-known symbol
// https://tc39.es/ecma262/#sec-symbol.tostringtag
defineWellKnownSymbol('toStringTag');

// Math[@@toStringTag] property
// https://tc39.es/ecma262/#sec-math-@@tostringtag
setToStringTag(Math, 'Math', true);

// JSON[@@toStringTag] property
// https://tc39.es/ecma262/#sec-json-@@tostringtag
setToStringTag(global$1.JSON, 'JSON', true);

// `Object.defineProperty` method
// https://tc39.es/ecma262/#sec-object.defineproperty
_export({ target: 'Object', stat: true, forced: !descriptors, sham: !descriptors }, {
  defineProperty: objectDefineProperty.f
});

// `Object.create` method
// https://tc39.es/ecma262/#sec-object.create
_export({ target: 'Object', stat: true, sham: !descriptors }, {
  create: objectCreate
});

var FAILS_ON_PRIMITIVES = fails(function () { objectGetPrototypeOf(1); });

// `Object.getPrototypeOf` method
// https://tc39.es/ecma262/#sec-object.getprototypeof
_export({ target: 'Object', stat: true, forced: FAILS_ON_PRIMITIVES, sham: !correctPrototypeGetter }, {
  getPrototypeOf: function getPrototypeOf(it) {
    return objectGetPrototypeOf(toObject(it));
  }
});

var arrayMethodIsStrict = function (METHOD_NAME, argument) {
  var method = [][METHOD_NAME];
  return !!method && fails(function () {
    // eslint-disable-next-line no-useless-call,no-throw-literal -- required for testing
    method.call(null, argument || function () { throw 1; }, 1);
  });
};

var $forEach$1 = arrayIteration.forEach;


var STRICT_METHOD$3 = arrayMethodIsStrict('forEach');

// `Array.prototype.forEach` method implementation
// https://tc39.es/ecma262/#sec-array.prototype.foreach
var arrayForEach = !STRICT_METHOD$3 ? function forEach(callbackfn /* , thisArg */) {
  return $forEach$1(this, callbackfn, arguments.length > 1 ? arguments[1] : undefined);
} : [].forEach;

// `Array.prototype.forEach` method
// https://tc39.es/ecma262/#sec-array.prototype.foreach
_export({ target: 'Array', proto: true, forced: [].forEach != arrayForEach }, {
  forEach: arrayForEach
});

var defineProperty$2 = objectDefineProperty.f;

var FunctionPrototype = Function.prototype;
var FunctionPrototypeToString = FunctionPrototype.toString;
var nameRE = /^\s*function ([^ (]*)/;
var NAME$1 = 'name';

// Function instances `.name` property
// https://tc39.es/ecma262/#sec-function-instances-name
if (descriptors && !(NAME$1 in FunctionPrototype)) {
  defineProperty$2(FunctionPrototype, NAME$1, {
    configurable: true,
    get: function () {
      try {
        return FunctionPrototypeToString.call(this).match(nameRE)[1];
      } catch (error) {
        return '';
      }
    }
  });
}

// `Object.setPrototypeOf` method
// https://tc39.es/ecma262/#sec-object.setprototypeof
_export({ target: 'Object', stat: true }, {
  setPrototypeOf: objectSetPrototypeOf
});

var nativePromiseConstructor = global$1.Promise;

var redefineAll = function (target, src, options) {
  for (var key in src) redefine(target, key, src[key], options);
  return target;
};

var SPECIES$4 = wellKnownSymbol('species');

var setSpecies = function (CONSTRUCTOR_NAME) {
  var Constructor = getBuiltIn(CONSTRUCTOR_NAME);
  var defineProperty = objectDefineProperty.f;

  if (descriptors && Constructor && !Constructor[SPECIES$4]) {
    defineProperty(Constructor, SPECIES$4, {
      configurable: true,
      get: function () { return this; }
    });
  }
};

var anInstance = function (it, Constructor, name) {
  if (!(it instanceof Constructor)) {
    throw TypeError('Incorrect ' + (name ? name + ' ' : '') + 'invocation');
  } return it;
};

var ITERATOR$3 = wellKnownSymbol('iterator');
var ArrayPrototype = Array.prototype;

// check on default Array iterator
var isArrayIteratorMethod = function (it) {
  return it !== undefined && (iterators.Array === it || ArrayPrototype[ITERATOR$3] === it);
};

var ITERATOR$2 = wellKnownSymbol('iterator');

var getIteratorMethod = function (it) {
  if (it != undefined) return it[ITERATOR$2]
    || it['@@iterator']
    || iterators[classof(it)];
};

var iteratorClose = function (iterator) {
  var returnMethod = iterator['return'];
  if (returnMethod !== undefined) {
    return anObject(returnMethod.call(iterator)).value;
  }
};

var Result = function (stopped, result) {
  this.stopped = stopped;
  this.result = result;
};

var iterate = function (iterable, unboundFunction, options) {
  var that = options && options.that;
  var AS_ENTRIES = !!(options && options.AS_ENTRIES);
  var IS_ITERATOR = !!(options && options.IS_ITERATOR);
  var INTERRUPTED = !!(options && options.INTERRUPTED);
  var fn = functionBindContext(unboundFunction, that, 1 + AS_ENTRIES + INTERRUPTED);
  var iterator, iterFn, index, length, result, next, step;

  var stop = function (condition) {
    if (iterator) iteratorClose(iterator);
    return new Result(true, condition);
  };

  var callFn = function (value) {
    if (AS_ENTRIES) {
      anObject(value);
      return INTERRUPTED ? fn(value[0], value[1], stop) : fn(value[0], value[1]);
    } return INTERRUPTED ? fn(value, stop) : fn(value);
  };

  if (IS_ITERATOR) {
    iterator = iterable;
  } else {
    iterFn = getIteratorMethod(iterable);
    if (typeof iterFn != 'function') throw TypeError('Target is not iterable');
    // optimisation for array iterators
    if (isArrayIteratorMethod(iterFn)) {
      for (index = 0, length = toLength(iterable.length); length > index; index++) {
        result = callFn(iterable[index]);
        if (result && result instanceof Result) return result;
      } return new Result(false);
    }
    iterator = iterFn.call(iterable);
  }

  next = iterator.next;
  while (!(step = next.call(iterator)).done) {
    try {
      result = callFn(step.value);
    } catch (error) {
      iteratorClose(iterator);
      throw error;
    }
    if (typeof result == 'object' && result && result instanceof Result) return result;
  } return new Result(false);
};

var ITERATOR$1 = wellKnownSymbol('iterator');
var SAFE_CLOSING = false;

try {
  var called = 0;
  var iteratorWithReturn = {
    next: function () {
      return { done: !!called++ };
    },
    'return': function () {
      SAFE_CLOSING = true;
    }
  };
  iteratorWithReturn[ITERATOR$1] = function () {
    return this;
  };
  // eslint-disable-next-line no-throw-literal -- required for testing
  Array.from(iteratorWithReturn, function () { throw 2; });
} catch (error) { /* empty */ }

var checkCorrectnessOfIteration = function (exec, SKIP_CLOSING) {
  if (!SKIP_CLOSING && !SAFE_CLOSING) return false;
  var ITERATION_SUPPORT = false;
  try {
    var object = {};
    object[ITERATOR$1] = function () {
      return {
        next: function () {
          return { done: ITERATION_SUPPORT = true };
        }
      };
    };
    exec(object);
  } catch (error) { /* empty */ }
  return ITERATION_SUPPORT;
};

var SPECIES$3 = wellKnownSymbol('species');

// `SpeciesConstructor` abstract operation
// https://tc39.es/ecma262/#sec-speciesconstructor
var speciesConstructor = function (O, defaultConstructor) {
  var C = anObject(O).constructor;
  var S;
  return C === undefined || (S = anObject(C)[SPECIES$3]) == undefined ? defaultConstructor : aFunction(S);
};

var engineIsIos = /(iphone|ipod|ipad).*applewebkit/i.test(engineUserAgent);

var location = global$1.location;
var set$1 = global$1.setImmediate;
var clear = global$1.clearImmediate;
var process$2 = global$1.process;
var MessageChannel = global$1.MessageChannel;
var Dispatch = global$1.Dispatch;
var counter = 0;
var queue = {};
var ONREADYSTATECHANGE = 'onreadystatechange';
var defer, channel, port;

var run = function (id) {
  // eslint-disable-next-line no-prototype-builtins -- safe
  if (queue.hasOwnProperty(id)) {
    var fn = queue[id];
    delete queue[id];
    fn();
  }
};

var runner = function (id) {
  return function () {
    run(id);
  };
};

var listener = function (event) {
  run(event.data);
};

var post = function (id) {
  // old engines have not location.origin
  global$1.postMessage(id + '', location.protocol + '//' + location.host);
};

// Node.js 0.9+ & IE10+ has setImmediate, otherwise:
if (!set$1 || !clear) {
  set$1 = function setImmediate(fn) {
    var args = [];
    var i = 1;
    while (arguments.length > i) args.push(arguments[i++]);
    queue[++counter] = function () {
      // eslint-disable-next-line no-new-func -- spec requirement
      (typeof fn == 'function' ? fn : Function(fn)).apply(undefined, args);
    };
    defer(counter);
    return counter;
  };
  clear = function clearImmediate(id) {
    delete queue[id];
  };
  // Node.js 0.8-
  if (engineIsNode) {
    defer = function (id) {
      process$2.nextTick(runner(id));
    };
  // Sphere (JS game engine) Dispatch API
  } else if (Dispatch && Dispatch.now) {
    defer = function (id) {
      Dispatch.now(runner(id));
    };
  // Browsers with MessageChannel, includes WebWorkers
  // except iOS - https://github.com/zloirock/core-js/issues/624
  } else if (MessageChannel && !engineIsIos) {
    channel = new MessageChannel();
    port = channel.port2;
    channel.port1.onmessage = listener;
    defer = functionBindContext(port.postMessage, port, 1);
  // Browsers with postMessage, skip WebWorkers
  // IE8 has postMessage, but it's sync & typeof its postMessage is 'object'
  } else if (
    global$1.addEventListener &&
    typeof postMessage == 'function' &&
    !global$1.importScripts &&
    location && location.protocol !== 'file:' &&
    !fails(post)
  ) {
    defer = post;
    global$1.addEventListener('message', listener, false);
  // IE8-
  } else if (ONREADYSTATECHANGE in documentCreateElement('script')) {
    defer = function (id) {
      html.appendChild(documentCreateElement('script'))[ONREADYSTATECHANGE] = function () {
        html.removeChild(this);
        run(id);
      };
    };
  // Rest old browsers
  } else {
    defer = function (id) {
      setTimeout(runner(id), 0);
    };
  }
}

var task$1 = {
  set: set$1,
  clear: clear
};

var engineIsWebosWebkit = /web0s(?!.*chrome)/i.test(engineUserAgent);

var getOwnPropertyDescriptor = objectGetOwnPropertyDescriptor.f;
var macrotask = task$1.set;




var MutationObserver = global$1.MutationObserver || global$1.WebKitMutationObserver;
var document$2 = global$1.document;
var process$1 = global$1.process;
var Promise$1 = global$1.Promise;
// Node.js 11 shows ExperimentalWarning on getting `queueMicrotask`
var queueMicrotaskDescriptor = getOwnPropertyDescriptor(global$1, 'queueMicrotask');
var queueMicrotask = queueMicrotaskDescriptor && queueMicrotaskDescriptor.value;

var flush, head, last, notify$1, toggle, node, promise, then;

// modern engines have queueMicrotask method
if (!queueMicrotask) {
  flush = function () {
    var parent, fn;
    if (engineIsNode && (parent = process$1.domain)) parent.exit();
    while (head) {
      fn = head.fn;
      head = head.next;
      try {
        fn();
      } catch (error) {
        if (head) notify$1();
        else last = undefined;
        throw error;
      }
    } last = undefined;
    if (parent) parent.enter();
  };

  // browsers with MutationObserver, except iOS - https://github.com/zloirock/core-js/issues/339
  // also except WebOS Webkit https://github.com/zloirock/core-js/issues/898
  if (!engineIsIos && !engineIsNode && !engineIsWebosWebkit && MutationObserver && document$2) {
    toggle = true;
    node = document$2.createTextNode('');
    new MutationObserver(flush).observe(node, { characterData: true });
    notify$1 = function () {
      node.data = toggle = !toggle;
    };
  // environments with maybe non-completely correct, but existent Promise
  } else if (Promise$1 && Promise$1.resolve) {
    // Promise.resolve without an argument throws an error in LG WebOS 2
    promise = Promise$1.resolve(undefined);
    then = promise.then;
    notify$1 = function () {
      then.call(promise, flush);
    };
  // Node.js without promises
  } else if (engineIsNode) {
    notify$1 = function () {
      process$1.nextTick(flush);
    };
  // for other environments - macrotask based on:
  // - setImmediate
  // - MessageChannel
  // - window.postMessag
  // - onreadystatechange
  // - setTimeout
  } else {
    notify$1 = function () {
      // strange IE + webpack dev server bug - use .call(global)
      macrotask.call(global$1, flush);
    };
  }
}

var microtask = queueMicrotask || function (fn) {
  var task = { fn: fn, next: undefined };
  if (last) last.next = task;
  if (!head) {
    head = task;
    notify$1();
  } last = task;
};

var PromiseCapability = function (C) {
  var resolve, reject;
  this.promise = new C(function ($$resolve, $$reject) {
    if (resolve !== undefined || reject !== undefined) throw TypeError('Bad Promise constructor');
    resolve = $$resolve;
    reject = $$reject;
  });
  this.resolve = aFunction(resolve);
  this.reject = aFunction(reject);
};

// 25.4.1.5 NewPromiseCapability(C)
var f = function (C) {
  return new PromiseCapability(C);
};

var newPromiseCapability$1 = {
	f: f
};

var promiseResolve = function (C, x) {
  anObject(C);
  if (isObject(x) && x.constructor === C) return x;
  var promiseCapability = newPromiseCapability$1.f(C);
  var resolve = promiseCapability.resolve;
  resolve(x);
  return promiseCapability.promise;
};

var hostReportErrors = function (a, b) {
  var console = global$1.console;
  if (console && console.error) {
    arguments.length === 1 ? console.error(a) : console.error(a, b);
  }
};

var perform = function (exec) {
  try {
    return { error: false, value: exec() };
  } catch (error) {
    return { error: true, value: error };
  }
};

var task = task$1.set;











var SPECIES$2 = wellKnownSymbol('species');
var PROMISE = 'Promise';
var getInternalState$1 = internalState.get;
var setInternalState$1 = internalState.set;
var getInternalPromiseState = internalState.getterFor(PROMISE);
var PromiseConstructor = nativePromiseConstructor;
var TypeError$1 = global$1.TypeError;
var document$1 = global$1.document;
var process = global$1.process;
var $fetch = getBuiltIn('fetch');
var newPromiseCapability = newPromiseCapability$1.f;
var newGenericPromiseCapability = newPromiseCapability;
var DISPATCH_EVENT = !!(document$1 && document$1.createEvent && global$1.dispatchEvent);
var NATIVE_REJECTION_EVENT = typeof PromiseRejectionEvent == 'function';
var UNHANDLED_REJECTION = 'unhandledrejection';
var REJECTION_HANDLED = 'rejectionhandled';
var PENDING = 0;
var FULFILLED = 1;
var REJECTED = 2;
var HANDLED = 1;
var UNHANDLED = 2;
var Internal, OwnPromiseCapability, PromiseWrapper, nativeThen;

var FORCED$5 = isForced_1(PROMISE, function () {
  var GLOBAL_CORE_JS_PROMISE = inspectSource(PromiseConstructor) !== String(PromiseConstructor);
  if (!GLOBAL_CORE_JS_PROMISE) {
    // V8 6.6 (Node 10 and Chrome 66) have a bug with resolving custom thenables
    // https://bugs.chromium.org/p/chromium/issues/detail?id=830565
    // We can't detect it synchronously, so just check versions
    if (engineV8Version === 66) return true;
    // Unhandled rejections tracking support, NodeJS Promise without it fails @@species test
    if (!engineIsNode && !NATIVE_REJECTION_EVENT) return true;
  }
  // We can't use @@species feature detection in V8 since it causes
  // deoptimization and performance degradation
  // https://github.com/zloirock/core-js/issues/679
  if (engineV8Version >= 51 && /native code/.test(PromiseConstructor)) return false;
  // Detect correctness of subclassing with @@species support
  var promise = PromiseConstructor.resolve(1);
  var FakePromise = function (exec) {
    exec(function () { /* empty */ }, function () { /* empty */ });
  };
  var constructor = promise.constructor = {};
  constructor[SPECIES$2] = FakePromise;
  return !(promise.then(function () { /* empty */ }) instanceof FakePromise);
});

var INCORRECT_ITERATION = FORCED$5 || !checkCorrectnessOfIteration(function (iterable) {
  PromiseConstructor.all(iterable)['catch'](function () { /* empty */ });
});

// helpers
var isThenable = function (it) {
  var then;
  return isObject(it) && typeof (then = it.then) == 'function' ? then : false;
};

var notify = function (state, isReject) {
  if (state.notified) return;
  state.notified = true;
  var chain = state.reactions;
  microtask(function () {
    var value = state.value;
    var ok = state.state == FULFILLED;
    var index = 0;
    // variable length - can't use forEach
    while (chain.length > index) {
      var reaction = chain[index++];
      var handler = ok ? reaction.ok : reaction.fail;
      var resolve = reaction.resolve;
      var reject = reaction.reject;
      var domain = reaction.domain;
      var result, then, exited;
      try {
        if (handler) {
          if (!ok) {
            if (state.rejection === UNHANDLED) onHandleUnhandled(state);
            state.rejection = HANDLED;
          }
          if (handler === true) result = value;
          else {
            if (domain) domain.enter();
            result = handler(value); // can throw
            if (domain) {
              domain.exit();
              exited = true;
            }
          }
          if (result === reaction.promise) {
            reject(TypeError$1('Promise-chain cycle'));
          } else if (then = isThenable(result)) {
            then.call(result, resolve, reject);
          } else resolve(result);
        } else reject(value);
      } catch (error) {
        if (domain && !exited) domain.exit();
        reject(error);
      }
    }
    state.reactions = [];
    state.notified = false;
    if (isReject && !state.rejection) onUnhandled(state);
  });
};

var dispatchEvent = function (name, promise, reason) {
  var event, handler;
  if (DISPATCH_EVENT) {
    event = document$1.createEvent('Event');
    event.promise = promise;
    event.reason = reason;
    event.initEvent(name, false, true);
    global$1.dispatchEvent(event);
  } else event = { promise: promise, reason: reason };
  if (!NATIVE_REJECTION_EVENT && (handler = global$1['on' + name])) handler(event);
  else if (name === UNHANDLED_REJECTION) hostReportErrors('Unhandled promise rejection', reason);
};

var onUnhandled = function (state) {
  task.call(global$1, function () {
    var promise = state.facade;
    var value = state.value;
    var IS_UNHANDLED = isUnhandled(state);
    var result;
    if (IS_UNHANDLED) {
      result = perform(function () {
        if (engineIsNode) {
          process.emit('unhandledRejection', value, promise);
        } else dispatchEvent(UNHANDLED_REJECTION, promise, value);
      });
      // Browsers should not trigger `rejectionHandled` event if it was handled here, NodeJS - should
      state.rejection = engineIsNode || isUnhandled(state) ? UNHANDLED : HANDLED;
      if (result.error) throw result.value;
    }
  });
};

var isUnhandled = function (state) {
  return state.rejection !== HANDLED && !state.parent;
};

var onHandleUnhandled = function (state) {
  task.call(global$1, function () {
    var promise = state.facade;
    if (engineIsNode) {
      process.emit('rejectionHandled', promise);
    } else dispatchEvent(REJECTION_HANDLED, promise, state.value);
  });
};

var bind = function (fn, state, unwrap) {
  return function (value) {
    fn(state, value, unwrap);
  };
};

var internalReject = function (state, value, unwrap) {
  if (state.done) return;
  state.done = true;
  if (unwrap) state = unwrap;
  state.value = value;
  state.state = REJECTED;
  notify(state, true);
};

var internalResolve = function (state, value, unwrap) {
  if (state.done) return;
  state.done = true;
  if (unwrap) state = unwrap;
  try {
    if (state.facade === value) throw TypeError$1("Promise can't be resolved itself");
    var then = isThenable(value);
    if (then) {
      microtask(function () {
        var wrapper = { done: false };
        try {
          then.call(value,
            bind(internalResolve, wrapper, state),
            bind(internalReject, wrapper, state)
          );
        } catch (error) {
          internalReject(wrapper, error, state);
        }
      });
    } else {
      state.value = value;
      state.state = FULFILLED;
      notify(state, false);
    }
  } catch (error) {
    internalReject({ done: false }, error, state);
  }
};

// constructor polyfill
if (FORCED$5) {
  // 25.4.3.1 Promise(executor)
  PromiseConstructor = function Promise(executor) {
    anInstance(this, PromiseConstructor, PROMISE);
    aFunction(executor);
    Internal.call(this);
    var state = getInternalState$1(this);
    try {
      executor(bind(internalResolve, state), bind(internalReject, state));
    } catch (error) {
      internalReject(state, error);
    }
  };
  // eslint-disable-next-line no-unused-vars -- required for `.length`
  Internal = function Promise(executor) {
    setInternalState$1(this, {
      type: PROMISE,
      done: false,
      notified: false,
      parent: false,
      reactions: [],
      rejection: false,
      state: PENDING,
      value: undefined
    });
  };
  Internal.prototype = redefineAll(PromiseConstructor.prototype, {
    // `Promise.prototype.then` method
    // https://tc39.es/ecma262/#sec-promise.prototype.then
    then: function then(onFulfilled, onRejected) {
      var state = getInternalPromiseState(this);
      var reaction = newPromiseCapability(speciesConstructor(this, PromiseConstructor));
      reaction.ok = typeof onFulfilled == 'function' ? onFulfilled : true;
      reaction.fail = typeof onRejected == 'function' && onRejected;
      reaction.domain = engineIsNode ? process.domain : undefined;
      state.parent = true;
      state.reactions.push(reaction);
      if (state.state != PENDING) notify(state, false);
      return reaction.promise;
    },
    // `Promise.prototype.catch` method
    // https://tc39.es/ecma262/#sec-promise.prototype.catch
    'catch': function (onRejected) {
      return this.then(undefined, onRejected);
    }
  });
  OwnPromiseCapability = function () {
    var promise = new Internal();
    var state = getInternalState$1(promise);
    this.promise = promise;
    this.resolve = bind(internalResolve, state);
    this.reject = bind(internalReject, state);
  };
  newPromiseCapability$1.f = newPromiseCapability = function (C) {
    return C === PromiseConstructor || C === PromiseWrapper
      ? new OwnPromiseCapability(C)
      : newGenericPromiseCapability(C);
  };

  if (typeof nativePromiseConstructor == 'function') {
    nativeThen = nativePromiseConstructor.prototype.then;

    // wrap native Promise#then for native async functions
    redefine(nativePromiseConstructor.prototype, 'then', function then(onFulfilled, onRejected) {
      var that = this;
      return new PromiseConstructor(function (resolve, reject) {
        nativeThen.call(that, resolve, reject);
      }).then(onFulfilled, onRejected);
    // https://github.com/zloirock/core-js/issues/640
    }, { unsafe: true });

    // wrap fetch result
    if (typeof $fetch == 'function') _export({ global: true, enumerable: true, forced: true }, {
      // eslint-disable-next-line no-unused-vars -- required for `.length`
      fetch: function fetch(input /* , init */) {
        return promiseResolve(PromiseConstructor, $fetch.apply(global$1, arguments));
      }
    });
  }
}

_export({ global: true, wrap: true, forced: FORCED$5 }, {
  Promise: PromiseConstructor
});

setToStringTag(PromiseConstructor, PROMISE, false);
setSpecies(PROMISE);

PromiseWrapper = getBuiltIn(PROMISE);

// statics
_export({ target: PROMISE, stat: true, forced: FORCED$5 }, {
  // `Promise.reject` method
  // https://tc39.es/ecma262/#sec-promise.reject
  reject: function reject(r) {
    var capability = newPromiseCapability(this);
    capability.reject.call(undefined, r);
    return capability.promise;
  }
});

_export({ target: PROMISE, stat: true, forced: FORCED$5 }, {
  // `Promise.resolve` method
  // https://tc39.es/ecma262/#sec-promise.resolve
  resolve: function resolve(x) {
    return promiseResolve(this, x);
  }
});

_export({ target: PROMISE, stat: true, forced: INCORRECT_ITERATION }, {
  // `Promise.all` method
  // https://tc39.es/ecma262/#sec-promise.all
  all: function all(iterable) {
    var C = this;
    var capability = newPromiseCapability(C);
    var resolve = capability.resolve;
    var reject = capability.reject;
    var result = perform(function () {
      var $promiseResolve = aFunction(C.resolve);
      var values = [];
      var counter = 0;
      var remaining = 1;
      iterate(iterable, function (promise) {
        var index = counter++;
        var alreadyCalled = false;
        values.push(undefined);
        remaining++;
        $promiseResolve.call(C, promise).then(function (value) {
          if (alreadyCalled) return;
          alreadyCalled = true;
          values[index] = value;
          --remaining || resolve(values);
        }, reject);
      });
      --remaining || resolve(values);
    });
    if (result.error) reject(result.value);
    return capability.promise;
  },
  // `Promise.race` method
  // https://tc39.es/ecma262/#sec-promise.race
  race: function race(iterable) {
    var C = this;
    var capability = newPromiseCapability(C);
    var reject = capability.reject;
    var result = perform(function () {
      var $promiseResolve = aFunction(C.resolve);
      iterate(iterable, function (promise) {
        $promiseResolve.call(C, promise).then(capability.resolve, reject);
      });
    });
    if (result.error) reject(result.value);
    return capability.promise;
  }
});

// `RegExp.prototype.flags` getter implementation
// https://tc39.es/ecma262/#sec-get-regexp.prototype.flags
var regexpFlags = function () {
  var that = anObject(this);
  var result = '';
  if (that.global) result += 'g';
  if (that.ignoreCase) result += 'i';
  if (that.multiline) result += 'm';
  if (that.dotAll) result += 's';
  if (that.unicode) result += 'u';
  if (that.sticky) result += 'y';
  return result;
};

var TO_STRING$1 = 'toString';
var RegExpPrototype = RegExp.prototype;
var nativeToString = RegExpPrototype[TO_STRING$1];

var NOT_GENERIC = fails(function () { return nativeToString.call({ source: 'a', flags: 'b' }) != '/a/b'; });
// FF44- RegExp#toString has a wrong name
var INCORRECT_NAME = nativeToString.name != TO_STRING$1;

// `RegExp.prototype.toString` method
// https://tc39.es/ecma262/#sec-regexp.prototype.tostring
if (NOT_GENERIC || INCORRECT_NAME) {
  redefine(RegExp.prototype, TO_STRING$1, function toString() {
    var R = anObject(this);
    var p = String(R.source);
    var rf = R.flags;
    var f = String(rf === undefined && R instanceof RegExp && !('flags' in RegExpPrototype) ? regexpFlags.call(R) : rf);
    return '/' + p + '/' + f;
  }, { unsafe: true });
}

var DatePrototype = Date.prototype;
var INVALID_DATE = 'Invalid Date';
var TO_STRING = 'toString';
var nativeDateToString = DatePrototype[TO_STRING];
var getTime = DatePrototype.getTime;

// `Date.prototype.toString` method
// https://tc39.es/ecma262/#sec-date.prototype.tostring
if (new Date(NaN) + '' != INVALID_DATE) {
  redefine(DatePrototype, TO_STRING, function toString() {
    var value = getTime.call(this);
    // eslint-disable-next-line no-self-compare -- NaN check
    return value === value ? nativeDateToString.call(this) : INVALID_DATE;
  });
}

for (var COLLECTION_NAME in domIterables) {
  var Collection = global$1[COLLECTION_NAME];
  var CollectionPrototype = Collection && Collection.prototype;
  // some Chrome versions have non-configurable methods on DOMTokenList
  if (CollectionPrototype && CollectionPrototype.forEach !== arrayForEach) try {
    createNonEnumerableProperty(CollectionPrototype, 'forEach', arrayForEach);
  } catch (error) {
    CollectionPrototype.forEach = arrayForEach;
  }
}

var nativeReverse = [].reverse;
var test = [1, 2];

// `Array.prototype.reverse` method
// https://tc39.es/ecma262/#sec-array.prototype.reverse
// fix for Safari 12.0 bug
// https://bugs.webkit.org/show_bug.cgi?id=188794
_export({ target: 'Array', proto: true, forced: String(test) === String(test.reverse()) }, {
  reverse: function reverse() {
    // eslint-disable-next-line no-self-assign -- dirty hack
    if (isArray(this)) this.length = this.length;
    return nativeReverse.call(this);
  }
});

var createProperty = function (object, key, value) {
  var propertyKey = toPrimitive(key);
  if (propertyKey in object) objectDefineProperty.f(object, propertyKey, createPropertyDescriptor(0, value));
  else object[propertyKey] = value;
};

var SPECIES$1 = wellKnownSymbol('species');

var arrayMethodHasSpeciesSupport = function (METHOD_NAME) {
  // We can't use this feature detection in V8 since it causes
  // deoptimization and serious performance degradation
  // https://github.com/zloirock/core-js/issues/677
  return engineV8Version >= 51 || !fails(function () {
    var array = [];
    var constructor = array.constructor = {};
    constructor[SPECIES$1] = function () {
      return { foo: 1 };
    };
    return array[METHOD_NAME](Boolean).foo !== 1;
  });
};

var HAS_SPECIES_SUPPORT$1 = arrayMethodHasSpeciesSupport('slice');

var SPECIES = wellKnownSymbol('species');
var nativeSlice = [].slice;
var max = Math.max;

// `Array.prototype.slice` method
// https://tc39.es/ecma262/#sec-array.prototype.slice
// fallback for not array-like ES3 strings and DOM objects
_export({ target: 'Array', proto: true, forced: !HAS_SPECIES_SUPPORT$1 }, {
  slice: function slice(start, end) {
    var O = toIndexedObject(this);
    var length = toLength(O.length);
    var k = toAbsoluteIndex(start, length);
    var fin = toAbsoluteIndex(end === undefined ? length : end, length);
    // inline `ArraySpeciesCreate` for usage native `Array#slice` where it's possible
    var Constructor, result, n;
    if (isArray(O)) {
      Constructor = O.constructor;
      // cross-realm fallback
      if (typeof Constructor == 'function' && (Constructor === Array || isArray(Constructor.prototype))) {
        Constructor = undefined;
      } else if (isObject(Constructor)) {
        Constructor = Constructor[SPECIES];
        if (Constructor === null) Constructor = undefined;
      }
      if (Constructor === Array || Constructor === undefined) {
        return nativeSlice.call(O, k, fin);
      }
    }
    result = new (Constructor === undefined ? Array : Constructor)(max(fin - k, 0));
    for (n = 0; k < fin; k++, n++) if (k in O) createProperty(result, n, O[k]);
    result.length = n;
    return result;
  }
});

createCommonjsModule(function (module) {
  var runtime = function (exports) {

    var Op = Object.prototype;
    var hasOwn = Op.hasOwnProperty;
    var undefined$1; // More compressible than void 0.

    var $Symbol = typeof Symbol === "function" ? Symbol : {};
    var iteratorSymbol = $Symbol.iterator || "@@iterator";
    var asyncIteratorSymbol = $Symbol.asyncIterator || "@@asyncIterator";
    var toStringTagSymbol = $Symbol.toStringTag || "@@toStringTag";

    function define(obj, key, value) {
      Object.defineProperty(obj, key, {
        value: value,
        enumerable: true,
        configurable: true,
        writable: true
      });
      return obj[key];
    }

    try {
      // IE 8 has a broken Object.defineProperty that only works on DOM objects.
      define({}, "");
    } catch (err) {
      define = function define(obj, key, value) {
        return obj[key] = value;
      };
    }

    function wrap(innerFn, outerFn, self, tryLocsList) {
      // If outerFn provided and outerFn.prototype is a Generator, then outerFn.prototype instanceof Generator.
      var protoGenerator = outerFn && outerFn.prototype instanceof Generator ? outerFn : Generator;
      var generator = Object.create(protoGenerator.prototype);
      var context = new Context(tryLocsList || []); // The ._invoke method unifies the implementations of the .next,
      // .throw, and .return methods.

      generator._invoke = makeInvokeMethod(innerFn, self, context);
      return generator;
    }

    exports.wrap = wrap; // Try/catch helper to minimize deoptimizations. Returns a completion
    // record like context.tryEntries[i].completion. This interface could
    // have been (and was previously) designed to take a closure to be
    // invoked without arguments, but in all the cases we care about we
    // already have an existing method we want to call, so there's no need
    // to create a new function object. We can even get away with assuming
    // the method takes exactly one argument, since that happens to be true
    // in every case, so we don't have to touch the arguments object. The
    // only additional allocation required is the completion record, which
    // has a stable shape and so hopefully should be cheap to allocate.

    function tryCatch(fn, obj, arg) {
      try {
        return {
          type: "normal",
          arg: fn.call(obj, arg)
        };
      } catch (err) {
        return {
          type: "throw",
          arg: err
        };
      }
    }

    var GenStateSuspendedStart = "suspendedStart";
    var GenStateSuspendedYield = "suspendedYield";
    var GenStateExecuting = "executing";
    var GenStateCompleted = "completed"; // Returning this object from the innerFn has the same effect as
    // breaking out of the dispatch switch statement.

    var ContinueSentinel = {}; // Dummy constructor functions that we use as the .constructor and
    // .constructor.prototype properties for functions that return Generator
    // objects. For full spec compliance, you may wish to configure your
    // minifier not to mangle the names of these two functions.

    function Generator() {}

    function GeneratorFunction() {}

    function GeneratorFunctionPrototype() {} // This is a polyfill for %IteratorPrototype% for environments that
    // don't natively support it.


    var IteratorPrototype = {};

    IteratorPrototype[iteratorSymbol] = function () {
      return this;
    };

    var getProto = Object.getPrototypeOf;
    var NativeIteratorPrototype = getProto && getProto(getProto(values([])));

    if (NativeIteratorPrototype && NativeIteratorPrototype !== Op && hasOwn.call(NativeIteratorPrototype, iteratorSymbol)) {
      // This environment has a native %IteratorPrototype%; use it instead
      // of the polyfill.
      IteratorPrototype = NativeIteratorPrototype;
    }

    var Gp = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(IteratorPrototype);
    GeneratorFunction.prototype = Gp.constructor = GeneratorFunctionPrototype;
    GeneratorFunctionPrototype.constructor = GeneratorFunction;
    GeneratorFunction.displayName = define(GeneratorFunctionPrototype, toStringTagSymbol, "GeneratorFunction"); // Helper for defining the .next, .throw, and .return methods of the
    // Iterator interface in terms of a single ._invoke method.

    function defineIteratorMethods(prototype) {
      ["next", "throw", "return"].forEach(function (method) {
        define(prototype, method, function (arg) {
          return this._invoke(method, arg);
        });
      });
    }

    exports.isGeneratorFunction = function (genFun) {
      var ctor = typeof genFun === "function" && genFun.constructor;
      return ctor ? ctor === GeneratorFunction || // For the native GeneratorFunction constructor, the best we can
      // do is to check its .name property.
      (ctor.displayName || ctor.name) === "GeneratorFunction" : false;
    };

    exports.mark = function (genFun) {
      if (Object.setPrototypeOf) {
        Object.setPrototypeOf(genFun, GeneratorFunctionPrototype);
      } else {
        genFun.__proto__ = GeneratorFunctionPrototype;
        define(genFun, toStringTagSymbol, "GeneratorFunction");
      }

      genFun.prototype = Object.create(Gp);
      return genFun;
    }; // Within the body of any async function, `await x` is transformed to
    // `yield regeneratorRuntime.awrap(x)`, so that the runtime can test
    // `hasOwn.call(value, "__await")` to determine if the yielded value is
    // meant to be awaited.


    exports.awrap = function (arg) {
      return {
        __await: arg
      };
    };

    function AsyncIterator(generator, PromiseImpl) {
      function invoke(method, arg, resolve, reject) {
        var record = tryCatch(generator[method], generator, arg);

        if (record.type === "throw") {
          reject(record.arg);
        } else {
          var result = record.arg;
          var value = result.value;

          if (value && _typeof(value) === "object" && hasOwn.call(value, "__await")) {
            return PromiseImpl.resolve(value.__await).then(function (value) {
              invoke("next", value, resolve, reject);
            }, function (err) {
              invoke("throw", err, resolve, reject);
            });
          }

          return PromiseImpl.resolve(value).then(function (unwrapped) {
            // When a yielded Promise is resolved, its final value becomes
            // the .value of the Promise<{value,done}> result for the
            // current iteration.
            result.value = unwrapped;
            resolve(result);
          }, function (error) {
            // If a rejected Promise was yielded, throw the rejection back
            // into the async generator function so it can be handled there.
            return invoke("throw", error, resolve, reject);
          });
        }
      }

      var previousPromise;

      function enqueue(method, arg) {
        function callInvokeWithMethodAndArg() {
          return new PromiseImpl(function (resolve, reject) {
            invoke(method, arg, resolve, reject);
          });
        }

        return previousPromise = // If enqueue has been called before, then we want to wait until
        // all previous Promises have been resolved before calling invoke,
        // so that results are always delivered in the correct order. If
        // enqueue has not been called before, then it is important to
        // call invoke immediately, without waiting on a callback to fire,
        // so that the async generator function has the opportunity to do
        // any necessary setup in a predictable way. This predictability
        // is why the Promise constructor synchronously invokes its
        // executor callback, and why async functions synchronously
        // execute code before the first await. Since we implement simple
        // async functions in terms of async generators, it is especially
        // important to get this right, even though it requires care.
        previousPromise ? previousPromise.then(callInvokeWithMethodAndArg, // Avoid propagating failures to Promises returned by later
        // invocations of the iterator.
        callInvokeWithMethodAndArg) : callInvokeWithMethodAndArg();
      } // Define the unified helper method that is used to implement .next,
      // .throw, and .return (see defineIteratorMethods).


      this._invoke = enqueue;
    }

    defineIteratorMethods(AsyncIterator.prototype);

    AsyncIterator.prototype[asyncIteratorSymbol] = function () {
      return this;
    };

    exports.AsyncIterator = AsyncIterator; // Note that simple async functions are implemented on top of
    // AsyncIterator objects; they just return a Promise for the value of
    // the final result produced by the iterator.

    exports.async = function (innerFn, outerFn, self, tryLocsList, PromiseImpl) {
      if (PromiseImpl === void 0) PromiseImpl = Promise;
      var iter = new AsyncIterator(wrap(innerFn, outerFn, self, tryLocsList), PromiseImpl);
      return exports.isGeneratorFunction(outerFn) ? iter // If outerFn is a generator, return the full iterator.
      : iter.next().then(function (result) {
        return result.done ? result.value : iter.next();
      });
    };

    function makeInvokeMethod(innerFn, self, context) {
      var state = GenStateSuspendedStart;
      return function invoke(method, arg) {
        if (state === GenStateExecuting) {
          throw new Error("Generator is already running");
        }

        if (state === GenStateCompleted) {
          if (method === "throw") {
            throw arg;
          } // Be forgiving, per 25.3.3.3.3 of the spec:
          // https://people.mozilla.org/~jorendorff/es6-draft.html#sec-generatorresume


          return doneResult();
        }

        context.method = method;
        context.arg = arg;

        while (true) {
          var delegate = context.delegate;

          if (delegate) {
            var delegateResult = maybeInvokeDelegate(delegate, context);

            if (delegateResult) {
              if (delegateResult === ContinueSentinel) continue;
              return delegateResult;
            }
          }

          if (context.method === "next") {
            // Setting context._sent for legacy support of Babel's
            // function.sent implementation.
            context.sent = context._sent = context.arg;
          } else if (context.method === "throw") {
            if (state === GenStateSuspendedStart) {
              state = GenStateCompleted;
              throw context.arg;
            }

            context.dispatchException(context.arg);
          } else if (context.method === "return") {
            context.abrupt("return", context.arg);
          }

          state = GenStateExecuting;
          var record = tryCatch(innerFn, self, context);

          if (record.type === "normal") {
            // If an exception is thrown from innerFn, we leave state ===
            // GenStateExecuting and loop back for another invocation.
            state = context.done ? GenStateCompleted : GenStateSuspendedYield;

            if (record.arg === ContinueSentinel) {
              continue;
            }

            return {
              value: record.arg,
              done: context.done
            };
          } else if (record.type === "throw") {
            state = GenStateCompleted; // Dispatch the exception by looping back around to the
            // context.dispatchException(context.arg) call above.

            context.method = "throw";
            context.arg = record.arg;
          }
        }
      };
    } // Call delegate.iterator[context.method](context.arg) and handle the
    // result, either by returning a { value, done } result from the
    // delegate iterator, or by modifying context.method and context.arg,
    // setting context.delegate to null, and returning the ContinueSentinel.


    function maybeInvokeDelegate(delegate, context) {
      var method = delegate.iterator[context.method];

      if (method === undefined$1) {
        // A .throw or .return when the delegate iterator has no .throw
        // method always terminates the yield* loop.
        context.delegate = null;

        if (context.method === "throw") {
          // Note: ["return"] must be used for ES3 parsing compatibility.
          if (delegate.iterator["return"]) {
            // If the delegate iterator has a return method, give it a
            // chance to clean up.
            context.method = "return";
            context.arg = undefined$1;
            maybeInvokeDelegate(delegate, context);

            if (context.method === "throw") {
              // If maybeInvokeDelegate(context) changed context.method from
              // "return" to "throw", let that override the TypeError below.
              return ContinueSentinel;
            }
          }

          context.method = "throw";
          context.arg = new TypeError("The iterator does not provide a 'throw' method");
        }

        return ContinueSentinel;
      }

      var record = tryCatch(method, delegate.iterator, context.arg);

      if (record.type === "throw") {
        context.method = "throw";
        context.arg = record.arg;
        context.delegate = null;
        return ContinueSentinel;
      }

      var info = record.arg;

      if (!info) {
        context.method = "throw";
        context.arg = new TypeError("iterator result is not an object");
        context.delegate = null;
        return ContinueSentinel;
      }

      if (info.done) {
        // Assign the result of the finished delegate to the temporary
        // variable specified by delegate.resultName (see delegateYield).
        context[delegate.resultName] = info.value; // Resume execution at the desired location (see delegateYield).

        context.next = delegate.nextLoc; // If context.method was "throw" but the delegate handled the
        // exception, let the outer generator proceed normally. If
        // context.method was "next", forget context.arg since it has been
        // "consumed" by the delegate iterator. If context.method was
        // "return", allow the original .return call to continue in the
        // outer generator.

        if (context.method !== "return") {
          context.method = "next";
          context.arg = undefined$1;
        }
      } else {
        // Re-yield the result returned by the delegate method.
        return info;
      } // The delegate iterator is finished, so forget it and continue with
      // the outer generator.


      context.delegate = null;
      return ContinueSentinel;
    } // Define Generator.prototype.{next,throw,return} in terms of the
    // unified ._invoke helper method.


    defineIteratorMethods(Gp);
    define(Gp, toStringTagSymbol, "Generator"); // A Generator should always return itself as the iterator object when the
    // @@iterator function is called on it. Some browsers' implementations of the
    // iterator prototype chain incorrectly implement this, causing the Generator
    // object to not be returned from this call. This ensures that doesn't happen.
    // See https://github.com/facebook/regenerator/issues/274 for more details.

    Gp[iteratorSymbol] = function () {
      return this;
    };

    Gp.toString = function () {
      return "[object Generator]";
    };

    function pushTryEntry(locs) {
      var entry = {
        tryLoc: locs[0]
      };

      if (1 in locs) {
        entry.catchLoc = locs[1];
      }

      if (2 in locs) {
        entry.finallyLoc = locs[2];
        entry.afterLoc = locs[3];
      }

      this.tryEntries.push(entry);
    }

    function resetTryEntry(entry) {
      var record = entry.completion || {};
      record.type = "normal";
      delete record.arg;
      entry.completion = record;
    }

    function Context(tryLocsList) {
      // The root entry object (effectively a try statement without a catch
      // or a finally block) gives us a place to store values thrown from
      // locations where there is no enclosing try statement.
      this.tryEntries = [{
        tryLoc: "root"
      }];
      tryLocsList.forEach(pushTryEntry, this);
      this.reset(true);
    }

    exports.keys = function (object) {
      var keys = [];

      for (var key in object) {
        keys.push(key);
      }

      keys.reverse(); // Rather than returning an object with a next method, we keep
      // things simple and return the next function itself.

      return function next() {
        while (keys.length) {
          var key = keys.pop();

          if (key in object) {
            next.value = key;
            next.done = false;
            return next;
          }
        } // To avoid creating an additional object, we just hang the .value
        // and .done properties off the next function object itself. This
        // also ensures that the minifier will not anonymize the function.


        next.done = true;
        return next;
      };
    };

    function values(iterable) {
      if (iterable) {
        var iteratorMethod = iterable[iteratorSymbol];

        if (iteratorMethod) {
          return iteratorMethod.call(iterable);
        }

        if (typeof iterable.next === "function") {
          return iterable;
        }

        if (!isNaN(iterable.length)) {
          var i = -1,
              next = function next() {
            while (++i < iterable.length) {
              if (hasOwn.call(iterable, i)) {
                next.value = iterable[i];
                next.done = false;
                return next;
              }
            }

            next.value = undefined$1;
            next.done = true;
            return next;
          };

          return next.next = next;
        }
      } // Return an iterator with no values.


      return {
        next: doneResult
      };
    }

    exports.values = values;

    function doneResult() {
      return {
        value: undefined$1,
        done: true
      };
    }

    Context.prototype = {
      constructor: Context,
      reset: function reset(skipTempReset) {
        this.prev = 0;
        this.next = 0; // Resetting context._sent for legacy support of Babel's
        // function.sent implementation.

        this.sent = this._sent = undefined$1;
        this.done = false;
        this.delegate = null;
        this.method = "next";
        this.arg = undefined$1;
        this.tryEntries.forEach(resetTryEntry);

        if (!skipTempReset) {
          for (var name in this) {
            // Not sure about the optimal order of these conditions:
            if (name.charAt(0) === "t" && hasOwn.call(this, name) && !isNaN(+name.slice(1))) {
              this[name] = undefined$1;
            }
          }
        }
      },
      stop: function stop() {
        this.done = true;
        var rootEntry = this.tryEntries[0];
        var rootRecord = rootEntry.completion;

        if (rootRecord.type === "throw") {
          throw rootRecord.arg;
        }

        return this.rval;
      },
      dispatchException: function dispatchException(exception) {
        if (this.done) {
          throw exception;
        }

        var context = this;

        function handle(loc, caught) {
          record.type = "throw";
          record.arg = exception;
          context.next = loc;

          if (caught) {
            // If the dispatched exception was caught by a catch block,
            // then let that catch block handle the exception normally.
            context.method = "next";
            context.arg = undefined$1;
          }

          return !!caught;
        }

        for (var i = this.tryEntries.length - 1; i >= 0; --i) {
          var entry = this.tryEntries[i];
          var record = entry.completion;

          if (entry.tryLoc === "root") {
            // Exception thrown outside of any try block that could handle
            // it, so set the completion value of the entire function to
            // throw the exception.
            return handle("end");
          }

          if (entry.tryLoc <= this.prev) {
            var hasCatch = hasOwn.call(entry, "catchLoc");
            var hasFinally = hasOwn.call(entry, "finallyLoc");

            if (hasCatch && hasFinally) {
              if (this.prev < entry.catchLoc) {
                return handle(entry.catchLoc, true);
              } else if (this.prev < entry.finallyLoc) {
                return handle(entry.finallyLoc);
              }
            } else if (hasCatch) {
              if (this.prev < entry.catchLoc) {
                return handle(entry.catchLoc, true);
              }
            } else if (hasFinally) {
              if (this.prev < entry.finallyLoc) {
                return handle(entry.finallyLoc);
              }
            } else {
              throw new Error("try statement without catch or finally");
            }
          }
        }
      },
      abrupt: function abrupt(type, arg) {
        for (var i = this.tryEntries.length - 1; i >= 0; --i) {
          var entry = this.tryEntries[i];

          if (entry.tryLoc <= this.prev && hasOwn.call(entry, "finallyLoc") && this.prev < entry.finallyLoc) {
            var finallyEntry = entry;
            break;
          }
        }

        if (finallyEntry && (type === "break" || type === "continue") && finallyEntry.tryLoc <= arg && arg <= finallyEntry.finallyLoc) {
          // Ignore the finally entry if control is not jumping to a
          // location outside the try/catch block.
          finallyEntry = null;
        }

        var record = finallyEntry ? finallyEntry.completion : {};
        record.type = type;
        record.arg = arg;

        if (finallyEntry) {
          this.method = "next";
          this.next = finallyEntry.finallyLoc;
          return ContinueSentinel;
        }

        return this.complete(record);
      },
      complete: function complete(record, afterLoc) {
        if (record.type === "throw") {
          throw record.arg;
        }

        if (record.type === "break" || record.type === "continue") {
          this.next = record.arg;
        } else if (record.type === "return") {
          this.rval = this.arg = record.arg;
          this.method = "return";
          this.next = "end";
        } else if (record.type === "normal" && afterLoc) {
          this.next = afterLoc;
        }

        return ContinueSentinel;
      },
      finish: function finish(finallyLoc) {
        for (var i = this.tryEntries.length - 1; i >= 0; --i) {
          var entry = this.tryEntries[i];

          if (entry.finallyLoc === finallyLoc) {
            this.complete(entry.completion, entry.afterLoc);
            resetTryEntry(entry);
            return ContinueSentinel;
          }
        }
      },
      "catch": function _catch(tryLoc) {
        for (var i = this.tryEntries.length - 1; i >= 0; --i) {
          var entry = this.tryEntries[i];

          if (entry.tryLoc === tryLoc) {
            var record = entry.completion;

            if (record.type === "throw") {
              var thrown = record.arg;
              resetTryEntry(entry);
            }

            return thrown;
          }
        } // The context.catch method must only be called with a location
        // argument that corresponds to a known catch block.


        throw new Error("illegal catch attempt");
      },
      delegateYield: function delegateYield(iterable, resultName, nextLoc) {
        this.delegate = {
          iterator: values(iterable),
          resultName: resultName,
          nextLoc: nextLoc
        };

        if (this.method === "next") {
          // Deliberately forget the last sent value so that we don't
          // accidentally pass it on to the delegate.
          this.arg = undefined$1;
        }

        return ContinueSentinel;
      }
    }; // Regardless of whether this script is executing as a CommonJS module
    // or not, return the runtime object so that we can declare the variable
    // regeneratorRuntime in the outer scope, which allows this module to be
    // injected easily by `bin/regenerator --include-runtime script.js`.

    return exports;
  }( // If this script is executing as a CommonJS module, use module.exports
  // as the regeneratorRuntime namespace. Otherwise create a new empty
  // object. Either way, the resulting object will be used to initialize
  // the regeneratorRuntime variable at the top of this file.
  module.exports );

  try {
    regeneratorRuntime = runtime;
  } catch (accidentalStrictMode) {
    // This module should not be running in strict mode, so the above
    // assignment should always work unless something is misconfigured. Just
    // in case runtime.js accidentally runs in strict mode, we can escape
    // strict mode using a global Function call. This could conceivably fail
    // if a Content Security Policy forbids using Function, but in that case
    // the proper solution is to fix the accidental strict mode problem. If
    // you've misconfigured your bundler to force strict mode and applied a
    // CSP to forbid Function, and you're not willing to fix either of those
    // problems, please detail your unique predicament in a GitHub issue.
    Function("r", "regeneratorRuntime = r")(runtime);
  }
});

var IS_CONCAT_SPREADABLE = wellKnownSymbol('isConcatSpreadable');
var MAX_SAFE_INTEGER = 0x1FFFFFFFFFFFFF;
var MAXIMUM_ALLOWED_INDEX_EXCEEDED = 'Maximum allowed index exceeded';

// We can't use this feature detection in V8 since it causes
// deoptimization and serious performance degradation
// https://github.com/zloirock/core-js/issues/679
var IS_CONCAT_SPREADABLE_SUPPORT = engineV8Version >= 51 || !fails(function () {
  var array = [];
  array[IS_CONCAT_SPREADABLE] = false;
  return array.concat()[0] !== array;
});

var SPECIES_SUPPORT = arrayMethodHasSpeciesSupport('concat');

var isConcatSpreadable = function (O) {
  if (!isObject(O)) return false;
  var spreadable = O[IS_CONCAT_SPREADABLE];
  return spreadable !== undefined ? !!spreadable : isArray(O);
};

var FORCED$4 = !IS_CONCAT_SPREADABLE_SUPPORT || !SPECIES_SUPPORT;

// `Array.prototype.concat` method
// https://tc39.es/ecma262/#sec-array.prototype.concat
// with adding support of @@isConcatSpreadable and @@species
_export({ target: 'Array', proto: true, forced: FORCED$4 }, {
  // eslint-disable-next-line no-unused-vars -- required for `.length`
  concat: function concat(arg) {
    var O = toObject(this);
    var A = arraySpeciesCreate(O, 0);
    var n = 0;
    var i, k, length, len, E;
    for (i = -1, length = arguments.length; i < length; i++) {
      E = i === -1 ? O : arguments[i];
      if (isConcatSpreadable(E)) {
        len = toLength(E.length);
        if (n + len > MAX_SAFE_INTEGER) throw TypeError(MAXIMUM_ALLOWED_INDEX_EXCEEDED);
        for (k = 0; k < len; k++, n++) if (k in E) createProperty(A, n, E[k]);
      } else {
        if (n >= MAX_SAFE_INTEGER) throw TypeError(MAXIMUM_ALLOWED_INDEX_EXCEEDED);
        createProperty(A, n++, E);
      }
    }
    A.length = n;
    return A;
  }
});

// `Array.prototype.{ reduce, reduceRight }` methods implementation
var createMethod = function (IS_RIGHT) {
  return function (that, callbackfn, argumentsLength, memo) {
    aFunction(callbackfn);
    var O = toObject(that);
    var self = indexedObject(O);
    var length = toLength(O.length);
    var index = IS_RIGHT ? length - 1 : 0;
    var i = IS_RIGHT ? -1 : 1;
    if (argumentsLength < 2) while (true) {
      if (index in self) {
        memo = self[index];
        index += i;
        break;
      }
      index += i;
      if (IS_RIGHT ? index < 0 : length <= index) {
        throw TypeError('Reduce of empty array with no initial value');
      }
    }
    for (;IS_RIGHT ? index >= 0 : length > index; index += i) if (index in self) {
      memo = callbackfn(memo, self[index], index, O);
    }
    return memo;
  };
};

var arrayReduce = {
  // `Array.prototype.reduce` method
  // https://tc39.es/ecma262/#sec-array.prototype.reduce
  left: createMethod(false),
  // `Array.prototype.reduceRight` method
  // https://tc39.es/ecma262/#sec-array.prototype.reduceright
  right: createMethod(true)
};

var $reduce$1 = arrayReduce.left;




var STRICT_METHOD$2 = arrayMethodIsStrict('reduce');
// Chrome 80-82 has a critical bug
// https://bugs.chromium.org/p/chromium/issues/detail?id=1049982
var CHROME_BUG = !engineIsNode && engineV8Version > 79 && engineV8Version < 83;

// `Array.prototype.reduce` method
// https://tc39.es/ecma262/#sec-array.prototype.reduce
_export({ target: 'Array', proto: true, forced: !STRICT_METHOD$2 || CHROME_BUG }, {
  reduce: function reduce(callbackfn /* , initialValue */) {
    return $reduce$1(this, callbackfn, arguments.length, arguments.length > 1 ? arguments[1] : undefined);
  }
});

var $map$1 = arrayIteration.map;


var HAS_SPECIES_SUPPORT = arrayMethodHasSpeciesSupport('map');

// `Array.prototype.map` method
// https://tc39.es/ecma262/#sec-array.prototype.map
// with adding support of @@species
_export({ target: 'Array', proto: true, forced: !HAS_SPECIES_SUPPORT }, {
  map: function map(callbackfn /* , thisArg */) {
    return $map$1(this, callbackfn, arguments.length > 1 ? arguments[1] : undefined);
  }
});

var nativeJoin = [].join;

var ES3_STRINGS = indexedObject != Object;
var STRICT_METHOD$1 = arrayMethodIsStrict('join', ',');

// `Array.prototype.join` method
// https://tc39.es/ecma262/#sec-array.prototype.join
_export({ target: 'Array', proto: true, forced: ES3_STRINGS || !STRICT_METHOD$1 }, {
  join: function join(separator) {
    return nativeJoin.call(toIndexedObject(this), separator === undefined ? ',' : separator);
  }
});

// `Array.isArray` method
// https://tc39.es/ecma262/#sec-array.isarray
_export({ target: 'Array', stat: true }, {
  isArray: isArray
});

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
  clone: function clone() {
    return new Point(this.x, this.y);
  },

  /**
   * Add this point's x & y coordinates to another point,
   * yielding a new point.
   * @param {Point} p the other point
   * @return {Point} output point
   */
  add: function add(p) {
    return this.clone()._add(p);
  },

  /**
   * Subtract this point's x & y coordinates to from point,
   * yielding a new point.
   * @param {Point} p the other point
   * @return {Point} output point
   */
  sub: function sub(p) {
    return this.clone()._sub(p);
  },

  /**
   * Multiply this point's x & y coordinates by point,
   * yielding a new point.
   * @param {Point} p the other point
   * @return {Point} output point
   */
  multByPoint: function multByPoint(p) {
    return this.clone()._multByPoint(p);
  },

  /**
   * Divide this point's x & y coordinates by point,
   * yielding a new point.
   * @param {Point} p the other point
   * @return {Point} output point
   */
  divByPoint: function divByPoint(p) {
    return this.clone()._divByPoint(p);
  },

  /**
   * Multiply this point's x & y coordinates by a factor,
   * yielding a new point.
   * @param {Point} k factor
   * @return {Point} output point
   */
  mult: function mult(k) {
    return this.clone()._mult(k);
  },

  /**
   * Divide this point's x & y coordinates by a factor,
   * yielding a new point.
   * @param {Point} k factor
   * @return {Point} output point
   */
  div: function div(k) {
    return this.clone()._div(k);
  },

  /**
   * Rotate this point around the 0, 0 origin by an angle a,
   * given in radians
   * @param {Number} a angle to rotate around, in radians
   * @return {Point} output point
   */
  rotate: function rotate(a) {
    return this.clone()._rotate(a);
  },

  /**
   * Rotate this point around p point by an angle a,
   * given in radians
   * @param {Number} a angle to rotate around, in radians
   * @param {Point} p Point to rotate around
   * @return {Point} output point
   */
  rotateAround: function rotateAround(a, p) {
    return this.clone()._rotateAround(a, p);
  },

  /**
   * Multiply this point by a 4x1 transformation matrix
   * @param {Array<Number>} m transformation matrix
   * @return {Point} output point
   */
  matMult: function matMult(m) {
    return this.clone()._matMult(m);
  },

  /**
   * Calculate this point but as a unit vector from 0, 0, meaning
   * that the distance from the resulting point to the 0, 0
   * coordinate will be equal to 1 and the angle from the resulting
   * point to the 0, 0 coordinate will be the same as before.
   * @return {Point} unit vector point
   */
  unit: function unit() {
    return this.clone()._unit();
  },

  /**
   * Compute a perpendicular point, where the new y coordinate
   * is the old x coordinate and the new x coordinate is the old y
   * coordinate multiplied by -1
   * @return {Point} perpendicular point
   */
  perp: function perp() {
    return this.clone()._perp();
  },

  /**
   * Return a version of this point with the x & y coordinates
   * rounded to integers.
   * @return {Point} rounded point
   */
  round: function round() {
    return this.clone()._round();
  },

  /**
   * Return the magitude of this point: this is the Euclidean
   * distance from the 0, 0 coordinate to this point's x and y
   * coordinates.
   * @return {Number} magnitude
   */
  mag: function mag() {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  },

  /**
   * Judge whether this point is equal to another point, returning
   * true or false.
   * @param {Point} other the other point
   * @return {boolean} whether the points are equal
   */
  equals: function equals(other) {
    return this.x === other.x && this.y === other.y;
  },

  /**
   * Calculate the distance from this point to another point
   * @param {Point} p the other point
   * @return {Number} distance
   */
  dist: function dist(p) {
    return Math.sqrt(this.distSqr(p));
  },

  /**
   * Calculate the distance from this point to another point,
   * without the square root step. Useful if you're comparing
   * relative distances.
   * @param {Point} p the other point
   * @return {Number} distance
   */
  distSqr: function distSqr(p) {
    var dx = p.x - this.x,
        dy = p.y - this.y;
    return dx * dx + dy * dy;
  },

  /**
   * Get the angle from the 0, 0 coordinate to this point, in radians
   * coordinates.
   * @return {Number} angle
   */
  angle: function angle() {
    return Math.atan2(this.y, this.x);
  },

  /**
   * Get the angle from this point to another point, in radians
   * @param {Point} b the other point
   * @return {Number} angle
   */
  angleTo: function angleTo(b) {
    return Math.atan2(this.y - b.y, this.x - b.x);
  },

  /**
   * Get the angle between this point and another point, in radians
   * @param {Point} b the other point
   * @return {Number} angle
   */
  angleWith: function angleWith(b) {
    return this.angleWithSep(b.x, b.y);
  },

  /*
   * Find the angle of the two vectors, solving the formula for
   * the cross product a x b = |a||b|sin(θ) for θ.
   * @param {Number} x the x-coordinate
   * @param {Number} y the y-coordinate
   * @return {Number} the angle in radians
   */
  angleWithSep: function angleWithSep(x, y) {
    return Math.atan2(this.x * y - this.y * x, this.x * x + this.y * y);
  },
  _matMult: function _matMult(m) {
    var x = m[0] * this.x + m[1] * this.y,
        y = m[2] * this.x + m[3] * this.y;
    this.x = x;
    this.y = y;
    return this;
  },
  _add: function _add(p) {
    this.x += p.x;
    this.y += p.y;
    return this;
  },
  _sub: function _sub(p) {
    this.x -= p.x;
    this.y -= p.y;
    return this;
  },
  _mult: function _mult(k) {
    this.x *= k;
    this.y *= k;
    return this;
  },
  _div: function _div(k) {
    this.x /= k;
    this.y /= k;
    return this;
  },
  _multByPoint: function _multByPoint(p) {
    this.x *= p.x;
    this.y *= p.y;
    return this;
  },
  _divByPoint: function _divByPoint(p) {
    this.x /= p.x;
    this.y /= p.y;
    return this;
  },
  _unit: function _unit() {
    this._div(this.mag());

    return this;
  },
  _perp: function _perp() {
    var y = this.y;
    this.y = this.x;
    this.x = -y;
    return this;
  },
  _rotate: function _rotate(angle) {
    var cos = Math.cos(angle),
        sin = Math.sin(angle),
        x = cos * this.x - sin * this.y,
        y = sin * this.x + cos * this.y;
    this.x = x;
    this.y = y;
    return this;
  },
  _rotateAround: function _rotateAround(angle, p) {
    var cos = Math.cos(angle),
        sin = Math.sin(angle),
        x = p.x + cos * (this.x - p.x) - sin * (this.y - p.y),
        y = p.y + sin * (this.x - p.x) + cos * (this.y - p.y);
    this.x = x;
    this.y = y;
    return this;
  },
  _round: function _round() {
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
  this.type = 0; // Private

  this._pbf = pbf;
  this._geometry = -1;
  this._keys = keys;
  this._values = values;
  pbf.readFields(readFeature, this, end);
}

function readFeature(tag, feature, pbf) {
  if (tag == 1) feature.id = pbf.readVarint();else if (tag == 2) readTag(pbf, feature);else if (tag == 3) feature.type = pbf.readVarint();else if (tag == 4) feature._geometry = pbf.pos;
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

VectorTileFeature.prototype.loadGeometry = function () {
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

      if (cmd === 1) {
        // moveTo
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

VectorTileFeature.prototype.bbox = function () {
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

VectorTileFeature.prototype.toGeoJSON = function (x, y, z) {
  var size = this.extent * Math.pow(2, z),
      x0 = this.extent * x,
      y0 = this.extent * y,
      coords = this.loadGeometry(),
      type = VectorTileFeature.types[this.type],
      i,
      j;

  function project(line) {
    for (var j = 0; j < line.length; j++) {
      var p = line[j],
          y2 = 180 - (p.y + y0) * 360 / size;
      line[j] = [(p.x + x0) * 360 / size - 180, 360 / Math.PI * Math.atan(Math.exp(y2 * Math.PI / 180)) - 90];
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
}; // classifies an array of rings into polygons with outer rings and holes


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
  this.length = 0; // Private

  this._pbf = pbf;
  this._keys = [];
  this._values = [];
  this._features = [];
  pbf.readFields(readLayer, this, end);
  this.length = this._features.length;
}

function readLayer(tag, layer, pbf) {
  if (tag === 15) layer.version = pbf.readVarint();else if (tag === 1) layer.name = pbf.readString();else if (tag === 5) layer.extent = pbf.readVarint();else if (tag === 2) layer._features.push(pbf.pos);else if (tag === 3) layer._keys.push(pbf.readString());else if (tag === 4) layer._values.push(readValueMessage(pbf));
}

function readValueMessage(pbf) {
  var value = null,
      end = pbf.readVarint() + pbf.pos;

  while (pbf.pos < end) {
    var tag = pbf.readVarint() >> 3;
    value = tag === 1 ? pbf.readString() : tag === 2 ? pbf.readFloat() : tag === 3 ? pbf.readDouble() : tag === 4 ? pbf.readVarint64() : tag === 5 ? pbf.readVarint() : tag === 6 ? pbf.readSVarint() : tag === 7 ? pbf.readBoolean() : null;
  }

  return value;
} // return feature `i` from this layer as a `VectorTileFeature`


VectorTileLayer.prototype.feature = function (i) {
  if (i < 0 || i >= this._features.length) throw new Error('feature index out of bounds');
  this._pbf.pos = this._features[i];

  var end = this._pbf.readVarint() + this._pbf.pos;

  return new vectortilefeature(this._pbf, end, this.extent, this._keys, this._values);
};

var vectortile = VectorTile$1;

function VectorTile$1(pbf, end) {
  this.layers = pbf.readFields(readTile, {}, end);
}

function readTile(tag, layers, pbf) {
  if (tag === 3) {
    var layer = new vectortilelayer(pbf, pbf.readVarint() + pbf.pos);
    if (layer.length) layers[layer.name] = layer;
  }
}

var VectorTile = vectortile;

var arrayBufferNative = typeof ArrayBuffer !== 'undefined' && typeof DataView !== 'undefined';

var defineProperty$1 = objectDefineProperty.f;





var Int8Array$3 = global$1.Int8Array;
var Int8ArrayPrototype = Int8Array$3 && Int8Array$3.prototype;
var Uint8ClampedArray = global$1.Uint8ClampedArray;
var Uint8ClampedArrayPrototype = Uint8ClampedArray && Uint8ClampedArray.prototype;
var TypedArray = Int8Array$3 && objectGetPrototypeOf(Int8Array$3);
var TypedArrayPrototype = Int8ArrayPrototype && objectGetPrototypeOf(Int8ArrayPrototype);
var ObjectPrototype$1 = Object.prototype;
var isPrototypeOf = ObjectPrototype$1.isPrototypeOf;

var TO_STRING_TAG = wellKnownSymbol('toStringTag');
var TYPED_ARRAY_TAG = uid('TYPED_ARRAY_TAG');
// Fixing native typed arrays in Opera Presto crashes the browser, see #595
var NATIVE_ARRAY_BUFFER_VIEWS$2 = arrayBufferNative && !!objectSetPrototypeOf && classof(global$1.opera) !== 'Opera';
var TYPED_ARRAY_TAG_REQIRED = false;
var NAME;

var TypedArrayConstructorsList = {
  Int8Array: 1,
  Uint8Array: 1,
  Uint8ClampedArray: 1,
  Int16Array: 2,
  Uint16Array: 2,
  Int32Array: 4,
  Uint32Array: 4,
  Float32Array: 4,
  Float64Array: 8
};

var BigIntArrayConstructorsList = {
  BigInt64Array: 8,
  BigUint64Array: 8
};

var isView = function isView(it) {
  if (!isObject(it)) return false;
  var klass = classof(it);
  return klass === 'DataView'
    || has$1(TypedArrayConstructorsList, klass)
    || has$1(BigIntArrayConstructorsList, klass);
};

var isTypedArray = function (it) {
  if (!isObject(it)) return false;
  var klass = classof(it);
  return has$1(TypedArrayConstructorsList, klass)
    || has$1(BigIntArrayConstructorsList, klass);
};

var aTypedArray$m = function (it) {
  if (isTypedArray(it)) return it;
  throw TypeError('Target is not a typed array');
};

var aTypedArrayConstructor$4 = function (C) {
  if (objectSetPrototypeOf) {
    if (isPrototypeOf.call(TypedArray, C)) return C;
  } else for (var ARRAY in TypedArrayConstructorsList) if (has$1(TypedArrayConstructorsList, NAME)) {
    var TypedArrayConstructor = global$1[ARRAY];
    if (TypedArrayConstructor && (C === TypedArrayConstructor || isPrototypeOf.call(TypedArrayConstructor, C))) {
      return C;
    }
  } throw TypeError('Target is not a typed array constructor');
};

var exportTypedArrayMethod$n = function (KEY, property, forced) {
  if (!descriptors) return;
  if (forced) for (var ARRAY in TypedArrayConstructorsList) {
    var TypedArrayConstructor = global$1[ARRAY];
    if (TypedArrayConstructor && has$1(TypedArrayConstructor.prototype, KEY)) {
      delete TypedArrayConstructor.prototype[KEY];
    }
  }
  if (!TypedArrayPrototype[KEY] || forced) {
    redefine(TypedArrayPrototype, KEY, forced ? property
      : NATIVE_ARRAY_BUFFER_VIEWS$2 && Int8ArrayPrototype[KEY] || property);
  }
};

var exportTypedArrayStaticMethod = function (KEY, property, forced) {
  var ARRAY, TypedArrayConstructor;
  if (!descriptors) return;
  if (objectSetPrototypeOf) {
    if (forced) for (ARRAY in TypedArrayConstructorsList) {
      TypedArrayConstructor = global$1[ARRAY];
      if (TypedArrayConstructor && has$1(TypedArrayConstructor, KEY)) {
        delete TypedArrayConstructor[KEY];
      }
    }
    if (!TypedArray[KEY] || forced) {
      // V8 ~ Chrome 49-50 `%TypedArray%` methods are non-writable non-configurable
      try {
        return redefine(TypedArray, KEY, forced ? property : NATIVE_ARRAY_BUFFER_VIEWS$2 && Int8Array$3[KEY] || property);
      } catch (error) { /* empty */ }
    } else return;
  }
  for (ARRAY in TypedArrayConstructorsList) {
    TypedArrayConstructor = global$1[ARRAY];
    if (TypedArrayConstructor && (!TypedArrayConstructor[KEY] || forced)) {
      redefine(TypedArrayConstructor, KEY, property);
    }
  }
};

for (NAME in TypedArrayConstructorsList) {
  if (!global$1[NAME]) NATIVE_ARRAY_BUFFER_VIEWS$2 = false;
}

// WebKit bug - typed arrays constructors prototype is Object.prototype
if (!NATIVE_ARRAY_BUFFER_VIEWS$2 || typeof TypedArray != 'function' || TypedArray === Function.prototype) {
  // eslint-disable-next-line no-shadow -- safe
  TypedArray = function TypedArray() {
    throw TypeError('Incorrect invocation');
  };
  if (NATIVE_ARRAY_BUFFER_VIEWS$2) for (NAME in TypedArrayConstructorsList) {
    if (global$1[NAME]) objectSetPrototypeOf(global$1[NAME], TypedArray);
  }
}

if (!NATIVE_ARRAY_BUFFER_VIEWS$2 || !TypedArrayPrototype || TypedArrayPrototype === ObjectPrototype$1) {
  TypedArrayPrototype = TypedArray.prototype;
  if (NATIVE_ARRAY_BUFFER_VIEWS$2) for (NAME in TypedArrayConstructorsList) {
    if (global$1[NAME]) objectSetPrototypeOf(global$1[NAME].prototype, TypedArrayPrototype);
  }
}

// WebKit bug - one more object in Uint8ClampedArray prototype chain
if (NATIVE_ARRAY_BUFFER_VIEWS$2 && objectGetPrototypeOf(Uint8ClampedArrayPrototype) !== TypedArrayPrototype) {
  objectSetPrototypeOf(Uint8ClampedArrayPrototype, TypedArrayPrototype);
}

if (descriptors && !has$1(TypedArrayPrototype, TO_STRING_TAG)) {
  TYPED_ARRAY_TAG_REQIRED = true;
  defineProperty$1(TypedArrayPrototype, TO_STRING_TAG, { get: function () {
    return isObject(this) ? this[TYPED_ARRAY_TAG] : undefined;
  } });
  for (NAME in TypedArrayConstructorsList) if (global$1[NAME]) {
    createNonEnumerableProperty(global$1[NAME], TYPED_ARRAY_TAG, NAME);
  }
}

var arrayBufferViewCore = {
  NATIVE_ARRAY_BUFFER_VIEWS: NATIVE_ARRAY_BUFFER_VIEWS$2,
  TYPED_ARRAY_TAG: TYPED_ARRAY_TAG_REQIRED && TYPED_ARRAY_TAG,
  aTypedArray: aTypedArray$m,
  aTypedArrayConstructor: aTypedArrayConstructor$4,
  exportTypedArrayMethod: exportTypedArrayMethod$n,
  exportTypedArrayStaticMethod: exportTypedArrayStaticMethod,
  isView: isView,
  isTypedArray: isTypedArray,
  TypedArray: TypedArray,
  TypedArrayPrototype: TypedArrayPrototype
};

var NATIVE_ARRAY_BUFFER_VIEWS$1 = arrayBufferViewCore.NATIVE_ARRAY_BUFFER_VIEWS;

// `ArrayBuffer.isView` method
// https://tc39.es/ecma262/#sec-arraybuffer.isview
_export({ target: 'ArrayBuffer', stat: true, forced: !NATIVE_ARRAY_BUFFER_VIEWS$1 }, {
  isView: arrayBufferViewCore.isView
});

// `ToIndex` abstract operation
// https://tc39.es/ecma262/#sec-toindex
var toIndex = function (it) {
  if (it === undefined) return 0;
  var number = toInteger(it);
  var length = toLength(number);
  if (number !== length) throw RangeError('Wrong length or index');
  return length;
};

// IEEE754 conversions based on https://github.com/feross/ieee754
var abs = Math.abs;
var pow = Math.pow;
var floor$1 = Math.floor;
var log = Math.log;
var LN2 = Math.LN2;

var pack = function (number, mantissaLength, bytes) {
  var buffer = new Array(bytes);
  var exponentLength = bytes * 8 - mantissaLength - 1;
  var eMax = (1 << exponentLength) - 1;
  var eBias = eMax >> 1;
  var rt = mantissaLength === 23 ? pow(2, -24) - pow(2, -77) : 0;
  var sign = number < 0 || number === 0 && 1 / number < 0 ? 1 : 0;
  var index = 0;
  var exponent, mantissa, c;
  number = abs(number);
  // eslint-disable-next-line no-self-compare -- NaN check
  if (number != number || number === Infinity) {
    // eslint-disable-next-line no-self-compare -- NaN check
    mantissa = number != number ? 1 : 0;
    exponent = eMax;
  } else {
    exponent = floor$1(log(number) / LN2);
    if (number * (c = pow(2, -exponent)) < 1) {
      exponent--;
      c *= 2;
    }
    if (exponent + eBias >= 1) {
      number += rt / c;
    } else {
      number += rt * pow(2, 1 - eBias);
    }
    if (number * c >= 2) {
      exponent++;
      c /= 2;
    }
    if (exponent + eBias >= eMax) {
      mantissa = 0;
      exponent = eMax;
    } else if (exponent + eBias >= 1) {
      mantissa = (number * c - 1) * pow(2, mantissaLength);
      exponent = exponent + eBias;
    } else {
      mantissa = number * pow(2, eBias - 1) * pow(2, mantissaLength);
      exponent = 0;
    }
  }
  for (; mantissaLength >= 8; buffer[index++] = mantissa & 255, mantissa /= 256, mantissaLength -= 8);
  exponent = exponent << mantissaLength | mantissa;
  exponentLength += mantissaLength;
  for (; exponentLength > 0; buffer[index++] = exponent & 255, exponent /= 256, exponentLength -= 8);
  buffer[--index] |= sign * 128;
  return buffer;
};

var unpack = function (buffer, mantissaLength) {
  var bytes = buffer.length;
  var exponentLength = bytes * 8 - mantissaLength - 1;
  var eMax = (1 << exponentLength) - 1;
  var eBias = eMax >> 1;
  var nBits = exponentLength - 7;
  var index = bytes - 1;
  var sign = buffer[index--];
  var exponent = sign & 127;
  var mantissa;
  sign >>= 7;
  for (; nBits > 0; exponent = exponent * 256 + buffer[index], index--, nBits -= 8);
  mantissa = exponent & (1 << -nBits) - 1;
  exponent >>= -nBits;
  nBits += mantissaLength;
  for (; nBits > 0; mantissa = mantissa * 256 + buffer[index], index--, nBits -= 8);
  if (exponent === 0) {
    exponent = 1 - eBias;
  } else if (exponent === eMax) {
    return mantissa ? NaN : sign ? -Infinity : Infinity;
  } else {
    mantissa = mantissa + pow(2, mantissaLength);
    exponent = exponent - eBias;
  } return (sign ? -1 : 1) * mantissa * pow(2, exponent - mantissaLength);
};

var ieee754$1 = {
  pack: pack,
  unpack: unpack
};

// `Array.prototype.fill` method implementation
// https://tc39.es/ecma262/#sec-array.prototype.fill
var arrayFill = function fill(value /* , start = 0, end = @length */) {
  var O = toObject(this);
  var length = toLength(O.length);
  var argumentsLength = arguments.length;
  var index = toAbsoluteIndex(argumentsLength > 1 ? arguments[1] : undefined, length);
  var end = argumentsLength > 2 ? arguments[2] : undefined;
  var endPos = end === undefined ? length : toAbsoluteIndex(end, length);
  while (endPos > index) O[index++] = value;
  return O;
};

var getOwnPropertyNames = objectGetOwnPropertyNames.f;
var defineProperty = objectDefineProperty.f;




var getInternalState = internalState.get;
var setInternalState = internalState.set;
var ARRAY_BUFFER$1 = 'ArrayBuffer';
var DATA_VIEW = 'DataView';
var PROTOTYPE = 'prototype';
var WRONG_LENGTH = 'Wrong length';
var WRONG_INDEX = 'Wrong index';
var NativeArrayBuffer$1 = global$1[ARRAY_BUFFER$1];
var $ArrayBuffer = NativeArrayBuffer$1;
var $DataView = global$1[DATA_VIEW];
var $DataViewPrototype = $DataView && $DataView[PROTOTYPE];
var ObjectPrototype = Object.prototype;
var RangeError$1 = global$1.RangeError;

var packIEEE754 = ieee754$1.pack;
var unpackIEEE754 = ieee754$1.unpack;

var packInt8 = function (number) {
  return [number & 0xFF];
};

var packInt16 = function (number) {
  return [number & 0xFF, number >> 8 & 0xFF];
};

var packInt32 = function (number) {
  return [number & 0xFF, number >> 8 & 0xFF, number >> 16 & 0xFF, number >> 24 & 0xFF];
};

var unpackInt32 = function (buffer) {
  return buffer[3] << 24 | buffer[2] << 16 | buffer[1] << 8 | buffer[0];
};

var packFloat32 = function (number) {
  return packIEEE754(number, 23, 4);
};

var packFloat64 = function (number) {
  return packIEEE754(number, 52, 8);
};

var addGetter = function (Constructor, key) {
  defineProperty(Constructor[PROTOTYPE], key, { get: function () { return getInternalState(this)[key]; } });
};

var get$1 = function (view, count, index, isLittleEndian) {
  var intIndex = toIndex(index);
  var store = getInternalState(view);
  if (intIndex + count > store.byteLength) throw RangeError$1(WRONG_INDEX);
  var bytes = getInternalState(store.buffer).bytes;
  var start = intIndex + store.byteOffset;
  var pack = bytes.slice(start, start + count);
  return isLittleEndian ? pack : pack.reverse();
};

var set = function (view, count, index, conversion, value, isLittleEndian) {
  var intIndex = toIndex(index);
  var store = getInternalState(view);
  if (intIndex + count > store.byteLength) throw RangeError$1(WRONG_INDEX);
  var bytes = getInternalState(store.buffer).bytes;
  var start = intIndex + store.byteOffset;
  var pack = conversion(+value);
  for (var i = 0; i < count; i++) bytes[start + i] = pack[isLittleEndian ? i : count - i - 1];
};

if (!arrayBufferNative) {
  $ArrayBuffer = function ArrayBuffer(length) {
    anInstance(this, $ArrayBuffer, ARRAY_BUFFER$1);
    var byteLength = toIndex(length);
    setInternalState(this, {
      bytes: arrayFill.call(new Array(byteLength), 0),
      byteLength: byteLength
    });
    if (!descriptors) this.byteLength = byteLength;
  };

  $DataView = function DataView(buffer, byteOffset, byteLength) {
    anInstance(this, $DataView, DATA_VIEW);
    anInstance(buffer, $ArrayBuffer, DATA_VIEW);
    var bufferLength = getInternalState(buffer).byteLength;
    var offset = toInteger(byteOffset);
    if (offset < 0 || offset > bufferLength) throw RangeError$1('Wrong offset');
    byteLength = byteLength === undefined ? bufferLength - offset : toLength(byteLength);
    if (offset + byteLength > bufferLength) throw RangeError$1(WRONG_LENGTH);
    setInternalState(this, {
      buffer: buffer,
      byteLength: byteLength,
      byteOffset: offset
    });
    if (!descriptors) {
      this.buffer = buffer;
      this.byteLength = byteLength;
      this.byteOffset = offset;
    }
  };

  if (descriptors) {
    addGetter($ArrayBuffer, 'byteLength');
    addGetter($DataView, 'buffer');
    addGetter($DataView, 'byteLength');
    addGetter($DataView, 'byteOffset');
  }

  redefineAll($DataView[PROTOTYPE], {
    getInt8: function getInt8(byteOffset) {
      return get$1(this, 1, byteOffset)[0] << 24 >> 24;
    },
    getUint8: function getUint8(byteOffset) {
      return get$1(this, 1, byteOffset)[0];
    },
    getInt16: function getInt16(byteOffset /* , littleEndian */) {
      var bytes = get$1(this, 2, byteOffset, arguments.length > 1 ? arguments[1] : undefined);
      return (bytes[1] << 8 | bytes[0]) << 16 >> 16;
    },
    getUint16: function getUint16(byteOffset /* , littleEndian */) {
      var bytes = get$1(this, 2, byteOffset, arguments.length > 1 ? arguments[1] : undefined);
      return bytes[1] << 8 | bytes[0];
    },
    getInt32: function getInt32(byteOffset /* , littleEndian */) {
      return unpackInt32(get$1(this, 4, byteOffset, arguments.length > 1 ? arguments[1] : undefined));
    },
    getUint32: function getUint32(byteOffset /* , littleEndian */) {
      return unpackInt32(get$1(this, 4, byteOffset, arguments.length > 1 ? arguments[1] : undefined)) >>> 0;
    },
    getFloat32: function getFloat32(byteOffset /* , littleEndian */) {
      return unpackIEEE754(get$1(this, 4, byteOffset, arguments.length > 1 ? arguments[1] : undefined), 23);
    },
    getFloat64: function getFloat64(byteOffset /* , littleEndian */) {
      return unpackIEEE754(get$1(this, 8, byteOffset, arguments.length > 1 ? arguments[1] : undefined), 52);
    },
    setInt8: function setInt8(byteOffset, value) {
      set(this, 1, byteOffset, packInt8, value);
    },
    setUint8: function setUint8(byteOffset, value) {
      set(this, 1, byteOffset, packInt8, value);
    },
    setInt16: function setInt16(byteOffset, value /* , littleEndian */) {
      set(this, 2, byteOffset, packInt16, value, arguments.length > 2 ? arguments[2] : undefined);
    },
    setUint16: function setUint16(byteOffset, value /* , littleEndian */) {
      set(this, 2, byteOffset, packInt16, value, arguments.length > 2 ? arguments[2] : undefined);
    },
    setInt32: function setInt32(byteOffset, value /* , littleEndian */) {
      set(this, 4, byteOffset, packInt32, value, arguments.length > 2 ? arguments[2] : undefined);
    },
    setUint32: function setUint32(byteOffset, value /* , littleEndian */) {
      set(this, 4, byteOffset, packInt32, value, arguments.length > 2 ? arguments[2] : undefined);
    },
    setFloat32: function setFloat32(byteOffset, value /* , littleEndian */) {
      set(this, 4, byteOffset, packFloat32, value, arguments.length > 2 ? arguments[2] : undefined);
    },
    setFloat64: function setFloat64(byteOffset, value /* , littleEndian */) {
      set(this, 8, byteOffset, packFloat64, value, arguments.length > 2 ? arguments[2] : undefined);
    }
  });
} else {
  /* eslint-disable no-new -- required for testing */
  if (!fails(function () {
    NativeArrayBuffer$1(1);
  }) || !fails(function () {
    new NativeArrayBuffer$1(-1);
  }) || fails(function () {
    new NativeArrayBuffer$1();
    new NativeArrayBuffer$1(1.5);
    new NativeArrayBuffer$1(NaN);
    return NativeArrayBuffer$1.name != ARRAY_BUFFER$1;
  })) {
  /* eslint-enable no-new -- required for testing */
    $ArrayBuffer = function ArrayBuffer(length) {
      anInstance(this, $ArrayBuffer);
      return new NativeArrayBuffer$1(toIndex(length));
    };
    var ArrayBufferPrototype = $ArrayBuffer[PROTOTYPE] = NativeArrayBuffer$1[PROTOTYPE];
    for (var keys = getOwnPropertyNames(NativeArrayBuffer$1), j = 0, key; keys.length > j;) {
      if (!((key = keys[j++]) in $ArrayBuffer)) {
        createNonEnumerableProperty($ArrayBuffer, key, NativeArrayBuffer$1[key]);
      }
    }
    ArrayBufferPrototype.constructor = $ArrayBuffer;
  }

  // WebKit bug - the same parent prototype for typed arrays and data view
  if (objectSetPrototypeOf && objectGetPrototypeOf($DataViewPrototype) !== ObjectPrototype) {
    objectSetPrototypeOf($DataViewPrototype, ObjectPrototype);
  }

  // iOS Safari 7.x bug
  var testView = new $DataView(new $ArrayBuffer(2));
  var nativeSetInt8 = $DataViewPrototype.setInt8;
  testView.setInt8(0, 2147483648);
  testView.setInt8(1, 2147483649);
  if (testView.getInt8(0) || !testView.getInt8(1)) redefineAll($DataViewPrototype, {
    setInt8: function setInt8(byteOffset, value) {
      nativeSetInt8.call(this, byteOffset, value << 24 >> 24);
    },
    setUint8: function setUint8(byteOffset, value) {
      nativeSetInt8.call(this, byteOffset, value << 24 >> 24);
    }
  }, { unsafe: true });
}

setToStringTag($ArrayBuffer, ARRAY_BUFFER$1);
setToStringTag($DataView, DATA_VIEW);

var arrayBuffer = {
  ArrayBuffer: $ArrayBuffer,
  DataView: $DataView
};

var ARRAY_BUFFER = 'ArrayBuffer';
var ArrayBuffer$3 = arrayBuffer[ARRAY_BUFFER];
var NativeArrayBuffer = global$1[ARRAY_BUFFER];

// `ArrayBuffer` constructor
// https://tc39.es/ecma262/#sec-arraybuffer-constructor
_export({ global: true, forced: NativeArrayBuffer !== ArrayBuffer$3 }, {
  ArrayBuffer: ArrayBuffer$3
});

setSpecies(ARRAY_BUFFER);

var ArrayBuffer$2 = arrayBuffer.ArrayBuffer;
var DataView$1 = arrayBuffer.DataView;
var nativeArrayBufferSlice = ArrayBuffer$2.prototype.slice;

var INCORRECT_SLICE = fails(function () {
  return !new ArrayBuffer$2(2).slice(1, undefined).byteLength;
});

// `ArrayBuffer.prototype.slice` method
// https://tc39.es/ecma262/#sec-arraybuffer.prototype.slice
_export({ target: 'ArrayBuffer', proto: true, unsafe: true, forced: INCORRECT_SLICE }, {
  slice: function slice(start, end) {
    if (nativeArrayBufferSlice !== undefined && end === undefined) {
      return nativeArrayBufferSlice.call(anObject(this), start); // FF fix
    }
    var length = anObject(this).byteLength;
    var first = toAbsoluteIndex(start, length);
    var fin = toAbsoluteIndex(end === undefined ? length : end, length);
    var result = new (speciesConstructor(this, ArrayBuffer$2))(toLength(fin - first));
    var viewSource = new DataView$1(this);
    var viewTarget = new DataView$1(result);
    var index = 0;
    while (first < fin) {
      viewTarget.setUint8(index++, viewSource.getUint8(first++));
    } return result;
  }
});

/* eslint-disable no-new -- required for testing */

var NATIVE_ARRAY_BUFFER_VIEWS = arrayBufferViewCore.NATIVE_ARRAY_BUFFER_VIEWS;

var ArrayBuffer$1 = global$1.ArrayBuffer;
var Int8Array$2 = global$1.Int8Array;

var typedArrayConstructorsRequireWrappers = !NATIVE_ARRAY_BUFFER_VIEWS || !fails(function () {
  Int8Array$2(1);
}) || !fails(function () {
  new Int8Array$2(-1);
}) || !checkCorrectnessOfIteration(function (iterable) {
  new Int8Array$2();
  new Int8Array$2(null);
  new Int8Array$2(1.5);
  new Int8Array$2(iterable);
}, true) || fails(function () {
  // Safari (11+) bug - a reason why even Safari 13 should load a typed array polyfill
  return new Int8Array$2(new ArrayBuffer$1(2), 1, undefined).length !== 1;
});

var toPositiveInteger = function (it) {
  var result = toInteger(it);
  if (result < 0) throw RangeError("The argument can't be less than 0");
  return result;
};

var toOffset = function (it, BYTES) {
  var offset = toPositiveInteger(it);
  if (offset % BYTES) throw RangeError('Wrong offset');
  return offset;
};

var aTypedArrayConstructor$3 = arrayBufferViewCore.aTypedArrayConstructor;

var typedArrayFrom = function from(source /* , mapfn, thisArg */) {
  var O = toObject(source);
  var argumentsLength = arguments.length;
  var mapfn = argumentsLength > 1 ? arguments[1] : undefined;
  var mapping = mapfn !== undefined;
  var iteratorMethod = getIteratorMethod(O);
  var i, length, result, step, iterator, next;
  if (iteratorMethod != undefined && !isArrayIteratorMethod(iteratorMethod)) {
    iterator = iteratorMethod.call(O);
    next = iterator.next;
    O = [];
    while (!(step = next.call(iterator)).done) {
      O.push(step.value);
    }
  }
  if (mapping && argumentsLength > 2) {
    mapfn = functionBindContext(mapfn, arguments[2], 2);
  }
  length = toLength(O.length);
  result = new (aTypedArrayConstructor$3(this))(length);
  for (i = 0; length > i; i++) {
    result[i] = mapping ? mapfn(O[i], i) : O[i];
  }
  return result;
};

// makes subclassing work correct for wrapped built-ins
var inheritIfRequired = function ($this, dummy, Wrapper) {
  var NewTarget, NewTargetPrototype;
  if (
    // it can work only with native `setPrototypeOf`
    objectSetPrototypeOf &&
    // we haven't completely correct pre-ES6 way for getting `new.target`, so use this
    typeof (NewTarget = dummy.constructor) == 'function' &&
    NewTarget !== Wrapper &&
    isObject(NewTargetPrototype = NewTarget.prototype) &&
    NewTargetPrototype !== Wrapper.prototype
  ) objectSetPrototypeOf($this, NewTargetPrototype);
  return $this;
};

var typedArrayConstructor = createCommonjsModule(function (module) {


















var getOwnPropertyNames = objectGetOwnPropertyNames.f;

var forEach = arrayIteration.forEach;






var getInternalState = internalState.get;
var setInternalState = internalState.set;
var nativeDefineProperty = objectDefineProperty.f;
var nativeGetOwnPropertyDescriptor = objectGetOwnPropertyDescriptor.f;
var round = Math.round;
var RangeError = global$1.RangeError;
var ArrayBuffer = arrayBuffer.ArrayBuffer;
var DataView = arrayBuffer.DataView;
var NATIVE_ARRAY_BUFFER_VIEWS = arrayBufferViewCore.NATIVE_ARRAY_BUFFER_VIEWS;
var TYPED_ARRAY_TAG = arrayBufferViewCore.TYPED_ARRAY_TAG;
var TypedArray = arrayBufferViewCore.TypedArray;
var TypedArrayPrototype = arrayBufferViewCore.TypedArrayPrototype;
var aTypedArrayConstructor = arrayBufferViewCore.aTypedArrayConstructor;
var isTypedArray = arrayBufferViewCore.isTypedArray;
var BYTES_PER_ELEMENT = 'BYTES_PER_ELEMENT';
var WRONG_LENGTH = 'Wrong length';

var fromList = function (C, list) {
  var index = 0;
  var length = list.length;
  var result = new (aTypedArrayConstructor(C))(length);
  while (length > index) result[index] = list[index++];
  return result;
};

var addGetter = function (it, key) {
  nativeDefineProperty(it, key, { get: function () {
    return getInternalState(this)[key];
  } });
};

var isArrayBuffer = function (it) {
  var klass;
  return it instanceof ArrayBuffer || (klass = classof(it)) == 'ArrayBuffer' || klass == 'SharedArrayBuffer';
};

var isTypedArrayIndex = function (target, key) {
  return isTypedArray(target)
    && typeof key != 'symbol'
    && key in target
    && String(+key) == String(key);
};

var wrappedGetOwnPropertyDescriptor = function getOwnPropertyDescriptor(target, key) {
  return isTypedArrayIndex(target, key = toPrimitive(key, true))
    ? createPropertyDescriptor(2, target[key])
    : nativeGetOwnPropertyDescriptor(target, key);
};

var wrappedDefineProperty = function defineProperty(target, key, descriptor) {
  if (isTypedArrayIndex(target, key = toPrimitive(key, true))
    && isObject(descriptor)
    && has$1(descriptor, 'value')
    && !has$1(descriptor, 'get')
    && !has$1(descriptor, 'set')
    // TODO: add validation descriptor w/o calling accessors
    && !descriptor.configurable
    && (!has$1(descriptor, 'writable') || descriptor.writable)
    && (!has$1(descriptor, 'enumerable') || descriptor.enumerable)
  ) {
    target[key] = descriptor.value;
    return target;
  } return nativeDefineProperty(target, key, descriptor);
};

if (descriptors) {
  if (!NATIVE_ARRAY_BUFFER_VIEWS) {
    objectGetOwnPropertyDescriptor.f = wrappedGetOwnPropertyDescriptor;
    objectDefineProperty.f = wrappedDefineProperty;
    addGetter(TypedArrayPrototype, 'buffer');
    addGetter(TypedArrayPrototype, 'byteOffset');
    addGetter(TypedArrayPrototype, 'byteLength');
    addGetter(TypedArrayPrototype, 'length');
  }

  _export({ target: 'Object', stat: true, forced: !NATIVE_ARRAY_BUFFER_VIEWS }, {
    getOwnPropertyDescriptor: wrappedGetOwnPropertyDescriptor,
    defineProperty: wrappedDefineProperty
  });

  module.exports = function (TYPE, wrapper, CLAMPED) {
    var BYTES = TYPE.match(/\d+$/)[0] / 8;
    var CONSTRUCTOR_NAME = TYPE + (CLAMPED ? 'Clamped' : '') + 'Array';
    var GETTER = 'get' + TYPE;
    var SETTER = 'set' + TYPE;
    var NativeTypedArrayConstructor = global$1[CONSTRUCTOR_NAME];
    var TypedArrayConstructor = NativeTypedArrayConstructor;
    var TypedArrayConstructorPrototype = TypedArrayConstructor && TypedArrayConstructor.prototype;
    var exported = {};

    var getter = function (that, index) {
      var data = getInternalState(that);
      return data.view[GETTER](index * BYTES + data.byteOffset, true);
    };

    var setter = function (that, index, value) {
      var data = getInternalState(that);
      if (CLAMPED) value = (value = round(value)) < 0 ? 0 : value > 0xFF ? 0xFF : value & 0xFF;
      data.view[SETTER](index * BYTES + data.byteOffset, value, true);
    };

    var addElement = function (that, index) {
      nativeDefineProperty(that, index, {
        get: function () {
          return getter(this, index);
        },
        set: function (value) {
          return setter(this, index, value);
        },
        enumerable: true
      });
    };

    if (!NATIVE_ARRAY_BUFFER_VIEWS) {
      TypedArrayConstructor = wrapper(function (that, data, offset, $length) {
        anInstance(that, TypedArrayConstructor, CONSTRUCTOR_NAME);
        var index = 0;
        var byteOffset = 0;
        var buffer, byteLength, length;
        if (!isObject(data)) {
          length = toIndex(data);
          byteLength = length * BYTES;
          buffer = new ArrayBuffer(byteLength);
        } else if (isArrayBuffer(data)) {
          buffer = data;
          byteOffset = toOffset(offset, BYTES);
          var $len = data.byteLength;
          if ($length === undefined) {
            if ($len % BYTES) throw RangeError(WRONG_LENGTH);
            byteLength = $len - byteOffset;
            if (byteLength < 0) throw RangeError(WRONG_LENGTH);
          } else {
            byteLength = toLength($length) * BYTES;
            if (byteLength + byteOffset > $len) throw RangeError(WRONG_LENGTH);
          }
          length = byteLength / BYTES;
        } else if (isTypedArray(data)) {
          return fromList(TypedArrayConstructor, data);
        } else {
          return typedArrayFrom.call(TypedArrayConstructor, data);
        }
        setInternalState(that, {
          buffer: buffer,
          byteOffset: byteOffset,
          byteLength: byteLength,
          length: length,
          view: new DataView(buffer)
        });
        while (index < length) addElement(that, index++);
      });

      if (objectSetPrototypeOf) objectSetPrototypeOf(TypedArrayConstructor, TypedArray);
      TypedArrayConstructorPrototype = TypedArrayConstructor.prototype = objectCreate(TypedArrayPrototype);
    } else if (typedArrayConstructorsRequireWrappers) {
      TypedArrayConstructor = wrapper(function (dummy, data, typedArrayOffset, $length) {
        anInstance(dummy, TypedArrayConstructor, CONSTRUCTOR_NAME);
        return inheritIfRequired(function () {
          if (!isObject(data)) return new NativeTypedArrayConstructor(toIndex(data));
          if (isArrayBuffer(data)) return $length !== undefined
            ? new NativeTypedArrayConstructor(data, toOffset(typedArrayOffset, BYTES), $length)
            : typedArrayOffset !== undefined
              ? new NativeTypedArrayConstructor(data, toOffset(typedArrayOffset, BYTES))
              : new NativeTypedArrayConstructor(data);
          if (isTypedArray(data)) return fromList(TypedArrayConstructor, data);
          return typedArrayFrom.call(TypedArrayConstructor, data);
        }(), dummy, TypedArrayConstructor);
      });

      if (objectSetPrototypeOf) objectSetPrototypeOf(TypedArrayConstructor, TypedArray);
      forEach(getOwnPropertyNames(NativeTypedArrayConstructor), function (key) {
        if (!(key in TypedArrayConstructor)) {
          createNonEnumerableProperty(TypedArrayConstructor, key, NativeTypedArrayConstructor[key]);
        }
      });
      TypedArrayConstructor.prototype = TypedArrayConstructorPrototype;
    }

    if (TypedArrayConstructorPrototype.constructor !== TypedArrayConstructor) {
      createNonEnumerableProperty(TypedArrayConstructorPrototype, 'constructor', TypedArrayConstructor);
    }

    if (TYPED_ARRAY_TAG) {
      createNonEnumerableProperty(TypedArrayConstructorPrototype, TYPED_ARRAY_TAG, CONSTRUCTOR_NAME);
    }

    exported[CONSTRUCTOR_NAME] = TypedArrayConstructor;

    _export({
      global: true, forced: TypedArrayConstructor != NativeTypedArrayConstructor, sham: !NATIVE_ARRAY_BUFFER_VIEWS
    }, exported);

    if (!(BYTES_PER_ELEMENT in TypedArrayConstructor)) {
      createNonEnumerableProperty(TypedArrayConstructor, BYTES_PER_ELEMENT, BYTES);
    }

    if (!(BYTES_PER_ELEMENT in TypedArrayConstructorPrototype)) {
      createNonEnumerableProperty(TypedArrayConstructorPrototype, BYTES_PER_ELEMENT, BYTES);
    }

    setSpecies(CONSTRUCTOR_NAME);
  };
} else module.exports = function () { /* empty */ };
});

// `Uint8Array` constructor
// https://tc39.es/ecma262/#sec-typedarray-objects
typedArrayConstructor('Uint8', function (init) {
  return function Uint8Array(data, byteOffset, length) {
    return init(this, data, byteOffset, length);
  };
});

var min$1 = Math.min;

// `Array.prototype.copyWithin` method implementation
// https://tc39.es/ecma262/#sec-array.prototype.copywithin
var arrayCopyWithin = [].copyWithin || function copyWithin(target /* = 0 */, start /* = 0, end = @length */) {
  var O = toObject(this);
  var len = toLength(O.length);
  var to = toAbsoluteIndex(target, len);
  var from = toAbsoluteIndex(start, len);
  var end = arguments.length > 2 ? arguments[2] : undefined;
  var count = min$1((end === undefined ? len : toAbsoluteIndex(end, len)) - from, len - to);
  var inc = 1;
  if (from < to && to < from + count) {
    inc = -1;
    from += count - 1;
    to += count - 1;
  }
  while (count-- > 0) {
    if (from in O) O[to] = O[from];
    else delete O[to];
    to += inc;
    from += inc;
  } return O;
};

var aTypedArray$l = arrayBufferViewCore.aTypedArray;
var exportTypedArrayMethod$m = arrayBufferViewCore.exportTypedArrayMethod;

// `%TypedArray%.prototype.copyWithin` method
// https://tc39.es/ecma262/#sec-%typedarray%.prototype.copywithin
exportTypedArrayMethod$m('copyWithin', function copyWithin(target, start /* , end */) {
  return arrayCopyWithin.call(aTypedArray$l(this), target, start, arguments.length > 2 ? arguments[2] : undefined);
});

var $every = arrayIteration.every;

var aTypedArray$k = arrayBufferViewCore.aTypedArray;
var exportTypedArrayMethod$l = arrayBufferViewCore.exportTypedArrayMethod;

// `%TypedArray%.prototype.every` method
// https://tc39.es/ecma262/#sec-%typedarray%.prototype.every
exportTypedArrayMethod$l('every', function every(callbackfn /* , thisArg */) {
  return $every(aTypedArray$k(this), callbackfn, arguments.length > 1 ? arguments[1] : undefined);
});

var aTypedArray$j = arrayBufferViewCore.aTypedArray;
var exportTypedArrayMethod$k = arrayBufferViewCore.exportTypedArrayMethod;

// `%TypedArray%.prototype.fill` method
// https://tc39.es/ecma262/#sec-%typedarray%.prototype.fill
// eslint-disable-next-line no-unused-vars -- required for `.length`
exportTypedArrayMethod$k('fill', function fill(value /* , start, end */) {
  return arrayFill.apply(aTypedArray$j(this), arguments);
});

var aTypedArrayConstructor$2 = arrayBufferViewCore.aTypedArrayConstructor;


var typedArrayFromSpeciesAndList = function (instance, list) {
  var C = speciesConstructor(instance, instance.constructor);
  var index = 0;
  var length = list.length;
  var result = new (aTypedArrayConstructor$2(C))(length);
  while (length > index) result[index] = list[index++];
  return result;
};

var $filter = arrayIteration.filter;


var aTypedArray$i = arrayBufferViewCore.aTypedArray;
var exportTypedArrayMethod$j = arrayBufferViewCore.exportTypedArrayMethod;

// `%TypedArray%.prototype.filter` method
// https://tc39.es/ecma262/#sec-%typedarray%.prototype.filter
exportTypedArrayMethod$j('filter', function filter(callbackfn /* , thisArg */) {
  var list = $filter(aTypedArray$i(this), callbackfn, arguments.length > 1 ? arguments[1] : undefined);
  return typedArrayFromSpeciesAndList(this, list);
});

var $find = arrayIteration.find;

var aTypedArray$h = arrayBufferViewCore.aTypedArray;
var exportTypedArrayMethod$i = arrayBufferViewCore.exportTypedArrayMethod;

// `%TypedArray%.prototype.find` method
// https://tc39.es/ecma262/#sec-%typedarray%.prototype.find
exportTypedArrayMethod$i('find', function find(predicate /* , thisArg */) {
  return $find(aTypedArray$h(this), predicate, arguments.length > 1 ? arguments[1] : undefined);
});

var $findIndex = arrayIteration.findIndex;

var aTypedArray$g = arrayBufferViewCore.aTypedArray;
var exportTypedArrayMethod$h = arrayBufferViewCore.exportTypedArrayMethod;

// `%TypedArray%.prototype.findIndex` method
// https://tc39.es/ecma262/#sec-%typedarray%.prototype.findindex
exportTypedArrayMethod$h('findIndex', function findIndex(predicate /* , thisArg */) {
  return $findIndex(aTypedArray$g(this), predicate, arguments.length > 1 ? arguments[1] : undefined);
});

var $forEach = arrayIteration.forEach;

var aTypedArray$f = arrayBufferViewCore.aTypedArray;
var exportTypedArrayMethod$g = arrayBufferViewCore.exportTypedArrayMethod;

// `%TypedArray%.prototype.forEach` method
// https://tc39.es/ecma262/#sec-%typedarray%.prototype.foreach
exportTypedArrayMethod$g('forEach', function forEach(callbackfn /* , thisArg */) {
  $forEach(aTypedArray$f(this), callbackfn, arguments.length > 1 ? arguments[1] : undefined);
});

var $includes = arrayIncludes.includes;

var aTypedArray$e = arrayBufferViewCore.aTypedArray;
var exportTypedArrayMethod$f = arrayBufferViewCore.exportTypedArrayMethod;

// `%TypedArray%.prototype.includes` method
// https://tc39.es/ecma262/#sec-%typedarray%.prototype.includes
exportTypedArrayMethod$f('includes', function includes(searchElement /* , fromIndex */) {
  return $includes(aTypedArray$e(this), searchElement, arguments.length > 1 ? arguments[1] : undefined);
});

var $indexOf = arrayIncludes.indexOf;

var aTypedArray$d = arrayBufferViewCore.aTypedArray;
var exportTypedArrayMethod$e = arrayBufferViewCore.exportTypedArrayMethod;

// `%TypedArray%.prototype.indexOf` method
// https://tc39.es/ecma262/#sec-%typedarray%.prototype.indexof
exportTypedArrayMethod$e('indexOf', function indexOf(searchElement /* , fromIndex */) {
  return $indexOf(aTypedArray$d(this), searchElement, arguments.length > 1 ? arguments[1] : undefined);
});

var ITERATOR = wellKnownSymbol('iterator');
var Uint8Array$2 = global$1.Uint8Array;
var arrayValues = es_array_iterator.values;
var arrayKeys = es_array_iterator.keys;
var arrayEntries = es_array_iterator.entries;
var aTypedArray$c = arrayBufferViewCore.aTypedArray;
var exportTypedArrayMethod$d = arrayBufferViewCore.exportTypedArrayMethod;
var nativeTypedArrayIterator = Uint8Array$2 && Uint8Array$2.prototype[ITERATOR];

var CORRECT_ITER_NAME = !!nativeTypedArrayIterator
  && (nativeTypedArrayIterator.name == 'values' || nativeTypedArrayIterator.name == undefined);

var typedArrayValues = function values() {
  return arrayValues.call(aTypedArray$c(this));
};

// `%TypedArray%.prototype.entries` method
// https://tc39.es/ecma262/#sec-%typedarray%.prototype.entries
exportTypedArrayMethod$d('entries', function entries() {
  return arrayEntries.call(aTypedArray$c(this));
});
// `%TypedArray%.prototype.keys` method
// https://tc39.es/ecma262/#sec-%typedarray%.prototype.keys
exportTypedArrayMethod$d('keys', function keys() {
  return arrayKeys.call(aTypedArray$c(this));
});
// `%TypedArray%.prototype.values` method
// https://tc39.es/ecma262/#sec-%typedarray%.prototype.values
exportTypedArrayMethod$d('values', typedArrayValues, !CORRECT_ITER_NAME);
// `%TypedArray%.prototype[@@iterator]` method
// https://tc39.es/ecma262/#sec-%typedarray%.prototype-@@iterator
exportTypedArrayMethod$d(ITERATOR, typedArrayValues, !CORRECT_ITER_NAME);

var aTypedArray$b = arrayBufferViewCore.aTypedArray;
var exportTypedArrayMethod$c = arrayBufferViewCore.exportTypedArrayMethod;
var $join = [].join;

// `%TypedArray%.prototype.join` method
// https://tc39.es/ecma262/#sec-%typedarray%.prototype.join
// eslint-disable-next-line no-unused-vars -- required for `.length`
exportTypedArrayMethod$c('join', function join(separator) {
  return $join.apply(aTypedArray$b(this), arguments);
});

var min = Math.min;
var nativeLastIndexOf = [].lastIndexOf;
var NEGATIVE_ZERO = !!nativeLastIndexOf && 1 / [1].lastIndexOf(1, -0) < 0;
var STRICT_METHOD = arrayMethodIsStrict('lastIndexOf');
var FORCED$3 = NEGATIVE_ZERO || !STRICT_METHOD;

// `Array.prototype.lastIndexOf` method implementation
// https://tc39.es/ecma262/#sec-array.prototype.lastindexof
var arrayLastIndexOf = FORCED$3 ? function lastIndexOf(searchElement /* , fromIndex = @[*-1] */) {
  // convert -0 to +0
  if (NEGATIVE_ZERO) return nativeLastIndexOf.apply(this, arguments) || 0;
  var O = toIndexedObject(this);
  var length = toLength(O.length);
  var index = length - 1;
  if (arguments.length > 1) index = min(index, toInteger(arguments[1]));
  if (index < 0) index = length + index;
  for (;index >= 0; index--) if (index in O && O[index] === searchElement) return index || 0;
  return -1;
} : nativeLastIndexOf;

var aTypedArray$a = arrayBufferViewCore.aTypedArray;
var exportTypedArrayMethod$b = arrayBufferViewCore.exportTypedArrayMethod;

// `%TypedArray%.prototype.lastIndexOf` method
// https://tc39.es/ecma262/#sec-%typedarray%.prototype.lastindexof
// eslint-disable-next-line no-unused-vars -- required for `.length`
exportTypedArrayMethod$b('lastIndexOf', function lastIndexOf(searchElement /* , fromIndex */) {
  return arrayLastIndexOf.apply(aTypedArray$a(this), arguments);
});

var $map = arrayIteration.map;


var aTypedArray$9 = arrayBufferViewCore.aTypedArray;
var aTypedArrayConstructor$1 = arrayBufferViewCore.aTypedArrayConstructor;
var exportTypedArrayMethod$a = arrayBufferViewCore.exportTypedArrayMethod;

// `%TypedArray%.prototype.map` method
// https://tc39.es/ecma262/#sec-%typedarray%.prototype.map
exportTypedArrayMethod$a('map', function map(mapfn /* , thisArg */) {
  return $map(aTypedArray$9(this), mapfn, arguments.length > 1 ? arguments[1] : undefined, function (O, length) {
    return new (aTypedArrayConstructor$1(speciesConstructor(O, O.constructor)))(length);
  });
});

var $reduce = arrayReduce.left;

var aTypedArray$8 = arrayBufferViewCore.aTypedArray;
var exportTypedArrayMethod$9 = arrayBufferViewCore.exportTypedArrayMethod;

// `%TypedArray%.prototype.reduce` method
// https://tc39.es/ecma262/#sec-%typedarray%.prototype.reduce
exportTypedArrayMethod$9('reduce', function reduce(callbackfn /* , initialValue */) {
  return $reduce(aTypedArray$8(this), callbackfn, arguments.length, arguments.length > 1 ? arguments[1] : undefined);
});

var $reduceRight = arrayReduce.right;

var aTypedArray$7 = arrayBufferViewCore.aTypedArray;
var exportTypedArrayMethod$8 = arrayBufferViewCore.exportTypedArrayMethod;

// `%TypedArray%.prototype.reduceRicht` method
// https://tc39.es/ecma262/#sec-%typedarray%.prototype.reduceright
exportTypedArrayMethod$8('reduceRight', function reduceRight(callbackfn /* , initialValue */) {
  return $reduceRight(aTypedArray$7(this), callbackfn, arguments.length, arguments.length > 1 ? arguments[1] : undefined);
});

var aTypedArray$6 = arrayBufferViewCore.aTypedArray;
var exportTypedArrayMethod$7 = arrayBufferViewCore.exportTypedArrayMethod;
var floor = Math.floor;

// `%TypedArray%.prototype.reverse` method
// https://tc39.es/ecma262/#sec-%typedarray%.prototype.reverse
exportTypedArrayMethod$7('reverse', function reverse() {
  var that = this;
  var length = aTypedArray$6(that).length;
  var middle = floor(length / 2);
  var index = 0;
  var value;
  while (index < middle) {
    value = that[index];
    that[index++] = that[--length];
    that[length] = value;
  } return that;
});

var aTypedArray$5 = arrayBufferViewCore.aTypedArray;
var exportTypedArrayMethod$6 = arrayBufferViewCore.exportTypedArrayMethod;

var FORCED$2 = fails(function () {
  /* global Int8Array -- safe */
  new Int8Array(1).set({});
});

// `%TypedArray%.prototype.set` method
// https://tc39.es/ecma262/#sec-%typedarray%.prototype.set
exportTypedArrayMethod$6('set', function set(arrayLike /* , offset */) {
  aTypedArray$5(this);
  var offset = toOffset(arguments.length > 1 ? arguments[1] : undefined, 1);
  var length = this.length;
  var src = toObject(arrayLike);
  var len = toLength(src.length);
  var index = 0;
  if (len + offset > length) throw RangeError('Wrong length');
  while (index < len) this[offset + index] = src[index++];
}, FORCED$2);

var aTypedArray$4 = arrayBufferViewCore.aTypedArray;
var aTypedArrayConstructor = arrayBufferViewCore.aTypedArrayConstructor;
var exportTypedArrayMethod$5 = arrayBufferViewCore.exportTypedArrayMethod;
var $slice$1 = [].slice;

var FORCED$1 = fails(function () {
  /* global Int8Array -- safe */
  new Int8Array(1).slice();
});

// `%TypedArray%.prototype.slice` method
// https://tc39.es/ecma262/#sec-%typedarray%.prototype.slice
exportTypedArrayMethod$5('slice', function slice(start, end) {
  var list = $slice$1.call(aTypedArray$4(this), start, end);
  var C = speciesConstructor(this, this.constructor);
  var index = 0;
  var length = list.length;
  var result = new (aTypedArrayConstructor(C))(length);
  while (length > index) result[index] = list[index++];
  return result;
}, FORCED$1);

var $some = arrayIteration.some;

var aTypedArray$3 = arrayBufferViewCore.aTypedArray;
var exportTypedArrayMethod$4 = arrayBufferViewCore.exportTypedArrayMethod;

// `%TypedArray%.prototype.some` method
// https://tc39.es/ecma262/#sec-%typedarray%.prototype.some
exportTypedArrayMethod$4('some', function some(callbackfn /* , thisArg */) {
  return $some(aTypedArray$3(this), callbackfn, arguments.length > 1 ? arguments[1] : undefined);
});

var aTypedArray$2 = arrayBufferViewCore.aTypedArray;
var exportTypedArrayMethod$3 = arrayBufferViewCore.exportTypedArrayMethod;
var $sort = [].sort;

// `%TypedArray%.prototype.sort` method
// https://tc39.es/ecma262/#sec-%typedarray%.prototype.sort
exportTypedArrayMethod$3('sort', function sort(comparefn) {
  return $sort.call(aTypedArray$2(this), comparefn);
});

var aTypedArray$1 = arrayBufferViewCore.aTypedArray;
var exportTypedArrayMethod$2 = arrayBufferViewCore.exportTypedArrayMethod;

// `%TypedArray%.prototype.subarray` method
// https://tc39.es/ecma262/#sec-%typedarray%.prototype.subarray
exportTypedArrayMethod$2('subarray', function subarray(begin, end) {
  var O = aTypedArray$1(this);
  var length = O.length;
  var beginIndex = toAbsoluteIndex(begin, length);
  return new (speciesConstructor(O, O.constructor))(
    O.buffer,
    O.byteOffset + beginIndex * O.BYTES_PER_ELEMENT,
    toLength((end === undefined ? length : toAbsoluteIndex(end, length)) - beginIndex)
  );
});

var Int8Array$1 = global$1.Int8Array;
var aTypedArray = arrayBufferViewCore.aTypedArray;
var exportTypedArrayMethod$1 = arrayBufferViewCore.exportTypedArrayMethod;
var $toLocaleString = [].toLocaleString;
var $slice = [].slice;

// iOS Safari 6.x fails here
var TO_LOCALE_STRING_BUG = !!Int8Array$1 && fails(function () {
  $toLocaleString.call(new Int8Array$1(1));
});

var FORCED = fails(function () {
  return [1, 2].toLocaleString() != new Int8Array$1([1, 2]).toLocaleString();
}) || !fails(function () {
  Int8Array$1.prototype.toLocaleString.call([1, 2]);
});

// `%TypedArray%.prototype.toLocaleString` method
// https://tc39.es/ecma262/#sec-%typedarray%.prototype.tolocalestring
exportTypedArrayMethod$1('toLocaleString', function toLocaleString() {
  return $toLocaleString.apply(TO_LOCALE_STRING_BUG ? $slice.call(aTypedArray(this)) : aTypedArray(this), arguments);
}, FORCED);

var exportTypedArrayMethod = arrayBufferViewCore.exportTypedArrayMethod;



var Uint8Array$1 = global$1.Uint8Array;
var Uint8ArrayPrototype = Uint8Array$1 && Uint8Array$1.prototype || {};
var arrayToString = [].toString;
var arrayJoin = [].join;

if (fails(function () { arrayToString.call({}); })) {
  arrayToString = function toString() {
    return arrayJoin.call(this);
  };
}

var IS_NOT_ARRAY_METHOD = Uint8ArrayPrototype.toString != arrayToString;

// `%TypedArray%.prototype.toString` method
// https://tc39.es/ecma262/#sec-%typedarray%.prototype.tostring
exportTypedArrayMethod('toString', arrayToString, IS_NOT_ARRAY_METHOD);

/*! ieee754. BSD-3-Clause License. Feross Aboukhadijeh <https://feross.org/opensource> */
var read = function read(buffer, offset, isLE, mLen, nBytes) {
  var e, m;
  var eLen = nBytes * 8 - mLen - 1;
  var eMax = (1 << eLen) - 1;
  var eBias = eMax >> 1;
  var nBits = -7;
  var i = isLE ? nBytes - 1 : 0;
  var d = isLE ? -1 : 1;
  var s = buffer[offset + i];
  i += d;
  e = s & (1 << -nBits) - 1;
  s >>= -nBits;
  nBits += eLen;

  for (; nBits > 0; e = e * 256 + buffer[offset + i], i += d, nBits -= 8) {}

  m = e & (1 << -nBits) - 1;
  e >>= -nBits;
  nBits += mLen;

  for (; nBits > 0; m = m * 256 + buffer[offset + i], i += d, nBits -= 8) {}

  if (e === 0) {
    e = 1 - eBias;
  } else if (e === eMax) {
    return m ? NaN : (s ? -1 : 1) * Infinity;
  } else {
    m = m + Math.pow(2, mLen);
    e = e - eBias;
  }

  return (s ? -1 : 1) * m * Math.pow(2, e - mLen);
};

var write = function write(buffer, value, offset, isLE, mLen, nBytes) {
  var e, m, c;
  var eLen = nBytes * 8 - mLen - 1;
  var eMax = (1 << eLen) - 1;
  var eBias = eMax >> 1;
  var rt = mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0;
  var i = isLE ? 0 : nBytes - 1;
  var d = isLE ? 1 : -1;
  var s = value < 0 || value === 0 && 1 / value < 0 ? 1 : 0;
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
      m = (value * c - 1) * Math.pow(2, mLen);
      e = e + eBias;
    } else {
      m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen);
      e = 0;
    }
  }

  for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8) {}

  e = e << mLen | m;
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

Pbf.Varint = 0; // varint: int32, int64, uint32, uint64, sint32, sint64, bool, enum

Pbf.Fixed64 = 1; // 64-bit: double, fixed64, sfixed64

Pbf.Bytes = 2; // length-delimited: string, bytes, embedded messages, packed repeated fields

Pbf.Fixed32 = 5; // 32-bit: float, fixed32, sfixed32

var SHIFT_LEFT_32 = (1 << 16) * (1 << 16),
    SHIFT_RIGHT_32 = 1 / SHIFT_LEFT_32; // Threshold chosen based on both benchmarking and knowledge about browser string
// data structures (which currently switch structure types at 12 bytes or more)

var TEXT_DECODER_MIN_LENGTH = 12;
var utf8TextDecoder = typeof TextDecoder === 'undefined' ? null : new TextDecoder('utf8');
Pbf.prototype = {
  destroy: function destroy() {
    this.buf = null;
  },
  // === READING =================================================================
  readFields: function readFields(readField, result, end) {
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
  readMessage: function readMessage(readField, result) {
    return this.readFields(readField, result, this.readVarint() + this.pos);
  },
  readFixed32: function readFixed32() {
    var val = readUInt32(this.buf, this.pos);
    this.pos += 4;
    return val;
  },
  readSFixed32: function readSFixed32() {
    var val = readInt32(this.buf, this.pos);
    this.pos += 4;
    return val;
  },
  // 64-bit int handling is based on github.com/dpw/node-buffer-more-ints (MIT-licensed)
  readFixed64: function readFixed64() {
    var val = readUInt32(this.buf, this.pos) + readUInt32(this.buf, this.pos + 4) * SHIFT_LEFT_32;
    this.pos += 8;
    return val;
  },
  readSFixed64: function readSFixed64() {
    var val = readUInt32(this.buf, this.pos) + readInt32(this.buf, this.pos + 4) * SHIFT_LEFT_32;
    this.pos += 8;
    return val;
  },
  readFloat: function readFloat() {
    var val = ieee754.read(this.buf, this.pos, true, 23, 4);
    this.pos += 4;
    return val;
  },
  readDouble: function readDouble() {
    var val = ieee754.read(this.buf, this.pos, true, 52, 8);
    this.pos += 8;
    return val;
  },
  readVarint: function readVarint(isSigned) {
    var buf = this.buf,
        val,
        b;
    b = buf[this.pos++];
    val = b & 0x7f;
    if (b < 0x80) return val;
    b = buf[this.pos++];
    val |= (b & 0x7f) << 7;
    if (b < 0x80) return val;
    b = buf[this.pos++];
    val |= (b & 0x7f) << 14;
    if (b < 0x80) return val;
    b = buf[this.pos++];
    val |= (b & 0x7f) << 21;
    if (b < 0x80) return val;
    b = buf[this.pos];
    val |= (b & 0x0f) << 28;
    return readVarintRemainder(val, isSigned, this);
  },
  readVarint64: function readVarint64() {
    // for compatibility with v2.0.1
    return this.readVarint(true);
  },
  readSVarint: function readSVarint() {
    var num = this.readVarint();
    return num % 2 === 1 ? (num + 1) / -2 : num / 2; // zigzag encoding
  },
  readBoolean: function readBoolean() {
    return Boolean(this.readVarint());
  },
  readString: function readString() {
    var end = this.readVarint() + this.pos;
    var pos = this.pos;
    this.pos = end;

    if (end - pos >= TEXT_DECODER_MIN_LENGTH && utf8TextDecoder) {
      // longer strings are fast with the built-in browser TextDecoder API
      return readUtf8TextDecoder(this.buf, pos, end);
    } // short strings are fast with our custom implementation


    return readUtf8(this.buf, pos, end);
  },
  readBytes: function readBytes() {
    var end = this.readVarint() + this.pos,
        buffer = this.buf.subarray(this.pos, end);
    this.pos = end;
    return buffer;
  },
  // verbose for performance reasons; doesn't affect gzipped size
  readPackedVarint: function readPackedVarint(arr, isSigned) {
    if (this.type !== Pbf.Bytes) return arr.push(this.readVarint(isSigned));
    var end = readPackedEnd(this);
    arr = arr || [];

    while (this.pos < end) {
      arr.push(this.readVarint(isSigned));
    }

    return arr;
  },
  readPackedSVarint: function readPackedSVarint(arr) {
    if (this.type !== Pbf.Bytes) return arr.push(this.readSVarint());
    var end = readPackedEnd(this);
    arr = arr || [];

    while (this.pos < end) {
      arr.push(this.readSVarint());
    }

    return arr;
  },
  readPackedBoolean: function readPackedBoolean(arr) {
    if (this.type !== Pbf.Bytes) return arr.push(this.readBoolean());
    var end = readPackedEnd(this);
    arr = arr || [];

    while (this.pos < end) {
      arr.push(this.readBoolean());
    }

    return arr;
  },
  readPackedFloat: function readPackedFloat(arr) {
    if (this.type !== Pbf.Bytes) return arr.push(this.readFloat());
    var end = readPackedEnd(this);
    arr = arr || [];

    while (this.pos < end) {
      arr.push(this.readFloat());
    }

    return arr;
  },
  readPackedDouble: function readPackedDouble(arr) {
    if (this.type !== Pbf.Bytes) return arr.push(this.readDouble());
    var end = readPackedEnd(this);
    arr = arr || [];

    while (this.pos < end) {
      arr.push(this.readDouble());
    }

    return arr;
  },
  readPackedFixed32: function readPackedFixed32(arr) {
    if (this.type !== Pbf.Bytes) return arr.push(this.readFixed32());
    var end = readPackedEnd(this);
    arr = arr || [];

    while (this.pos < end) {
      arr.push(this.readFixed32());
    }

    return arr;
  },
  readPackedSFixed32: function readPackedSFixed32(arr) {
    if (this.type !== Pbf.Bytes) return arr.push(this.readSFixed32());
    var end = readPackedEnd(this);
    arr = arr || [];

    while (this.pos < end) {
      arr.push(this.readSFixed32());
    }

    return arr;
  },
  readPackedFixed64: function readPackedFixed64(arr) {
    if (this.type !== Pbf.Bytes) return arr.push(this.readFixed64());
    var end = readPackedEnd(this);
    arr = arr || [];

    while (this.pos < end) {
      arr.push(this.readFixed64());
    }

    return arr;
  },
  readPackedSFixed64: function readPackedSFixed64(arr) {
    if (this.type !== Pbf.Bytes) return arr.push(this.readSFixed64());
    var end = readPackedEnd(this);
    arr = arr || [];

    while (this.pos < end) {
      arr.push(this.readSFixed64());
    }

    return arr;
  },
  skip: function skip(val) {
    var type = val & 0x7;
    if (type === Pbf.Varint) while (this.buf[this.pos++] > 0x7f) {} else if (type === Pbf.Bytes) this.pos = this.readVarint() + this.pos;else if (type === Pbf.Fixed32) this.pos += 4;else if (type === Pbf.Fixed64) this.pos += 8;else throw new Error('Unimplemented type: ' + type);
  },
  // === WRITING =================================================================
  writeTag: function writeTag(tag, type) {
    this.writeVarint(tag << 3 | type);
  },
  realloc: function realloc(min) {
    var length = this.length || 16;

    while (length < this.pos + min) {
      length *= 2;
    }

    if (length !== this.length) {
      var buf = new Uint8Array(length);
      buf.set(this.buf);
      this.buf = buf;
      this.length = length;
    }
  },
  finish: function finish() {
    this.length = this.pos;
    this.pos = 0;
    return this.buf.subarray(0, this.length);
  },
  writeFixed32: function writeFixed32(val) {
    this.realloc(4);
    writeInt32(this.buf, val, this.pos);
    this.pos += 4;
  },
  writeSFixed32: function writeSFixed32(val) {
    this.realloc(4);
    writeInt32(this.buf, val, this.pos);
    this.pos += 4;
  },
  writeFixed64: function writeFixed64(val) {
    this.realloc(8);
    writeInt32(this.buf, val & -1, this.pos);
    writeInt32(this.buf, Math.floor(val * SHIFT_RIGHT_32), this.pos + 4);
    this.pos += 8;
  },
  writeSFixed64: function writeSFixed64(val) {
    this.realloc(8);
    writeInt32(this.buf, val & -1, this.pos);
    writeInt32(this.buf, Math.floor(val * SHIFT_RIGHT_32), this.pos + 4);
    this.pos += 8;
  },
  writeVarint: function writeVarint(val) {
    val = +val || 0;

    if (val > 0xfffffff || val < 0) {
      writeBigVarint(val, this);
      return;
    }

    this.realloc(4);
    this.buf[this.pos++] = val & 0x7f | (val > 0x7f ? 0x80 : 0);
    if (val <= 0x7f) return;
    this.buf[this.pos++] = (val >>>= 7) & 0x7f | (val > 0x7f ? 0x80 : 0);
    if (val <= 0x7f) return;
    this.buf[this.pos++] = (val >>>= 7) & 0x7f | (val > 0x7f ? 0x80 : 0);
    if (val <= 0x7f) return;
    this.buf[this.pos++] = val >>> 7 & 0x7f;
  },
  writeSVarint: function writeSVarint(val) {
    this.writeVarint(val < 0 ? -val * 2 - 1 : val * 2);
  },
  writeBoolean: function writeBoolean(val) {
    this.writeVarint(Boolean(val));
  },
  writeString: function writeString(str) {
    str = String(str);
    this.realloc(str.length * 4);
    this.pos++; // reserve 1 byte for short string length

    var startPos = this.pos; // write the string directly to the buffer and see how much was written

    this.pos = writeUtf8(this.buf, str, this.pos);
    var len = this.pos - startPos;
    if (len >= 0x80) makeRoomForExtraLength(startPos, len, this); // finally, write the message length in the reserved place and restore the position

    this.pos = startPos - 1;
    this.writeVarint(len);
    this.pos += len;
  },
  writeFloat: function writeFloat(val) {
    this.realloc(4);
    ieee754.write(this.buf, val, this.pos, true, 23, 4);
    this.pos += 4;
  },
  writeDouble: function writeDouble(val) {
    this.realloc(8);
    ieee754.write(this.buf, val, this.pos, true, 52, 8);
    this.pos += 8;
  },
  writeBytes: function writeBytes(buffer) {
    var len = buffer.length;
    this.writeVarint(len);
    this.realloc(len);

    for (var i = 0; i < len; i++) {
      this.buf[this.pos++] = buffer[i];
    }
  },
  writeRawMessage: function writeRawMessage(fn, obj) {
    this.pos++; // reserve 1 byte for short message length
    // write the message directly to the buffer and see how much was written

    var startPos = this.pos;
    fn(obj, this);
    var len = this.pos - startPos;
    if (len >= 0x80) makeRoomForExtraLength(startPos, len, this); // finally, write the message length in the reserved place and restore the position

    this.pos = startPos - 1;
    this.writeVarint(len);
    this.pos += len;
  },
  writeMessage: function writeMessage(tag, fn, obj) {
    this.writeTag(tag, Pbf.Bytes);
    this.writeRawMessage(fn, obj);
  },
  writePackedVarint: function writePackedVarint(tag, arr) {
    if (arr.length) this.writeMessage(tag, _writePackedVarint, arr);
  },
  writePackedSVarint: function writePackedSVarint(tag, arr) {
    if (arr.length) this.writeMessage(tag, _writePackedSVarint, arr);
  },
  writePackedBoolean: function writePackedBoolean(tag, arr) {
    if (arr.length) this.writeMessage(tag, _writePackedBoolean, arr);
  },
  writePackedFloat: function writePackedFloat(tag, arr) {
    if (arr.length) this.writeMessage(tag, _writePackedFloat, arr);
  },
  writePackedDouble: function writePackedDouble(tag, arr) {
    if (arr.length) this.writeMessage(tag, _writePackedDouble, arr);
  },
  writePackedFixed32: function writePackedFixed32(tag, arr) {
    if (arr.length) this.writeMessage(tag, _writePackedFixed, arr);
  },
  writePackedSFixed32: function writePackedSFixed32(tag, arr) {
    if (arr.length) this.writeMessage(tag, _writePackedSFixed, arr);
  },
  writePackedFixed64: function writePackedFixed64(tag, arr) {
    if (arr.length) this.writeMessage(tag, _writePackedFixed2, arr);
  },
  writePackedSFixed64: function writePackedSFixed64(tag, arr) {
    if (arr.length) this.writeMessage(tag, _writePackedSFixed2, arr);
  },
  writeBytesField: function writeBytesField(tag, buffer) {
    this.writeTag(tag, Pbf.Bytes);
    this.writeBytes(buffer);
  },
  writeFixed32Field: function writeFixed32Field(tag, val) {
    this.writeTag(tag, Pbf.Fixed32);
    this.writeFixed32(val);
  },
  writeSFixed32Field: function writeSFixed32Field(tag, val) {
    this.writeTag(tag, Pbf.Fixed32);
    this.writeSFixed32(val);
  },
  writeFixed64Field: function writeFixed64Field(tag, val) {
    this.writeTag(tag, Pbf.Fixed64);
    this.writeFixed64(val);
  },
  writeSFixed64Field: function writeSFixed64Field(tag, val) {
    this.writeTag(tag, Pbf.Fixed64);
    this.writeSFixed64(val);
  },
  writeVarintField: function writeVarintField(tag, val) {
    this.writeTag(tag, Pbf.Varint);
    this.writeVarint(val);
  },
  writeSVarintField: function writeSVarintField(tag, val) {
    this.writeTag(tag, Pbf.Varint);
    this.writeSVarint(val);
  },
  writeStringField: function writeStringField(tag, str) {
    this.writeTag(tag, Pbf.Bytes);
    this.writeString(str);
  },
  writeFloatField: function writeFloatField(tag, val) {
    this.writeTag(tag, Pbf.Fixed32);
    this.writeFloat(val);
  },
  writeDoubleField: function writeDoubleField(tag, val) {
    this.writeTag(tag, Pbf.Fixed64);
    this.writeDouble(val);
  },
  writeBooleanField: function writeBooleanField(tag, val) {
    this.writeVarintField(tag, Boolean(val));
  }
};

function readVarintRemainder(l, s, p) {
  var buf = p.buf,
      h,
      b;
  b = buf[p.pos++];
  h = (b & 0x70) >> 4;
  if (b < 0x80) return toNum(l, h, s);
  b = buf[p.pos++];
  h |= (b & 0x7f) << 3;
  if (b < 0x80) return toNum(l, h, s);
  b = buf[p.pos++];
  h |= (b & 0x7f) << 10;
  if (b < 0x80) return toNum(l, h, s);
  b = buf[p.pos++];
  h |= (b & 0x7f) << 17;
  if (b < 0x80) return toNum(l, h, s);
  b = buf[p.pos++];
  h |= (b & 0x7f) << 24;
  if (b < 0x80) return toNum(l, h, s);
  b = buf[p.pos++];
  h |= (b & 0x01) << 31;
  if (b < 0x80) return toNum(l, h, s);
  throw new Error('Expected varint not more than 10 bytes');
}

function readPackedEnd(pbf) {
  return pbf.type === Pbf.Bytes ? pbf.readVarint() + pbf.pos : pbf.pos + 1;
}

function toNum(low, high, isSigned) {
  if (isSigned) {
    return high * 0x100000000 + (low >>> 0);
  }

  return (high >>> 0) * 0x100000000 + (low >>> 0);
}

function writeBigVarint(val, pbf) {
  var low, high;

  if (val >= 0) {
    low = val % 0x100000000 | 0;
    high = val / 0x100000000 | 0;
  } else {
    low = ~(-val % 0x100000000);
    high = ~(-val / 0x100000000);

    if (low ^ 0xffffffff) {
      low = low + 1 | 0;
    } else {
      low = 0;
      high = high + 1 | 0;
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
  pbf.buf[pbf.pos++] = low & 0x7f | 0x80;
  low >>>= 7;
  pbf.buf[pbf.pos++] = low & 0x7f | 0x80;
  low >>>= 7;
  pbf.buf[pbf.pos++] = low & 0x7f | 0x80;
  low >>>= 7;
  pbf.buf[pbf.pos++] = low & 0x7f | 0x80;
  low >>>= 7;
  pbf.buf[pbf.pos] = low & 0x7f;
}

function writeBigVarintHigh(high, pbf) {
  var lsb = (high & 0x07) << 4;
  pbf.buf[pbf.pos++] |= lsb | ((high >>>= 3) ? 0x80 : 0);
  if (!high) return;
  pbf.buf[pbf.pos++] = high & 0x7f | ((high >>>= 7) ? 0x80 : 0);
  if (!high) return;
  pbf.buf[pbf.pos++] = high & 0x7f | ((high >>>= 7) ? 0x80 : 0);
  if (!high) return;
  pbf.buf[pbf.pos++] = high & 0x7f | ((high >>>= 7) ? 0x80 : 0);
  if (!high) return;
  pbf.buf[pbf.pos++] = high & 0x7f | ((high >>>= 7) ? 0x80 : 0);
  if (!high) return;
  pbf.buf[pbf.pos++] = high & 0x7f;
}

function makeRoomForExtraLength(startPos, len, pbf) {
  var extraLen = len <= 0x3fff ? 1 : len <= 0x1fffff ? 2 : len <= 0xfffffff ? 3 : Math.floor(Math.log(len) / (Math.LN2 * 7)); // if 1 byte isn't enough for encoding message length, shift the data to the right

  pbf.realloc(extraLen);

  for (var i = pbf.pos - 1; i >= startPos; i--) {
    pbf.buf[i + extraLen] = pbf.buf[i];
  }
}

function _writePackedVarint(arr, pbf) {
  for (var i = 0; i < arr.length; i++) {
    pbf.writeVarint(arr[i]);
  }
}

function _writePackedSVarint(arr, pbf) {
  for (var i = 0; i < arr.length; i++) {
    pbf.writeSVarint(arr[i]);
  }
}

function _writePackedFloat(arr, pbf) {
  for (var i = 0; i < arr.length; i++) {
    pbf.writeFloat(arr[i]);
  }
}

function _writePackedDouble(arr, pbf) {
  for (var i = 0; i < arr.length; i++) {
    pbf.writeDouble(arr[i]);
  }
}

function _writePackedBoolean(arr, pbf) {
  for (var i = 0; i < arr.length; i++) {
    pbf.writeBoolean(arr[i]);
  }
}

function _writePackedFixed(arr, pbf) {
  for (var i = 0; i < arr.length; i++) {
    pbf.writeFixed32(arr[i]);
  }
}

function _writePackedSFixed(arr, pbf) {
  for (var i = 0; i < arr.length; i++) {
    pbf.writeSFixed32(arr[i]);
  }
}

function _writePackedFixed2(arr, pbf) {
  for (var i = 0; i < arr.length; i++) {
    pbf.writeFixed64(arr[i]);
  }
}

function _writePackedSFixed2(arr, pbf) {
  for (var i = 0; i < arr.length; i++) {
    pbf.writeSFixed64(arr[i]);
  }
} // Buffer code below from https://github.com/feross/buffer, MIT-licensed


function readUInt32(buf, pos) {
  return (buf[pos] | buf[pos + 1] << 8 | buf[pos + 2] << 16) + buf[pos + 3] * 0x1000000;
}

function writeInt32(buf, val, pos) {
  buf[pos] = val;
  buf[pos + 1] = val >>> 8;
  buf[pos + 2] = val >>> 16;
  buf[pos + 3] = val >>> 24;
}

function readInt32(buf, pos) {
  return (buf[pos] | buf[pos + 1] << 8 | buf[pos + 2] << 16) + (buf[pos + 3] << 24);
}

function readUtf8(buf, pos, end) {
  var str = '';
  var i = pos;

  while (i < end) {
    var b0 = buf[i];
    var c = null; // codepoint

    var bytesPerSequence = b0 > 0xEF ? 4 : b0 > 0xDF ? 3 : b0 > 0xBF ? 2 : 1;
    if (i + bytesPerSequence > end) break;
    var b1, b2, b3;

    if (bytesPerSequence === 1) {
      if (b0 < 0x80) {
        c = b0;
      }
    } else if (bytesPerSequence === 2) {
      b1 = buf[i + 1];

      if ((b1 & 0xC0) === 0x80) {
        c = (b0 & 0x1F) << 0x6 | b1 & 0x3F;

        if (c <= 0x7F) {
          c = null;
        }
      }
    } else if (bytesPerSequence === 3) {
      b1 = buf[i + 1];
      b2 = buf[i + 2];

      if ((b1 & 0xC0) === 0x80 && (b2 & 0xC0) === 0x80) {
        c = (b0 & 0xF) << 0xC | (b1 & 0x3F) << 0x6 | b2 & 0x3F;

        if (c <= 0x7FF || c >= 0xD800 && c <= 0xDFFF) {
          c = null;
        }
      }
    } else if (bytesPerSequence === 4) {
      b1 = buf[i + 1];
      b2 = buf[i + 2];
      b3 = buf[i + 3];

      if ((b1 & 0xC0) === 0x80 && (b2 & 0xC0) === 0x80 && (b3 & 0xC0) === 0x80) {
        c = (b0 & 0xF) << 0x12 | (b1 & 0x3F) << 0xC | (b2 & 0x3F) << 0x6 | b3 & 0x3F;

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
        if (c > 0xDBFF || i + 1 === str.length) {
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

function get (_x, _x2, _x3, _x4) {
  return _ref.apply(this, arguments);
}

function _ref() {
  _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(layerId, z, x, y) {
    var response, blob, buf, pbf$1, _VectorTile, layers, result, _i, _Object$entries, _Object$entries$_i, id, vt, i, f, coordinates, r, g, b, style;

    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.next = 2;
            return fetch("tile/".concat(layerId, "/").concat(z, "/").concat(x, "/").concat(y));

          case 2:
            response = _context.sent;
            _context.next = 5;
            return response.blob();

          case 5:
            blob = _context.sent;
            _context.next = 8;
            return blob.arrayBuffer();

          case 8:
            buf = _context.sent;
            pbf$1 = new pbf(buf);
            _VectorTile = new VectorTile(pbf$1), layers = _VectorTile.layers;
            result = {};

            for (_i = 0, _Object$entries = Object.entries(layers); _i < _Object$entries.length; _i++) {
              _Object$entries$_i = _slicedToArray(_Object$entries[_i], 2), id = _Object$entries$_i[0], vt = _Object$entries$_i[1];
              result[id] = [];

              for (i = 0; i < vt.length; ++i) {
                f = vt.feature(i);
                coordinates = f.loadGeometry().reduce(function (a, r) {
                  return a.concat.apply(a, _toConsumableArray(r.map(function (_ref2) {
                    var x = _ref2.x,
                        y = _ref2.y;
                    return [x, y];
                  })));
                }, []);
                r = Math.floor(Math.random() * 255);
                g = Math.floor(Math.random() * 255);
                b = Math.floor(Math.random() * 255);
                style = "rgb(".concat([r, g, b].join(','), ")");
                result[id].push({
                  coordinates: coordinates,
                  style: style
                });
              }
            }

            return _context.abrupt("return", result);

          case 14:
          case "end":
            return _context.stop();
        }
      }
    }, _callee);
  }));
  return _ref.apply(this, arguments);
}

// `Array.prototype.fill` method
// https://tc39.es/ecma262/#sec-array.prototype.fill
_export({ target: 'Array', proto: true }, {
  fill: arrayFill
});

// https://tc39.es/ecma262/#sec-array.prototype-@@unscopables
addToUnscopables('fill');

function render (ctx, coordinates, style) {
  var a = [];
  var b = [];

  for (var i = 0; i < coordinates.length; ++i) {
    if (b.length == 2) {
      a.push(b);
      b = [];
      b.push(coordinates[i]);
    } else {
      b.push(coordinates[i]);
    }
  }

  if (a.length > 0) {

    ctx.beginPath();

    var _a$ = _slicedToArray(a[0], 2),
        x0 = _a$[0],
        y0 = _a$[1];

    ctx.moveTo(x0, y0);

    for (var _i = 1; _i < a.length; ++_i) {
      var _a$_i = _slicedToArray(a[_i], 2),
          x = _a$_i[0],
          y = _a$_i[1];

      ctx.lineTo(x, y);
    }

    ctx.closePath();
    ctx.fillStyle = style;
    ctx.fill();
  }
}

onmessage = function onmessage(e) {
  var _e$data = e.data,
      layerId = _e$data.layerId,
      z = _e$data.z,
      x = _e$data.x,
      y = _e$data.y;
  var offscreen = new OffscreenCanvas(256, 256);
  var ctx = offscreen.getContext('2d');
  get(layerId, z, x, y).then(function (res) {
    for (var _i = 0, _Object$entries = Object.entries(res); _i < _Object$entries.length; _i++) {
      var _Object$entries$_i = _slicedToArray(_Object$entries[_i], 2);
          _Object$entries$_i[0];
          var features = _Object$entries$_i[1];

      var _iterator = _createForOfIteratorHelper(features),
          _step;

      try {
        for (_iterator.s(); !(_step = _iterator.n()).done;) {
          var _step$value = _step.value,
              coordinates = _step$value.coordinates,
              style = _step$value.style;
          render(ctx, coordinates, style); // postMessage({status: 'feature', coordinates, style});
        }
      } catch (err) {
        _iterator.e(err);
      } finally {
        _iterator.f();
      }
    }

    var bitmap = offscreen.transferToImageBitmap();
    postMessage({
      status: 'ready',
      bitmap: bitmap
    });
  })["catch"](function (error) {
    postMessage({
      status: 'error',
      error: error
    });
  });
};
//# sourceMappingURL=tile.js.map
