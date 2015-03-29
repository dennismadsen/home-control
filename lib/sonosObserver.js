var sonos = require('sonos');
var debug = require('debug')('sonosObserver');
var events = require('events');

var eventEmitter = new events.EventEmitter();

function sonosObserver() {
	this._query_getState();
}

sonosObserver.prototype.observeByName = function(name) {
	this._searchByName = name;
	this._search();
}

sonosObserver.prototype.device = undefined;

sonosObserver.prototype.getState = function(callback) {
	debug('getState called');
	var _this = this;
	
	if (this.device) {
		this.device.getCurrentState(function(err, state) {
			if (state!=_this._lastState) {
			
				if (_this._lastState) {
					switch (state) {
					case "playing":
						_this.emit('Started', _this.device);
						break;
					case "stopped":
						_this.emit('Stopped', _this.device);
						break;
					}
				}
			
				_this._lastState = state;
			}
		
			if (callback)
				callback();
		});
	} else {
		if (callback)
			callback();
	}
}

sonosObserver.prototype._lastState = undefined;

sonosObserver.prototype._searchByName = undefined;

sonosObserver.prototype._search = function() {
	debug('Searching for Sonos devices on network');
	
	var _this = this;
	
	sonos.search(function(device, model) {
		debug('Found %j %j', device, model);
		
		device.getZoneAttrs(function(err, attrs) {
			if (_this._searchByName) {
				var name = attrs['CurrentZoneName'];
		
				if (name == _this._searchByName) {
					console.log('Found Sonos Connect named "'+name+'"');
					_this.device = device;
					_this.emit('DeviceAvailable', _this.device);
				}
			}
		});
	});
}

sonosObserver.prototype._query_getState = function() {
	var _this = this; 
	this.getState(function() {
		setTimeout(function() { _this._query_getState() }, 2000);
	});
}

sonosObserver.prototype.__proto__ = events.EventEmitter.prototype;

module.exports = sonosObserver;