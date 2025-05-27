// withDisableForcedDarkModeAndroid.js
const {
  withAndroidStyles,
  AndroidConfig,
  createRunOncePlugin,
} = require('expo/config-plugins');

function setForceDarkAllowed(styles) {
  return AndroidConfig.Styles.assignStylesValue(styles, {
    parent: { name: 'AppTheme' },
    name: 'android:forceDarkAllowed',
    value: 'false',
    add: true,
  });
}

const withDisableForcedDarkModeAndroid = config => {
  return withAndroidStyles(config, config => {
    config.modResults = setForceDarkAllowed(config.modResults);
    return config;
  });
};

module.exports = createRunOncePlugin(
  withDisableForcedDarkModeAndroid,
  'disable-forced-dark-mode',
  '1.0.0'
);
