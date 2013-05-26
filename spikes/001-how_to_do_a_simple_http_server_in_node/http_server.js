// Copyright (c) 2013 by John S. Ryan.  All rights reserved.  See LICENSE.txt for details.
"use strict";

/* Spike 001: how does one write a simple HTTP server in node.js?
      The basis for our app is going to be an HTTP server.
      At this point, I didn't know how to build one of these, so this is me
      learning how to do that.
 */

var http = require("http");
var server = http.createServer();

server.on("request", function(request, response) {
  console.log("request received.");

  response.end("<html><body><h1>hello, world.</h1></body></html>");
});

server.listen(8000);

console.log("Server listening on port 8000");