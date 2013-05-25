desc("Full build.");
task("default", ["lint"]);

desc("Runs JSLint (to catch common JavaScript errors).");
task("lint", function() {
  var lint_runner = require("./build/lint/lint_runner.js");
  lint_runner.validateFile("jakefile.js");
});