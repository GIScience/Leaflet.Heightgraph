module.exports = function(grunt) {
    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        jshint: {
            // define the files to lint
            files: ['src/**/*.js'],
            // configure JSHint (documented at http://www.jshint.com/docs/)
            options: {
                // more options here if you want to override JSHint defaults
                asi: true,
                esnext: true,
                globals: {
                    console: true,
                    module: true
                }
            }
        },
        jasmine: {
            pivotal: {
                src: ['src/**/*.js'],
                options: {
                    specs: ['spec/*Spec.js'],
                    helpers: ['spec/*Helper.js'],
                    vendor: [
                        'node_modules/leaflet/dist/leaflet.js',
                        'node_modules/d3/dist/d3.min.js'
                    ],
                    '--local-to-remote-url-access': true
                }
            }
        },
        connect: {
            server: {
                options: {
                    port: 9001,
                    base: 'spec'
                }
            }
        }
    });
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-jasmine');
    grunt.loadNpmTasks('grunt-contrib-connect');
    grunt.registerTask('default', ['jshint', 'connect', 'jasmine']);
};
