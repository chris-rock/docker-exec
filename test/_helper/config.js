'use strict';

var os = require('os');

function getExecConfig() {
    if (os.platform() == 'darwin') {
        return {
            host: 'http://127.0.0.1',
            port: 4243
        };
    } else {
        return null; // default should work
    }
}

module.exports = {
    getExecConfig : getExecConfig
};