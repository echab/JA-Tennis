basePath = '../';

files = [
  'test/lib/jasmine/lib/jasmine-1.2.0/jasmine.js',
  'test/lib/JasmineAdapter/src/JasmineAdapter.js',
  'app/lib/angular/angular.js',
  'app/lib/angular/angular-*.js',
  'test/lib/angular/angular-mocks.js',
  'app/js/**/*.js',
  'test/unit/**/*.js'
];

autoWatch = true;

browsers = ['Chrome'];

junitReporter = {
  outputFile: 'test_out/unit.xml',
  suite: 'unit'
};
