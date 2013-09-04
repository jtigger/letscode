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

    function isDOMElement(object) {
      return object instanceof Window ||
             object instanceof HTMLDivElement ||
             object instanceof SVGSVGElement;
    }

    function objectToHtml(object) {
      var propName;
      var html = "";

      html += "<ul>";
      for (propName in object) {
        if (object.hasOwnProperty(propName)) {
          html += "<li>" + propName + " = ";
          html += object[propName];
          if(object[propName] instanceof Object && !isDOMElement(object[propName])) {
            html += "{" + objectToHtml(object[propName]) + "}";
          }
          html += "</li>";
        }
      }
      html += "</ul>";

      return html;
    }

    function displayEventInfo(eventName, event) {
      var eventData;

      eventData = "<b>Type:</b> " + eventName + "<br/>";
      eventData += objectToHtml(event);
      $("#eventInfo").html(eventData);
    }

    $(containerElementId).on("touchstart", function(event) {
      displayEventInfo("touchstart", event.originalEvent);
      startDraw(event.originalEvent);
      renderDraftLine(event.originalEvent);
    });

    $(containerElementId).on("touchmove", function(event) {
      event.preventDefault();
      displayEventInfo("touchmove", event.originalEvent);
      renderDraftLine(event.originalEvent);
    });

    $(containerElementId).on("touchend", function(event) {
      displayEventInfo("touchend", event.originalEvent);
      affixLine();
    });

    $(containerElementId).on("touchcancel", function(event) {
      displayEventInfo("touchcancel", event.originalEvent);
    });

    function startDraw(event) {
      startPosition = { x: event.pageX - $(containerElementId).offset().left,
        y: event.pageY - $(containerElementId).offset().top};

      draftLine = wwp.drawLine(startPosition, startPosition);
      draftLine.attr("stroke-opacity", "0.1");
    }

    function renderDraftLine(event) {
      if (startPosition !== null) {
        var attrs = draftLine.attr();
        var offset = { x: event.pageX - $(containerElementId).offset().left,
          y: event.pageY - $(containerElementId).offset().top};
        attrs.path[1] = ["L", offset.x, offset.y];
        draftLine.attr(attrs);
      }
    }

    function affixLine() {
      if (startPosition !== null) {
        draftLine.attr("stroke-opacity", "1.0");
        draftLine.attr("stroke", "#00F");
        startPosition = null;
      }
    }

//    $(containerElementId).mousedown(function(event) {
//      startDraw(event);
//      displayEventInfo("mousedown", event.originalEvent);
//    });
//
//    $(containerElementId).mousemove(function(event) {
//      renderDraftLine(event);
//    });
//
//
//    $(containerElementId).mouseup(function(event) {
//      affixLine();
//    });

    return paper;
  };

  wwp.drawLine = function(startX, startY, endX, endY) {
    return paper.path("M" + startX + "," + startY + "L" + endX + "," + endY);
  };

})
  ();
