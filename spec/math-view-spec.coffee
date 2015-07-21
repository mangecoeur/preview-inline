MathView = require '../lib/math-view'
# {$} = require 'space-pen'

describe "MathView", ->
  describe "Creates an element from a simple math string", ->
    it "returns the html element for the math", ->
      mathString = "x = \\frac{1}{2}"
      view = new MathView(mathString)
      expect(view).toExist()

    it "renders the maths as some extra html elements in the container", ->
      mathString = "x = \frac{1}{2}"
      view = new MathView(mathString)
      expect(view.container[0].childNodes.length > 0).toBeTruthy()

  describe "Creates an element from a complex math string", ->
    it "returns the html element for the math", ->
      mathString = "\\Phi = \\begin{cases}
      \\Phi_L - G_{sol} \\text{ if } \\Phi_L \\geq G_{sol}
      \\ \\ \\Phi_L \\text{ if } 0 <\\Phi_L \\leq G_{sol}
      \\\\0 \\text{ otherwise}
      \\end{cases}"
      view = new MathView(mathString)
      expect(view).toExist()
      expect(view.container[0].childNodes.length > 0).toBeTruthy()

    it "renders maths as new html elements in the container", ->
      mathString = "\\Phi = \\begin{cases}
      \\Phi_L - G_{sol} \\text{ if } \\Phi_L \\geq G_{sol}
      \\ \\ \\Phi_L \\text{ if } 0 <\\Phi_L \\leq G_{sol}
      \\\\0 \\text{ otherwise}
      \\end{cases}"
      view = new MathView(mathString)
      expect(view.container[0].childNodes.length > 0).toBeTruthy()
