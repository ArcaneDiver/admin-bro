/* eslint-disable import/no-extraneous-dependencies */
/**
 * @private
 * @fileoverview
 * This script runs process, which bundles all globals like React or ReactDOM
 * to the  `global-bundle.js`.
 */

const { rollup: _rollup }= require('rollup')
const { nodeResolve: resolve } = require('@rollup/plugin-node-resolve')
const commonjs = require('@rollup/plugin-commonjs')
const replace = require('@rollup/plugin-replace')
const json = require('@rollup/plugin-json')
const builtins = require('rollup-plugin-node-builtins')
const globals = require('rollup-plugin-node-globals')
const { terser } = require('rollup-plugin-terser')

const React = require('react')
const ReactDOM = require('react-dom')
const env = require('../src/backend/bundler/bundler-env')

const reactIsExport = ['isValidElementType', 'isContextConsumer', 'isElement', 'ForwardRef', 'typeOf']
const { theme, ...designSystem } = require('@admin-bro/design-system')

const run = async () => {
  const inputOptions = {
    input: `${__dirname}/../src/frontend/global-entry.js`,
    plugins: [
      resolve({
        extensions: ['.mjs', '.js', '.jsx', '.json'],
        mainFields: ['browser'],
        preferBuiltins: true,
      }),
      replace({
        'process.env.NODE_ENV': JSON.stringify(env),
        'process.env.IS_BROWSER': 'true',
        'process.stderr.fd': 'false',
      }),
      json(),
      commonjs({
        include: ['node_modules/**'],
        /* namedExports: {
          react: Object.keys(React),
          'react-dom': Object.keys(ReactDOM),
          'react-is': reactIsExport,
          'node_modules/react-redux/node_modules/react-is/index.js': reactIsExport,
          'node_modules/react-router/node_modules/react-is/index.js': reactIsExport,
          '@admin-bro/design-system/build/index.js': Object.keys(designSystem),
        }, */
        ignoreGlobal: true,
      }),
      globals(),
      builtins(),
      ...(env === 'production' ? [terser()] : []),
    ],
  }
  const bundle = await _rollup(inputOptions)

  return bundle.write({
    format: 'iife',
    name: 'globals',
    globals: {
      react: 'React',
      redux: 'Redux',
      axios: 'axios',
      recharts: 'Recharts',
      'styled-components': 'styled',
      'styled-system': 'StyledSystem',
      'react-dom': 'ReactDOM',
      'prop-types': 'PropTypes',
      'react-redux': 'ReactRedux',
      'react-router': 'ReactRouter',
      'react-router-dom': 'ReactRouterDOM',
    },
    file: `${__dirname}/../src/frontend/assets/scripts/global-bundle.${env}.js`,
  })
}

run()
