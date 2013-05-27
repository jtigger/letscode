// Copyright (c) 2013 by John S. Ryan.  All rights reserved.  See LICENSE.txt for details.
"use strict";

var nodeunit = require("nodeunit");
var http = require("http");
var server = require("../../src/server/server.js");
var httpServer;
var port = 8000;

exports.server = nodeunit.testCase({
  setUp: function(done) {
    httpServer = server.start(port);
    done();
  },

  tearDown: function(done) {
    httpServer.close();
    done();
  },

  "responds to HTTP GET requests.": function(test) {
    test.expect(1);

    http.get("http://localhost:" + port, function(response) {
      test.equals(200, response.statusCode, "Expected server to return the root page; it didn't..");
      response.on("data", function() {});
      test.done();
    });
  },

  "returns 'Hello, world!' in the response": function(test) {
    test.expect(2);

    http.get("http://localhost:" + port, function(response) {
      var returnedHTML = "";
      test.equals(200, response.statusCode, "Expected an HTTP 200 (OK) response.");
      response.on("data", function(chunk) { returnedHTML += chunk; });
      response.on("end", function() {
        var expected = "Hello, world!";
        var containsExpected = returnedHTML.indexOf(expected) > 0;
        test.ok(containsExpected, "Expected to find '" + expected + "' in response; response = '" + returnedHTML + "'.");
        test.done();
      });
    });

  }

});
