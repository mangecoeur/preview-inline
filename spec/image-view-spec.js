'use babel';
/* eslint-env node, browser, jasmine */

import ImageView from '../lib/image-view';

describe("ImageView", () =>
  describe("Creates an element from a simple math string", () =>
    it("returns the html element for the math", () => {
      let image = "test-image.jpg";
      let view = new ImageView();
      view.imageLocation = image;
      return expect(view.getElement()).toExist();
    })
  )
);
