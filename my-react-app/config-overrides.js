const { override } = require("customize-cra");
const path = require("path");

module.exports = {
  webpack: override((config) => {
    // Handle polyfills and dependency fallbacks
    config.resolve.fallback = {
      fs: false,
      path: require.resolve("path-browserify"),
      // Add other fallbacks as needed
    };

    // Handle .wasm files
    const wasmExtensionRegExp = /\.wasm$/;

    // Add .wasm to the list of extensions webpack will resolve
    config.resolve.extensions.push(".wasm");

    // Exclude .wasm files from the default file-loader
    config.module.rules.forEach((rule) => {
      (rule.oneOf || []).forEach((oneOf) => {
        if (oneOf.loader && oneOf.loader.indexOf("file-loader") >= 0) {
          oneOf.exclude.push(wasmExtensionRegExp);
        }
      });
    });

    // Add a dedicated loader for .wasm files
    config.module.rules.push({
      test: wasmExtensionRegExp,
      type: 'webassembly/async', // This sets the type for .wasm files
      loader: 'file-loader', // Use file-loader to handle .wasm files
      options: {
        mimetype: 'application/wasm', // Specify the correct MIME type
      },
    });

    // Enable WebAssembly experiments
    config.experiments = {
      asyncWebAssembly: true,
      syncWebAssembly: true,
    };

    return config;
  }),
}
