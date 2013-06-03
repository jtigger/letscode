// Copyright (c) 2013 by John S. Ryan.  All rights reserved.  See LICENSE.txt for details.
"use strict";
var http = require("http");
var url = require("url");
var fs = require("fs");

var DEFAULT_404_HTML = "<html><!-- If you are seeing this, the 404 page is not properly configured. --><body>404 Not Found.</body></html>";
var fileRootDirectory;

function writeFile(response, filename, done) {
  fs.readFile(filename, function(err, data) {
    if (!err) {
      response.write(data);
    } else {
      response.statusCode = 500;
    }
    done();
  });
}

function fileSystemPathForUrl(urlPathname) {
  var fileExtension = ".html";
  return fileRootDirectory + "/" + urlPathname + fileExtension;
}

function serveFileForUrl(response, urlPath) {
  var filePath = fileSystemPathForUrl(urlPath);
  fs.exists(filePath, function(exists) {
    if (exists) {
      writeFile(response, filePath, function() {
        response.end();
      });
    } else {
      // base-case for recursive call: we're already trying to serve 404 and can't find THAT file.
      if(response.statusCode === 404) {
        response.write(DEFAULT_404_HTML);
        response.end();
      } else {
        response.statusCode = 404;
        serveFileForUrl(response, "404");
      }
    }
  });

}

// port = which TCP/IP port to listen on.
// rootDirectory = filesystem path to the root of what files this server should serve. (optional)
// callback = invoked when server is ready to accept connections.  (optional)
exports.start = function(port, rootDirectory, callback) {
  if (!port) { throw new Error("'port' is not optional."); }
  if (rootDirectory instanceof Function) {
    callback = rootDirectory;
    rootDirectory = undefined;
  }

  if (rootDirectory) {
    fileRootDirectory = rootDirectory;
  }

  var server = http.createServer();

  server.on("request", function(request, response) {
    var requestUrl = url.parse(request.url);
    serveFileForUrl(response, requestUrl.pathname);
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
