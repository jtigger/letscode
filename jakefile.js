/* global complete, desc, directory, fail, jake, task */
"use strict";

var BUILD_DIR = "build";
var TEST_TEMP_DIR = BUILD_DIR + "/test";
var lint_runner = require("./src/build/lint/lint_runner.js");
var path = require("path");

var supportedBrowsers = [
//  "IE 7.0 (Windows)",
  "Chrome 27.0 (Windows)",
  "Firefox 2[12].0 (Windows)",
  "IE 8.0 (Windows)",
  "Chrome 27.0 (Mac)",
  "Firefox 21.0 (Mac)",
  "Safari 6.0 (Mac)"
];

function getCommonJSHintOptions() {
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
    maxcomplexity: 10
  };
}

function getJSHintOptionsForServerSideCode() {
  var options = getCommonJSHintOptions();
  options.node = true;
  return options;
}

function getJSHintOptionsForBrowsers() {
  var options = getCommonJSHintOptions();
  options.browser = true;
  return  options;
}

jake.logger.logTaskStart = function(taskName) {
  var border = new Array(taskName.length+1).join("=");
  this.log("\n" + border);
  this.log(taskName);
  this.log(border);
};

function patchInStdoutSniffer() {
  var originalWriteFunction = process.stdout.write;
  var sniffer = {
    output : "",
    unpatch : function() {
      process.stdout.write = originalWriteFunction;
    }
  };

  process.stdout.write = function(data) {
    sniffer.output += data;
    originalWriteFunction.apply(this, arguments);
  };

  return sniffer;
}

var karma = (function() {
  var homedir = path.resolve(process.cwd(), "node_modules", "karma", "lib");

  return {
    start : function (configFilepath, done) {
      var config = {configFile : configFilepath };
      require(path.join(homedir, "server")).start(config);
      done();
    },

    run : function (done) {
      var sniffer = patchInStdoutSniffer();
      var config = {};
      require(path.join(homedir, "runner")).run(config, function(exitCode) {
        // karma runner is not designed to be run programmatically and sends it output directly to standard out.
        sniffer.unpatch();
        if(exitCode) {
          done(new Error("Karma runner reported an error #" + exitCode + ".  Output = \"" + sniffer.output + "\"."));
        } else {
          done(sniffer.output);
        }
      });
    }
  };
})();

directory(BUILD_DIR);
directory(TEST_TEMP_DIR);

desc("Integration");
task("integrate", ["default"], function() {
  jake.logger.logTaskStart("integrate");
  jake.logger.log("Steps for the commit tango...");
  jake.logger.log("1. Verify the build on the master branch, locally.\n   yourbox$ ./jake.sh\n");
  jake.logger.log("2. Pull to the Integation Station and verify the build there.\n   integration$ git pull && ./jake.sh\n");
  jake.logger.log("3. If all good, merge changes into 'last-known-good'\n   yourbox$ merge-to-integration.sh\n");
});

desc("Starts the Karma server (which captures browsers for client-side testing).");
task("setup.client-tests", [], function() {
  jake.logger.logTaskStart("setup.client-tests");

  karma.start("src/build/karma.conf.js", function(results) {
    if(results instanceof Error) {
      fail("Failed to start Karma server with \"" + results.toString() + "\" (also, see above).");
    }
    complete();
  });
}, {async: true});


desc("Runs server-side unit tests.");
task("test.unit.server", [TEST_TEMP_DIR], function() {
  // CAP-0002
  jake.logger.logTaskStart("test.unit.server");
  var reporter = require('nodeunit').reporters.default;
  var allJavaScriptTests = new jake.FileList();
  allJavaScriptTests.include("src/specs/server/*.js");
  allJavaScriptTests.include("src/tests/smoke_test.js");
  allJavaScriptTests.exclude("node_modules");  // assuming these are properly linted, already.

  reporter.run(allJavaScriptTests.toArray(), null, function(failureOccurred) {
    if (failureOccurred) { fail("Task 'test.unit.server' failed (see above)."); }
    complete();
  });
}, {async: true});


desc("Runs client-side unit tests.");
task("test.unit.client", [], function() {
  jake.logger.logTaskStart("test.unit.client");
  karma.run(function(results) {
    if(results instanceof Error) {
      fail("Client-side tests failed (see above).");
    }
    supportedBrowsers.forEach(function(supportedBrowser) {
      if (results.match(supportedBrowser)) {
        fail("Client-side tests were not run against " + supportedBrowser + " as is required.");
      }
    });
    complete();
  });
}, {async: true});

desc("Runs all unit tests");
task("test.unit", ["test.unit.server", "test.unit.client"]);

desc("Runs production verification tests.");
task("test.prod", [TEST_TEMP_DIR], function() {
  // CAP-0002
  jake.logger.logTaskStart("test.prod");

  var reporter = require('nodeunit').reporters.default;
  var productionTests = new jake.FileList();
  productionTests.include("src/tests/production_smoke_test.js");

  reporter.run(productionTests.toArray(), null, function(failureOccurred) {
    if (failureOccurred) { fail("Task 'test.prod' failed (see above)."); }
    complete();
  });
}, {async: true});

desc("Runs JSLint on everything");
task("lint", ["lint.server", "lint.client"]);

task("lint.server", function() {
  jake.logger.logTaskStart("lint.server");

  var serverSideJavaScriptFiles = new jake.FileList();
  serverSideJavaScriptFiles.include("src/**/server/**/*.js");
  serverSideJavaScriptFiles.include("src/tests/smoke_test.js");
  serverSideJavaScriptFiles.include("src/build/**/*.js");
  serverSideJavaScriptFiles.include("*.js");
  serverSideJavaScriptFiles.exclude("karma.conf.js");  // won't be proper stand-alone js, it's JSON config file.
  var passesLint = lint_runner.validateFileList(serverSideJavaScriptFiles, getJSHintOptionsForServerSideCode());

  if (!passesLint) { fail("Task 'lint.server' failed (see above)."); }
});

task("lint.client", function() {
  jake.logger.logTaskStart("lint.client");

  var clientSideJavaScriptFiles = new jake.FileList();
  clientSideJavaScriptFiles.include("src/**/client/**/*.js");
  clientSideJavaScriptFiles.include("src/code/web/**/*.js");
  var passesLint = lint_runner.validateFileList(clientSideJavaScriptFiles, getJSHintOptionsForBrowsers());

  if (!passesLint) { fail("Task 'lint.client' failed (see above)."); }
});

desc("Purges the build output directory (i.e. " + BUILD_DIR + ").");
task("clean", function() {
  jake.logger.logTaskStart("clean");
  jake.rmRf(BUILD_DIR);
});

task("check.dependencies", function() {
  // TODO: obtain node version from the package.json definition.
  jake.logger.logTaskStart("check.dependencies");

  var expectedNodeVersion = "v0.10.8";
  var actualNodeVersion = process.version;

  // since node.js is changes quite frequently, making this an exact match, for now.
  if (actualNodeVersion !== expectedNodeVersion) {
    fail(actualNodeVersion + " is an unsupported version of node.js.  Must be " + expectedNodeVersion);
  }
});

desc("Full build.");
task("default", ["check.dependencies", "clean", "lint", "test.unit"], function() {
  jake.logger.log("\nBuild Completed Successfully!");
});

