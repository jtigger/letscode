/* global desc, task, jake */
"use strict";

desc("Full build.");
task("default", ["lint"]);

desc("Runs JSLint (to catch common JavaScript errors).");
task("lint", function() {
  var lint_runner = require("./build/lint/lint_runner.js");

  var allJavaScriptSources = new jake.FileList();
  allJavaScriptSources.include("**/*.js");
  allJavaScriptSources.exclude("node_modules");  // assuming these are properly linted, already.

  var options = {
    node: true
  };


  lint_runner.validateFileList(allJavaScriptSources, options);
});