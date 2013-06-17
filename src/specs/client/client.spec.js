// Copyright (c) 2013 by John S. Ryan.  All rights reserved.  See LICENSE.txt for details.
/* globals after, afterEach, before, beforeEach, describe, expect, it, jQuery, Raphael, wwp, $ */

(function() {
  "use strict";

  describe("wee canvas", function() {
    var drawingArea;
    var paper;
    var monkeyPatchedArray = false;

    before(function() {
      // 2013-06-17: IE 8.0 does not provide this function on arrays; everyone else does.
      if (!$.isFunction(Array.prototype.forEach)) {
        Array.prototype.forEach = function(callback) {
          var idx;
          for (idx = 0; idx < this.length; idx++) {
            callback(this[idx]);
          }
        };
        monkeyPatchedArray = true;
      }
    });

    after(function() {
      if (monkeyPatchedArray) {
        delete Array.prototype.forEach;
      }
    });

    beforeEach(function() {
      drawingArea = $("<div id='wwp-drawingArea'></div>");
      drawingArea.height(200).width(400);
      $(document.body).append(drawingArea);
      paper = wwp.initializeDrawingArea(drawingArea[0]);
    });

    afterEach(function() {
      drawingArea.remove();
    });

    it("should exist within the drawing div", function() {
      var drawingAreaChildTag;

      drawingAreaChildTag = drawingArea.children()[0].tagName.toLowerCase();

      // modern browsers support SVG, older (e.g. IE 8) do not.
      if (Raphael.type === "SVG") {
        expect(drawingAreaChildTag).to.be("svg");
      } else {
        expect(drawingAreaChildTag).to.be("div");
      }
    });

    it("should match the dimensions of the enclosing div", function() {

      expect(paper.height).to.be(200);
      expect(paper.width).to.be(400);
    });

    it("should display a drawn line", function() {
      var totalElements;

      wwp.drawLine(20, 30, 200, 20);

      totalElements = 0;
      paper.forEach(function() {
        totalElements++;
      });
      expect(totalElements).to.be(1);
    });

    it("should display that drawn line with the dimensions given.", function() {
      var pathValues = [
        ['M', 200, 30],
        ['L', 200, 20]
      ];
      var pathValuesAsString = "M200,30L200,20";

      wwp.drawLine(200, 30, 200, 20);

      paper.forEach(function(element) {
        var actualPath;
        var expectedPath;

        expect(element.attr()).to.have.property("path");
        if (Raphael.type === "SVG") {
          actualPath = JSON.stringify(element.attr().path);
          expectedPath = JSON.stringify(pathValues);
        } else {
          actualPath = element.attr().path;
          expectedPath = pathValuesAsString;
        }
        expect(actualPath).to.equal(expectedPath);
      });
    });

    it("when the user clicks inside the drawing area, WWP puts a line starting there.", function() {
      var expectedPathValues = [
        ['M', 100, 200],
        ['L', 150, 250]
      ];
      var expectedPathValuesAsString = "M100,200L150,250";
      var actualPaths, actualPath, expectedPath;

      var startingPosition = calcAbsolutePagePosition({x: expectedPathValues[0][1], y: expectedPathValues[0][2]}, drawingArea);
      var endingPosition = calcAbsolutePagePosition({x: expectedPathValues[1][1], y: expectedPathValues[1][2]}, drawingArea);

      drawingArea.trigger(createMouseEvent("mousedown", startingPosition));
      drawingArea.trigger(createMouseEvent("mouseup", endingPosition));

      actualPaths = getElementsOnPaper(paper);

      expect(actualPaths.length).to.be(1);
      actualPaths.forEach(function(path) {
        expect(path.attr()).to.have.property("path");
        if (Raphael.type === "SVG") {
          actualPath = JSON.stringify(path.attr().path);
          expectedPath = JSON.stringify(expectedPathValues);
        } else {
          actualPath = path.attr().path;
          expectedPath = expectedPathValuesAsString;
        }
        expect(actualPath).to.equal(expectedPath);
      });
    });
  });

  function calcAbsolutePagePosition(relativePosition, element) {
    return { pageX: $(element).offset().left + relativePosition.x,
      pageY: $(element).offset().top + relativePosition.y };
  }

  function createMouseEvent(type, pageLocation) {
    var event = jQuery.Event();
    event.type = type;
    event.pageX = pageLocation.pageX;
    event.pageY = pageLocation.pageY;
    return event;
  }

  function getElementsOnPaper(paper) {
    var elements = [];
    paper.forEach(function(element) {
      elements.push(element);
    });
    return elements;
  }

})();
