module.exports = function(config) {
  config.set({
    basePath: './',
    frameworks: ['systemjs', 'jasmine'],
    systemjs: {
      configFile: 'config.js',

      // SystemJS configuration specifically for tests, added after your config file. 
      // Good for adding test libraries and mock modules 
      config: {
        paths: {
          "*": "*",
          "src/*": "src/*",
          // "mocks/*": "test/unit/mocks/*",
          // "test/unit/*": "test/unit/*", // https://github.com/aurelia/skeleton-navigation/issues/265
          // "custom_typings/*": "custom_typings/*",
          "typescript": "node_modules/typescript/lib/typescript.js",
          "systemjs": "node_modules/systemjs/dist/system.js",
          'system-polyfills': 'node_modules/systemjs/dist/system-polyfills.js',
          'es6-module-loader': 'node_modules/es6-module-loader/dist/es6-module-loader.js'
        },
        packages: {
          'test/unit': {
            defaultExtension: 'ts'
          },
          // 'test/mocks': {
          //   defaultExtension: 'ts'
          // },
          // 'custom_typings': {
          //   defaultExtension: 'ts'
          // },
          'src': {
            defaultExtension: 'ts'
          }
        },
        transpiler: 'typescript',
        typescriptOptions : {
          "module": "amd",
          "emitDecoratorMetadata": true,
          "experimentalDecorators": true
          ,preserveConstEnums: true
          ,traceResolution: true
        }
      },
      // Patterns for files that you want Karma to make available, but not loaded until a module requests them. eg. Third-party libraries. 
      serveFiles: [
        'src/**/*.*',
        'test/mocks/**/*.js',
        'jspm_packages/**/*.js'
      ]
    },
    // list of files / patterns to load in the browser
    files: [
      'test/unit/setup.ts',
      // 'test/unit/*.ts'
      // 'test/mocks/*_mock.ts',
      // 'custom_typings/**/*.d.ts',
      'test/unit/*spec.ts',
      'test/unit/**/*spec.ts'
    ],
    exclude: [],
    preprocessors: { },
    reporters: ['progress'],
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: true,
    //browsers: ['Chrome'],
    browsers: ['ChromeCanary'],
    //browsers: ['Chromium'],
    // you can define custom flags
    customLaunchers: {
      Chromium: {
        base: 'ChromeCanary',
        flags: ['--profile-directory=Default']
        //,flags: ['--disable-web-security']
      }
    },
    singleRun: false
  });
};
