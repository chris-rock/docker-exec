'use strict';

var os = require('os');
var url = require('url');

function getExecConfig() {
    var config = null;
    if (os.platform() === 'darwin') {
        if (process.env.DOCKER_HOST) {
            var urlObj = url.parse(process.env.DOCKER_HOST);
            config = {
                host: 'http://' + urlObj.hostname,
                port: urlObj.port
            };
        } else {
            console.error('Please set environment variable DOCKER_HOST');
        }
    }
    return config;
}

module.exports = {
    getExecConfig : getExecConfig
};