'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _consul = require('consul');

var _consul2 = _interopRequireDefault(_consul);

var _ampLogLib = require('amp-log-lib');

var _ampLogLib2 = _interopRequireDefault(_ampLogLib);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { return step("next", value); }, function (err) { return step("throw", err); }); } } return step("next"); }); }; }

let consul_update = 0;
let consul_conflict = 0;
let consul_conflict_freq = [];

class Consul {
  constructor() {
    this.options = {
      host: 'consul',
      port: '8500',
      promisify: true
    };
    this.client = (0, _consul2.default)(this.options);
  }

  set(id, value) {
    var _this = this;

    return _asyncToGenerator(function* () {
      yield _this.client.kv.set(id, value);
    })();
  }

  get(id) {
    var _this2 = this;

    return _asyncToGenerator(function* () {
      return yield _this2.client.kv.get(id);
    })();
  }

  delete(id) {
    var _this3 = this;

    return _asyncToGenerator(function* () {
      return yield _this3.client.kv.del(id);
    })();
  }

  set_json(id, json) {
    var _this4 = this;

    return _asyncToGenerator(function* () {
      yield _this4.client.kv.set(id, JSON.stringify(json));
    })();
  }

  get_json(id) {
    var _this5 = this;

    return _asyncToGenerator(function* () {
      let r = yield _this5.client.kv.get(id);
      if (r) {
        return JSON.parse(r.Value);
      }
      return r;
    })();
  }

  // update : allow concurrent update of an object using advisory consul test-and-set strategy
  update_json(key, f) {
    var _this6 = this;

    return _asyncToGenerator(function* () {
      consul_update += 1;
      let is_updated;
      let val2;
      let retry = 0;
      do {
        const result = yield _this6.client.kv.get(key);
        let val = null;
        let cas = 0;
        if (result) {
          val = JSON.parse(result.Value);
          cas = result.ModifyIndex;
        }
        val2 = f(val, key);
        if (!val2) break;

        is_updated = yield _this6.client.kv.set({ key, value: JSON.stringify(val2), cas });

        if (!is_updated) {
          consul_conflict += 1;
          retry += 1;
          _ampLogLib2.default.info({ msgid: "consul conflict", consul_update, consul_conflict, consul_conflict_freq, key });
          //TODO: add exponential random delay before retry
        } else {
            consul_conflict_freq[retry] = consul_conflict_freq[retry] || 0;
            consul_conflict_freq[retry] += 1;
          }
      } while (!is_updated);
      return val2;
    })();
  }
}
exports.default = Consul;
//# sourceMappingURL=Consul.js.map