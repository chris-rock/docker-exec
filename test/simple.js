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

        // creates a new container
        ds.start().then(function (stream) {
            // pipe it to the console here
            stream.pipe(process.stdout);

            // run a command
            return ds.run('cat /etc/lsb-release');
        }).then(function () {
            // stops and deletes the container
            return ds.stop();
        }).then(function () {
            // Done without error
            done();
        }).catch(function (err) {
            // Done with error
            console.log(err);
        });
    });
});