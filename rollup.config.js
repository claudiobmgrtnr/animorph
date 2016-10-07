import babel from 'rollup-plugin-babel';
import nodeResolve from 'rollup-plugin-node-resolve';

export default {
  entry: 'src/index.js',
  format: 'umd',
  moduleName: 'Animorph',
  plugins: [
    babel({
      presets: [ [ 'es2015', { modules: false } ], 'stage-0' ],
      babelrc: false
    }),
    nodeResolve({})
  ],
  sourceMap: true,
  dest: 'dist/index.js'
};
