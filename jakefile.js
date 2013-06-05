/* global complete, desc, directory, fail, jake, task */
"use strict";

var BUILD_DIR = "build";
var TEST_TEMP_DIR = BUILD_DIR + "/test";

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

desc("Integration");
task("integrate", ["default"], function() {
  console.log("Steps for the commit tango...");
  console.log("1. Verify the build on the master branch, locally.\n   yourbox$ ./jake.sh\n");
  console.log("2. Pull to the Integation Station and verify the build there.\n   integration$ git pull && ./jake.sh\n");
  console.log("3. If all good, merge changes into 'last-known-good'\n   yourbox$ merge-to-integration.sh\n");
});

directory(BUILD_DIR);
directory(TEST_TEMP_DIR);

desc("Runs server-side unit tests.");
task("test.unit.server", [TEST_TEMP_DIR], function() {
  // CAP-0002
  var reporter = require('nodeunit').reporters.default;
  var allJavaScriptTests = new jake.FileList();
  allJavaScriptTests.include("src/specs/server/*.js");
  allJavaScriptTests.include("src/tests/smoke_test.js");
  allJavaScriptTests.exclude("node_modules");  // assuming these are properly linted, already.

  reporter.run(allJavaScriptTests.toArray(), null, function(failureOccurred) {
    if(failureOccurred) { fail("Task 'test.unit.server' failed (see above)."); }
    complete();
  });
}, {async: true});

desc("Runs client-side unit tests.");
task("test.unit.client", [], function() {
  var config = {};
  require("karma/lib/runner").run(config, function(errorCode) {
    if(errorCode) {
      fail("Task 'test.unit.client' failed with error code = " + errorCode + " (see above).");
    }
  });
}, {async: true});

desc("Runs all unit tests");
task("test.unit", ["test.unit.server", "test.unit.client"], function() {
});

desc("Runs production verification tests.");
task("test.prod", [TEST_TEMP_DIR], function() {
  // CAP-0002
  var reporter = require('nodeunit').reporters.default;
  var productionTests = new jake.FileList();
  productionTests.include("src/tests/production_smoke_test.js");

  reporter.run(productionTests.toArray(), null, function(failureOccurred) {
    if(failureOccurred) { fail("Task 'test.prod' failed (see above)."); }
    complete();
  });
}, {async: true});

desc("Runs JSLint (to catch common JavaScript errors).");
task("lint", function() {
  var lint_runner = require("./src/build/lint/lint_runner.js");

  var allJavaScriptSources = new jake.FileList();
  allJavaScriptSources.include("**/*.js");
  allJavaScriptSources.exclude("karma.conf.js");  // won't be proper stand-alone js, it's JSON config file.
  allJavaScriptSources.exclude("node_modules");  // assuming these are properly linted, already.
  var passesLint = lint_runner.validateFileList(allJavaScriptSources, getJSHintOptions());

  if(!passesLint) { fail("Task 'lint' failed (see above)."); }
});

desc("Purges the build output directory (i.e. " + BUILD_DIR + ").");
task("clean", function() {
  jake.rmRf(BUILD_DIR);
});

task("check node version", function() {
  // TODO: obtain node version from the package.json definition.
  var expectedNodeVersion = "v0.10.8";
  var actualNodeVersion = process.version;

  // since node.js is changes quite frequently, making this an exact match, for now.
  if(actualNodeVersion !== expectedNodeVersion) {
    fail(actualNodeVersion + " is an unsupported version of node.js.  Must be " + expectedNodeVersion);
  }
});

desc("Full build.");
task("default", ["check node version", "clean", "lint", "test.unit"]);

