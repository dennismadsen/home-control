var sonosObserver = require('./lib/sonosObserver');
var denonObserver = require('./lib/denonObserver');

var sonosObserver = new sonosObserver();
var denonObserver = new denonObserver();

var denonAvr = undefined;
var sonosDevice = undefined;

denonObserver.on('Discovered', function(device, attrs) {
	console.log("Found Denon AVR "+attrs.name);
    denonAvr = device;
});

sonosObserver.on('DeviceAvailable', function(device, attrs) {
	var name = attrs['CurrentZoneName'];
	console.log('Found Sonos Connect named '+name);
	sonosDevice = device;
});

sonosObserver.on('Started', function(device, attrs) {
	console.log('Sonos Connect started');
	
    denonAvr.push({
        on: true,
		volume: 0.5,
		band: 'AUX1',
		soundmode: 'MCH STEREO'
    });
});

sonosObserver.on('Stopped', function(device, attrs) {
	console.log('Sonos Connect stopped');

    denonAvr.push({
        on: false
    });
});

sonosObserver.on('Paused', function(device, attrs) {
	console.log('Sonos Connect paused');

    denonAvr.push({
        on: false
    });
});

denonObserver.discover();
sonosObserver.observeByName("Stue");