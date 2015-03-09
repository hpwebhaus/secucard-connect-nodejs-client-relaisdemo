var _ = require('lodash'),
  events = require('events'),
  util = require('util'),
  Device = require('./smart/device.js'),
  Message = require('./message.js'),
  uuid = require('node-uuid');

function Smart(args) {

  events.EventEmitter.call(this);

  //_.merge(this, args);

  _this = this;

}

util.inherits(Smart, events.EventEmitter);

Smart.prototype.idents = function (callback) {

  var correlationId = uuid.v4();
  var message = new Message({
    type: 'stomp',
    action: 'get',
    section: 'Smart',
    subsection: 'Idents',
    userId: _this.auth.access_token,
    correlationId: correlationId,
    persistent: true
  });

  _this.stompConnection.send(message.get(), true);
  _this.stomp.messages[correlationId] = callback;

}


Smart.prototype.transactionNew = function (body, callback) {

  var correlationId = uuid.v4();
  var message = new Message({
    type: 'stomp',
    action: 'add',
    section: 'Smart',
    subsection: 'Transactions',
    userId: _this.auth.access_token,
    body: body,
    correlationId: correlationId,
    persistent: true
  });

  _this.stompConnection.send(message.get(), true);
  _this.stomp.messages[correlationId] = callback;

}

Smart.prototype.transactionStart = function (body, callback) {

  var correlationId = uuid.v4();
  var message = new Message({
    type: 'stomp',
    action: 'exec',
    method: 'start',
    section: 'Smart',
    subsection: 'Transactions',
    userId: _this.auth.access_token,
    body: body,
    correlationId: correlationId,
    persistent: true
  });

  _this.stompConnection.send(message.get(), true);
  _this.stomp.messages[correlationId] = callback;

}



module.exports = Smart;
