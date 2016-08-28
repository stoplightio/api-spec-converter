const name = 'api-spec-conveter';
const target = process.env.TARGET;

module.exports = {
  target,
  entry: [
    'babel-polyfill',
    `./src/environments/${target}.js`,
  ],
  output: {
    path: `./lib/${target}/`,
    pathInfo: true,
    filename: `${name}.js`,
  },
  loaders: [
    {
      loader: 'babel-loader',
      include: './src',
      test: /\.js?$/,
      query: {
        plugins: ['transform-runtime'],
        presets: ['es2015'],
      },
    },
  ],
};
