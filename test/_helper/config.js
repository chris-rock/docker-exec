'use strict';

var os = require('os');

function getExecConfig() {
    if (os.platform() == 'darwin') {
        return {
            host: 'http://192.168.59.103',
            port: 2375
        };
    } else {
        return null; // default should work
    }
}

module.exports = {
    getExecConfig : getExecConfig
};