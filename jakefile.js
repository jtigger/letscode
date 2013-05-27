/* global complete, desc, directory, fail, jake, task */
"use strict";

var BUILD_DIR = "build";
var TEST_TEMP_DIR = BUILD_DIR + "/test";

desc("Full build.");
task("default", ["check node version", "clean", "lint", "test"]);

directory(BUILD_DIR);
directory(TEST_TEMP_DIR);

desc("Purges the build output directory (i.e. " + BUILD_DIR + ").");
task("clean", function() {
  jake.rmRf(BUILD_DIR);
});

desc("Runs JSLint (to catch common JavaScript errors).");
task("lint", /* jshint latedef: false */ function() {
  var lint_runner = require("./src/build/lint/lint_runner.js");

  var allJavaScriptSources = new jake.FileList();
  allJavaScriptSources.include("**/*.js");
  allJavaScriptSources.exclude("node_modules");  // assuming these are properly linted, already.
  var passesLint = lint_runner.validateFileList(allJavaScriptSources, getJSHintOptions());

  if(!passesLint) { fail("Task 'lint' failed (see above)."); }
});

desc("Runs unit tests.");
task("test", [TEST_TEMP_DIR], function() {
  var reporter = require('nodeunit').reporters.default;
  reporter.run(['src/specs/server'], null, function(failureOccurred) {
      if(failureOccurred) { fail("Task 'test' failed (see above)."); }
      complete();
    });
}, {async: true});

desc("Integration");
task("integrate", ["default"], function() {
  console.log("Steps for the commit tango...");
  console.log("1. Verify the build on the master branch, locally.\n   yourbox$ ./jake.sh\n");
  console.log("2. Pull to the Integation Station and verify the build there.\n   integration$ git pull && ./jake.sh\n");
  console.log("3. If all good, merge changes into 'last-known-good'\n   yourbox$ merge-to-integration.sh\n");
});

function getJSHintOptions() {
  return {
    bitwise: false,
    curly: true,
    eqeqeq: true,
    forin: true,
    immed: true,
    latedef: true,
    newcap: true,
    noarg: true,
    nonew: true,
    undef: true,
    unused: true,
    strict: true,
    trailing: true,
    maxstatements: 15,
    maxcomplexity: 10,
    node: true
  };
}

task("check node version", function() {
  var expectedNodeVersion = "v0.10.8";
  var actualNodeVersion = process.version;

  // since node.js is changes quite frequently, making this an exact match, for now.
  if(actualNodeVersion !== expectedNodeVersion) {
    fail(actualNodeVersion + " is an unsupported version of node.js.  Must be " + expectedNodeVersion);
  }
});

