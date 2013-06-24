// Copyright (c) 2013 by John S. Ryan.  All rights reserved.  See LICENSE.txt for details.
/* globals after, afterEach, before, beforeEach, describe, expect, it, jQuery, Raphael, wwp, $ */

(function() {
  "use strict";

  describe("The WeeWikiPaint canvas,", function() {
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

    it("when told to draw a line, should add a 'path' to the canvas.", function() {
      var pathValues = [
        ['M', 200, 30],
        ['L', 200, 20]
      ];
      var elements, element;

      wwp.drawLine({x: pathValues[0][1], y: pathValues[0][2]}, {x: pathValues[1][1], y: pathValues[1][2]});

      elements = getElementsOnPaper(paper);
      expect(elements.length).to.equal(1);
      element = elements[0];

      expect(element.attr()).to.have.property("path");
      expect(pathAsString(element.attr().path)).to.equal(pathAsString(pathValues));
    });

    describe("when the user clicks within it,", function() {
      var startingPosition = {x: 100, y: 10};
      var endingPosition = {x: 200, y: 20};

      beforeEach(function() {
        simulateMouseDownWithin(drawingArea, startingPosition);
      });

      it("should draw a line.", function() {
        var elements = getElementsOnPaper(paper);
        var pathOfLine = elements[0];
        expect(elements.length).to.equal(1);
        expect(pathOfLine.attr()).to.have.property("path");
      });

      describe("and drags to another point within it,", function() {
        var elements;
        var pathOfLine;

        beforeEach(function() {
          simulateMouseMoveWithin(drawingArea, endingPosition);
          elements = getElementsOnPaper(paper);
          pathOfLine = elements[0];
        });

        it("should adjust the line to track the mouse", function() {
          var endpointOfLine;
          var pathValue = pathAsArray(pathOfLine.attr().path);

          endpointOfLine = {x: pathValue[1][1], y: pathValue[1][2]};

          expect(endpointOfLine).to.eql(endingPosition);
        });

        it("should make the line semi-transparent", function() {
          expect(pathOfLine.attr()["stroke-opacity"]).to.be("0.1");
        });

        describe("and lets go,", function() {
          beforeEach(function() {
            simulateMouseUpWithin(drawingArea, endingPosition);
          });

          it("should make the line fully opaque.", function() {
            expect(pathOfLine.attr()["stroke-opacity"]).to.be("1.0");
          });
        });

        describe("and drags outside of the canvas, and lets go, and clicks back in it", function() {
          beforeEach(function() {
            // this assumes that the "mousemove" and "mouseup" events have no affect on WWP's behavior, here.
            simulateMouseDownWithin(drawingArea, endingPosition);
            elements = getElementsOnPaper(paper);
          });

          it("should continue to adjust the same line (and not create a new one)", function() {
             expect(elements.length).to.be(1);
          });
        });

      });

    });

    it("when user clicks, drags, and lets go, draws a line that starts where they clicked and ends where they had let go.", function() {
//      var expectedPathValues = [
//        ['M', 100, 200],
//        ['L', 150, 250]
//      ];
//      clickAndDragAcrossPath(expectedPathValues, drawingArea);
//
//      var path = getElementsOnPaper(paper)[0];
//
//      expect(pathAsString(path.attr().path)).to.equal(pathAsString(expectedPathValues));
    });

    it("when determining the location of a line, WWP accounts for padding of the canvas' container.", function() {
//      var topPadding = 11;
//      var leftPadding = 19;
//      var mousePath = [
//        ['M', 101, 223],
//        ['L', 113, 251]
//      ];
//      var expectedPath = [
//        ['M', mousePath[0][1] - leftPadding, mousePath[0][2] - topPadding],
//        ['L', mousePath[1][1] - leftPadding, mousePath[1][2] - topPadding]
//      ];
//
//      drawingArea.attr("style", function(index, value) {
//        return value + "; padding-left: " + leftPadding + "px; padding-top: " + topPadding + "px";
//      });
//
//      clickAndDragAcrossPath(mousePath, drawingArea);
//
//      var path = getElementsOnPaper(paper)[0];
//      expect(pathAsString(path.attr().path)).to.be(pathAsString(expectedPath));
    });

  });

  /**
   * Generates String representation for a SVG Path, handling browser differences.
   *
   * @param { [[],[]] | String } path either the "path" attribute of a Raphael Element that is a Path -OR- an array representing the path values.
   * @returns {String} the value as a string.
   */
  function pathAsString(path) {
    var result;
    if (Raphael.type === "SVG") {  // in this mode, all paths are objects
      result = JSON.stringify(path);
    } else {
      if ($.isArray(path)) {
        result = path[0][0] + path[0][1] + "," + path[0][2] +
          path[1][0] + path[1][1] + "," + path[1][2];
      } else {
        result = path;  // assumes path is already a string (e.g. in IE 8.0)
      }
    }
    return result;
  }

  /**
   * Generates an Array representation for a SVG path, handling browser differences.
   *
   * @param { [[],[]] | String } pathAsString either the "path" attribute of a Raphael Element that is a Path -OR- a string representing path values.
   * @returns { [[],[]] } the value as an array (e.g. [["M", 7, 4], ["L", 19, 42]]).
   */
  function pathAsArray(pathAsString) {
    var pathValues;
    if(pathAsString instanceof Array) {
      pathValues = pathAsString;
    } else {
      var pathTokens = pathAsString.match(/([M])(\d+),(\d+)([L])(\d+),(\d+)/);
      pathValues = [[pathTokens[1], pathTokens[2], pathTokens[3]], [pathTokens[4], pathTokens[5], pathTokens[6]]];
    }
    return pathValues;
  }


  /**
   * Generates and dispatches browser events that simulates a user clicking on the starting position of the path
   * and letting go at the ending position of the path.
   *
   * @param pathValues [['M', AAA, BBB], ['L', XXX, YYY]]
   * @param drawingArea the HTML element containing the Raphael Paper (typically a DIV).
   */
  /*
   function clickAndDragAcrossPath(pathValues, drawingArea) {
   // TODO: emit "mousemove" events along the paths.
   var startingPosition = calcAbsolutePagePosition({x: pathValues[0][1], y: pathValues[0][2]}, drawingArea);
   var endingPosition = calcAbsolutePagePosition({x: pathValues[1][1], y: pathValues[1][2]}, drawingArea);
   drawingArea.trigger(createMouseEvent("mousedown", startingPosition));
   drawingArea.trigger(createMouseEvent("mouseup", endingPosition));
   }
   */

  /**
   * @param {{x: number, y:number}} relativePosition
   * @param element jQuery selector of the element to which relativePosition is relative.
   * @returns {{pageX: number, pageY: number}} the corresponding position relative to the document.
   */
  function calcAbsolutePagePosition(relativePosition, element) {
    return  { pageX: $(element).offset().left + relativePosition.x,
      pageY: $(element).offset().top + relativePosition.y };
  }

  function simulateMouseDownWithin(element, relativePosition) {
    element.trigger(createMouseEvent("mousedown", calcAbsolutePagePosition(relativePosition, element)));
  }

  function simulateMouseUpWithin(element, relativePosition) {
    element.trigger(createMouseEvent("mouseup", calcAbsolutePagePosition(relativePosition, element)));
  }

  function simulateMouseMoveWithin(element, relativePosition) {
    element.trigger(createMouseEvent("mousemove", calcAbsolutePagePosition(relativePosition, element)));
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
