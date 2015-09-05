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

var ignoreAvrSourceChanged = false;

avr.on('SourceChanged', function (newSource) {
    if (ignoreAvrSourceChanged) {
        return;
    }
        
    if (newSource === denonSourceTV) {
        console.log('Denon AVR changed source to ' + newSource + '. Stopping Sonos.');
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

    denonDisconnectAndOffIfSourceIsSonos();
});

sonosObserver.on('Paused', function (device, attrs) {
    console.log('Sonos Connect paused');

    denonDisconnectAndOffIfSourceIsSonos();
});

function turnDenonOnAndSetSourceToSonos() {
    avr.connect();
    
    ignoreAvrSourceChanged = true;

    var endFunction = function(result) {
        console.log('endFunctionCalled: '+result);
        ignoreAvrSourceChanged = false;
    };

    console.log('Turning Denon on');
    avr.powerOn(function (result) {
        console.log('powered on');
        avr.setSource(denonSourceSonosConnect, function(result) {
            console.log('source set');
            ignoreAvrSourceChanged = false;
        }, endFunction);
    }, endFunction);
    
    // TODO: do we need to change sound mode?
    //avr.setSoundMode('MCH STEREO');
}

function denonDisconnectAndOffIfSourceIsSonos() {
    avr.getSource(function (result) {
        if (result === denonSourceSonosConnect) {
            console.log('Powering Denon off');
            avr.powerOff();
            avr.disconnect();
        } else {
            avr.disconnect();
        }
    });
}

sonosObserver.observeByName(argv.sonosname);