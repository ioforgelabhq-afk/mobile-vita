module.exports = function (api) {
  api.cache(true);
  return {
    // NativeWind v4: styling is driven by `jsxImportSource: 'nativewind'` here + the
    // `withNativeWind` Metro transformer (metro.config.js). We intentionally do NOT add the
    // `nativewind/babel` preset — in 4.2.x it hardcodes `react-native-worklets/plugin`
    // (a Reanimated-4 dependency we don't use), which breaks bundling.
    presets: [['babel-preset-expo', { jsxImportSource: 'nativewind' }]],
    // Reanimated 4 (pulled in by NativeWind's native runtime) requires the worklets plugin,
    // and it MUST be listed last.
    plugins: ['react-native-worklets/plugin'],
  };
};
