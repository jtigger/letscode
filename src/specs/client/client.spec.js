// Copyright (c) 2013 by John S. Ryan.  All rights reserved.  See LICENSE.txt for details.
/* globals describe, expect, it, wwp, $  */

(function() {
  "use strict";

  describe("wee canvas", function() {
    it("should exist within the drawing div", function() {
      var drawingAreaDiv = document.createElement("div");
      var drawingAreaChildTag;

      drawingAreaDiv.setAttribute("id", "wwp-drawingArea");
      document.body.appendChild(drawingAreaDiv);

      wwp.initializeDrawingArea("wwp-drawingArea");

      drawingAreaChildTag = $("#wwp-drawingArea").children()[0].tagName.toLowerCase();
      // if a browser does not support SVG (e.g. IE 8), the canvas will be a DIV tag.
      // otherwise, it will be a SVG tag.
      if(drawingAreaChildTag !== "svg" && drawingAreaChildTag !== "div") {
        expect().fail("could not find the HTML element that contains the canvas.  Should be either 'svg' or 'div' (IE 8).");
      }
    });
  });
})();
