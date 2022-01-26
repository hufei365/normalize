export default {
    input: './src/index.js',
    output: [{
        file: 'dist/myschema.js',
        format: 'cjs',
        name: 'mySchema'
    }, {
        file: 'dist/myschema.esm.js',
        format: 'esm',
        name: 'mySchema'
    }]
};