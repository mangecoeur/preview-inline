'use babel';
/* eslint-env node, browser, jasmine */
import MathMarker from '../lib/math-marker';

// Use the command `window:run-package-specs` (cmd-alt-ctrl-p) to run specs.
//
// To run a specific `it` or `describe` block add an `f` to the front (e.g. `fit`
// or `fdescribe`). Remove the `f` to unfocus the block.

describe("MathMarker", () => {
  let editor;

  beforeEach(() => {
    let filePath = 'test.md';

    waitsForPromise(() => atom.packages.activatePackage('preview-inline'));

    // p = atom.packages.activatePackage('language-pfm')
    waitsForPromise(() => atom.packages.activatePackage('language-pfm'));

    waitsForPromise(() => atom.workspace.open(filePath));

    return runs(() => {
      editor = atom.workspace.getActiveTextEditor();
      let grammar = atom.grammars.grammarForScopeName('source.gfm');
      editor.setGrammar(grammar);
    });
  });

  describe("MathMarker::getMathAroundCursor", () => {
    it("doesn't crash if you are on an empty line", () => {
      let cursor = editor.addCursorAtBufferPosition([4, 1]);
      let text = MathMarker.getMathAroundCursor(cursor);
      expect(text).toBeNull();
    });
    //TODO for some reason doesn't seem to be setting the text buffer
    it("gets single line maths at cursor", () => {
      let cursor = editor.addCursorAtBufferPosition([25, 31]);
      console.log(cursor.getBufferPosition());
      console.log(editor.getText());
      let text = MathMarker.getMathAroundCursor(cursor);
      expect(text).toBeTruthy();
    });
  });
});
