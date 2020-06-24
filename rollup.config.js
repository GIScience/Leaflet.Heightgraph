import commonjs  from 'rollup-plugin-commonjs'
import nodeResolve from 'rollup-plugin-node-resolve'
import {terser} from 'rollup-plugin-terser'
import babel from 'rollup-plugin-babel'
import css from 'rollup-plugin-css-porter'
import copy from 'rollup-plugin-copy'

export default {
    input: 'src/L.Control.Heightgraph.js',
    output: [
        {
            file: 'dist/L.Control.Heightgraph.js',
            format: 'cjs'
        },
        {
            file: 'dist/L.Control.Heightgraph.min.js',
            format: 'cjs',
            plugins: [terser()]
        }

    ],
    plugins: [
        nodeResolve({
            mainFields: ['jsnext', 'main']
        }),
        commonjs({
            namedExports: {
                "d3-selection": ["select", "selectAll", "mouse"],
                "d3-scale-chromatic": [
                    "schemeAccent", "schemeDark2", "schemeSet2", "schemeCategory10", "schemeSet3", "schemePaired"
                ],
                "d3-scale": ["scaleOrdinal", "scaleLinear"],
                "d3-array": ["quantile", "min", "max", "bisector"],
                "d3-shape": ["curveBasis", "curveLinear", "line", "area", "symbol", "symbolTriangle"],
                "d3-format": ["format"],
                "d3-drag": ["drag"],
                "d3-axis": ["axisLeft", "axisBottom", "axisRight"]
            }
        }),
        babel({
            exclude: "node_modules/**" // only transpile our source code
        }),
        css({
            raw: 'dist/L.Control.Heightgraph.css',
            minified: 'dist/L.Control.Heightgraph.min.css'
        }),
        copy({
            targets: [
                { src: 'src/img/**/*', dest: 'dist/img'}
            ]
        })
    ],
    external: ['leaflet']
};
