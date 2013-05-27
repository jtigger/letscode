/* global complete, desc, fail, jake, task */
"use strict";
var $p = require("procstreams");


desc("Full build.");
task("default", ["check node version", "lint", "test"]);


desc("Runs JSLint (to catch common JavaScript errors).");
task("lint", /* jshint latedef: false */ function() {
  var lint_runner = require("./build/lint/lint_runner.js");

  var allJavaScriptSources = new jake.FileList();
  allJavaScriptSources.include("**/*.js");
  allJavaScriptSources.exclude("node_modules");  // assuming these are properly linted, already.
  var passesLint = lint_runner.validateFileList(allJavaScriptSources, getJSHintOptions());

  if(!passesLint) { fail("Task 'lint' failed (see above)."); }
});

desc("Runs unit tests.");
task("test", function() {
  var reporter = require('nodeunit').reporters.default;
  reporter.run(['specs/server'], null, function(failureOccurred) {
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

  $p("node --version")
    .data(function(err, stdout) {
      var version = stdout.toString().trim();

      if(version !== expectedNodeVersion) {
        fail(version + " is an unsupported version of node.js.  Must be " + expectedNodeVersion);
      }
      complete();
    });

   console.log("node version check");
}, {async: true});

