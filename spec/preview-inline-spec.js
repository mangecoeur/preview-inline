'use babel';
/* eslint-env node, browser, jasmine */

import PreviewInline from '../lib/preview-inline';

// Use the command `window:run-package-specs` (cmd-alt-ctrl-p) to run specs.
//
// To run a specific `it` or `describe` block add an `f` to the front (e.g. `fit`
// or `fdescribe`). Remove the `f` to unfocus the block.

describe("PreviewInline", () => {
  let [editor, workspaceElement] = [];

  beforeEach(function() {
    // directory = temp.mkdirSync()
    // atom.project.setPaths([directory])
    workspaceElement = atom.views.getView(atom.workspace);
    let filePath = 'test.md';

    waitsForPromise(() => atom.packages.activatePackage('preview-inline'));

    // p = atom.packages.activatePackage('language-pfm')
    waitsForPromise(() => atom.packages.activatePackage('language-pfm'));

    waitsForPromise(() =>
      atom.workspace.open(filePath).then(function(ed) {
        editor = ed;
        let grammar = atom.grammars.grammarForScopeName('source.gfm');
        editor.setGrammar(grammar);
      })
    );

    runs(() => editor.getBuffer());
  });

  describe("PreviewInline::clearPreviews", () =>
    it("works", () => expect(PreviewInline.clearPreviews()).toBeFalsy())
  );

// TODO: figure out how to correctly create and query for an element added to view
  xdescribe("when the preview-inline:show image event is triggered", () => {
    it("shows markdown image link under cursor (local)", () => {
      expect(editor.getPath()).toContain('test.md');
      editor.setCursorBufferPosition([5, 2]);
      atom.commands.dispatch(workspaceElement, 'preview-inline:show');
      console.log(workspaceElement.querySelector('div'));
      return expect(workspaceElement.querySelector('div.preview-inline')).toExist();
    });

      // TODO check image location is right

    it("only shows md image under cursor once", () => {
      expect(editor.getPath()).toContain('test.md');
      editor.setCursorBufferPosition([5, 5]);

      expect(workspaceElement.querySelectorAll('.preview-inline').length)
        .toEqual(0);

      // waitsForPromise ->
      atom.commands.dispatch(workspaceElement, 'preview-inline:show');

      expect(workspaceElement.querySelectorAll('div.preview-inline').length)
        .toEqual(1);

      atom.commands.dispatch(workspaceElement, 'preview-inline:show');

      expect(workspaceElement.querySelectorAll('.preview-inline').length)
        .toEqual(1);
    });
  });
});
