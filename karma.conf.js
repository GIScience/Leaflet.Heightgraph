// karma.conf.js
module.exports = (config) => {
    config.set({
        // this will keep the test output open on the karma browser result site
        client: {
            clearContext: false
        },
        basePath: "./",
        frameworks: ["jasmine", "esm"],
        files: [
            "./node_modules/leaflet/dist/leaflet-src.js",
            "./node_modules/leaflet/dist/leaflet.css",
            { pattern: "./src/L.Control.Heightgraph.js", type: 'module' },
            "./src/L.Control.Heightgraph.css",
            { pattern: 'spec/**/*.Spec.js', type: 'module' }
        ],
        plugins: [
            // load plugin
            require.resolve('@open-wc/karma-esm'),
            // fallback: resolve any karma- plugins
            'karma-*',
        ],
        browsers: ["Chrome"],
        autoWatch: true,
        reporters: [
            "progress",
            "kjhtml",
            "coverage"
        ],
        // TODO: coverage reports currently not working
        coverageReporter: {
            dir: "coverage/",
            reporters: [
                {type: "html", subdir: "html"},
                {type: "lcovonly", subdir: "../coverage"},
                {type: "json", subdir: "../coverage"},
                {type: "text-summary"}
            ],
        },
        esm: {
            nodeResolve: true
        },
        logLevel: config.LOG_DEBUG, failOnEmptyTestSuite: true
    })
}
