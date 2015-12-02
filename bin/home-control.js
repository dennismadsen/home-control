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

var sonosConnected = false;
var denonSourceBeforeSonosWasTurnedOn;

avr.on('SourceChanged', function (newSource) {        
    if (sonosConnected && newSource === denonSourceTV) {
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

    turnDenonOnAndSetSourceToSonos(function() {
        sonosConnected = true;
    });
});

sonosObserver.on('Stopped', function (device, attrs) {
    console.log('Sonos Connect stopped');

    handleSonosStopped();
});

sonosObserver.on('Paused', function (device, attrs) {
    console.log('Sonos Connect paused');
    
    handleSonosStopped();
});

function handleSonosStopped() {
    if (denonSourceBeforeSonosWasTurnedOn !== undefined) {
        avr.setSource(denonSourceBeforeSonosWasTurnedOn);
        avr.disconnect();
        denonSourceBeforeSonosWasTurnedOn = undefined;
    } else {
        disconnectDenonAndTurnOffIfSourceIsSonos();
    }
    sonosConnected = false;
}

function turnDenonOnAndSetSourceToSonos(successCallback) {
    avr.connect();
    
    avr.getPowerState(function (result) {
        if (result === 'ON') {
            avr.getSource(function (result) {
                denonSourceBeforeSonosWasTurnedOn = result;
                avr.setSource(denonSourceSonosConnect, function (result) {
                    if (successCallback) {
                        successCallback();
                    }
                });
            });
        } else {
                     
            avr.powerOn(function (result) {
                avr.setSource(denonSourceSonosConnect, function(result) {
                    if (successCallback) {
                        successCallback();
                    }
                });
            });
            
        }    
    });
    
    // TODO: do we need to change sound mode?
    //avr.setSoundMode('MCH STEREO');
}

function disconnectDenonAndTurnOffIfSourceIsSonos() {
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