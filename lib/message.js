var _ = require('lodash'),
  events = require('events'),
  util = require('util')
;

function Message(args) {

  events.EventEmitter.call(this);

  this.action = '';
  this.section = '';
  this.subsection = '';
  this.method = null;
  this.userId = '';
  this.body = null;
  this.correlationId = '';
  this.persistent = true;

  this.contentType = 'application/json'

  _.merge(this, args);

  this.get = function () {
    if(this.type == 'stomp') {
      return this.generateStomp();
    }
    if(this.type == 'rest') {
      return this.generateRest();
    }
  }


}

util.inherits(Message, events.EventEmitter);

Message.prototype.generateStomp = function () {

  var message = {
    'destination': '/exchange/connect.api/api:'+this.action+':'+this.section+'.'+this.subsection,
    'content-type': 'application/json',
    'user-id': this.userId,
    'reply-to': '/temp-queue/main',
    'correlation-id': this.correlationId,
    'persistent': 'true'
  }

  if(this.method !== null) {
    message.destination = message.destination + '.' + this.method;
  }

  if (this.body !== null) {
    message['body'] = JSON.stringify(this.body)
  }

  return message;

}

Message.prototype.generateRest = function () {

  var message = {};
  // var message = {
  //   'destination': '/exchange/connect.api/api:'+this.action+':'+this.section+'.'+this.subsection+'.'+this.method+'',
  //   'content-type': 'application/json',
  //   'user-id': this.userId,
  //   'reply-to': '/temp-queue/main',
  //   'correlation-id': this.correlationId,
  //   'persistent': 'true'
  // }
  //
  // if (this.body !== null) {
  //   message['body'] = JSON.stringify(this.body),
  // }

  return message;

}


module.exports = Message;
