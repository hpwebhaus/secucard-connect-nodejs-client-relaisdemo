'use strict';

var Secucard = require('../secucard-connect-nodejs-client-lib');
var wpi = require( 'node-wiringpi' );

var secucard = new Secucard({
  auth: {
      client_id: '611c00ec6b2be6c77c2338774f50040b',
      client_secret: 'dc1f422dde755f0b1c4ac04e7efbd6c4c78870691fe783266d7d6c89439925eb',
      vendor: 'secucard',
      uuid: '/vendor/secucard/relais/1',
      refresh_token: "09acadd3044e42804941dcb94051250eae7d096d",
      expires_in: 9000000
  },
  debug: true,
  //environment: 'dev'
  environment: 'prod'
});


wpi.pin_mode( 6, wpi.PIN_MODE.OUTPUT );

// Events
/*
onStompConnected
onStompDisconnect
onDeviceCodeAuthorizationPending
onDeviceCodeAuthorizationSuccess
onDeviceAuthorizationError
onDeviceAuthorizationSuccess
onMessage
*/



secucard.on('onMessage', function(msg) {
    if (msg.body.type == 'SwitchRelais') {
        _this.log.debug("SwitchRelais: " + msg.body.data.value);
	    wpi.digital_write( 6, msg.body.data.value );

        // nach einer Sekunde wieder aus
        setTimeout(function() {
            wpi.digital_write( 6, wpi.WRITE.LOW );
        }, 1000)

    }
});

secucard.on('onStompDisconnect', function(msg) {
    console.log("Got disconnected. Exit to get restarted");
    setTimeout(function() {
        wpi.digital_write( 6, wpi.WRITE.LOW );
        process.exit();
    }, 1000)
});


secucard.connect(function() {

    var Auth = secucard.getController('auth');

    // register Device every 30 seconds
    setInterval(function() {
        Auth.SessionsRefresh({pid: "me"}, function(err, headers, body) {
            if (body.status == 'ok' && body.data.result == true) {
                _this.log.debug('Auth.SessionsRefresh success');
            } else {
                _this.log.error('Auth.SessionsRefresh', body);
            }
        });
    }, 30000)


});


process.on('SIGINT', function() {
  console.log("Caught interrupt signal");

  secucard.disconnect();
  setTimeout(function() {
  wpi.digital_write( 6, wpi.WRITE.LOW );
    process.exit();

  }, 1000)
})
