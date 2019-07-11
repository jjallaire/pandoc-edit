const path = require('path');
const express = require('express');
const child_process = require('child_process')


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

        function pandoc({ from, to, input }) {
          return new Promise(resolve => {
            let spawn = child_process.spawn;
            pandoc = spawn('pandoc', ['--from', from, '--to', to]);
            pandoc.stdout.on('data', data => {
              let ast = JSON.parse(data);
              resolve(ast);
            });
            pandoc.stdin.setEncoding = 'utf-8';
            pandoc.stdin.write(input);
            pandoc.stdin.end();
          })
        }
                
        app.post('/pandoc/ast', express.json(), function(request, response) {
          let spawn = child_process.spawn;
          pandoc = spawn('pandoc', ['--from', request.body.format, '--to', 'json']);
          pandoc.stdout.on('data', data => {
            let ast = JSON.parse(data);
            response.json( { ast });
          });
          pandoc.stderr.on('data', data => {
            response.status(500).send(`${data}`);
          })
          pandoc.stdin.setEncoding = 'utf-8';
          pandoc.stdin.write(request.body.markdown);
          pandoc.stdin.end();
        });

        app.post('/pandoc/markdown', express.json(), function(request, response) {
          let spawn = child_process.spawn;
          pandoc = spawn('pandoc', ['--from', 'json', '--to', request.body.format]);
          pandoc.stdout.on('data', data => {
            response.json( { markdown: `${data}` });
          });
          pandoc.stderr.on('data', data => {
            response.status(500).send(`${data}`);
          })
          pandoc.stdin.setEncoding = 'utf-8';
          pandoc.stdin.write(JSON.stringify(request.body.ast));
          pandoc.stdin.end();
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



