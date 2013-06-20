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

    it("drawing a line puts a 'path' on the canvas.", function() {
      var pathValues = [
        ['M', 200, 30],
        ['L', 200, 20]
      ];
      var elements, element;

      wwp.drawLine({x:200, y: 30}, {x:200, y:20});

      elements = getElementsOnPaper(paper);
      expect(elements.length).to.equal(1);
      element = elements[0];

      expect(element.attr()).to.have.property("path");
      expect(pathToString(element.attr().path)).to.equal(pathToString(pathValues));
    });

    it("when user clicks, drags, and lets go, WWP draws a line that starts where they clicked and ends where they had let go.", function() {
      var expectedPathValues = [
        ['M', 100, 200],
        ['L', 150, 250]
      ];
      clickAndDragAcrossPath(expectedPathValues, drawingArea);

      var path = getElementsOnPaper(paper)[0];

      expect(pathToString(path.attr().path)).to.equal(pathToString(expectedPathValues));
    });

    it("when determining the location of a line, WWP accounts for padding of the canvas' container.", function() {
      var topPadding = 11;
      var leftPadding = 19;
      var mousePath = [
        ['M', 101, 223],
        ['L', 113, 251]
      ];
      var expectedPath = [
        ['M', mousePath[0][1] - leftPadding, mousePath[0][2] - topPadding],
        ['L', mousePath[1][1] - leftPadding, mousePath[1][2] - topPadding]
      ];

      drawingArea.attr("style", function(index, value) {
        return value + "; padding-left: " + leftPadding + "px; padding-top: " + topPadding + "px";
      });

      clickAndDragAcrossPath(mousePath, drawingArea);

      var path = getElementsOnPaper(paper)[0];
      expect(pathToString(path.attr().path)).to.be(pathToString(expectedPath));
    });

  });

  /**
   * Generates String representation for a SVG Path, handling browser differences.
   *
   * @param path either a Raphael Element that is a Path -OR- an array representing the path values.
   * @returns {String} the value as a string.
   */
  function pathToString(path) {
    var pathAsString;
    if (Raphael.type === "SVG") {  // in this mode, all paths are objects
      pathAsString = JSON.stringify(path);
    } else {
      if ($.isArray(path)) {
        pathAsString = path[0][0] + path[0][1] + "," + path[0][2] +
          path[1][0] + path[1][1] + "," + path[1][2];
      } else {
        pathAsString = path;  // assumes path is already a string (e.g. in IE 8.0)
      }
    }
    return pathAsString;
  }

  /**
   * Generates and dispatches browser events that simulates a user clicking on the starting position of the path
   * and letting go at the ending position of the path.
   *
   * @param pathValues [['M', AAA, BBB], ['L', XXX, YYY]]
   * @param drawingArea the HTML element containing the Raphael Paper (typically a DIV).
   */
  function clickAndDragAcrossPath(pathValues, drawingArea) {
    var startingPosition = calcAbsolutePagePosition({x: pathValues[0][1], y: pathValues[0][2]}, drawingArea);
    var endingPosition = calcAbsolutePagePosition({x: pathValues[1][1], y: pathValues[1][2]}, drawingArea);
    drawingArea.trigger(createMouseEvent("mousedown", startingPosition));
    drawingArea.trigger(createMouseEvent("mouseup", endingPosition));
  }

  function calcAbsolutePagePosition(relativePosition, element) {
    return  { pageX: $(element).offset().left + relativePosition.x,
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
