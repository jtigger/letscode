// Copyright (c) 2013 by John S. Ryan.  All rights reserved.  See LICENSE.txt for details.
/* globals Raphael, wwp:true, $  */
wwp = {};

(function() {
  "use strict";

  var paper;

  /**
   * Installs a Raphael Paper instance into the page and initializes Raphael.
   *
   * @param containerElementId the element into which Raphael should initialized (typically a DIV).
   * @returns {Paper} the initialized instance of Raphael Paper.
   */
  wwp.initializeDrawingArea = function(containerElementId) {
    var paperContainer = $(containerElementId);

    paper = new Raphael(containerElementId);
    registerEventHandlersForDrawingLines(containerElementId, paperContainer);
    paperContainer.onselectstart = function() {
      return false;
    };
    return paper;
  };

  function registerEventHandlersForDrawingLines(containerElementId, paperContainer) {
    var draftLine = null;

    function startDrawingLine(event) {
      var positionWithinCanvas;

      if (!draftLine) {
        positionWithinCanvas = calcPositionOnPaper(event, paperContainer);
        draftLine = drawLine(positionWithinCanvas, positionWithinCanvas);
        draftLine.attr("stroke-opacity", "0.1");
      }
      event.preventDefault();  // to avoid user selecting elements off the Paper.
    }

    function adjustDraftLine(event) {
      if (draftLine) {
        setEndPoint(draftLine, calcPositionOnPaper(event, paperContainer));
      }
    }

    function finishDrawingLine() {
      var path;
      var startingPointEqualsEndingPoint;

      if (draftLine) {
        path = pathAsArray(draftLine.attr().path);
        startingPointEqualsEndingPoint = path[0][1] === path[1][1] && path[0][2] === path[1][2];
        if (startingPointEqualsEndingPoint) {
          draftLine.remove();
        } else {
          draftLine.attr("stroke-opacity", "1.0");
        }
        draftLine = null;
      }
    }

    function cancelDrawingLine() {
      if (draftLine) {
        draftLine.remove();
        draftLine = null;
      }
    }

    $(containerElementId).mousedown(function(event) {
      startDrawingLine(event);
    });

    // In all other browsers, preventing the default browser behavior on "mousedown" events is sufficient to
    // prevent the user from inadvertently selecting elements outside of Paper.
    // IE 8.0's event model is different.  That behavior is covered by the "selectstart" event.
    $(containerElementId).on("selectstart", function(event) {
      event.preventDefault();
    });

    $(containerElementId).mousemove(function(event) {
      adjustDraftLine(event);
    });

    $(containerElementId).mouseup(function() {
      finishDrawingLine();
    });

    $(containerElementId).mouseleave(function() {
      cancelDrawingLine();
    });

    function isATouchEvent(event) {
      return event.hasOwnProperty("originalEvent");
    }

    $(containerElementId).on("touchstart", function(event) {
      if (isATouchEvent(event)) {
        setLocationOfEventToBeLocationOfFirstTouch(event);
        if (draftLine) {
          adjustDraftLine(event.originalEvent);
        } else {
          startDrawingLine(event.originalEvent);
        }
      }
    });

    $(containerElementId).on("touchmove", function(event) {
      if (isATouchEvent(event)) {
        setLocationOfEventToBeLocationOfFirstTouch(event);
        adjustDraftLine(event.originalEvent);
      }
    });

    $(containerElementId).on("touchend", function(event) {
      if (isATouchEvent(event)) {
        setLocationOfEventToBeLocationOfFirstTouch(event);
        finishDrawingLine();
      }
    });
    $(containerElementId).on("touchcancel", function(event) {
      if (isATouchEvent(event)) {
        setLocationOfEventToBeLocationOfFirstTouch(event);
        cancelDrawingLine();
      }
    });
  }

  function setLocationOfEventToBeLocationOfFirstTouch(event) {
    event.originalEvent.pageX = event.originalEvent.touches[0].pageX;
    event.originalEvent.pageY = event.originalEvent.touches[0].pageY;
  }

  /**
   * Draws a line on the Paper
   * @param {{x:number, y:number}} start position on the Paper to start the line.
   * @param {{x:number, y:number}} end position on the paper to end the line.
   */
  function drawLine(start, end) {
    return paper.path("M" + start.x + "," + start.y + "L" + end.x + "," + end.y);
  }

  /**
   * @param {{pageX: number, pageY:number}} absolutePosition position relative to the document (aka {pageX, pageY}).
   * @param {jQuery} paperContainer the container of the Raphael paper.
   * @return {{x:number, y:number}} of the position within the Raphael Paper that corresponds to absolutePosition.
   */
  function calcPositionOnPaper(absolutePosition, paperContainer) {
    var positionOfContainerOnPage = { x: paperContainer.offset().left,
      y: paperContainer.offset().top};

    var leftPadding = parseInt(paperContainer.css("padding-left"), 10);
    var topPadding = parseInt(paperContainer.css("padding-top"), 10);

// this is how it SHOULD be.  Accessing these properties with this notation returns 0.
//    var pageX = absolutePosition.pageX;
//    var pageY = absolutePosition.pageY;

    // I think I'm gonna vomit...
    function getProperty(obj, property) {
      var prop;
      var value;
      for (prop in obj) {
        if (obj.hasOwnProperty(prop)) {
          if(prop === property) {
            value = obj[prop];
          }
        }
      }
      return value;
    }

    // stupified why this approach works, but not the dot notation.  wtf?
    var pageX = getProperty(absolutePosition, "pageX");
    var pageY = getProperty(absolutePosition, "pageY");

    var positionOnPaper = { x: pageX - positionOfContainerOnPage.x - leftPadding,
      y: pageY - positionOfContainerOnPage.y - topPadding };

    return positionOnPaper;
  }


  function setEndPoint(path, position) {
    var attrs = path.attr();
    if (Raphael.type === "SVG") {
      attrs.path[1] = ["L", position.x, position.y];
    } else {
      attrs.path = attrs.path.substring(0, attrs.path.indexOf("L") + 1) + position.x + "," + position.y;
    }
    path.attr(attrs);
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

})
  ();
