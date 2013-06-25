// Copyright (c) 2013 by John S. Ryan.  All rights reserved.  See LICENSE.txt for details.
/* globals Raphael, wwp:true, $ */
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
    registerMouseEventHandlersForDrawingLines(containerElementId, paperContainer);
    return paper;
  };


  function registerMouseEventHandlersForDrawingLines(containerElementId, paperContainer) {
    var draftLine = null;

    $(containerElementId).mousedown(function(event) {
      var positionWithinCanvas;

      if (!draftLine) {
        positionWithinCanvas = calcPositionOnPaper(event, paperContainer);
        draftLine = drawLine(positionWithinCanvas, positionWithinCanvas);
        draftLine.attr("stroke-opacity", "0.1");
      }
    });

    $(containerElementId).mousemove(function(event) {
      if (draftLine) {
        setEndPoint(draftLine, calcPositionOnPaper(event, paperContainer));
      }
    });

    $(containerElementId).mouseup(function() {
      draftLine.attr("stroke-opacity", "1.0");
      draftLine = null;
    });
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

    return { x: absolutePosition.pageX - positionOfContainerOnPage.x - leftPadding,
      y: absolutePosition.pageY - positionOfContainerOnPage.y - topPadding };
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

})();
