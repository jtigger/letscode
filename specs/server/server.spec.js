// Copyright (c) 2013 by John S. Ryan.  All rights reserved.  See LICENSE.txt for details.
"use strict";

var nodeunit = require("nodeunit");
var http = require("http");
var server = require("../../src/server/server.js");
var httpServer;
var port = 8000;

exports.specs = nodeunit.testCase({
  setUp: function(done) {
    httpServer = server.start(port);
    done();
  },

  tearDown: function(done) {
    httpServer.close();
    done();
  },

  "There exists an HTTP server.": function(test) {
    test.expect(1);

    http.get("http://localhost:" + port, function(response) {
      test.equals(200, response.statusCode, "Expected server to return the root page; it didn't..");
      response.on("data", function() {});
      test.done();
    });
  }

});
