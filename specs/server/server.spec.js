// Copyright (c) 2013 by John S. Ryan.  All rights reserved.  See LICENSE.txt for details.
"use strict";

var server = require("../../src/server/server.js");

exports.firstTest = function(test) {
  test.expect(1);

  test.equals(4, server.number(), "Number is incorrect.");
  test.done();
};