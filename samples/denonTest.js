var denon = require('../lib/denon');
var config = require('./config');

var avr = new denon({
    host: config.denonIp
});

avr.on('StateChanged', function (state) {
    console.log(state);
});

avr.on('SourceChanged', function (source) {
    console.log('Source changed:' + source);
});

avr.connect();

setTimeout(function () {
    console.log('Disconnecting');
    avr.disconnect();
}, 10000);