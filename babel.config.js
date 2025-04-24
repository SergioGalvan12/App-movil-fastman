// babel.config.js
module.exports = function(api) {
  api.cache(true);
  // Aquí forzamos a producción SIEMPRE:
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      ['module:react-native-dotenv', {
        moduleName: '@env',
        path: `.env.production`,    // ← cargamos sólo .env.production
        safe: false,
        allowUndefined: true,
      }]
    ]
  };
};

