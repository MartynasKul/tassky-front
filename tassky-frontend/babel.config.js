module.exports = function (api) {
  // Check if we're running in a test environment
  const isTest = api.env('test');

  // Only apply this config in test environments
  if (isTest) {
    return {
      presets: ['next/babel'],
    };
  }

  // In non-test environments, return an empty config
  // This allows SWC to be used for normal builds
  return {};
};
