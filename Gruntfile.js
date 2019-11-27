module.exports = function(grunt) {
    require('load-grunt-tasks')(grunt);
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        jshint: {
            files: ['src/**/*.js', 'spec/**/*.js'],
            // configure JSHint (documented at http://www.jshint.com/docs/)
            options: {
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
        },
        babel: {
            options: {
                sourceMap: true,
                presets: ['@babel/preset-env']
            },
            dist: {
                files: {
                    'dist/L.Control.Heightgraph.js': 'src/L.Control.Heightgraph.js'
                }
            }
        }
    });
    grunt.registerTask('default', ['jshint', 'connect', 'jasmine']);
};
