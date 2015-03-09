var _ = require('lodash'),
  rest = require('./channel/rest.js'),
  stomp = require('./channel/stomp.js'),
  events = require('events'),
  util = require('util')
  //stomp = require('./channel/stomp.js')

;

function Channel(args) {

  events.EventEmitter.call(this);

  _.merge(this, args);

  this.rest = new rest(this)
    .on('onRestConnected', function(data) {
      console.log('onRestConnected');
    });

  this.stomp = new stomp(this)
    .on('onStompConnected', function(data) {
      console.log('onStompConnected');
    });

  _this = this;  

}

util.inherits(Channel, events.EventEmitter);

module.exports = Channel;
