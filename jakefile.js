/* global desc, task, jake */
"use strict";

desc("Full build.");
task("default", ["lint"]);


desc("Runs JSLint (to catch common JavaScript errors).");
task("lint", /* jshint latedef: false */ function() {
  var lint_runner = require("./build/lint/lint_runner.js");

  var allJavaScriptSources = new jake.FileList();
  allJavaScriptSources.include("**/*.js");
  allJavaScriptSources.exclude("node_modules");  // assuming these are properly linted, already.
  lint_runner.validateFileList(allJavaScriptSources, getJSHintOptions());
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

