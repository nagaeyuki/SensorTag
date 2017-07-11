var util = require('util');

var async = require('async');

var CC2650SensorTag = require('./index').CC2650;

var USE_READ = true;
var USE_READ = false;
var before_state=0;
var now_state=0;

CC2650SensorTag.discover(function(sensorTag) {
  console.log('discovered: ' + sensorTag);

  // sensorTag.on('simpleKeyChange', function(left, right, reedRelay) {
  //   if (right) {
  //     console.log('right: down');
  //   } else {
  //     console.log('right: up');
  //   }
  //   if (left) {
  //     console.log('disconnected!');
  //     process.exit(0);
  //   }
  // });

   

  async.series([
    function(callback) {
      console.log('connectAndSetUp');
      sensorTag.connectAndSetUp(callback);
    },
    // function(callback) {
    //   sensorTag.notifySimpleKey(callback);
    //   console.log('key change waiting...');
    // },
    function(callback){
      sensorTag.notifyAccelerometer(callback);
      console.log("accelerometer setup");
    },
    function(callback) {
      console.log('enableAccelerometer');
      sensorTag.enableAccelerometer(callback);
    },
    function(callback) {
      setTimeout(callback, 2000);
    },//ちょっと待たないと一回目にデータ取得できない
    function checkState(callback) {
      if (USE_READ) {
        console.log('readAccelerometer');
        sensorTag.readAccelerometer(function(error, x, y, z) {

          //console.log('\tx = %d G', x.toFixed(1));
          //console.log('\ty = %d G', y.toFixed(1));
          //console.log('\tz = %d G', z.toFixed(1));

          callback();
        });
      } else {
        sensorTag.on('accelerometerChange', function(x, y, z) {
          //console.log('\tx = %d G', x.toFixed(1));
          //console.log('\ty = %d G', y.toFixed(1));
          //console.log('\tz = %d G', z.toFixed(1));

          var X = x.toFixed(1);
          var Y = y.toFixed(1);
          var Z = z.toFixed(1);
          //console.log(X);
          //console.log(Y);
          //console.log(Z);
          if(X <= 0.2 && X >= -0.2 && Y <= 0.2 && Y >= -0.2 &&  Z >= 0.8){
            now_state = 1;
          }else if(X <= -0.8 && Z >= -0.2 &&Y <= 0.2 && Y >= -0.2 && Z <= 0.2){
            now_state = 2;
          }else if(X <= 0.2 && X >= -0.2 && Y >= 0.8 && Z <= 0.2 && Z >= -0.2){
             now_state = 3;
          }else if(X <= 0.2 && X >= -0.2 && Y <= 0.8 && Z <= 0.2 && Z >= -0.2){
            now_state = 4;
          }else if(X >= 0.8 && Y <= 0.2 && Y >= -0.2 &&  Z >= -0.2 && Z <= 0.2){
            now_state = 5;
          }else if(X <= 0.2 && X >= -0.2 &&　Y <= 0.2 && Y >= -0.2 && Z <= -0.8){
            now_state= 6;
          }
          if(before_state != now_state){
            console.log(now_state);
         }
          before_state = now_state;
        });
         console.log('setAccelerometerPeriod');
        sensorTag.setAccelerometerPeriod(1000, function(error) {
          console.log('notifyAccelerometer');
          sensorTag.notifyAccelerometer(function(error) {
            setTimeout(function() {
              //console.log('unnotifyAccelerometer');
              sensorTag.unnotifyAccelerometer(callback);
            }, 5000);
          });
        });
      }
    },
    function(callback) {
      //console.log('disableAccelerometer');
      //sensorTag.enableAccelerometer(callback);
      //sensorTag.disableAccelerometer(callback);
    }
    ]
  );
});
