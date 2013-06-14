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

    it("should display a drawn line", function() {
      var paper;
      var totalElements;
      drawingArea.height(200).width(400);

      paper = wwp.initializeDrawingArea(drawingArea[0]);
      wwp.drawLine(20, 30, 200, 20);

      totalElements = 0;
      paper.forEach(function() {
        totalElements++;
      });
      expect(totalElements).to.be(1);
    });

    it("should display that drawn line with the dimensions given.", function() {
      var paper;
      var pathValues = [['M', 200, 30], ['L', 200, 20]];
      var pathValuesAsString = "M200,30L200,20";
      drawingArea.height(200).width(400);

      paper = wwp.initializeDrawingArea(drawingArea[0]);


      wwp.drawLine(200, 30, 200, 20);

      paper.forEach(function(element) {
        var actualPath;
        var expectedPath;

        expect(element.attr()).to.have.property("path");
        if(Raphael.type === "SVG") {
          actualPath = JSON.stringify(element.attr().path);
          expectedPath = JSON.stringify(pathValues);
        } else {
          actualPath = element.attr().path;
          expectedPath = pathValuesAsString;
        }
        expect(actualPath).to.equal(expectedPath);
      });

    });
  });
})();
