module.exports = function (api) {
  api.cache(true);

  const appEnv = process.env.APP_ENV || 'development';
  const envPath = `.env.${appEnv}`;

  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module:react-native-dotenv',
        {
          moduleName: '@env',
          path: envPath,
          safe: false,
          allowUndefined: true,
        },
      ],
    ],
  };
};
