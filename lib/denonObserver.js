var denonAVRBridge = require('homestar-denon-avr').Bridge;
var debug = require('debug')('denonObserver');
var events = require('events');

var denonAVRBridge = new denonAVRBridge();

var eventEmitter = new events.EventEmitter();

function denonObserver() {
    
    var _this = this;
    
    denonAVRBridge.discovered = function(bridge) {
    	bridge.pulled = function(state) {
            var bandChanged = false;
            
            if (_this._band && _this._band!=state.band)
                bandChanged = true;
            
            _this.state = state;
            _this._band = state.band;
            _this.emit('StateChanged', _this.state);
            if (bandChanged)
                _this.emit('BandChanged', _this.state.band);
        };
        bridge.connect();
        
        var meta = bridge.meta();
        
        _this.device = bridge;
        _this.deviceAttrs = {
            name: meta['schema:name']
        }
        _this.emit('Discovered', _this.device, _this.deviceAttrs);
    };

}

denonObserver.prototype.device = undefined;
denonObserver.prototype.deviceAttrs = undefined;
denonObserver.prototype.state = undefined;

denonObserver.prototype._band = undefined;

denonObserver.prototype.discover = function() {
    denonAVRBridge.discover();
}

denonObserver.prototype.__proto__ = events.EventEmitter.prototype;

module.exports = denonObserver;