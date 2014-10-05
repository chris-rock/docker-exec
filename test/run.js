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
        this.timeout(50000);
        
        console.log('start new container');

        ds.start().then(function (stream) {
            stream.pipe(process.stdout);
            return ds.run('cat /etc/hosts');
        }).then(function () {
            return ds.run('cd / && ls');
        }).then(function () {
            return ds.run('echo "test" >> /private/test.txt');
        }).then(function () {
            return ds.run('cd /private');
        }).then(function () {
            return ds.run('ls');
        }).then(function () {
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