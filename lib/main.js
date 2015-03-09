var _ = require('lodash'),
  events = require('events'),
  util = require('util'),

  Auth = require('./auth.js'),
  Channel = require('./channel.js')
  Smart = require('./smart.js')
  Log = require('./log.js')
;

function Secucard(opts) {

  events.EventEmitter.call(this);

  _.merge(this, {
    debug: false,
    stomp: {
      host: 'dev10.secupay-ag.de',
      port: 61614,
      ssl: true,
      enabled: true,
      heartbeat: 600,
      timeout: 0,
      debug: false,
    },
    rest: {
      host: 'https://dev10.secupay-ag.de/api/v2',
      host_auth: 'https://core-dev10.secupay-ag.de/app.core.connector'
    },
    auth: {},
    id: ''
  }, opts);

  if (this.environment == 'prod') {
    this.stomp.host = 'connect.secucard.com';
    this.rest.host = 'https://connect.secucard.com/api/v2';
    this.rest.host_auth = 'https://connect.secucard.com';
  }

  this.connections = {};

  this.ctrl = {
    auth: new Auth(this),
    channel: new Channel(this),
    smart: new Smart(this)
  }

  this.log = new Log(this.debug);

  _this = this;

};


util.inherits(Secucard, events.EventEmitter);

Secucard.prototype.connect = function(callback) {
  _this.ctrl.auth.device(function () {
    //after getting access_token we could connect to stomp
    _this.ctrl.channel.stomp.open(function () {
      callback();
    });

  });

}

Secucard.prototype.getController = function (ctrl) {
  return _this.ctrl[ctrl];
}

Secucard.prototype.disconnect = function() {
  _this.ctrl.channel.stomp.close();
}

Secucard.prototype.sendMessage = function() {
  _this.ctrl.channel.stomp.close();
}

module.exports = Secucard;
