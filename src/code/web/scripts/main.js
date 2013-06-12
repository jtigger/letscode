// Copyright (c) 2013 by John S. Ryan.  All rights reserved.  See LICENSE.txt for details.
/* globals Raphael, wwp:true */
wwp = {};

(function() {
  "use strict";

  var paper;

  wwp.initializeDrawingArea = function(containerElementId) {
    paper = new Raphael(containerElementId);
    return paper;
  };

})();
