// Copyright (c) 2013 by John S. Ryan.  All rights reserved.  See LICENSE.txt for details.
/* globals Raphael, wwp:true, $ */
wwp = {};

(function() {
  "use strict";

  var paper;
  var startPosition = null;
  var draftLine;

  wwp.initializeDrawingArea = function(containerElementId) {
    paper = new Raphael(containerElementId);

    $(containerElementId).mousedown(function(event) {
      startPosition = { x: event.pageX - $(containerElementId).offset().left,
        y: event.pageY - $(containerElementId).offset().top};

      draftLine = wwp.drawLine(startPosition, startPosition);
      draftLine.attr("stroke-opacity", "0.1");
    });

    $(containerElementId).mousemove(function(event) {
      if(startPosition !== null) {
        var attrs = draftLine.attr();
        var offset = { x: event.pageX - $(containerElementId).offset().left,
          y: event.pageY - $(containerElementId).offset().top};
        attrs.path[1] = ["L", offset.x, offset.y];
        draftLine.attr(attrs);
      }
    });

    $(containerElementId).mouseup(function(event) {
      if(startPosition !== null) {
        draftLine.attr("stroke-opacity", "1.0");
        draftLine.attr("stroke", "#00F");
        startPosition = null;
      }
    });

    return paper;
  };

  wwp.drawLine = function(startX, startY, endX, endY) {
    return paper.path("M"+startX+","+startY+"L"+endX+","+endY);
  };

})();
