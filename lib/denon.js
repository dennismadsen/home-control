var telnet = require('telnet-client');

function denon(params) {
	for(var key in params) {
      this.params[key] = params[key];
  }
}

denon.prototype.params = {
	shellPrompt: '',
	echoLines: 0,
	irs: '\r',
	ors: '\r',
	//separator: false,
	execTimeout: 200
}

denon.prototype.connect = function() {
	this._query_processCommandQueue();
}

denon.prototype.disconnect = function() {
	this._stopProcessing = true;
}

denon.prototype.queueCommand = function(cmd, successCallback, errorCallback) { 
	this._commandQueue.push({
		"cmd": cmd,
		"successCallback": successCallback,
		"errorCallback": errorCallback
	});
}

denon.prototype.getPowerState = function(successCallback, errorCallback) {
	this.queueCommand("PW?", successCallback, errorCallback);
}

denon.prototype.getVolumeState = function(successCallback, errorCallback) {
	this.queueCommand("MV?", successCallback, errorCallback);
}

denon.prototype.powerOn = function(successCallback, errorCallback) {
	this.queueCommand("PWON", successCallback, errorCallback);
}

denon.prototype.standby = function(successCallback, errorCallback) {
	this.queueCommand("PWSTANDBY", successCallback, errorCallback);
}

denon.prototype._stopProcessing = false;
denon.prototype._commandQueue = [];

denon.prototype._processCommand = function(cmd, successCallback, errorCallback) {
	var connection = new telnet();
	
	connection.on('connect', function(prompt) {
		connection.exec(cmd, function(response) {
			if (successCallback)
				successCallback(response);
		});
	});
	
	connection.on('timeout', function() {
	  //console.log('connection timeout');
	  connection.end();
	});
	
	connection.on('error', function(error) {
	  //console.log('connection error: '+error);
	  connection.end();
	  if (errorCallback)
	  	errorCallback(error);
	});

	connection.on('close', function() {
	  //console.log('connection closed');
	  connection.end();
	  connection.destroy();
	  connection = null;
	});
	
	connection.connect(this.params);
}

denon.prototype._processCommandQueue = function(callback) {
	var cmd = this._commandQueue.shift();
	if (cmd) {
		this._processCommand(cmd.cmd, cmd.successCallback, cmd.errorCallback);
		console.log("commandQueue size: "+this._commandQueue.length);
	}
	
	if (this._stopProcessing) {
		this._stopProcessing = false;
		return;
	}
	
	callback();
}

denon.prototype._query_processCommandQueue = function() {
	var self = this; 
	this._processCommandQueue(function() {
		setTimeout(function() { self._query_processCommandQueue() }, 800);
	});
}

module.exports = denon;