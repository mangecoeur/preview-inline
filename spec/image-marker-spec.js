'use babel';
/* eslint-env node, browser, jasmine */

import ImageMarker from '../lib/image-marker';

import path from 'path';

// Use the command `window:run-package-specs` (cmd-alt-ctrl-p) to run specs.
//
// To run a specific `it` or `describe` block add an `f` to the front (e.g. `fit`
// or `fdescribe`). Remove the `f` to unfocus the block.

describe("ImageMarker", () => {
  let editor;
  let buffer;

  beforeEach(() => {
    let filePath = 'test.md';

    waitsForPromise(() => atom.packages.activatePackage('preview-inline'));
    waitsForPromise(() => atom.packages.activatePackage('language-markdown'));

    waitsForPromise(() =>
      atom.workspace.open(filePath).then(function(ed) {
        editor = ed;
        let grammar = atom.grammars.grammarForScopeName('source.gfm');
        editor.setGrammar(grammar);
      })
    );

    runs(() => {
      buffer = editor.getBuffer();
    });
  });

  describe("ImageMarker::parseImageLocation", () => {
    it("parses a url", () => {
      let url = "http://imgs.xkcd.com/comics/the_martian.png";
      expect(ImageMarker.parseImageLocation(url)).toEqual(url);

      // should work when the file basePath is provided
      expect(ImageMarker.parseImageLocation(url, __dirname)).toEqual(url);
    });

    it("parses an absolute path", () => {
      let imgPath = path.join(__dirname, "test-image.jpg");
      expect(ImageMarker.parseImageLocation(imgPath)).toEqual(imgPath);
    });

    it("parses a relative path, given a basePath", () => {
      let imgPath = "test-image.jpg";
      expect(ImageMarker.parseImageLocation(imgPath, __dirname))
        .toEqual(path.join(__dirname, "test-image.jpg"));
    });

    it("returns false for absolute path of a file that doesn't exist", () => {
      let imgPath = path.join(__dirname, "non-image.jpg");
      expect(() => ImageMarker.parseImageLocation(imgPath))
        .toEqual(false);
    });

    it("throws an error for a relative path of a file that doesn't exist", () => {
      let imgPath = "non-image.jpg";
      expect(() => ImageMarker.parseImageLocation(imgPath, __dirname))
        .toThrow(new Error(`no image ${imgPath}`));
    });

    it("throws an error for a relative path if there is no basePath", () => {
      let imgPath = "test-image.jpg";
      expect(() => ImageMarker.parseImageLocation(imgPath))
        .toThrow(new Error(`no image ${imgPath}`));
    });
  });

  describe("ImageMarker::getBasePath", () => {
    it("gets latex graphicspath", () => {
      // TODO
      // - create a text buffer including the graphics path
      // - run basepath on buffer to get graphics path
    });

    it("gets the configured basepath", () => {
      atom.config.set('preview-inline.imageBasePath', __dirname);
      expect(ImageMarker.getBasePath(editor)).toEqual(__dirname);
    });
  });
});
