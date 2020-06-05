'use babel';
/* eslint-env node, browser, jasmine */

import TikzView from '../lib/tikz-view';

describe("TikzView", () =>
  describe("Creates an element from a tikzpicture", () =>
    it("returns the html element for the tikzpicture", () => {
      let image = "tikz.png";
      let view = new TikzView();
      view.imageLocation = image;
      return expect(view.getElement()).toExist();
    })
  )
);
