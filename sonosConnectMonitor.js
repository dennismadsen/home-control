var sonos = require('sonos');
var denon = require('./lib/denon');

var avr = new denon({
	host: '10.0.1.14'
});

avr.connect();

var searchModel = "ZPS1"; //TODO: Change to Sonos Connect Model UUID

var sonosDevice = null;
var lastState = "";

console.log('Searching for Sonos Connect on network');

sonos.search(function(device, model) {
	
	if (model==searchModel) {
		
		device.getZoneAttrs(function(err, attrs) {
			var name = attrs['CurrentZoneName'];
			
			console.log("Found Sonos Connect named \""+name+"\"");
			sonosDevice = device;
			query_getSonosState();			
		});
	}
});

function handleSonosConnectStarted() {
	console.log("Sonos Connect started");
	
	avr.powerOn(function () {
		avr.setSourceToAUX(function() {
			avr.setSoundModeToMultiChannelStereo(function() {
				//TODO: Set volume?
			});
		});
	});
}

function handleSonosConnectStopped() {
	console.log("Sonos Connect stopped");
	
	avr.setSoundModeToAuto(function() {
		avr.powerOff();
	});
}

function getSonosState(callback) {
	sonosDevice.getCurrentState(function(err, state) {
		if (state!=lastState) {
			
			switch (state) {
			case "playing":
				handleSonosConnectStarted();
				break;
			case "stopped":
				handleSonosConnectStopped();
				break;
			}
			
			lastState = state;
		}
		
		if (callback)
			callback();
	});
}

function query_getSonosState() {
	getSonosState(function() {
		setTimeout(query_getSonosState, 1000);
	});
}