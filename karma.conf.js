// karma.conf.js
module.exports = (config) => {
    config.set({
        // this will keep the test output open on the karma browser result site
        client: {
            clearContext: false
        },
        basePath: "./",
        frameworks: ["jasmine"],
        browsers: ["Chrome"],
        files: [
            "./node_modules/d3/dist/d3.js",
            "./node_modules/leaflet/dist/leaflet.js",
            "./node_modules/leaflet/dist/leaflet.css",
            {
                pattern: "./node_modules/jasmine-core/images/jasmine_favicon.png",
                watched: false,
                included: false,
                served: true
            },
            "./src/L.Control.Heightgraph.js",
            "./src/L.Control.Heightgraph.css",
            "./spec/L.Control.Heightgraph.Spec.js"
        ],
        autoWatch: true,
        reporters: [
            "progress",
            "kjhtml",
            "coverage"
        ],
        preprocessors: {
            "src/**/*.js": "coverage"
        },
        coverageReporter: {
            dir: "coverage/", reporters: [
                {type: "html", subdir: "html"},
                {type: "lcovonly", subdir: "../coverage"},
                {type: "json", subdir: "../coverage"},
                {type: "text-summary"}
            ]
        },
        logLevel: config.LOG_DEBUG, failOnEmptyTestSuite: true
    })
}
