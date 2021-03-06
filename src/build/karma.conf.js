// Karma configuration
// Generated on Tue Jun 04 2013 07:26:23 GMT-0700 (PDT)

// base path, that will be used to resolve files and exclude and location of test output
basePath = '../../build/test';


// list of files / patterns to load in the browser
files = [
  MOCHA,
  MOCHA_ADAPTER,
  "../../lib/jquery-1.10.1.js",
  "../../lib/jquery.simulate-25938de.js",
  "../../lib/raphael-min-2.1.0.js",
  "../../node_modules/expect.js/expect.js",
  "../../src/code/web/scripts/*.js",
  "../../src/specs/client/*.js"
];



// list of files to exclude
exclude = [
  
];


// test results reporter to use
// possible values: 'dots', 'progress', 'junit'
reporters = ['progress', 'junit'];


// web server port
port = 9876;


// cli runner port
runnerPort = 9100;


// enable / disable colors in the output (reporters and logs)
colors = true;


// level of logging
// possible values: LOG_DISABLE || LOG_ERROR || LOG_WARN || LOG_INFO || LOG_DEBUG
logLevel = LOG_INFO;


// enable / disable watching file and executing tests whenever any file changes
autoWatch = false;


// Start these browsers, currently available:
// - Chrome
// - ChromeCanary
// - Firefox
// - Opera
// - Safari (only Mac)
// - PhantomJS
// - IE (only Windows)
browsers = [];


// If browser does not capture in given timeout [ms], kill it
captureTimeout = 60000;


// Continuous Integration mode
// if true, it capture browsers, run tests and exit
singleRun = false;
