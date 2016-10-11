import babel from 'rollup-plugin-babel';

export default {
  entry: 'src/jquery.js',
  format: 'umd',
  moduleName: 'animorph',
  plugins: [
    babel({
      presets: [ [ 'es2015', { modules: false } ], 'stage-0' ],
      babelrc: false
    })
  ],
  globals: {
    jquery: 'jQuery'
  },
  external: [
    'jquery'
  ],
  dest: 'dist/animorph.jquery.js'
};
