// Copyright (c) 2013 by John S. Ryan.  All rights reserved.  See LICENSE.txt for details.
"use strict";

var server = require("./server.js");

if(process.argv.length < 3) {
  throw new Error("Missing arguments.  It's weewikipaint (port) (root-dir).");
}

var port = process.argv[2];
var rootDirectory = process.argv[3];

server.start(port, rootDirectory, function() {
  console.log("Server started successfully.");
});