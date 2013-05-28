// Copyright (c) 2013 by John S. Ryan.  All rights reserved.  See LICENSE.txt for details.
"use strict";

var nodeunit = require("nodeunit");
var http = require("http");
var fs = require("fs");
var server = require("../../code/server/server.js");
var httpServer;
var port = 8000;

function httpGet(url, callback) {
  http.get(url, function(response) {
    response.on("data", function() {} );
    response.on("end", function() {
      callback(response);
    });
  });
}


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
      test.equals(200, response.statusCode, "Expected server to return the root page; it didn't.");
      response.on("data", function() {});
      test.done();
    });
  },

});

exports["Given the server is running and has a virtual-to-physical mapping"] = (function() {
  var pathname = "somefile";
  var filename;

  return nodeunit.testCase({
    setUp: function(done) {
      httpServer = server.start(port, function() {
        filename = httpServer.rootDirectory + "/" + pathname + ".html";
        console.log(filename);
        fs.writeFileSync(filename, "Hello, world.");
        done();
      });
    },

    tearDown: function(done) {
      fs.unlinkSync(filename);
      httpServer.stop(done);
    },

    "when a non-existant file is requested, the server returns a 404.": function(test) {
      test.expect(1);

      httpGet("http://localhost:" + port + "/some-non-existant-file", function(response) {
        test.equals(404, response.statusCode, "Expected an HTTP 404 return code.");
        test.done();
      });
    },

    "when an existing file is requested, that file is served." : function(test) {
      test.expect(1);
      var url = "http://localhost:" + port + "/" + pathname;

      httpGet(url, function(response) {
        test.equals(200, response.statusCode, "Expected an HTTP 200 (OK) response; virtual path = " + url + "; file located at " + filename);
        test.done();
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
