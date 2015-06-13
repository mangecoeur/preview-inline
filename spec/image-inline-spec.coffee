ImageInline = require '../lib/image-inline'

# Use the command `window:run-package-specs` (cmd-alt-ctrl-p) to run specs.
#
# To run a specific `it` or `describe` block add an `f` to the front (e.g. `fit`
# or `fdescribe`). Remove the `f` to unfocus the block.

describe "ImageInline", ->
  [workspaceElement, activationPromise] = []

  beforeEach ->
    workspaceElement = atom.views.getView(atom.workspace)
    activationPromise = atom.packages.activatePackage('image-inline')

  describe "when the parsing image links", ->
    it "parses a url", ->
      imageInline = new ImageInline()

  describe "when the image-inline:show event is triggered", ->
    it "shows markdown image link (local)", ->
      # need to supply a dummy buffer i guess...
      expect(workspaceElement.querySelector('.image-inline')).not.toExist()

      # This is an activation event, triggering it will cause the package to be
      # activated.
      atom.commands.dispatch workspaceElement, 'image-inline:show'

      waitsForPromise ->
        activationPromise

      runs ->
        expect(workspaceElement.querySelector('.image-inline')).toExist()

    it "shows URL image link", ->
      # need to supply a dummy buffer i guess...
      expect(workspaceElement.querySelector('.image-inline')).not.toExist()

      # This is an activation event, triggering it will cause the package to be
      # activated.
      atom.commands.dispatch workspaceElement, 'image-inline:show'

      waitsForPromise ->
        activationPromise

      runs ->
        expect(workspaceElement.querySelector('.image-inline')).toExist()

  describe "when the image-inline:toggle event is triggered", ->
    it "hides and shows the modal panel", ->
      # Before the activation event the view is not on the DOM, and no panel
      # has been created
      expect(workspaceElement.querySelector('.image-inline')).not.toExist()

      # This is an activation event, triggering it will cause the package to be
      # activated.
      atom.commands.dispatch workspaceElement, 'image-inline:toggle'

      waitsForPromise ->
        activationPromise

      runs ->
        expect(workspaceElement.querySelector('.image-inline')).toExist()

        imageInlineElement = workspaceElement.querySelector('.image-inline')
        expect(imageInlineElement).toExist()

        imageInlinePanel = atom.workspace.panelForItem(imageInlineElement)
        expect(imageInlinePanel.isVisible()).toBe true
        atom.commands.dispatch workspaceElement, 'image-inline:toggle'
        expect(imageInlinePanel.isVisible()).toBe false

    it "hides and shows the view", ->
      # This test shows you an integration test testing at the view level.

      # Attaching the workspaceElement to the DOM is required to allow the
      # `toBeVisible()` matchers to work. Anything testing visibility or focus
      # requires that the workspaceElement is on the DOM. Tests that attach the
      # workspaceElement to the DOM are generally slower than those off DOM.
      jasmine.attachToDOM(workspaceElement)

      expect(workspaceElement.querySelector('.image-inline')).not.toExist()

      # This is an activation event, triggering it causes the package to be
      # activated.
      atom.commands.dispatch workspaceElement, 'image-inline:toggle'

      waitsForPromise ->
        activationPromise

      runs ->
        # Now we can test for view visibility
        imageInlineElement = workspaceElement.querySelector('.image-inline')
        expect(imageInlineElement).toBeVisible()
        atom.commands.dispatch workspaceElement, 'image-inline:toggle'
        expect(imageInlineElement).not.toBeVisible()
