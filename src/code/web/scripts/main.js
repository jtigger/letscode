// Copyright (c) 2013 by John S. Ryan.  All rights reserved.  See LICENSE.txt for details.
/* globals Raphael, wwp:true, $ */
wwp = {};

(function() {
  "use strict";

  var paper;
  var startEvent = null;

  wwp.initializeDrawingArea = function(containerElementId) {
    var paperContainer = $(containerElementId);
    paper = new Raphael(containerElementId);

    $(containerElementId).mousedown(function(event) {
      startEvent = event;
    });

    $(containerElementId).mouseup(function(event) {
      var startOffset = calcPositionOnPaper(startEvent, paperContainer);
      var endOffset = calcPositionOnPaper(event, paperContainer);

      wwp.drawLine(startOffset, endOffset);
      startEvent = null;
    });

    return paper;
  };

  /**
   * Draws a line on the Paper
   * @param {{x:number, y:number}} start position on the Paper to start the line.
   * @param {{x:number, y:number}} end position on the paper to end the line.
   */
  wwp.drawLine = function(start, end) {
    paper.path("M" + start.x + "," + start.y + "L" + end.x + "," + end.y);
  };

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


})();
