// Copyright (c) 2013 by John S. Ryan.  All rights reserved.  See LICENSE.txt for details.
"use strict";
var http = require("http");
var url = require("url");
var fs = require("fs");

var DEFAULT_FILE_ROOT_DIRECTORY = fs.realpathSync(__dirname + "/../../../build/test");
var fileRootDirectory = DEFAULT_FILE_ROOT_DIRECTORY;


// port = which TCP/IP port to listen on.
// rootDirectory = filesystem path to the root of what files this server should serve. (optional)
// callback = invoked when server is ready to accept connections.  (optional)
exports.start = function(port, rootDirectory, callback) {
  if (!port) { throw new Error("'port' is not optional."); }
  if (rootDirectory instanceof Function) {
    callback = rootDirectory;
    rootDirectory = undefined;
  }

  if(rootDirectory) {
    fileRootDirectory = rootDirectory;
  }

  var server = http.createServer();

  server.on("request", function(request, response) {

    var requestUrl = url.parse(request.url);

    if (requestUrl.pathname === "/") {
      response.end("<html><body><h1>Hello, world!</h1></body></html>");
    } else {
      var filePathname = requestUrl.pathname;
      var fileExtension = ".html";
      var filename = fileRootDirectory + "/" + filePathname + fileExtension;
      fs.exists(filename, function(exists) {
        if(exists) {
          fs.readFile(filename, function(err, data) {
            if(!err) {
              response.write(data);
            } else {
              response.statusCode = 500;
            }
            response.end();
          });
        } else {
          var notFoundHTMLFile = "404";
          fileExtension = ".html";
          filename = fileRootDirectory + "/" + notFoundHTMLFile + fileExtension;
          var content = "<html><!-- If you are seeing this, the 404 page is not properly configured. --><body>404 Not Found.</body></html>";

          fs.exists(filename, function(exists) {
            response.statusCode = 404;
            if(exists) {
              fs.readFile(filename, function(err, data) {
                if(!err) {
                  response.write(data);
                } else {
                  response.statusCode = 500;
                }
                response.end();
              });
            } else {
              response.write(content);
              response.end();
            }
          });
        }
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
