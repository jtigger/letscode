// Copyright (c) 2013 by John S. Ryan.  All rights reserved.  See LICENSE.txt for details.
/* globals Raphael, wwp:true, $ */
wwp = {};

(function() {
  "use strict";

  var paper;
  var startEvent = null;

  wwp.initializeDrawingArea = function(containerElementId) {
    paper = new Raphael(containerElementId);

    $(containerElementId).mousedown(function(event) {
      startEvent = event;
    });

    $(containerElementId).mouseup(function(event) {
      var startOffset = { x: startEvent.pageX - $(containerElementId).offset().left,
        y: startEvent.pageY - $(containerElementId).offset().top};
      var endOffset = { x: event.pageX - $(containerElementId).offset().left,
        y: event.pageY - $(containerElementId).offset().top};

      var leftPadding = parseInt($(containerElementId).css("padding-left"), 10);
      var topPadding = parseInt($(containerElementId).css("padding-top"), 10);

      wwp.drawLine(startOffset.x - leftPadding, startOffset.y - topPadding,
        endOffset.x - leftPadding, endOffset.y - topPadding);
      startEvent = null;
    });

    return paper;
  };

  wwp.drawLine = function(startX, startY, endX, endY) {
    paper.path("M" + startX + "," + startY + "L" + endX + "," + endY);
  };

})();
