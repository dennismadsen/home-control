var sonosObserver = require('./lib/sonosObserver');
var denonAVRBridge = require('homestar-denon-avr').Bridge.Bridge;

var sonosObserver = new sonosObserver();
var denonObserver = new denonAVRBridge();

var denonAvr = undefined;
var sonosDevice = undefined;

denonObserver.discovered = function(bridge) {
    console.log("Found Denon AVR", bridge.meta());
    bridge.pulled = function(state) {
        //console.log("+ state-change", state);
    };
    bridge.connect();
	
	denonAvr = bridge;
};

sonosObserver.on('DeviceAvailable', function(device) {
	console.log('Found Sonos Connect');
	sonosDevice = device;
});

sonosObserver.on('Started', function(device) {
	console.log('Sonos Connect started');
	
    denonAvr.push({
        on: true,
		volume: 0.5,
		band: 'AUX1',
		soundmode: 'MCH STEREO'
    });
});

sonosObserver.on('Stopped', function(device) {
	console.log('Sonos Connect stopped');

    denonAvr.push({
        on: false
    });
});

denonObserver.discover();
sonosObserver.observeByName("Stue");