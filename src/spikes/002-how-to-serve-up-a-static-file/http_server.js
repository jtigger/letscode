// Copyright (c) 2013 by John S. Ryan.  All rights reserved.  See LICENSE.txt for details.
"use strict";

/* Spike 001: how does one write a simple HTTP server in node.js?
 The basis for our app is going to be an HTTP server.
 At this point, I didn't know how to build one of these, so this is me
 learning how to do that.
 */

var http = require("http");
var fs = require("fs");
var url = require("url");
var server = http.createServer();

server.on("request", function(request, response) {
  console.log("request received.");

  var requestUrl = url.parse(request.url);
  // check to see if file exists

  // virtual path to files system path mapping...
  // - establish the virtual directory root (and calc the filesystem prefix
  var fileRootDirectory = __dirname + "/";
  var filePathname = requestUrl.pathname;
  // - if no pathname specified, use "index"
  console.log(filePathname);
  if (filePathname === "" || filePathname === "/") { filePathname = "index"; }
  // - look for pathname.html, pathname.htm, pathname.txt
  var fileExtension = ".html";
  var filename = fileRootDirectory + filePathname + fileExtension;  // use a strategy for looking for multiple extensions.

  fs.readFile(filename, function(err, data) {
    if (err) {
      console.log(err);
      // TODO: should actually determine what the error is
      if (err.errno === 34) {
        response.statusCode = 404;
        console.log("sent 404.");
      } else {
        response.statusCode = 500;
        console.log("sent 500.");
      }
    }
    if (data) {
      response.write(data);
      console.log("response sent.");
    }
    response.end();
  });
});

server.listen(8000);

console.log("Server listening on port 8000");