var sonos = require('sonos');

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
	//TODO: Handle Denon AVR
}

function handleSonosConnectStopped() {
	console.log("Sonos Connect stopped");
	//TODO: Handle Denon AVR
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