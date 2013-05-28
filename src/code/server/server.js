// Copyright (c) 2013 by John S. Ryan.  All rights reserved.  See LICENSE.txt for details.
"use strict";
var http = require("http");
var url = require("url");
var fs = require("fs");

var fileRootDirectory = fs.realpathSync(__dirname + "/../../../build/test");

// port = which TCP/IP port to listen on.
// callback = invoked when server is ready to accept connections.
exports.start = function(port, callback) {
  if (!port) { throw new Error("'port' is not optional."); }

  var server = http.createServer();

  server.on("request", function(request, response) {

    var requestUrl = url.parse(request.url);

    if (requestUrl.pathname === "/") {
      response.end("<html><body><h1>Hello, world!</h1></body></html>");
    } else {
      var filePathname = requestUrl.pathname;
      var fileExtension = ".html";
      var filename = fileRootDirectory + "/" + filePathname + fileExtension;
      fs.readFile(filename, function(err, data) {
        if (err) {
          // TODO: should actually determine what the error is
          if (err.errno === 34) {
            response.statusCode = 404;
          } else {
            response.statusCode = 500;
          }
        }
        if (data) {
          response.write(data);
        }
        response.end();
      });
    }
  });
  server.listen(port, callback);

  var wrapper = (function() {
    return {
      "rootDirectory": fileRootDirectory,
      "stop": function(callback) {
        server.close(callback);
      }
    };
  })();

  return wrapper;
};
