// Copyright (c) 2013 by John S. Ryan.  All rights reserved.  See LICENSE.txt for details.
"use strict";
var http = require("http");
var url = require("url");
var fs = require("fs");

exports.start = function(port) {
  if (!port) { throw new Error("'port' is not optional."); }

  var server = http.createServer();

  server.on("request", function(request, response) {

    var requestUrl = url.parse(request.url);

    if (requestUrl.pathname === "/") {
      response.end("<html><body><h1>Hello, world!</h1></body></html>");
    } else {
      var fileRootDirectory = __dirname + "/../../../build";
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
  server.listen(port);

  var wrapper = (function() {
    return {
      "stop": function(callback) {
        server.close();
        if (callback) {callback();}
      }
    };
  })();

  return wrapper;
};
