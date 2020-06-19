module.exports = function(grunt) {
    require('load-grunt-tasks')(grunt);
    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        jshint: {
            // define the files to lint
            files: ['src/**/*.js', 'spec/**/*.js'],
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
        },
        uglify: {
            heightgraph: {
                files: {
                    'dist/L.Control.Heightgraph.min.js': 'dist/L.Control.Heightgraph.js'
                }
            }
        },
        cssmin: {
            target: {
                files: {
                    'dist/L.Control.Heightgraph.min.css': 'src/L.Control.Heightgraph.css'
                }
            }
        },
        browserify: {
            target: {
                files: {
                    'dist/L.Control.Heightgraph.js': 'src/L.Control.Heightgraph.js'
                },
                options: {
                    browserifyOptions: {
                        debug: true
                    },
                    transform: [ [ 'babelify', { presets: ["@babel/preset-env"] } ] ]
                }
            }
        },
        copy: {
            img: {
                files: [
                    {
                        expand: true,
                        cwd: 'src/',
                        src: 'img/*',
                        dest: 'dist/'
                    }
                ]
            }
        }
    });
    grunt.registerTask('default', ['jshint', 'connect', 'jasmine']);
    grunt.registerTask('build', ['browserify', 'copy', 'uglify', 'cssmin']);
};
