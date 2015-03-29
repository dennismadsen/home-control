var denon = require('./lib/denon');
var heapdump = require('heapdump');

var avr = new denon({
	host: '10.0.1.14'
});

function query_powerstate() {
	avr.getPowerState(function(result) {
		console.log("PowerState: "+result);
	}, function(error) {
		console.log(error);
	});
	setTimeout(query_powerstate, 2000);
}

function query_volumestate() {
	avr.getVolumeState(function(result) {
		console.log("Volume state:"+result);
	}, function(error) {
		console.log(error);
	});
	setTimeout(query_volumestate, 2000);
}

query_powerstate();
query_volumestate();

process.on('SIGINT', function() {
  console.log("Caught interrupt signal");

  //console.log("Running GC");
  //gc();

  heapdump.writeSnapshot(__dirname + "/final.heapsnapshot", function writeFinalSnapshot () {
    console.log("Wrote final heap snapshot");
  });
  
  process.exit(0);
});