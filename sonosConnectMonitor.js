var sonosObserver = require('./lib/sonosObserver');
var denon = require('./lib/denon');

var sonosObserver = new sonosObserver();

var avr = new denon({
	host: '10.0.1.14'
});

avr.connect();

sonosObserver.observeByName("Kitchen");

sonosObserver.on('DeviceAvailable', function(device) {
	console.log('Found Sonos Connect');
});

sonosObserver.on('Started', function(device) {
	console.log('Sonos Connect started');
	
	avr.powerOn(function () {
		avr.setSourceToAUX(function() {
			avr.setSoundModeToMultiChannelStereo(function() {
				//TODO: Set volume?
			});
		});
	});
});

sonosObserver.on('Stopped', function(device) {
	console.log('Sonos Connect stopped');

	avr.setSoundModeToAuto(function() {
		avr.powerOff();
	});
});