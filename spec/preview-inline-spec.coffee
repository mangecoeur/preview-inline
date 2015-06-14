PreviewInline = require '../lib/preview-inline'

path = require 'path'


# Use the command `window:run-package-specs` (cmd-alt-ctrl-p) to run specs.
#
# To run a specific `it` or `describe` block add an `f` to the front (e.g. `fit`
# or `fdescribe`). Remove the `f` to unfocus the block.

describe "PreviewInline", ->

  [editor, buffer, workspaceElement] = []

  beforeEach ->
    # directory = temp.mkdirSync()
    # atom.project.setPaths([directory])
    workspaceElement = atom.views.getView(atom.workspace)
    filePath = 'test.md'
    # fs.writeFileSync(filePath, '')
    # fs.writeFileSync(path.join(directory, 'sample.txt'), 'Some text.\n')

    waitsForPromise ->
      atom.workspace.open(filePath).then (ed) -> editor = ed

    runs ->
      buffer = editor.getBuffer()

    waitsForPromise ->
      atom.packages.activatePackage('preview-inline')


  describe "PreviewInline::parseImageLocation", ->
    it "parses a url", ->
      # FIXME: for some reason atom regex looses http, while online test works
      # url = "http://imgs.xkcd.com/comics/the_martian.png"

      url = "imgs.xkcd.com/comics/the_martian.png"
      expect(PreviewInline.parseImageLocation(url)).toEqual(url)

    it "parses an absolute path", ->
      imgPath = path.join(__dirname, "test-image.jpg")
      expect(PreviewInline.parseImageLocation(imgPath)).toEqual(imgPath)

    it "parses a relative path, given a basePath", ->
      imgPath = "test-image.jpg"
      expect(PreviewInline.parseImageLocation(imgPath, __dirname))
        .toEqual(path.join(__dirname, "test-image.jpg"))


    it "throws an error for absolute path of a file that doesn't exist", ->
      imgPath =  path.join(__dirname, "non-image.jpg")
      expect(-> PreviewInline.parseImageLocation(imgPath))
        .toThrow(new Error("no image at " + imgPath))

    it "throws an error for a relative path of a file that doesn't exist", ->
      imgPath = "non-image.jpg"
      expect(-> PreviewInline.parseImageLocation(imgPath, __dirname))
        .toThrow(new Error("no image at " + path.join(__dirname, imgPath)))

    # FIXME: not sure I can really tell the difference between link and relpath
    # So not sure if you can really throw an exception
    # it "throws an error for a relative path if there is no basePath", ->
    #   imgPath = "test-image.jpg"
    #   expect(-> PreviewInline.parseImageLocation(imgPath))
    #     .toThrow(new Error(imgPath +
    #       " is a relative path, but no base directory was defined"))

  describe "when the image-inline:show event is triggered", ->
    it "shows markdown image link under cursor (local)", ->
      expect(editor.getPath()).toContain 'test.md'
      editor.setCursorBufferPosition([5, 2])
      atom.commands.dispatch workspaceElement, 'image-inline:show'
      expect(workspaceElement.querySelector('.image-inline')).toExist()

    it "only shows md image under cursor once", ->
      expect(editor.getPath()).toContain 'test.md'
      editor.setCursorBufferPosition([5, 2])
      expect(workspaceElement.querySelectorAll('.image-inline').length)
        .toEqual(0)

      atom.commands.dispatch workspaceElement, 'image-inline:show'

      expect(workspaceElement.querySelectorAll('.image-inline').length)
        .toEqual(1)

      atom.commands.dispatch workspaceElement, 'image-inline:show'

      expect(workspaceElement.querySelectorAll('.image-inline').length)
        .toEqual(1)
