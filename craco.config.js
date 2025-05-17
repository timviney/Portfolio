module.exports = {
    devServer: {
      setupMiddlewares: (middlewares, devServer) => {
        if (!devServer) {
          throw new Error('webpack-dev-server is not defined');
        }
  
        middlewares.unshift((req, res, next) => {
          if (req.url.endsWith('.js.gz')) {
            res.setHeader('Content-Type', 'application/javascript');
            res.setHeader('Content-Encoding', 'gzip');
          } else if (req.url.endsWith('.wasm.gz')) {
            res.setHeader('Content-Type', 'application/wasm');
            res.setHeader('Content-Encoding', 'gzip');
          } else if (req.url.endsWith('.data.gz')) {
            res.setHeader('Content-Type', 'application/octet-stream');
            res.setHeader('Content-Encoding', 'gzip');
          }
          res.setHeader('Cache-Control', 'no-store');
          next();
        });
  
        return middlewares;
      },
    },
    webpack: {
      configure: (webpackConfig) => {
        webpackConfig.module.rules.push({
          test: /\.(js|wasm|data|framework)\.gz$/,
          type: 'javascript/auto',
          use: [
            {
              loader: 'file-loader',
              options: {
                name: '[path][name].[ext]',
              },
            },
          ],
        });
        return webpackConfig;
      },
    },
  };
  