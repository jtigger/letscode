// Copyright (c) 2013 by John S. Ryan.  All rights reserved.  See LICENSE.txt for details.
/* globals afterEach, beforeEach, describe, expect, it, wwp, $ */

(function() {
  "use strict";

  describe("wee canvas", function() {
    var drawingArea;

    beforeEach(function() {
      drawingArea = $("<div id='wwp-drawingArea'></div>");
      $(document.body).append(drawingArea);
    });

    afterEach(function() {
      drawingArea.remove();
    });

    it("should exist within the drawing div", function() {
      var drawingAreaChildTag;

      wwp.initializeDrawingArea(drawingArea[0]);

      drawingAreaChildTag = drawingArea.children()[0].tagName.toLowerCase();
      // if a browser does not support SVG (e.g. IE 8), the canvas will be a DIV tag.
      // otherwise, it will be a SVG tag.
      if(drawingAreaChildTag !== "svg" && drawingAreaChildTag !== "div") {
        expect().fail("could not find the HTML element that contains the canvas.  Should be either 'svg' or 'div' (IE 8).");
      }
    });

    it("should match the dimensions of the enclosing div", function() {
      var paper;

      drawingArea.height(200).width(400);

      paper = wwp.initializeDrawingArea(drawingArea[0]);

      expect(paper.height).to.be(200);
      expect(paper.width).to.be(400);
    });
  });
})();
