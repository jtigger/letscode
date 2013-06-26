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

    it("should account for padding of the canvas' container when determining the location of a line.", function() {
      var topPadding = 10;
      var leftPadding = 20;
      var mousePath = [
        ['M', 100, 10],
        ['L', 20, 200]
      ];
      var expectedPath = [
        ['M', mousePath[0][1] - leftPadding, mousePath[0][2] - topPadding],
        ['L', mousePath[1][1] - leftPadding, mousePath[1][2] - topPadding]
      ];

      drawingArea.attr("style", function(index, value) {
        return value + "; padding-left: " + leftPadding + "px; padding-top: " + topPadding + "px";
      });

      simulateMouseDownWithRespectTo(drawingArea, {x: mousePath[0][1], y: mousePath[0][2]});
      simulateMouseMoveWithRespectTo(drawingArea, {x: mousePath[1][1], y: mousePath[1][2]});
      simulateMouseUpWithRespectTo(drawingArea, {x: mousePath[1][1], y: mousePath[1][2]});

      var path = getElementsOnPaper(paper)[0];
      expect(pathAsString(path.attr().path)).to.be(pathAsString(expectedPath));
    });

    describe("when the user clicks within it,", function() {
      var startingPosition = {x: 100, y: 10};
      var endingPosition = {x: 200, y: 20};

      beforeEach(function() {
        simulateMouseDownWithRespectTo(drawingArea, startingPosition);
      });

      it("should draw a line.", function() {
        var elements = getElementsOnPaper(paper);
        var pathOfLine = elements[0];
        expect(elements.length).to.equal(1);
        expect(pathOfLine.attr()).to.have.property("path");
      });

      describe("and lets go without moving,", function() {
        beforeEach(function() {
          simulateMouseUpWithRespectTo(drawingArea, startingPosition);
        });
        it("should delete the line.", function() {
          expect(getElementsOnPaper(paper).length).to.equal(0);
        });
      });

      describe("and drags to another point within it,", function() {
        var elements;
        var pathOfLine;

        beforeEach(function() {
          simulateMouseMoveWithRespectTo(drawingArea, endingPosition);
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
            simulateMouseUpWithRespectTo(drawingArea, endingPosition);
          });

          it("should make the line fully opaque.", function() {
            expect(pathOfLine.attr()["stroke-opacity"]).to.be("1.0");
          });
        });

        describe("and drags outside of the canvas, and lets go", function() {
          beforeEach(function() {
            // this assumes that the "mousemove" and "mouseup" events have no affect on WWP's behavior, here.
            simulateMouseLeaveWithRespectTo(drawingArea);
            elements = getElementsOnPaper(paper);
          });

          it("should abort drawing the line", function() {
             expect(elements.length).to.be(0);
          });
        });

      });

    });


  });

  function getElementsOnPaper(paper) {
    var elements = [];
    paper.forEach(function(element) {
      elements.push(element);
    });
    return elements;
  }

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
    // CAP-0003: pathAsArray
    var pathValues;
    if(pathAsString instanceof Array) {
      pathValues = pathAsString;
    } else {
      var pathTokens = pathAsString.match(/([M])(\d+),(\d+)([L])(\d+),(\d+)/);
      pathValues = [[pathTokens[1], pathTokens[2], pathTokens[3]], [pathTokens[4], pathTokens[5], pathTokens[6]]];
    }
    return pathValues;
  }

  function simulateMouseDownWithRespectTo(element, relativePosition) {
    var pagePosition = calcAbsolutePagePosition(relativePosition, element);
    element.trigger(createMouseEvent("mousedown", pagePosition));
  }

  function simulateMouseUpWithRespectTo(element, relativePosition) {
    element.trigger(createMouseEvent("mouseup", calcAbsolutePagePosition(relativePosition, element)));
  }

  function simulateMouseMoveWithRespectTo(element, relativePosition) {
    element.trigger(createMouseEvent("mousemove", calcAbsolutePagePosition(relativePosition, element)));
  }

  function simulateMouseLeaveWithRespectTo(element) {
    element.trigger(createMouseEvent("mouseleave"));
  }

  /**
   * @param {{x: number, y:number}} relativePosition
   * @param element jQuery selector of the element to which relativePosition is relative.
   * @returns {{pageX: number, pageY: number}} the corresponding position relative to the document.
   */
  function calcAbsolutePagePosition(relativePosition, element) {
    return  { pageX: $(element).offset().left + relativePosition.x,
      pageY: $(element).offset().top + relativePosition.y };
  }

  /**
   * @param type which event to create.
   * @param {{pageX:number, pageY:number}} [pageLocation]
   * @returns {Event}
   */
  function createMouseEvent(type, pageLocation) {
    var event = jQuery.Event();
    event.type = type;
    if(pageLocation) {
      event.pageX = pageLocation.pageX;
      event.pageY = pageLocation.pageY;
    }
    return event;
  }

})();
