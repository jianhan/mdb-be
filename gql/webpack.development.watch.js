const merge = require('webpack-merge');
const nodeExternals = require('webpack-node-externals');
const path = require('path');

const development = require('./webpack.common.js');


module.exports = merge.smart(development, {
  entry: ['webpack/hot/poll?1000', path.join(__dirname, 'src/main.ts')],
  externals: [
    nodeExternals({
      whitelist: ['webpack/hot/poll?1000']
    })
  ],
  watch: true
});
