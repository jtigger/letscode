// Copyright (c) 2013 by John S. Ryan.  All rights reserved.  See LICENSE.txt for details.
/* globals after, afterEach, before, beforeEach, describe, DocumentTouch:true, expect, it, jQuery, Raphael, Touch, TouchList, wwp, $ */

(function(globals) {
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
      if (browserDoesSupportTouchEvents()) {
        if (typeof globals.DocumentTouch === "undefined") {
          // 2013-07-05: despite the fact that the Mozilla Developers Network indicates that this class is supported
          //  by mobile Safari, in practice, it's not there.  We need to construct the Touch Event-contained objects
          //  so we'll use the API that (supposedly) forthcoming.
          globals.DocumentTouch = {};
          DocumentTouch.createTouch = function(view, target, identifier, pageX, pageY, screenX, screenY, clientX, clientY, radiusX, radiusY, rotationAngle, force) {
            return new Touch(view, target, identifier, pageX, pageY, screenX, screenY, clientX, clientY, radiusX, radiusY, rotationAngle, force);
          };
          DocumentTouch.createTouchList = function(touch1, touch2, touch3) {
            return new TouchList(touch1, touch2, touch3);
          };
        }
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

        describe("and drags outside of the canvas", function() {
          beforeEach(function() {
            simulateMouseLeaveWithRespectTo(drawingArea);
            elements = getElementsOnPaper(paper);
          });

          it("should abort drawing the line", function() {
            expect(elements.length).to.be(0);
          });

          it("should prevent other elements outside the canvas from being selected (even on IE 8).", function() {
            var positionOutsideTheDrawingArea = {x: drawingArea.outerWidth() + 10, y: drawingArea.outerHeight() + 10 };
            drawingArea.mousedown(function(event) {
              expect(event.isDefaultPrevented()).to.be(true);
            });
            simulateMouseDownWithRespectTo(drawingArea, positionOutsideTheDrawingArea);

            // this is additionally required by IE 8.0
            drawingArea.on("selectstart", function(event) {
              expect(event.isDefaultPrevented()).to.be(true);
            });
            simulateMouseEventOn("selectstart", drawingArea, positionOutsideTheDrawingArea);
          });
        });
      });
    });

    if (browserDoesSupportTouchEvents()) {
      // the behavior with touch mirrors that of the mouse unless otherwise specified, below.
      describe("when the user touches within it", function() {

        var startingPosition = {x: 100, y: 10};
//        var endingPosition = {x: 200, y: 20};
//        var secondTouchPosition = {x: 10, y: 10};

        function createTouchEventOn(element, type, pageLocation) {
          var event;
          var touch;

          event = jQuery.Event();
          event.type = type;
          event.originalEvent = document.createEvent("TouchEvent");
          event.originalEvent.initTouchEvent(event, true, true);

          touch = DocumentTouch.createTouch(undefined, element, 0, pageLocation.pageX, pageLocation.pageY);
          event.originalEvent.touches = DocumentTouch.createTouchList(touch);

          if (pageLocation) {
            event.pageX = pageLocation.pageX;
            event.pageY = pageLocation.pageY;
          }
          return event;
        }

        function simulateTouchStartWithRespectTo(element, relativePosition) {
          element.trigger(createTouchEventOn(element, "touchstart", calcAbsolutePagePosition(relativePosition, element)));
        }

        // TODO: document multi-touch handling
//        function simulateTouchMoveWithRespectTo(element, relativePosition) {
//          var pagePosition;
//
//          if(relativePosition instanceof Array) {
//            // multi-touch
//            pagePosition = relativePosition.map(function(item) {
//              return calcAbsolutePagePosition(item, element);
//            });
//          } else {
//            pagePosition = calcAbsolutePagePosition(relativePosition, element);
//          }
//
//          element.trigger(createTouchEventOn(element, "touchmove", pagePosition));
//        }

        function simulateTouchEndWithRespectTo(element, relativePosition) {
          element.trigger(createTouchEventOn(element, "touchend", calcAbsolutePagePosition(relativePosition, element)));
        }

        beforeEach(function() {
          simulateTouchStartWithRespectTo(drawingArea, startingPosition);
        });

        it("should draw a line.", function() {
          var elements = getElementsOnPaper(paper);
          var pathOfLine = elements[0];
          expect(elements.length).to.equal(1);
          expect(pathOfLine.attr()).to.have.property("path");
        });

        describe("and lets go without moving,", function() {
          beforeEach(function() {
            simulateTouchEndWithRespectTo(drawingArea, startingPosition);
          });
          it("should delete the line.", function() {
            expect(getElementsOnPaper(paper).length).to.equal(0);
          });
        });

//        describe("and then starts to touch with two fingers", function() {
//          beforeEach(function() {
//            simulateTouchMoveWithRespectTo(drawingArea, [endingPosition, secondTouchPosition]);
//          });
//          it("should cancel drawing the line.", function() {
//            expect(getElementsOnPaper(paper).length).to.equal(0);
//          });
//        });
      });
    }

  });

  function getElementsOnPaper(paper) {
    var elements = [];
    paper.forEach(function(element) {
      elements.push(element);
    });
    return elements;
  }

  function browserDoesSupportTouchEvents() {
    return typeof TouchEvent !== "undefined";
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
    if (pathAsString instanceof Array) {
      pathValues = pathAsString;
    } else {
      var pathTokens = pathAsString.match(/([M])(\d+),(\d+)([L])(\d+),(\d+)/);
      pathValues = [
        [pathTokens[1], pathTokens[2], pathTokens[3]],
        [pathTokens[4], pathTokens[5], pathTokens[6]]
      ];
    }
    return pathValues;
  }

  function simulateMouseEventOn(eventType, element, pagePosition) {
    element.trigger(createMouseEvent(eventType, pagePosition));
  }

  function simulateMouseDownWithRespectTo(element, relativePosition) {
    simulateMouseEventOn("mousedown", element, calcAbsolutePagePosition(relativePosition, element));
  }

  function simulateMouseUpWithRespectTo(element, relativePosition) {
    simulateMouseEventOn("mouseup", element, calcAbsolutePagePosition(relativePosition, element));
  }

  function simulateMouseMoveWithRespectTo(element, relativePosition) {
    simulateMouseEventOn("mousemove", element, calcAbsolutePagePosition(relativePosition, element));
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
    if (pageLocation) {
      event.pageX = pageLocation.pageX;
      event.pageY = pageLocation.pageY;
    }
    return event;
  }

})(this);
