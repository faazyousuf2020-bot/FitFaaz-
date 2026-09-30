// Adds the CI build number so every APK installs as an update over the previous one.
module.exports = ({ config }) => {
  const build = Number(process.env.BUILD_NUMBER || 1);
  return {
    ...config,
    version: `1.0.${build}`,
    android: { ...config.android, versionCode: build },
  };
};
