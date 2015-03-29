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

denon.prototype.getVolumeState = function(successCallback, errorCallback) {
	this.queueCommand("MV?", successCallback, errorCallback);
}

/* Power commands */
denon.prototype.getPowerState = function(successCallback, errorCallback) {
	this.queueCommand("PW?", successCallback, errorCallback);
}

denon.prototype.powerOn = function(successCallback, errorCallback) {
	this.queueCommand("PWON", successCallback, errorCallback);
}

denon.prototype.powerOff = function(successCallback, errorCallback) {
	this.queueCommand("PWSTANDBY", successCallback, errorCallback);
}

/* Source commands */
denon.prototype.setSource = function(source, successCallback, errorCallback) {
	this.queueCommand(source, successCallback, errorCallback);
}

denon.prototype.setSourceToAUX = function(successCallback, errorCallback) {
	this.setSource("SIAUX1", successCallback, errorCallback);
}

/* Sound mode commands */
denon.prototype.setSoundMode = function(mode, successCallback, errorCallback) {
	this.queueCommand(mode, successCallback, errorCallback);
}

denon.prototype.setSoundModeToMultiChannelStereo = function(successCallback, errorCallback) {
	this.setSoundMode("MSMCH STEREO", successCallback, errorCallback);
}

denon.prototype.setSoundModeToAuto = function(successCallback, errorCallback) {
	this.setSoundMode("MSSTANDARD", successCallback, errorCallback); //TODO: Is this the AUTO mode?
}

/* Private variables and methods */
denon.prototype._stopProcessing = false;
denon.prototype._commandQueue = [];

denon.prototype._processCommand = function(cmd, successCallback, errorCallback) {
	var connection = new telnet();
	var done = false;
	var responseExpected  = cmd.slice(-1) == "?";
	
	//console.log("responseExpected: "+responseExpected);
	
	connection.on('connect', function(prompt) {
		console.log("Execution command "+cmd);
		
		var responseFunction = function(response) {
			done = true;
			if (successCallback)
				successCallback(response);
		};
		
		if (responseExpected) {
			connection.exec(cmd, responseFunction);
		} else {
			connection.exec(cmd);
			responseFunction();
		}
	});
	
	connection.on('timeout', function() {
	  //console.log('connection timeout');
	  if (responseExpected && !done) {
		  //console.log("command "+cmd+" was not done before timeout");
		  if (errorCallback)
		  	errorCallback("command timeout");
	  }
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
		//console.log("commandQueue size: "+this._commandQueue.length);
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
		setTimeout(function() { self._query_processCommandQueue() }, 2000);
	});
}

module.exports = denon;