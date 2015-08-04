PreviewInline = require '../lib/preview-inline'

path = require 'path'

{$} = require 'space-pen'
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

  describe "PreviewInline::clearPreviews", ->
    it "works", ->
      expect(PreviewInline.clearPreviews()).toBeFalsy()

  describe "PreviewInline::parseImageLocation", ->
    it "parses a url", ->
      url = "http://imgs.xkcd.com/comics/the_martian.png"

      expect(PreviewInline.parseImageLocation(url)).toEqual(url)

      # should work when the file basePath is provided
      expect(PreviewInline.parseImageLocation(url, __dirname)).toEqual(url)

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
        .toThrow(new Error("no image " + imgPath))

    it "throws an error for a relative path of a file that doesn't exist", ->
      imgPath = "non-image.jpg"
      expect(-> PreviewInline.parseImageLocation(imgPath, __dirname))
        .toThrow(new Error("no image " + imgPath))

    it "throws an error for a relative path if there is no basePath", ->
      imgPath = "test-image.jpg"
      expect(-> PreviewInline.parseImageLocation(imgPath))
        .toThrow(new Error("no image " + imgPath))

# TODO: this depends on the buffer having the right syntax applied, don't
# know how to do that yet
  describe "PreviewInline::getMathAroundCursor", ->
    it "doesn't crash if you are on an empty line", ->
      editor.setCursorBufferPosition([4, 1])
      cursor = editor.getLastCursor()
      text = PreviewInline.getMathAroundCursor(cursor)
      expect(text).toBeNull()
    it "gets single line maths at cursor", ->
      editor.setCursorBufferPosition([23, 5])
      cursor = editor.getLastCursor()
      text = PreviewInline.getMathAroundCursor(cursor)
      expect(text).toExist()


  xdescribe "PreviewInline::showPreview", ->
    it "doesn't crash if you are on an empty line", ->
      editor.setCursorBufferPosition([4, 1])
      cursor = editor.getLastCursor()
      text = PreviewInline.getMathAroundCursor(cursor)
      expect(text).toBeNull()

#TODO: figure out how to correctly create and query for an element added to view
  xdescribe "when the preview-inline:show image event is triggered", ->
    it "shows markdown image link under cursor (local)", ->
      expect(editor.getPath()).toContain 'test.md'
      editor.setCursorBufferPosition([5, 2])
      atom.commands.dispatch( workspaceElement, 'preview-inline:show')
      console.log(workspaceElement.querySelector('div'))
      expect(workspaceElement.querySelector('div.preview-inline')).toExist()

      # TODO check image location is right

    it "only shows md image under cursor once", ->
      expect(editor.getPath()).toContain 'test.md'
      editor.setCursorBufferPosition([5, 5])

      expect(workspaceElement.querySelectorAll('.preview-inline').length)
        .toEqual(0)

      # waitsForPromise ->
      atom.commands.dispatch workspaceElement, 'preview-inline:show'

      expect(workspaceElement.querySelectorAll('div.preview-inline').length)
        .toEqual(1)

      atom.commands.dispatch workspaceElement, 'preview-inline:show'

      expect(workspaceElement.querySelectorAll('.preview-inline').length)
        .toEqual(1)
