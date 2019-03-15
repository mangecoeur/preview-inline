'use babel';
import {Range, Point} from 'atom';

import MathView from './math-view';
import * as scopeTools from './scope-tools';
import {mathBlockScopes, mathInlineScopes, inlineMathPattern} from './previewScopes';

export default class MathMarker {
  constructor(cursor, editor) {
    this.editor = editor;
    // this.markerLayer = markerLayer;
    // FIXME markerLayers don't seem to work as expected, just use editor for now
    this.markerLayer = editor;

    let result = MathMarker.getMathAroundCursor(cursor, editor);
    if (!result) {
      throw new Error("Could not find math at cursor");
    }
    this.isBlock = result.isBlock;
    this.range = result.range;

    this.view = new MathView();
    this.view.mathText = result.text;

    this.mathContentMarker = null;
    this.mathPosMarker = null;
    this.addMathView();
  }

  addMathView() {
    this.mathContentMarker = this.markerLayer.markBufferRange(this.range, {
      invalidate: 'overlap'
    });

    let markRow = this.isBlock ? this.range.end.row + 1 : this.range.start.row;

    this.clearBubblesOnRow(markRow);
    // Seperate marker for the bubble
    // rather than sharing it with the math content.
    this.mathPosMarker = this.markerLayer.markBufferRange([{
      row: markRow,
      column: this.range.start.column
    }, {
      row: markRow,
      column: this.range.start.column + 1
    }], {
      invalidate: 'touch'
    });

    let overlayMode = false;

    if (atom.config.get('preview-inline.previewMode') === 'none') {
      overlayMode = true;
    } else if (!this.isBlock && atom.config.get('preview-inline.previewMode') === 'except-inline-math') {
      overlayMode = true;
    }

    let type;
    let position;
    if (overlayMode) {
      type = 'overlay';
      position = 'tail';
    } else {
      type = 'block';
      position = 'after';
    }

    this.editor.decorateMarker(this.mathPosMarker, {
      type: type,
      item: this.view,
      position: position
    });

    // add a listener to track changes to text
    // only update marker if the cursor is within this markers range, to avoid updating everything
    this.editorListener = this.editor.onDidStopChanging(event => {
      // let mathMarker;
      let pos = this.editor.getCursorBufferPosition();

      if (this.mathContentMarker.getBufferRange().containsPoint(pos)) {
        let text = this.editor.getTextInBufferRange(this.mathContentMarker.getBufferRange());
        if (!this.isBlock) {
          let pattern = /\$(.*)\$/;
          let result = pattern.exec(text);
          if (result) {
            text = result[1];
          } else {
            this.destroy();
            return;
          }
        }
        this.view.mathText = text;
      }
    });

    // listeners to close preview
    this.mathContentMarker.onDidChange(event => {
      if (!event.isValid) {
        this.destroy();
      }
    });

    this.mathPosMarker.onDidChange(event => {
      if (!event.isValid) {
        this.destroy();
      }
    });

    // clean up the marker when the bubble is closed
    this.view.onClose(event => {
      this.destroy();
    });
  }

  destroy() {
    this.mathContentMarker.destroy();
    this.mathPosMarker.destroy();
    this.editorListener.dispose();
  }

  clearBubblesOnRow(row) {
    let iterable = this.editor.findMarkers({endRow: row});
    for (let marker of iterable) {
      if (marker !== this.mathPosMarker && marker !== this.mathContentMarker) {
        marker.destroy();
      }
    }
  }

  static getMathInline(scopeString, editor) {
    let range = editor.bufferRangeForScopeAtCursor(scopeString);
    let text = editor.getBuffer().getTextInRange(range);

    let result = inlineMathPattern.exec(text);

    // FIXME: need to adapt to work with RST math
    if (result === null) {
      throw new Error("Math match failed")
      // text = text;
    } else {
      text = result[1];
    }
    return {text, range, isBlock: false};
  }

  static getMathBlock(scopeString, editor) {
    let range = editor.bufferRangeForScopeAtCursor(scopeString);
    let text = editor.getTextInBufferRange(range);

    let minRow = range.start.row;
    let maxRow = range.end.row;
    let curScope = scopeString;
    let curPos = [minRow, 0];

    while (scopeTools.scopeContains(curScope, scopeString)) {
      minRow -= 1;
      if (minRow < 0) {
          break;
      }
      curPos = [minRow, 0];
      curScope = editor.scopeDescriptorForBufferPosition(curPos);
    }

    curScope = scopeString;
    curPos = [maxRow, 0];

    while (scopeTools.scopeContains(curScope, scopeString)) {
      maxRow += 1;
      curPos = [maxRow, 0];
      curScope = editor.scopeDescriptorForBufferPosition(curPos);
    }

    range = new Range(new Point(minRow + 2, 0), new Point(maxRow - 2, 9999));

    text = editor.getTextInBufferRange(range);

    return {text, range, isBlock: true};
  }

  static getMathAroundCursor(cursor, editor) {
    let scope = cursor.getScopeDescriptor();

    let scopeString = scopeTools.scopeContainsOne(scope, mathInlineScopes);
    if (scopeString) {
      return this.getMathInline(scopeString, editor);
    } else {
      scopeString = scopeTools.scopeContainsOne(scope, mathBlockScopes);
      if (scopeString) {
        return this.getMathBlock(scopeString, editor);
      } else {
        return null;
      }
    }
  }

}
