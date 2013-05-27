// Copyright (c) 2013 by John S. Ryan.  All rights reserved.  See LICENSE.txt for details.
"use strict";

var nodeunit = require("nodeunit");
var http = require("http");
var fs = require("fs");
var server = require("../../code/server/server.js");
var httpServer;
var port = 8000;

exports["Given the server is running"] = nodeunit.testCase({
  setUp: function(done) {
    httpServer = server.start(port, done);
  },

  tearDown: function(done) {
    httpServer.stop(done);
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

exports["Given the server is running and has a virtual-to-physical mapping"] = (function() {
  var rootDirectory = fs.realpathSync(__dirname + "/../../../build/test");
  var pathname = "somefile";
  var filename = rootDirectory + "/" + pathname + ".html";

  return nodeunit.testCase({
    setUp: function(done) {
      fs.writeFileSync(filename, "Hello, world.");
      httpServer = server.start(port, done);
    },

    tearDown: function(done) {
      fs.unlinkSync(filename);
      httpServer.stop(done);
    },

    "when a non-existant file is requested, the server returns a 404.": function(test) {
      test.expect(1);

      http.get("http://localhost:" + port + "/some-non-existant-file", function(response) {
        test.equals(404, response.statusCode, "Expected an HTTP 404 return code.");
        response.on("data", function() {} );
        response.on("end", function() {
          test.done();
        });
      });
    },

    "when an existing file is requested, that file is served." : function(test) {
      var url = "http://localhost:" + port + "/" + pathname;
      http.get(url, function(response) {
        test.equals(200, response.statusCode, "Expected an HTTP 200 (OK) response; virtual path = " + url + "; file located at " + filename);
        response.on("data", function() {} );
        response.on("end", function() {
          test.done();
        });
      });
    }
  });
})();

exports["In general"] = nodeunit.testCase({
  "when started without a port number, throws an exception": function(test) {
    test.expect(1);

    test.throws(function() {
      httpServer = server.start();
    });

    test.done();
  },

  "when stopped, the server invokes the configured callback." : function(test) {
    test.expect(1);

    var callbackCalled = false;
    httpServer = server.start(port);
    httpServer.stop(function() {
      callbackCalled = true;
      test.ok(callbackCalled, "Expected server to invoke the callback on closing.");
      test.done();
    });
  },

  "when stop is called on a stopped server, it throws an exception.": function(test) {
    test.expect(1);

    httpServer = server.start(port);
    httpServer.stop();
    test.throws(function() {
       httpServer.stop();
    });

    test.done();
  }

});
