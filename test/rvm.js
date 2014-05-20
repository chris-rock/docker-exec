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

        console.log('\n---> start new container\n');

        ds.start().then(function (stream) {
            stream.pipe(process.stdout);
            console.log('---> run apt-get update\n');
            return ds.run('apt-get update');
        }).then(function () {
            console.log('---> install curl\n');
            return ds.run('apt-get install -y curl'); // zlib1g-dev build-essential libssl-dev libreadline-dev libyaml-dev libsqlite3-dev sqlite3 libxml2-dev libxslt1-dev libcurl4-openssl-dev python-software-properties
        }).then(function () {
            console.log('---> install rvm\n');
            return ds.run('curl -sSL https://get.rvm.io | bash -s stable --rails'); // zlib1g-dev build-essential libssl-dev libreadline-dev libyaml-dev libsqlite3-dev sqlite3 libxml2-dev libxslt1-dev libcurl4-openssl-dev python-software-properties
        }).then(function () {
            console.log('---> load rvm environment\n');
            return ds.run('source ~/.rvm/scripts/rvm');
        }).then(function () {
            console.log('---> install ruby version\n');
            return ds.run('rvm install 1.9.3');
        }).then(function () {
            console.log('---> stop container\n');
            return ds.stop();
        }).then(function () {
            console.log('---> Done without error\n');
            done();
        }).catch(function (err) {
            console.log('Done with error\n');
            console.log(err);
        });

    });
});