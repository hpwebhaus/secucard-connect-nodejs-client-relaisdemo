var _ = require('lodash'),
  events = require('events'),
  util = require('util'),
  request = require('request');

function RestChannel(args) {

  events.EventEmitter.call(this);

  _.merge(this, args);
  _this = this;

}

util.inherits(RestChannel, events.EventEmitter);

RestChannel.prototype.open = function() {
  _this.emit("onRestConnected", null);
}

RestChannel.prototype.close = function() {
  _this.emit("onRestDisconnect", null);
}

RestChannel.prototype.post = function(url, params, callback) {

  var requestParams = {
    url: url,
    method: 'POST',
    json: params
  }

  request(requestParams, function (err, response, body) {
    callback(err, response, body);
  });

}


module.exports = RestChannel;
