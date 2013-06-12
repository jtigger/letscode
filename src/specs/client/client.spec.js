// Copyright (c) 2013 by John S. Ryan.  All rights reserved.  See LICENSE.txt for details.
/* globals afterEach, beforeEach, describe, expect, it, wwp, $  */

(function() {
  "use strict";

  describe("wee canvas", function() {

    beforeEach(function() {
      var drawingAreaDiv = document.createElement("div");
      drawingAreaDiv.setAttribute("id", "wwp-drawingArea");
      document.body.appendChild(drawingAreaDiv);
    });

    afterEach(function() {
      $("#wwp-drawingArea").remove();
    });

    it("should exist within the drawing div", function() {
      var drawingAreaChildTag;

      wwp.initializeDrawingArea("wwp-drawingArea");

      drawingAreaChildTag = $("#wwp-drawingArea").children()[0].tagName.toLowerCase();
      // if a browser does not support SVG (e.g. IE 8), the canvas will be a DIV tag.
      // otherwise, it will be a SVG tag.
      if(drawingAreaChildTag !== "svg" && drawingAreaChildTag !== "div") {
        expect().fail("could not find the HTML element that contains the canvas.  Should be either 'svg' or 'div' (IE 8).");
      }
    });

    it("should match the dimensions of the enclosing div", function() {
      var paper;

      $("#wwp-drawingArea").height(200).width(400);

      paper = wwp.initializeDrawingArea("wwp-drawingArea");

      expect(paper.height).to.be(200);
      expect(paper.width).to.be(400);
    });
  });
})();
