import babel from 'rollup-plugin-babel'
import babelrc from 'babelrc-rollup'
import nodeResolve from 'rollup-plugin-node-resolve'

export default {
    entry: 'build/src/index.js',
    dest: 'dist/index.js',
    format: 'cjs',
    sourceMap: 'inline',
    plugins: [
        babel(babelrc({ addExternalHelpersPlugin: false })),
        nodeResolve()
    ]
}
