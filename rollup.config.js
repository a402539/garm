import babel from '@rollup/plugin-babel';
import commonjs from '@rollup/plugin-commonjs';
import css from 'rollup-plugin-css-porter';
import json from '@rollup/plugin-json';
import resolve from '@rollup/plugin-node-resolve';
import {terser} from 'rollup-plugin-terser';

export default [
    {
        input: 'src/index.js',        
        output: { 
            file: 'wwwroot/main.js',
            format: 'iife',
            sourcemap: true,
            name: 'Garm',
            globals: {
                'leaflet': 'L',
            },
        },
        plugins: [                      
            resolve({moduleDirectories: ['node_modules', 'src']}),
            commonjs(),
            json(),
            css({dest: 'wwwroot/main.css', minified: false}),
            babel({babelHelpers: 'bundled'}),
            terser(),
        ],
    }, 
    {
        input: 'src/Worker/dataManager.js',
        output: { 
            file: 'wwwroot/dataManager.js',
            format: 'iife',
            sourcemap: true,
            name: 'DataManager',
            globals: {
                'leaflet': 'L',
            },
        },
        plugins: [                      
            resolve({moduleDirectories: ['node_modules', 'src']}),
            commonjs(),
            json(),
            babel({babelHelpers: 'bundled'}),
        ],
    },       
];