var sonosObserver = require('./lib/sonosObserver');
var denonObserver = require('./lib/denonObserver');

var sonosObserver = new sonosObserver();
var denonObserver = new denonObserver();

var denonAvr;
var denonBand;
var sonosDevice;

var denonBandSonosConnect = 'AUX1';
var denonBandTV = 'TV';

denonObserver.on('Discovered', function (device, attrs) {
    console.log('Found Denon AVR ' + attrs.name);
    denonAvr = device;
});

denonObserver.on('BandChanged', function (newBand) {
    var oldBand = denonBand;

    if (oldBand === denonBandSonosConnect && newBand === denonBandTV) {
        console.log('Denon AVR changed band from ' + oldBand + ' to ' + newBand + '. Stopping Sonos.');
        sonosDevice.stop(function (err, stopped) {

        });
    }

    denonBand = newBand;
});

sonosObserver.on('DeviceAvailable', function (device, attrs) {
    var name = attrs['CurrentZoneName'];
    console.log('Found Sonos Connect named ' + name);
    sonosDevice = device;
});

sonosObserver.on('Started', function (device, attrs) {
    console.log('Sonos Connect started');

    denonAvr.push({
        on: true,
        volume: 0.7,
        band: denonBandSonosConnect,
        soundmode: 'MCH STEREO'
    });
});

sonosObserver.on('Stopped', function (device, attrs) {
    console.log('Sonos Connect stopped');

    //TODO: Switch Denon band to TV if it was in this state before Sonos started

    if (denonBand === denonBandSonosConnect) {
        denonAvr.push({
            on: false
        });
    }
});

sonosObserver.on('Paused', function (device, attrs) {
    console.log('Sonos Connect paused');

    if (denonBand === denonBandSonosConnect) {
        denonAvr.push({
            on: false
        });
    }
});

denonObserver.discover();
sonosObserver.observeByName('Stue');