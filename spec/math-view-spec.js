'use babel';
/* eslint-env node, browser, jasmine */
import MathView from '../lib/math-view';

describe("MathView", function() {
  describe("Creates an element from a simple math string", function() {
    it("returns the html element for the math", function() {
      let mathString = "x = \\frac{1}{2}";
      let view = new MathView();
      view.mathText = mathString;
      return expect(view).toExist();
    });

    return it("renders the maths as some extra html elements in the container", function() {
      let mathString = "x = \frac{1}{2}";
      let view = new MathView();
      view.mathText = mathString;
      return expect(view.container.childNodes.length > 0).toBeTruthy();
    });
  });

  return describe("Creates an element from a complex math string", function() {
    it("returns the html element for the math", function() {
      let mathString = "\\Phi = \\begin{cases} \\Phi_L - G_{sol} \\text{ if } \\Phi_L \\geq G_{sol} \\ \\ \\Phi_L \\text{ if } 0 <\\Phi_L \\leq G_{sol} \\\\0 \\text{ otherwise} \\end{cases}";
      let view = new MathView();
      view.mathText = mathString;
      expect(view).toExist();
      return expect(view.container.childNodes.length > 0).toBeTruthy();
    });

    return it("renders maths as new html elements in the container", function() {
      let mathString = "\\Phi = \\begin{cases} \\Phi_L - G_{sol} \\text{ if } \\Phi_L \\geq G_{sol} \\ \\ \\Phi_L \\text{ if } 0 <\\Phi_L \\leq G_{sol} \\\\0 \\text{ otherwise} \\end{cases}";
      let view = new MathView();
      view.mathText = mathString;
      return expect(view.container.childNodes.length > 0).toBeTruthy();
    });
  });
});
