// Copyright (c) 2013 by John S. Ryan.  All rights reserved.  See LICENSE.txt for details.
"use strict";

var nodeunit = require("nodeunit");
var http = require("http");
var child_process = require("child_process");
var port = 8000;
var server_proc;

// TODO: refactor from here and server.spec.js
// complete -- function to invoke when the HTTP GET completes.  This function is passed an instance
//             of node's http.ServerResponse (http://nodejs.org/api/http.html#http_class_http_serverresponse)
//             with an additional property named "content" which holds the textual content of the response.
function httpGet(url, complete) {
  http.get(url, function(response) {
    var content = "";
    response.on("data", function(chunk) { content += chunk; } );
    response.on("end", function() {
      response.content = content;
      complete(response);
    });
  });
}

exports["When the server is started"] = nodeunit.testCase({
  setUp: function(done) {
    var commandArgs = ["./src/code/server/weewikipaint", "./src/code/web", port];

    server_proc = child_process.spawn("node", commandArgs);
    server_proc.stdout.setEncoding("utf8");
    server_proc.stdout.on("data", function(chunk) {
      if(chunk.trim() === "Server started successfully.") {
        done();
      }
    });
  },

  tearDown: function(done) {
    server_proc.on("close", function() {
      done();
    });

    server_proc.kill();
  },

  "can serve the Home Page.": function(test) {
    // if the following fails in any way, an exception is thrown
    httpGet("http://localhost:" + port + "/index", function(response) {
      test.ok(response.content.indexOf("Home Page") !== -1, "Could not find 'Home Page' marker in response.  Response was = \"" + response.content + "\".");
      test.done();
    });
  }

});
