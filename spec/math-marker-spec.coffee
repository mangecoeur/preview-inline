MathMarker = require '../lib/math-marker'

path = require 'path'

# Use the command `window:run-package-specs` (cmd-alt-ctrl-p) to run specs.
#
# To run a specific `it` or `describe` block add an `f` to the front (e.g. `fit`
# or `fdescribe`). Remove the `f` to unfocus the block.

describe "MathMarker", ->

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


# TODO: this depends on the buffer having the right syntax applied, don't
# know how to do that yet
  describe "MathMarker::getMathAroundCursor", ->
    it "doesn't crash if you are on an empty line", ->
      editor.setCursorBufferPosition([4, 1])
      cursor = editor.getLastCursor()
      text = MathMarker.getMathAroundCursor(cursor)
      expect(text).toBeNull()
    it "gets single line maths at cursor", ->
      editor.setCursorBufferPosition([23, 5])
      cursor = editor.getLastCursor()
      text = MathMarker.getMathAroundCursor(cursor)
      expect(text).toBeTruthy()
