'use strict';

let incr_unsafe = (() => {
  var ref = _asyncToGenerator(function* (c, key) {
    const r = yield c.get_json(key);
    yield c.set_json(key, r + 1);
  });

  return function incr_unsafe(_x, _x2) {
    return ref.apply(this, arguments);
  };
})();

let incr_safe = (() => {
  var ref = _asyncToGenerator(function* (c, key) {
    yield c.update_json(key, function (r) {
      return r + 1;
    });
  });

  return function incr_safe(_x3, _x4) {
    return ref.apply(this, arguments);
  };
})();

require('source-map-support/register');

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

var _ampLogLib = require('amp-log-lib');

var _ampLogLib2 = _interopRequireDefault(_ampLogLib);

var _ = require('..');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { return step("next", value); }, function (err) { return step("throw", err); }); } } return step("next"); }); }; }

_ampLogLib2.default.init({ name: 'amp-consul-test' });

function sleep(ms) {
  return new Promise((resolve, reject) => {
    setTimeout(resolve, ms);
  });
}

describe('amp-consul-lib', function () {
  let c = new _.Consul();
  const n = 10;
  before(_asyncToGenerator(function* () {
    console.log("starting...");
    let ok;
    do {
      ok = false;
      try {
        const h = yield c.client.health.node('node1');
        console.log(h);
        ok = true;
      } catch (e) {
        console.log("Error:", e.message);
      }
      if (!ok) yield sleep(1000);
    } while (!ok);
  }));

  it('should store and retrieve a value from consul', _asyncToGenerator(function* () {
    let result;
    yield c.set('hello', 'world');
    result = yield c.get('hello');
    _assert2.default.equal(result.Value, 'world');
  }));

  it('should store and retrieve a key value recursively from consul', _asyncToGenerator(function* () {
    let result;
    yield c.set('key1', 'val1');
    result = yield c.get('key1');
    _assert2.default.equal(result.Value, 'val1');

    result = yield c.set('key1/key2', 'val2');
    result = yield c.get('key1/key2');
    _assert2.default.equal(result.Value, 'val2');

    result = yield c.get({
      key: 'key1',
      recurse: true
    });
    _assert2.default.equal(result[0].Key, 'key1');
    _assert2.default.equal(result[0].Value, 'val1');
    _assert2.default.equal(result[1].Key, 'key1/key2');
    _assert2.default.equal(result[1].Value, 'val2');
  }));

  it('should update consul entry (sync/unsafe) -> good', _asyncToGenerator(function* () {
    const key = 'key3';
    yield c.set_json(key, 1);
    let v = yield c.get_json(key);
    _assert2.default.equal(v, 1);

    for (let i = 0; i < n; i++) {
      yield incr_unsafe(c, key);
    }

    v = yield c.get_json(key);
    _assert2.default.equal(v, n + 1);
  }));

  it('should update consul entry (async/unsafe) -> bad', _asyncToGenerator(function* () {
    const key = 'key4';
    yield c.set_json(key, 1);
    let v = yield c.get_json(key);
    _assert2.default.equal(v, 1);
    let all = [];
    for (let i = 0; i < n; i++) {
      all.push(incr_unsafe(c, key));
    }
    yield Promise.all(all);

    v = yield c.get_json(key);
    _assert2.default.notEqual(v, n + 1);
  }));

  it('should update consul entry (async/safe) -> good', _asyncToGenerator(function* () {
    const key = 'key4';
    yield c.set_json(key, 1);
    let v = yield c.get_json(key);
    _assert2.default.equal(v, 1);
    let all = [];
    for (let i = 0; i < n; i++) {
      all.push(incr_safe(c, key));
    }
    yield Promise.all(all);

    v = yield c.get_json(key);
    _assert2.default.equal(v, n + 1);
  }));
});
//# sourceMappingURL=test.js.map