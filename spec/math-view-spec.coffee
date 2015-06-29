MathView = require '../lib/math-view'


describe "MathView", ->
  describe "Creates an element from a simple math string", ->
    it "returns the html element for the math", ->
      mathString = "x = \frac{1}{2}"
      view = new MathView(mathString)
      expect(view).toExist()
