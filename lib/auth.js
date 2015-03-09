var _ = require('lodash'),
    events = require('events'),
    util = require('util'),
    Message = require('./message.js'),
    uuid = require('node-uuid');


function Auth(args) {

  _.merge(this, args);

  this.params = {
    client_id: args.auth.client_id,
    client_secret: args.auth.client_secret,
  }

  this.token = function(params, callback) {
    _this.ctrl.channel.rest.post(args.rest.host_auth + '/oauth/token', params, function(err, result, body) {
      callback(err, result, body);
    });
  }

  _this = this;
}

Auth.prototype.deviceCode = function(callback) {

  var params = {};
  _.merge(params, {
    grant_type: 'device',
    code: _this.oauth.device_code
  }, this.params);

  this.token(params, function(err, result, body) {
    callback(err, result, body);
  })

}

Auth.prototype.device = function(callback) {

  if (_this.auth.refresh_token) {
    _this.log.debug('refresh_token exists, start refreshing after timeout');
    _this.ctrl.auth.refresh(function() {
      callback();
      return;
    });
  } else {
    var params = {};
    _.merge(params, {
      grant_type: 'device',
      uuid: _this.auth.uuid
    }, this.params);

    _this.log.debug('start auth device');
    this.token(params, function(err, result, body) {

      if (body.error) { //error while authenticating
        if (body.error == 'invalid_device') {
          _this.log.error('device authorization', body);
          _this.emit("onDeviceAuthorizationError", body);
          callback();
          return;
        }
      }
      _this.log.debug('device authorization success');
      _this.emit("onDeviceAuthorizationSuccess", body);

      if (body.device_code.length > 0) {
        _this.oauth = body;
        var checkInterval = body.interval * 1000; //convert to milliseconds
        var timeoutInterval = 100; // set maximum intervals
        var timer;

        // Auth Device with device_code
        function deviceCode() {
          _this.ctrl.auth.deviceCode(function(err, result, body) {
            //console.log('Response auth.deviceCode', body);
            timeoutInterval--;
            if (timeoutInterval > 0 && body.error == 'authorization_pending') {
              _this.log.debug('device code authorization pending');
              _this.emit("onDeviceCodeAuthorizationPending", body);
              timer = setTimeout(deviceCode, checkInterval)
            } else {
              _this.auth.access_token = body.access_token;
              _this.auth.refresh_token = body.refresh_token;
              _this.auth.expires_in = (parseInt(body.expires_in) - 60) * 1000;
              setTimeout(_this.ctrl.auth.refresh, _this.auth.expires_in)

              _this.log.debug('device code authorization success');
              _this.log.debug('access_token : ' + _this.auth.access_token);
              _this.log.debug('refresh_token : ' + _this.auth.refresh_token);
              _this.log.debug('expires_in : ' + _this.auth.expires_in);

              _this.emit("onDeviceCodeAuthorizationSuccess", body);
              callback();
            }
          })
        }
        deviceCode();

      }

    })
  }



}

Auth.prototype.refresh = function(callback) {

  _this.log.debug('start refresh token');

  var params = {};
  _.merge(params, {
    grant_type: 'refresh_token',
    refresh_token: _this.auth.refresh_token
  }, _this.ctrl.auth.params);

  _this.ctrl.auth.token(params, function(err, result, body) {

    if(err) {
      _this.log.error('refresh token', body);
      // if error occurs, try again in 5 seconds....
      setTimeout(_this.ctrl.auth.refresh, 5000)
    }

    if (body.access_token) {
      _this.log.debug('refresh token success, new access_token: ' + body.access_token);
      _this.auth.access_token = body.access_token;
      _this.auth.expires_in = (parseInt(body.expires_in) - 60) * 1000;
      setTimeout(_this.ctrl.auth.refresh, _this.auth.expires_in)
    } else {
      // if error occurs, try again in 5 seconds....
      _this.log.error('refresh token', body);
      setTimeout(_this.ctrl.auth.refresh, 5000)
    }

    if(callback) {
      callback();
    }
  })

}

Auth.prototype.client = function(callback) {

  var params = {};
  _.merge(params, {
    grant_type: 'client_credentials',
  }, this.params);

  this.token(params, function() {
    callback();
  })

}

Auth.prototype.SessionsRefresh = function (body, callback) {

    var correlationId = uuid.v4();
    var message = new Message({
        type: 'stomp',
        action: 'exec',
        section: 'Auth',
        subsection: 'Sessions',
        method: 'refresh',
        userId: _this.auth.access_token,
        body: body,
        correlationId: correlationId,
        persistent: true
    });

    _this.stompConnection.send(message.get(), true);

    if(!_this.stomp.messages) {
        _this.stomp.messages = {};
    }
    _this.stomp.messages[correlationId] = callback;

}





module.exports = Auth;
