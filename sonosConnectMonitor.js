var log4js = require('log4js');
var sonosObserver = require('./lib/sonosObserver');
var denonObserver = require('./lib/denonObserver');


log4js.configure('configurations/logging.json', {});
var logger = log4js.getLogger("default");
var sonosObserver = new sonosObserver();
var denonObserver = new denonObserver();

var denonAvr = undefined;
var denonBand = undefined;
var sonosDevice = undefined;

var denonBandSonosConnect = 'AUX1';
var denonBandTV = 'TV';

denonObserver.on('Discovered', function(device, attrs) {
	logger.info("Found Denon AVR "+attrs.name);
    denonAvr = device;
});

denonObserver.on('BandChanged', function(newBand) {
    var oldBand = denonBand;
    
    if (oldBand===denonBandSonosConnect && newBand===denonBandTV) {
        logger.info('Denon AVR changed band from '+oldBand+' to '+newBand+'. Stopping Sonos.');
        sonosDevice.stop(function(err, stopped) {
            
        });
    }
    
    denonBand = newBand;
});

sonosObserver.on('DeviceAvailable', function(device, attrs) {
	var name = attrs['CurrentZoneName'];
	logger.info('Found Sonos Connect named '+name);
	sonosDevice = device;
});

sonosObserver.on('Started', function(device, attrs) {
	logger.info('Sonos Connect started');
	
    denonAvr.push({
        on: true,
		volume: 0.5,
		band: denonBandSonosConnect,
		soundmode: 'MCH STEREO'
    });
});

sonosObserver.on('Stopped', function(device, attrs) {
	logger.info('Sonos Connect stopped');

    if (denonBand===denonBandSonosConnect) {
        denonAvr.push({
            on: false
        });
    }
});

sonosObserver.on('Paused', function(device, attrs) {
	logger.info('Sonos Connect paused');

    if (denonBand===denonBandSonosConnect) {
        denonAvr.push({
            on: false
        });
    }
});

denonObserver.discover();
sonosObserver.observeByName("Stue");