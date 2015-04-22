var denonObserver = require('../lib/denonObserver');

var denonObserver = new denonObserver();


denonObserver.on('Discovered', function (device, attrs) {
    console.log("Found Denon AVR " + attrs.name);
});

denonObserver.on('StateChanged', function (state) {
    console.log(state);
});

denonObserver.on('BandChanged', function (band) {
    console.log(band);
});

denonObserver.discover();