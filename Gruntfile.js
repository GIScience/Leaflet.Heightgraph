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
                    specs: 'spec/*Spec.js',
                    helpers: 'spec/*Helper.js',
                    vendor: ['https://unpkg.com/leaflet@1.0.0-rc.3/dist/leaflet.js', 'https://d3js.org/d3.v4.min.js', "https://d3js.org/d3-scale-chromatic.v0.3.min.js"],
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