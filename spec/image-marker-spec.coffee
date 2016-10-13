ImageMarker = require '../lib/image-marker'

path = require 'path'

# Use the command `window:run-package-specs` (cmd-alt-ctrl-p) to run specs.
#
# To run a specific `it` or `describe` block add an `f` to the front (e.g. `fit`
# or `fdescribe`). Remove the `f` to unfocus the block.

describe "ImageMarker", ->

  [editor, buffer, workspaceElement] = []

  beforeEach ->
    # directory = temp.mkdirSync()
    # atom.project.setPaths([directory])
    workspaceElement = atom.views.getView(atom.workspace)
    filePath = 'test.md'

    waitsForPromise ->
      atom.packages.activatePackage('preview-inline')

    # p = atom.packages.activatePackage('language-pfm')
    waitsForPromise ->
      atom.packages.activatePackage('language-pfm')


    waitsForPromise ->
      atom.workspace.open(filePath).then (ed) ->
        editor = ed
        grammar = atom.grammars.grammarForScopeName('source.gfm')
        editor.setGrammar(grammar)

    runs ->
      buffer = editor.getBuffer()

  describe "ImageMarker::parseImageLocation", ->
    it "parses a url", ->
      url = "http://imgs.xkcd.com/comics/the_martian.png"

      expect(ImageMarker.parseImageLocation(url)).toEqual(url)

      # should work when the file basePath is provided
      expect(ImageMarker.parseImageLocation(url, __dirname)).toEqual(url)

    it "parses an absolute path", ->
      imgPath = path.join(__dirname, "test-image.jpg")
      expect(ImageMarker.parseImageLocation(imgPath)).toEqual(imgPath)

    it "parses a relative path, given a basePath", ->
      imgPath = "test-image.jpg"
      expect(ImageMarker.parseImageLocation(imgPath, __dirname))
        .toEqual(path.join(__dirname, "test-image.jpg"))


    it "throws an error for absolute path of a file that doesn't exist", ->
      imgPath =  path.join(__dirname, "non-image.jpg")
      expect(-> ImageMarker.parseImageLocation(imgPath))
        .toThrow(new Error("no image " + imgPath))

    it "throws an error for a relative path of a file that doesn't exist", ->
      imgPath = "non-image.jpg"
      expect(-> ImageMarker.parseImageLocation(imgPath, __dirname))
        .toThrow(new Error("no image " + imgPath))

    it "throws an error for a relative path if there is no basePath", ->
      imgPath = "test-image.jpg"
      expect(-> ImageMarker.parseImageLocation(imgPath))
        .toThrow(new Error("no image " + imgPath))
