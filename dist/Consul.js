'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _consul = require('consul');

var _consul2 = _interopRequireDefault(_consul);

var _ampLogLib = require('amp-log-lib');

var _ampLogLib2 = _interopRequireDefault(_ampLogLib);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var consul_update = 0;
var consul_conflict = 0;
var consul_conflict_freq = [];

var Consul = function () {
  function Consul() {
    _classCallCheck(this, Consul);

    this.options = {
      host: 'consul',
      port: '8500',
      promisify: true
    };
    this.client = (0, _consul2.default)(this.options);
  }

  _createClass(Consul, [{
    key: 'set',
    value: function set(id, value) {
      return regeneratorRuntime.async(function set$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              _context.next = 2;
              return regeneratorRuntime.awrap(this.client.kv.set(id, value));

            case 2:
            case 'end':
              return _context.stop();
          }
        }
      }, null, this);
    }
  }, {
    key: 'get',
    value: function get(id) {
      return regeneratorRuntime.async(function get$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              _context2.next = 2;
              return regeneratorRuntime.awrap(this.client.kv.get(id));

            case 2:
              return _context2.abrupt('return', _context2.sent);

            case 3:
            case 'end':
              return _context2.stop();
          }
        }
      }, null, this);
    }
  }, {
    key: 'delete',
    value: function _delete(id) {
      return regeneratorRuntime.async(function _delete$(_context3) {
        while (1) {
          switch (_context3.prev = _context3.next) {
            case 0:
              _context3.next = 2;
              return regeneratorRuntime.awrap(this.client.kv.del(id));

            case 2:
              return _context3.abrupt('return', _context3.sent);

            case 3:
            case 'end':
              return _context3.stop();
          }
        }
      }, null, this);
    }

    // update : allow concurrent update of an object using advisory consul test-and-set strategy

  }, {
    key: 'update',
    value: function update(key, f) {
      var is_updated, val2, retry, result, val, cas;
      return regeneratorRuntime.async(function update$(_context4) {
        while (1) {
          switch (_context4.prev = _context4.next) {
            case 0:
              consul_update += 1;
              is_updated = void 0;
              val2 = void 0;
              retry = 0;

            case 4:
              _context4.next = 6;
              return regeneratorRuntime.awrap(this.client.kv.get(key));

            case 6:
              result = _context4.sent;
              val = null;
              cas = 0;

              if (result) {
                val = JSON.parse(result.Value);
                cas = result.ModifyIndex;
              }
              val2 = f(val, key);

              if (val2) {
                _context4.next = 13;
                break;
              }

              return _context4.abrupt('break', 18);

            case 13:
              _context4.next = 15;
              return regeneratorRuntime.awrap(this.client.kv.set({ key: key, value: JSON.stringify(val2), cas: cas }));

            case 15:
              is_updated = _context4.sent;


              if (!is_updated) {
                consul_conflict += 1;
                retry += 1;
                _ampLogLib2.default.info({ msgid: "consul conflict", consul_update: consul_update, consul_conflict: consul_conflict, consul_conflict_freq: consul_conflict_freq, key: key });
                //TODO: add exponential random delay before retry
              } else {
                  consul_conflict_freq[retry] = consul_conflict_freq[retry] || 0;
                  consul_conflict_freq[retry] += 1;
                }

            case 17:
              if (!is_updated) {
                _context4.next = 4;
                break;
              }

            case 18:
              return _context4.abrupt('return', val2);

            case 19:
            case 'end':
              return _context4.stop();
          }
        }
      }, null, this);
    }
  }]);

  return Consul;
}();

exports.default = Consul;
//# sourceMappingURL=Consul.js.map