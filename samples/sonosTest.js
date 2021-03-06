var sonosObserver = require('../lib/sonosObserver');
var config = require('./config');

var sonosObserver = new sonosObserver();

sonosObserver.observeByName(config.sonosName);

sonosObserver.on('DeviceAvailable', function (device, attrs) {
    var name = attrs['CurrentZoneName'];
    console.log('Found device: ' + name);
});

sonosObserver.on('Started', function (device, attrs) {
    var name = attrs['CurrentZoneName'];
    console.log('Started: ' + name);
});

sonosObserver.on('Stopped', function (device, attrs) {
    var name = attrs['CurrentZoneName'];
    console.log('Stopped: ' + name);
});

sonosObserver.on('Paused', function (device, attrs) {
    var name = attrs['CurrentZoneName'];
    console.log('Paused: ' + name);
});