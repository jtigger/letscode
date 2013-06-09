// Copyright (c) 2013 by John S. Ryan.  All rights reserved.  See LICENSE.txt for details.
/* globals describe, expect, it, wwp  */

(function() {
  "use strict";

  describe("document", function() {
    it("should contain foo", function() {
      wwp.createElement();
      var extractedElement = document.getElementById("hooka");
      expect(extractedElement.getAttribute("foo")).to.eql("bar");
    });
  });
})();
