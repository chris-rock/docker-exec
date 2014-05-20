# docker-exec

Run multiple commands in a docker container. Very useful if you need a container where you are able to run multiple commands. Every command that runs in a container is encapsulated in a javascript promise and returns once the command is done.

## Requirements

This module is based on docker. Please follow the [installation guide](https://www.docker.io/gettingstarted/) and a [specific guide for Mac](http://docs.docker.io/installation/mac/).

## Usage

```javascript
// var ds = new DockerRunner();
ds.start().then(function (stream) {
    stream.pipe(process.stdout);
    console.log('---> run apt-get update\n');
    return ds.run('apt-get update');
}).then(function () {
    console.log('---> install curl\n');
    return ds.run('apt-get install -y curl');
}).then(function () {
    console.log('---> install rvm\n');
    return ds.run('curl -sSL https://get.rvm.io | bash -s stable --rails');
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
```

On Mac install boot2docker and change the initialization:

```javascript
// for mac use
var ds = new DockerRunner({
    host: 'http://127.0.0.1',
    port: 4243
});
```

## Contributing

1. Fork it ( http://github.com/chris-rock/exec-simple/fork )
2. Create your feature branch (`git checkout -b my-new-feature`)
3. Commit your changes (`git commit -am 'Add some feature'`)
4. Push to the branch (`git push origin my-new-feature`)
5. Create new Pull Request

## Author

- Christoph Hartmann <chris@lollyrock.com>

## License

MIT