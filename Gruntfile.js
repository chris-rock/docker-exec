'use strict';

module.exports = function(grunt) {

    // load the plugins.
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-mocha-test');

    // project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        // Configure a mochaTest task
        mochaTest: {
            test: {
                options: {
                    reporter: 'spec'
                },
                src: ['test/*.js']
            }
        },
        jshint: {
            allFiles: ['gruntfile.js', 'lib/**/*.js', 'services/**/*.js'],
            options: {
                jshintrc: '.jshintrc'
            }
        }
    });

    // configure tasks.
    grunt.registerTask('default', ['test']);
    grunt.registerTask('test', ['mochaTest', 'jshint']);
};