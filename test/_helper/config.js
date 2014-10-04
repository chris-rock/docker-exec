'use strict';

var os = require('os');
var url = require('url');

function getExecConfig() {
    if (os.platform() === 'darwin') {
        var urlObj = url.parse(process.env.DOCKER_HOST);
        return {
            host: 'http://' + urlObj.hostname,
            port: urlObj.port
        };
    } else {
        return null; // default should work
    }
}

module.exports = {
    getExecConfig : getExecConfig
};