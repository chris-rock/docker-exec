'use strict';

var DockerRunner = require('../lib/docker-exec'),
    helper = require('./_helper/config');

describe('docker-exec', function () {

    var ds = null;

    before(function(done){
        ds = new DockerRunner(helper.getExecConfig());
        done();
    });

    it('run', function (done) {
        this.timeout(1000000);
        console.log('start new container');

        ds.start({
            Image: 'chrisrock/spaceportci-nodejs'
        }).then(function (stream) {
            stream.pipe(process.stdout);
        }).then(function () {
            return ds.run('git clone git://github.com/chris-rock/exec-simple.git spaceportci/exec-simple');
        }).then(function () {
            return ds.run('cd spaceportci/exec-simple');
        }).then(function () {
            return ds.run('git checkout -qf e6ce32aba6f1b01cef481a1d5e437e4bca10a7d7');
        }).then(function () {
            return ds.run('nvm use 0.10');
        }).then(function () {
            return ds.run('node --version');
        }).then(function () {
            return ds.run('npm --version');
        }).then(function () {
            return ds.run('apt-get install -y libicu-dev');
        }).then(function () {
            return ds.run('npm install');
        }).then(function () {
            return ds.run('npm test');
        }).then(function (code) {
            console.log('Run done with exit code: ' + code);
            // stop container
            return ds.stop();
        }).then(function () {
            
            done();
        }).catch(function (err) {
            console.log('Done with error');
            console.log(err);
        });

    });
});