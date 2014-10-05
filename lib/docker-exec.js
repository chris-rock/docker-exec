'use strict';

var util = require('util'),
    EventEmitter = require('events').EventEmitter,
    Docker = require('dockerode'),
    Promise = require('bluebird'),
    uuid = require('uuid'),
    debug = require('debug')('docker-runner');


var DockerExec = function (options) {

    // linux
    options = options ||  {
        socketPath: '/var/run/docker.sock'
    };

    this.docker = new Docker(options);

    this.container = null;
};

util.inherits(DockerExec, EventEmitter);

/**
 * Creates a new docker container
 */
DockerExec.prototype.createContainer = function (options) {
    debug('create a new container');

    var docker = this.docker;
    return new Promise(function (resolve, reject) {
        docker.createContainer(options, function handler(err, container) {
            if (err) {
                reject(err);
            } else {
                resolve(container);
            }
        });
    });
};

/**
 * attaches a stream to a docker container
 */
DockerExec.prototype.attachContainer = function (container) {
    debug('attach to a container');

    var self = this;

    var attach_opts = {
        stream: true,
        stdin: true,
        stdout: true,
        stderr: true
    };

    return new Promise(function (resolve, reject) {
        container.attach(attach_opts, function handler(err, stream) {
            if (err) {
                reject(err);
            } else {

                // attach stream to stdout
                // stream.pipe(process.stdout);

                /*stream.on('data', function(data){
                    debug(data.toString('utf8'));
                });*/

                self.emit('container:attach');
                resolve(stream);
            }
        });
    });
};

/**
 * starts a docker container
 */
DockerExec.prototype.startContainer = function (container, options) {
    debug('start a new container');

    var self = this;

    return new Promise(function (resolve, reject) {
        container.start(options || {}, function handler(err, data) {
            if (err) {
                reject(err);
            } else {
                self.emit('container:start');
                resolve(data);
            }
        });
    });
};

/**
 * register for container end
 */
DockerExec.prototype.waitContainer = function (container) {
    debug('register wait event for a new container');

    var self = this;
    container.wait(function handler(err) {
        if (err) {
            self.emit('error', err);
            self.emit('container:stop');
            debug(err);
        } else {
            // emit stream end event;
            self.emit('container:stop');
        }
    });

};

DockerExec.prototype.pullContainer = function (image) {
    debug('download operating system: ' + image);
    var docker = this.docker;

    return new Promise(function (resolve, reject) {

        docker.pull(image, function (err, stream) {

            stream.on('data', function(data){
                debug(data.toString('utf8'));
            });

            stream.on('error', function() {
                reject();
            });

            stream.on('end', function(){
                resolve();
            });
        });
    });
};

DockerExec.prototype.removeContainer = function (container) {
    return new Promise(function (resolve, reject) {
        container.remove(function handler(err) {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });
};

DockerExec.prototype.killContainer = function (container) {
    return new Promise(function (resolve, reject) {
        container.kill(function handler(err) {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });
};

DockerExec.prototype.streamEnd = function () {
    if (this.stream) {
        this.stream.end();
    }
};

/*
 * Starts a new docker container
 */
DockerExec.prototype.start = function (options) {
    debug('start a new container');

    options = options ||  {};

    var optsc = {
        'Hostname': '',
        'User': '',
        'AttachStdin': true,
        'AttachStdout': true,
        'AttachStderr': true,
        'Tty': true,
        'OpenStdin': true,
        'StdinOnce': false,
        'Env': null,
        'Cmd': ['bash'], // run a bash shell
        'Dns': ['8.8.8.8', '8.8.4.4'], // use google dns
        'Image': options.Image ||  'ubuntu:14.04', // TODO make os configurable
        'Volumes': options.Volumes ||  {},
        'VolumesFrom': options.VolumesFrom || '',
        'Binds': options.Binds || []
    };

    var self = this;

    return new Promise(function (resolve, reject) {
        // console.log('prepare container');

        // attach a volume to docker to copy the files afterwards
        self.pullContainer(optsc.Image).then(function () {
            return self.createContainer(optsc);
        }).then(function (container) {
            self.container = container;
            return self.attachContainer(self.container);
        }).then(function (stream) {
            self.stream = stream;
            return self.startContainer(self.container, optsc);
        }).then(function () {
            self.waitContainer(self.container);
        }).then(function () {
            console.log('container ready');
            resolve(self.stream);
        }).
        catch(function (err) {
            console.log(err);
            reject(err);
        });
    });
};

/**
 * execute one command
 * @param command a cli command like "apt-get update\n"
 */
DockerExec.prototype.run = function (command) {
    var self = this;

    // emit process start event
    self.emit('start');

    function exitListener(data) {
        debug('recieved data ' + data);
        // wait for exit event and use abort condition with var exit = 'task ' + id;
        var match = data.toString('utf8').match(/((;echo\s)?exit\stask\s([A-Za-z0-9-]{36})\s(\d+))/i);
        debug(JSON.stringify(match));
        if (match && match.length > 0) {
            debug('detected exit with uuid: ' + match[3] + 'and exitcode: ' + match[4]);

            // emit process exit event
            self.emit('exit', match[4]);
        }
    }

    // register command exit listener
    self.stream.on('data', exitListener);

    // generate process id
    var id = uuid.v4();

    // add exit code to command
    var cmd2 = command + ';echo exit task ' + id + ' $?\n';
    debug('run: "' + cmd2 + '"');

    return new Promise(function (resolve, reject) {
        self.stream.write(cmd2);
        self.once('exit', function (exitcode) {
            // unregister listener
            self.stream.removeListener('data', exitListener);

            var ex = parseInt(exitcode);

            // exit promise
            if (ex === 0) {
                resolve(ex);
            } else {
                reject(ex);
            }
        });
    });
};



/**
 * stops the docker container
 */
DockerExec.prototype.stop = function () {
    debug('stops the container');
    var self = this;
    var container = this.container;

    return new Promise(function (resolve, reject) {
        self.killContainer(container).then(function () {
            return self.removeContainer(container);
        }).then(function () {
            resolve();
        }).
        catch(function (err) {
            reject(err);
        });
    });
};

module.exports = DockerExec;