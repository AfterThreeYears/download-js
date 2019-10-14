const plugins = [
  '@babel/plugin-transform-runtime',
  "@babel/plugin-proposal-object-rest-spread",
];

console.log('babel running~~~~~~~~');

const { MODULE_ENV, NODE_ENV } = process.env;
const IS_TEST = NODE_ENV === 'test';

const presets = [
  [
    "@babel/env",
    ['cj', 'esm'].includes(MODULE_ENV) && {
      // 只会包含你所需要的 polyfill
      useBuiltIns: "usage",
      corejs: 3,
      modules: MODULE_ENV === 'esm' ? false : 'auto',
    },
    IS_TEST && {
      targets: {
        node: 'current',
      },
    },
  ].filter(Boolean),
  "@babel/preset-typescript",
];

module.exports = { presets, plugins };
