// babel.config.js - Fixed to properly handle TypeScript in a Next.js project
module.exports = function (api) {
  // Cache the config
  api.cache(true);

  return {
    // Always use Next.js preset which includes TypeScript support
    presets: [
      [
        'next/babel',
        {
          'preset-react': {
            runtime: 'automatic',
          },
          'preset-typescript': {},
        },
      ],
    ],
    // Don't apply any plugins in test environment
    env: {
      test: {
        // Add any test-specific transformations here if needed
      },
    },
  };
};
