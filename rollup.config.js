import nodeResolve from '@rollup/plugin-node-resolve'
import {terser} from 'rollup-plugin-terser'
import babel from '@rollup/plugin-babel'
import css from 'rollup-plugin-css-porter'
import copy from 'rollup-plugin-copy'

// noinspection JSUnusedGlobalSymbols
export default {
    input: 'src/L.Control.Heightgraph.js',
    output: [
        {
            file: 'dist/L.Control.Heightgraph.js',
            format: 'cjs'
        },
        {
            file: 'dist/L.Control.Heightgraph.min.js',
            format: 'iife',
            name: 'version',
            plugins: [terser()]
        }

    ],
    plugins: [
        nodeResolve({
            mainFields: ['module','jsnext', 'main']
        }),
        babel({
            exclude: "node_modules/**", // only transpile our source code
            babelHelpers: 'bundled'
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
    external: ['leaflet'],
    // see e.g. https://github.com/rollup/rollup/issues/2271
    onwarn (warning, warn) {
        if (warning.code === 'CIRCULAR_DEPENDENCY') return;
        warn(warning);
    }
};
