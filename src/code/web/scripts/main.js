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

      wwp.drawLine(startOffset.x, startOffset.y, endOffset.x, endOffset.y);
      startEvent = null;
    });

    return paper;
  };

  wwp.drawLine = function(startX, startY, endX, endY) {
    paper.path("M"+startX+","+startY+"L"+endX+","+endY);
  };

})();
