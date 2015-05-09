#!/usr/bin/env node

'use strict';
var argv = require('optimist')
    .usage('Usage: $0 --denonip [ip] --sonosname [name]')
    .demand(['denonip', 'sonosname'])
    .argv;

var sonosObserver = require('../lib/sonosObserver');
var denon = require('../lib/denon');

var sonosObserver = new sonosObserver();
var avr = new denon({
    host: argv.denonip
});

var sonosDevice;

var denonSourceSonosConnect = 'AUX1';
var denonSourceTV = 'TV';


avr.on('SourceChanged', function (newSource) {
    if (newSource === denonSourceTV) {
        console.log('Denon AVR changed source from ' + oldSource + ' to ' + newSource + '. Stopping Sonos.');
        sonosDevice.stop(function (err, stopped) {});
    }
});

sonosObserver.on('DeviceAvailable', function (device, attrs) {
    var name = attrs['CurrentZoneName'];
    console.log('Found Sonos Connect named ' + name);
    sonosDevice = device;
});

sonosObserver.on('Started', function (device, attrs) {
    console.log('Sonos Connect started');

    turnDenonOnAndSetSourceToSonos();
});

sonosObserver.on('Stopped', function (device, attrs) {
    console.log('Sonos Connect stopped');

    //TODO: Switch Denon source to TV if it was in this state before Sonos started

    turnDenonOffIfSourceIsSonos();
});

sonosObserver.on('Paused', function (device, attrs) {
    console.log('Sonos Connect paused');

    turnDenonOffIfSourceIsSonos();
});

function turnDenonOnAndSetSourceToSonos() {
    avr.connect();

    console.log('Turning Denon on');
    avr.powerOn();
    avr.setSource(denonSourceSonosConnect);
    avr.setSoundMode('MCH STEREO');
}

function turnDenonOffIfSourceIsSonos() {
    avr.getSource(function (result) {
        if (result === denonSourceSonosConnect) {
            console.log('Powering Denon off');
            avr.powerOff();
        }
    });

    avr.disconnect();
}

sonosObserver.observeByName(argv.sonosname);