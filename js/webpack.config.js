const path = require("path");

module.exports = {
  entry: "./js/app.js",
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "./js/app.bundle.js"
  },
  module: {
    loaders: [
      {
        test: /\.css$/,
        loader: "style!css!"
      },
      {
        test: /\.js?$/,
        exclude: /node_modules/,
        loader: "babel-loader",
        query: {
          presets: ["env"]
        }
      }
    ]
  }
}
