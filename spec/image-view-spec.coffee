ImageView = require '../lib/image-view'


describe "ImageView", ->
  describe "Creates an element from a simple math string", ->
    it "returns the html element for the math", ->
      image = "test-image.jpg"
      view = new ImageView(image)
      expect(view.element).toExist()
