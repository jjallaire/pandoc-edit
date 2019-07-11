const path = require('path');
const express = require('express');

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
      port: 8080,
      before: function(app, server) {
        
        app.post('/pandoc/ast', express.json(), (request, response) => {
          
          let markdown = request.body.markdown;
          response.json({ markdown });
         
        });
        app.post('/pandoc/markdown', express.json(), (request, response) => {
          let ast = request.body.ast;
          response.json({ ast })
        })
      }
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