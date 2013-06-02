// Copyright (c) 2013 by John S. Ryan.  All rights reserved.  See LICENSE.txt for details.
"use strict";

var server = require("./server.js");
var port = 8000;

server.start(port, function() {
  console.log("Server started successfully.");
});