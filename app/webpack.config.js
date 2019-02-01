// Webpack Config
const path = require('path');

module.exports = {
  watch: true,
  entry: './app/index.js',
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: 'app.bundle.js'
  },
  module: {
    // loaders: [
    rules: [
      {
        test: /\.css$/,
        loader: 'style!css!'
      },
      {
        test: /^node_modules\/jsonld/,
        loader: 'babel-loader',
        options: {
          presets: ['@babel/preset-env'],
          plugins: [
            ['@babel/plugin-proposal-object-rest-spread'],
            ['@babel/plugin-syntax-object-rest-spread'],
            ['@babel/plugin-transform-runtime'],
          ]
        }
      },
      {
        test: /\.js?$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
        query: {
          presets: ['@babel/preset-env'],
          plugins: [
            ['@babel/plugin-proposal-object-rest-spread'],
            ['@babel/plugin-syntax-object-rest-spread'],
            ['@babel/plugin-transform-modules-commonjs'],
            ['@babel/plugin-transform-regenerator'],
            ['@babel/plugin-transform-runtime']
          ]
        }
      }
    ]
  }
}
