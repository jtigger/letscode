// Copyright (c) 2013 by John S. Ryan.  All rights reserved.  See LICENSE.txt for details.
"use strict";
var http = require("http");

exports.start = function(port) {
  var server = http.createServer();

  server.on("request", function(request, response) {
    response.end("<html><body><h1>hello, world.</h1></body></html>");
  });
  server.listen(port);

  return server;
};
