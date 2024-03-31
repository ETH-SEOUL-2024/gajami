const childProcess = require('child_process');
const path = require('path');

const dotenv = require('dotenv');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');

dotenv.config();

// Execute Git command to get the current commit ID
const commitHash = childProcess.execSync('git rev-parse --short HEAD').toString().trim();

module.exports = (env, argv) => {
  console.log(`Mode: ${argv.mode}`);
  console.log(`process.env.NODE_ENV: ${process.env.NETWORK_ID}`);
  return {
    entry:  './src/index.tsx',
    output: {
      filename:   'main.js',
      path:       path.resolve(__dirname, 'dist'),
      publicPath: '/',
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: path.join(__dirname, 'public', 'index.html'),
      }),
      new webpack.ProvidePlugin({
        process: 'process/browser',
        Buffer:  ['buffer', 'Buffer']
      }),
      new webpack.EnvironmentPlugin({
        DEBUG:                                true,
        REACT_APP_BASE_PATH:                  '',
        NETWORK_ID:                           process.env.NETWORK_ID,
        RELAYER_URL:                          process.env.RELAYER_URL,
        FIREBASE_API_KEY:                     process.env.FIREBASE_API_KEY,
        FIREBASE_AUTH_DOMAIN:                 process.env.FIREBASE_AUTH_DOMAIN,
        FIREBASE_PROJECT_ID:                  process.env.FIREBASE_PROJECT_ID,
        FIREBASE_STORAGE_BUCKET:              process.env.FIREBASE_STORAGE_BUCKET,
        FIREBASE_MESSAGING_SENDER_ID:         process.env.FIREBASE_MESSAGING_SENDER_ID,
        FIREBASE_APP_ID:                      process.env.FIREBASE_APP_ID,
        FIREBASE_MEASUREMENT_ID:              process.env.FIREBASE_MEASUREMENT_ID,
        GIT_COMMIT_HASH:                      commitHash,
      }),
    ],
    devServer: {
      static: {
        directory: path.join(__dirname, 'dist'),
      },
      port: 3000,
    },
    devtool: argv.mode === 'production' ? 'source-map' : 'eval-source-map',
    module:  {
      // exclude node_modules
      rules: [
        {
          test:    /\.(js|ts|tsx)$/,
          exclude: /node_modules/,
          use:     ['ts-loader'],
        },
        {
          test: /\.css$/i,
          use:  ['style-loader', 'css-loader'],
        },
        {
          test: /\.(woff(2)?|ttf|eot|svg)(\?v=\d+\.\d+\.\d+)?$/,
          type: 'asset/resource',
        },
      ],
    },
    // pass all js files through Babel
    resolve: {
      extensions: ['.ts', '.tsx', '.js', '.css'],
      fallback:   {
        https:             require.resolve('https-browserify'),
        http:              require.resolve('stream-http'),
        // crypto:   require.resolve('crypto-browserify'),
        crypto:            false,
        stream:            require.resolve('stream-browserify'),
        process:           require.resolve('process/browser'),
        'process/browser': require.resolve('process/browser'),
        url:               require.resolve('url/')
      }
    }
  };
};
