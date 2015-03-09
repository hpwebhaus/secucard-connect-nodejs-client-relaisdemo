'use strict';

var Secucard = require('../secucard-connect-nodejs-client-lib');

var secucard = new Secucard({
  auth: {
      // bitbakers
    client_id: 'fbcc96ddb37fedd48a0d8538da256280',
    client_secret: 'b74c7a381d94b1d318b8a81f394ef47b6b93f1f2cb8a458776ccfd3203ab4b65',
      // secucard dev
      //client_id: '611c00ec6b2be6c77c2338774f50040b',
      //client_secret: 'dc1f422dde755f0b1c4ac04e7efbd6c4c78870691fe783266d7d6c89439925eb',
    id: '4711',
    //vendor: 'flour',
    //uuid: '/vendor/flour/pointofsale/547c7689cd6abcf402f93667',
      vendor: 'secucard',
      uuid: '/vendor/secucard/parameter1/test1/parameter2/test2',
      //refresh_token: "f8ef1976a90beae1b39ccd28ad7ebedfdf0b51f1",_t
      refresh_token: "b64c6483657549ab0859b56663fce5b1ce6557e2",
      expires_in: 1000000,
  },
  debug: true,
  //environment: 'dev'
  environment: 'prod'
});


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

secucard.on('onDeviceAuthorizationSuccess', function(body) {
    console.log(body);
    console.log("Please enter user-pin: "+body.user_code);
});


secucard.on('onMessage', function(body) {
    if (body.body.type == 'CashierDisplay') {
        _this.log.debug("Display-Meldung: " + body.body.value);
    }
});

secucard.connect(function() {

  var Smart = secucard.getController('smart');
    var Auth = secucard.getController('auth');

  // register Device
  Auth.SessionsRefresh({pid: "me"}, function(err, headers, body) {
    if (body.status == 'ok' && body.data.result == true) {
      _this.log.debug('Auth.SessionsRefresh success');
    } else {
      _this.log.error('Auth.SessionsRefresh', body);
    }

    // get Idents
    Smart.idents(function(err, headers, body) {
      if (body.status == 'ok') {
        _this.log.debug('Smart.idents success');
      } else {
        _this.log.error('Smart.idents', body);
      }
    });

    // new Transaction
    Smart.transactionNew({
        data: {
          basket_info: {
            sum: 300
          }
        }
      },
      function(err, headers, body) {
        if (body.status == 'ok') {
          _this.log.debug('Smart.transactionNew success');
            console.log(body);
        } else {
          _this.log.error('Smart.transactionNew', body);
        }


        if (body && body.data && body.data.id) {
          // start Transaction
          Smart.transactionStart({
              pid: body.data.id,
              sid: 'auto' //'demo'
            },
            function(err, headers, body) {
              if (body.status == 'ok') {
                _this.log.debug('Smart.transactionStart success');
                  console.log(body);
              } else {
                _this.log.error('Smart.transactionStart', body);
              }
            });
        }
      });

  });

});


process.on('SIGINT', function() {
  console.log("Caught interrupt signal");

  secucard.disconnect();
  setTimeout(function() {

    process.exit();

  }, 1000)
})
