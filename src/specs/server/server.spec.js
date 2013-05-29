// Copyright (c) 2013 by John S. Ryan.  All rights reserved.  See LICENSE.txt for details.
"use strict";

var nodeunit = require("nodeunit");
var http = require("http");
var fs = require("fs");
var server = require("../../code/server/server.js");
var httpServer;
var port = 8000;

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

exports["Configuring the server"] = nodeunit.testCase({

  tearDown: function(done) {
    httpServer.stop(done);
  },

  "when we specify an existing filesystem directory as the web root, the server serves files from that directory" : function(test) {
    test.expect(1);
    var webRootDirectory = __dirname + "/../../../build/test/sample-web-root";
    var pathname = "foo";
    var filename = webRootDirectory + "/" + pathname + ".html";
    fs.mkdirSync(webRootDirectory);
    fs.writeFileSync(filename, "(some HTML)");

    var url = "http://localhost:" + port + "/" + pathname;

    httpServer = server.start(port, webRootDirectory, function() {
      httpGet(url, function(response) {
        test.equals(200, response.statusCode, "Expected that a file within the web root directory would be served.");
        test.done();
      });
    });
  }
//  ,
//
//  "when we specify a non-existant directory as the web root, the server throws an exception": function(test) {
//    test.expect(1);
//
//
//    test.done();
//  }
});

exports["Given the server is running, has a web root configured and has some files"] = (function() {
  var pathname = "somefile";
  var filename;

  return nodeunit.testCase({
    setUp: function(done) {
      httpServer = server.start(port, function() {
        filename = httpServer.rootDirectory + "/" + pathname + ".html";
        fs.writeFileSync(filename, "Hello, world.");
        done();
      });
    },

    tearDown: function(done) {
      fs.unlinkSync(filename);
      httpServer.stop(done);
    },

    "when an existing file is requested, that file is served." : function(test) {
      test.expect(1);
      var url = "http://localhost:" + port + "/" + pathname;

      httpGet(url, function(response) {
        test.equals(200, response.statusCode, "Expected an HTTP 200 (OK) response; virtual path = " + url + "; file located at " + filename);
        test.done();
      });
    },

    "when a non-existant file is requested, the server returns a 404 page.": function(test) {
      test.expect(2);

      httpGet("http://localhost:" + port + "/some-non-existant-file", function(response) {
        var responseContains404HTML = response.content.search(/not found/i) > -1;
        test.equals(404, response.statusCode, "Expected an HTTP 404 return code; actual HTTP response code was " + response.statusCode);
        test.ok(responseContains404HTML, "Expected the 404 Not Found page to be served.  Instead the content served was: \"" + response.content + "\".");
        test.done();
      });
    },

    "when a 404 page is configured, that is served instead of the default.": function(test) {
      test.expect(1);

      var filename = httpServer.rootDirectory + "/404.html";
      var notFoundHTML = "<html><head><title>File Not Found</title></head>" +
                "<body>The page you requested is not available on this server. Click <a href="/">here</a> to continue.</body>" +
                "</html>";
      fs.writeFileSync(filename, notFoundHTML);
      httpGet("http://localhost:" + port + "/some-non-existant-file", function(response) {
        var responseContains404HTML = response.content === notFoundHTML;
        test.ok(responseContains404HTML, "Expected the configured 404 Not Found page to be served.  Instead the content served was: \"" + response.content + "\".");
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
