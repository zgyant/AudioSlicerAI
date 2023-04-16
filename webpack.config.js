const path = require('path');

module.exports = {
    entry: './src/index.tsx',
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'build'),
    },
    module: {
        rules: [
            {
                test: /\.js$|jsx/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                }
            },
            {
                test: /\.scss$/,
                use: ['style-loader', 'css-loader', 'sass-loader'],
            },
            {
                test: /\.ts$|tsx/,
                exclude: /node_modules/,
                use: {
                    loader: 'ts-loader',
                }
            }
        ],
    },
    resolve: {
        extensions: ['.js', '.jsx', '.ts', '.tsx']
    }
};