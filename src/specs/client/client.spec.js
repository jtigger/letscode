// Copyright (c) 2013 by John S. Ryan.  All rights reserved.  See LICENSE.txt for details.
/* globals afterEach, beforeEach, describe, expect, it, Raphael, wwp, $ */

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

      // modern browsers support SVG, older (e.g. IE 8) do not.
      if(Raphael.type === "SVG") {
        expect(drawingAreaChildTag).to.be("svg");
      } else {
        expect(drawingAreaChildTag).to.be("div");
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
