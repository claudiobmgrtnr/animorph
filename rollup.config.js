import babel from 'rollup-plugin-babel';

export default {
  entry: 'src/index.js',
  format: 'umd',
  moduleName: 'animorph',
  plugins: [ babel({
    presets: [ [ 'es2015', { modules: false } ], 'stage-0' ],
    babelrc: false
  }) ],
  dest: 'dist/index.js'
};
