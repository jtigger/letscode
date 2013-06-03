// Copyright (c) 2013 by John S. Ryan.  All rights reserved.  See LICENSE.txt for details.
"use strict";

var nodeunit = require("nodeunit");
var http = require("http");
var child_process = require("child_process");
var fs = require("fs");
var procfile = require("procfile");
var port = 5000;
var server_proc;

// CAP-0001
// complete -- function to invoke when the HTTP GET completes.  This function is passed an instance
//             of node's http.ServerResponse (http://nodejs.org/api/http.html#http_class_http_serverresponse)
//             with an additional property named "content" which holds the textual content of the response.
function httpGet(url, complete) {
  http.get(url, function(response) {
    var content = "";
    response.on("data", function(chunk) { content += chunk; });
    response.on("end", function() {
      response.content = content;
      complete(response);
    });
  });
}

function replaceVariablesWithValues(string, variables) {
  for (var variable in variables) {
    if (variables.hasOwnProperty(variable)) {
      var envVarRef = "$" + variable;
      string = string.replace(envVarRef, variables[variable]);
    }
  }
  return string;
}

function parseProcfile() {
  var procFileContents;
  var proc = {};
  try {
    // TODO: remove hardcoded path to procfile
    procFileContents = fs.readFileSync("Procfile", {encoding: "utf-8"});
    procFileContents = replaceVariablesWithValues(procFileContents, process.env);
    proc = procfile.parse(procFileContents);
  } catch (error) {
    console.log(error);
  }

  return proc;
}

exports["When the server is started"] = nodeunit.testCase({
  setUp: function(done) {
    var processDefinition = parseProcfile();

    server_proc = child_process.spawn(processDefinition.web.command, processDefinition.web.options);
    server_proc.stdout.setEncoding("utf8");
    server_proc.stdout.on("data", function(chunk) {
      if (chunk.trim() === "Server started successfully.") {
        done();
      }
    });
  },

  tearDown: function(done) {
    server_proc.on("exit", function() {
      done();
    });

    server_proc.kill();
  },

  "can serve the Home Page.": function(test) {
    test.expect(1);
    // if the following fails in any way, an exception is thrown
    httpGet("http://localhost:" + port + "/index", function(response) {
      test.ok(response.content.indexOf("pageId=Home") !== -1, "Could not find 'Home Page' marker in response.  Response was = \"" + response.content + "\".");
      test.done();
    });
  },

  "can serve the custom 404 page.": function(test) {
    test.expect(1);
    httpGet("http://localhost:" + port + "/some-non-existant-resource", function(response) {
      test.ok(response.content.indexOf("pageId=404") !== -1, "Could not find '404' marker in response.  Response was = \"" + response.content + "\".");
      test.done();
    });
  }

});
