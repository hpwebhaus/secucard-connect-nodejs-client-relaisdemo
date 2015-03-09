var _ = require('lodash'),
events = require('events'),
util = require('util');

function SmartDevice(args) {

  events.EventEmitter.call(this);

  _.merge(this, args);
  _this = this;

}

util.inherits(SmartDevice, events.EventEmitter);

// Stomp.prototype.open = function() {
//
//   _this.stompConnection = new stomplib.Stomp(_this.stomp);
//   _this.stompConnection.connect()
//   _this.stompConnection.on('connected', function() {
//     _this.emit("onStompConnected", this);
//
//     //connection successfull, now register device
//     _this.ctrl.smart.
//
//   })
//
// }
//
// Stomp.prototype.close = function() {
//   _this.stompConnection.disconnect()
//   _this.emit("onStompDisconnect", null);
// }
//
// Stomp.prototype.execute = function() {
//
//   console.log(_this.connection);
// }

module.exports = SmartDevice;
