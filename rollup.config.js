import babel from 'rollup-plugin-babel';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import css from 'rollup-plugin-css-porter';
import json from '@rollup/plugin-json';
// import cpy from 'rollup-plugin-cpy';

export default [
    {
        input: 'src/index.js',        
        output: { 
            file: 'wwwroot/main.js',
            format: 'iife',
            sourcemap: true,
            name: 'D3T',
            globals: {
                'd3': 'd3',                
            },
        },
        plugins: [                      
            resolve({                
                moduleDirectories: ['node_modules', 'src']
            }),
            commonjs(),            
            json(),
            css({dest: 'wwwroot/main.css', minified: false}),
            // cpy([
            //     {files: 'src/images/*.*', dest: 'public/assets/images'},
            //     {files: 'src/ImageBitmapLoader-worker.js', dest: 'public'},
            // ]),
            babel({                
                extensions: ['.js', '.mjs'],
                exclude: ['node_modules/@babel/**', 'node_modules/core-js/**'],
                include: ['src/**']
            }),
        ],
    },          
];