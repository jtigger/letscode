// Copyright (c) 2013 by John S. Ryan.  All rights reserved.  See LICENSE.txt for details.
"use strict";

var server = require("./server.js");

if(process.argv.length < 3) {
  throw new Error("Invalid number of arguments.");
}

var rootDirectory = process.argv[2];
var port = process.argv[3];

server.start(port, rootDirectory, function() {
  console.log("Server started successfully.");
});