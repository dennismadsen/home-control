var telnet = require('telnet-client');
var debug = require('debug')('denon');
var events = require('events');

var eventEmitter = new events.EventEmitter();

function denon(params) {
    for (var key in params) {
        this.params[key] = params[key];
    }
}

denon.prototype.params = {
    shellPrompt: '',
    echoLines: 0,
    irs: '\r',
    ors: '\r',
    execTimeout: 300
};

denon.prototype.state = [];

denon.prototype.connect = function () {
    debug('connecting..');
    var currentValue = this._isRunning;
    this._isRunning = true;

    if (!currentValue) {
        this._queryProcessCommandQueue();
        this._queryPullState();
    }
};

denon.prototype.disconnect = function () {
    debug('disconnecting..');
    this._isRunning = false;
};

denon.prototype.queueCommand = function (cmd, successCallback, errorCallback) {
    this._commandQueue.push({
        'cmd': cmd,
        'successCallback': successCallback,
        'errorCallback': errorCallback
    });
};

denon.prototype.getVolumeState = function (successCallback, errorCallback) {
    this.queueCommand('MV?', successCallback, errorCallback);
};

/* Power commands */
denon.prototype.getPowerState = function (successCallback, errorCallback) {
    this.queueCommand('PW?', successCallback, errorCallback);
};

denon.prototype.powerOn = function (successCallback, errorCallback) {
    this.queueCommand('PWON', successCallback, errorCallback);
};

denon.prototype.powerOff = function (successCallback, errorCallback) {
    this.queueCommand('PWSTANDBY', successCallback, errorCallback);
};

/* Source commands */
denon.prototype.getSource = function (successCallback, errorCallback) {
    this.queueCommand('SI?', successCallback, errorCallback);
};

denon.prototype.setSource = function (source, successCallback, errorCallback) {
    this.queueCommand('SI' + source, successCallback, errorCallback);
};

denon.prototype.setSourceToAUX = function (successCallback, errorCallback) {
    this.setSource('AUX1', successCallback, errorCallback);
};

/* Sound mode commands */
denon.prototype.getSoundMode = function (successCallback, errorCallback) {
    this.queueCommand('MS?', successCallback, errorCallback);
};

denon.prototype.setSoundMode = function (mode, successCallback, errorCallback) {
    this.queueCommand('MS' + mode, successCallback, errorCallback);
};

denon.prototype.setSoundModeToMultiChannelStereo = function (successCallback, errorCallback) {
    this.setSoundMode('MCH STEREO', successCallback, errorCallback);
};

denon.prototype.setSoundModeToAuto = function (successCallback, errorCallback) {
    this.setSoundMode('STANDARD', successCallback, errorCallback); //TODO: Is this the AUTO mode?
};

/* Private variables and methods */
denon.prototype._isRunning = false;
denon.prototype._commandQueue = [];

denon.prototype._processCommand = function (cmd, successCallback, errorCallback) {
    var _this = this;
    var connection = new telnet();
    var done = false;
    var stateCommand = cmd.slice(-1) === '?';

    debug('stateCommand %s', stateCommand);

    connection.on('connect', function (prompt) {
        debug('Execution command %s', cmd);

        var stateResponseFunction = function (response) {
            done = true;

            if (response) {
                var key = response.substring(0, 2);
                var value = response.substr(2);

                var currentValue = _this.state[key];

                _this.state[key] = value;
                if (currentValue !== value) {
                    _this.emit('StateChanged', _this.state);
                    _this._handleCustomStateChange(key, value);
                }

                if (successCallback) {
                    successCallback(value);
                }
            } else {
                if (errorCallback) {
                    errorCallback('no response');
                }
            }
        };

        if (stateCommand) {
            connection.exec(cmd, stateResponseFunction);
        } else {
            connection.exec(cmd);
            stateResponseFunction();
        }
    });

    connection.on('timeout', function () {
        debug('connection timeout');
        if (stateCommand && !done) {
            debug('command %s was not done before timeout', cmd);
            if (errorCallback) {
                errorCallback('command timeout');
            }
        }
        connection.end();
    });

    connection.on('error', function (error) {
        debug('connection error: %s', error);
        connection.end();
        if (errorCallback) {
            errorCallback(error);
        }
    });

    connection.on('close', function () {
        debug('connection closed');
        connection.end();
        connection.destroy();
        connection = null;
    });

    connection.connect(this.params);
};

denon.prototype._handleCustomStateChange = function (key, value) {
    if (key === 'SI') {
        this.emit('SourceChanged', value);
    }
};

denon.prototype._processCommandQueue = function (callback) {
    var cmd = this._commandQueue.shift();
    if (cmd) {
        this._processCommand(cmd.cmd, cmd.successCallback, cmd.errorCallback);

        debug('commandQueue size: %d', this._commandQueue.length);
    }

    if (this._isRunning) {
        callback();
    }
};

denon.prototype._queryProcessCommandQueue = function () {
    var _this = this;
    this._processCommandQueue(function () {
        setTimeout(function () {
            _this._queryProcessCommandQueue();
        }, 2000);
    });
};

denon.prototype._pullState = function (callback) {
    debug('pulling state');
    this.getVolumeState();
    this.getPowerState();
    this.getSource();
    this.getSoundMode();

    if (this._isRunning) {
        callback();
    }
};

denon.prototype._queryPullState = function () {
    var _this = this;
    this._pullState(function () {
        setTimeout(function () {
            _this._queryPullState();
        }, 2000);
    });
};

denon.prototype.__proto__ = events.EventEmitter.prototype;

module.exports = denon;