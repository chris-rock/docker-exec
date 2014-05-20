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
        
        ds.start().then(function (stream) {
            stream.pipe(process.stdout);
            console.log('run apt-get update');
            return ds.run('apt-get update');
        }).then(function () {
            console.log('install packages');
            return ds.run('apt-get install -y git-core curl');
        }).then(function () {
            console.log('install ruby');
            return ds.run('apt-get install -y ruby1.9.3');
        }).then(function () {
            console.log('print ruby version');
            return ds.run('ruby -v');
        }).then(function () {
            console.log('stop container');
            return ds.stop();
        }).then(function () {
            console.log('Done without error');
            done();
        }).catch(function (err) {
            console.log('Done with error');
            console.log(err);
        });
    });
});