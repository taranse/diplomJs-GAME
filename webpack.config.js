/**
 * Created by Евгений on 14.06.2017.
 */
const webpack = require('webpack');
module.exports = {
    entry: './game.js',
    output: {
        filename: "main.js"
    },
    module: {
        rules: [
            {test: /\.js$/, loader: 'babel-loader', query: {
                presets: ['es2015']
            }},
        ]
    },
    plugins: [
        new webpack.optimize.UglifyJsPlugin({
            compress: {
                warnings: false
            }
        })
    ]
};