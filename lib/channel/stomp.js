var _ = require('lodash'),
  events = require('events'),
  util = require('util'),
  stomplib = require('./stomp/stomp.js');

function Stomp(args) {

  events.EventEmitter.call(this);

  this.messages = {};

  _.merge(this, args);
  _this = this;

}

util.inherits(Stomp, events.EventEmitter);

Stomp.prototype.open = function(callback) {

  _this.log.debug('stomp start connection');

  _this.stomp.login = _this.auth.access_token,
  _this.stomp.passcode = _this.auth.access_token;

  _this.stompConnection = new stomplib.Stomp(_this.stomp);
  _this.stompConnection.should_run_message_callback = this.getMessage;

  _this.stompConnection.connect();

  _this.stompConnection.on('connected', function() {
    _this.log.debug('stomp connected');
    _this.emit("onStompConnected", this);
    callback();
  })




}

Stomp.prototype.close = function() {
  _this.stompConnection.disconnect()
  _this.log.debug('stomp disconnected');
  _this.emit("onStompDisconnect", null);
}

Stomp.prototype.execute = function() {

    //console.log(_this.connection);
}

Stomp.prototype.getMessage = function(frame) {

  frame.body = JSON.parse(frame.body[0]);

  // execute correlation-id callback
  if(frame && frame.headers && frame.headers['correlation-id']) {
    var correlationId = frame.headers['correlation-id'];
    _this.stomp.messages[correlationId](null, frame.headers, frame.body);
  }

  _this.emit("onMessage", frame);
}
Stomp.prototype.sendMessage = function(frame) {

  console.log(frame);

}
module.exports = Stomp;
