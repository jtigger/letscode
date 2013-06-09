// Copyright (c) 2013 by John S. Ryan.  All rights reserved.  See LICENSE.txt for details.
/* globals wwp:true */
wwp = {};

(function() {
  "use strict";

  wwp.createElement = function() {
    var div = document.createElement("div");
    div.setAttribute("id", "hooka");
    div.setAttribute("foo", "bar");
    document.body.appendChild(div);
  };

})();
