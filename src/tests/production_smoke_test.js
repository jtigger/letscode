// Copyright (c) 2013 by John S. Ryan.  All rights reserved.  See LICENSE.txt for details.
"use strict";

var nodeunit = require("nodeunit");
var http = require("http");
var PRODUCTION_HOST = "weewikipaint-jsr.herokuapp.com";
var PROTOCOL = "http";

// complete -- function to invoke when the HTTP GET completes.  This function is passed an instance
//             of node's http.ServerResponse (http://nodejs.org/api/http.html#http_class_http_serverresponse)
//             with an additional property named "content" which holds the textual content of the response.
function httpGet(url, complete) {
  // CAP-0001
  http.get(url, function(response) {
    var content = "";
    response.on("data", function(chunk) { content += chunk; });
    response.on("end", function() {
      response.content = content;
      complete(response);
    });
  });
}

exports["Assuming the server is deployed to Heroku"] = nodeunit.testCase({
  "can serve the Home Page.": function(test) {
    test.expect(1);
    // if the following fails in any way, an exception is thrown
    httpGet(PROTOCOL + "://" + PRODUCTION_HOST + "/index", function(response) {
      test.ok(response.content.indexOf("pageId=Home") !== -1, "Could not find 'Home Page' marker in response.  Response was = \"" + response.content + "\".");
      test.done();
    });
  },

  "can serve the custom 404 page.": function(test) {
    test.expect(1);
    httpGet(PROTOCOL + "://" + PRODUCTION_HOST + "/some-non-existant-resource", function(response) {
      test.ok(response.content.indexOf("pageId=404") !== -1, "Could not find '404' marker in response.  Response was = \"" + response.content + "\".");
      test.done();
    });
  }
  // TODO: add a test case to check the log files

});
