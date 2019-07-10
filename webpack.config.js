const path = require('path');

module.exports = {
    devtool: 'source-map',
    entry: './src/index.js',
    // https://webpack.js.org/guides/author-libraries/
    output: {
      filename: 'pandoc-editor.js',
      path: path.resolve(__dirname, 'dist'),
      library: "PandocEditor",
      libraryTarget: "var"
    },
    devServer: {
      contentBase: path.join(__dirname, 'example'),
      port: 8080
    },
    module: {
      rules: [
        {
          enforce: "pre",
          test: /\.js$/,
          exclude: /node_modules/,
          loader: "eslint-loader"
        },
        {
          test: /\.js$/, 
          exclude: /node_modules/, 
          loader: "babel-loader"
        }
      ]
    }
};