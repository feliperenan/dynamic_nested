const path = require('path')

module.exports = {
  entry: './js/dynamic_nested.js',
  output: {
    filename: 'dynamic_nested.js',
    path: path.resolve(__dirname, './static'),
    library: 'dynamic_nested',
    libraryTarget: 'umd'
  },
  module: {
    rules: [
      {
        test: path.resolve(__dirname, './js/dynamic_nested.js'),
        use: [{
          loader: 'expose-loader',
          options: 'Phoenix.LiveView'
        }]
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader'
        }
      }
    ]
  },
  plugins: []
}
