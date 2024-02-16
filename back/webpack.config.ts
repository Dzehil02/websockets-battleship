import path from 'path';
import webpack from 'webpack';
import {BuildEnv} from './src/types/types';
import dotenv from 'dotenv';

dotenv.config();

export default (env: BuildEnv) => {
    const mode = env.mode || 'development';

    const config: webpack.Configuration = {
        target: 'node',
        mode,
        entry: path.resolve(__dirname, 'src', 'index.ts'),
        output: {
            path: path.resolve(__dirname, 'build'),
            filename: 'bundle.js',
        },
        module: {
            rules: [
                {
                    test: /\.ts?$/,
                    use: 'ts-loader',
                    exclude: /node_modules/,
                },
            ],
        },
        resolve: {
            extensions: ['.ts', '.js'],
        },
    };
    return config;
};
