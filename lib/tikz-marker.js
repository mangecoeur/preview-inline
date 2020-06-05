'use babel';
import {Range, Point} from 'atom';

import TikzView from './tikz-view';
import * as scopeTools from './scope-tools';
import {tikzScopes} from './previewScopes';

export default class TikzMarker {
  constructor(cursor, editor) {
    this.editor = editor;
    // this.markerLayer = markerLayer;
    // FIXME markerLayers don't seem to work as expected, just use editor for now
    this.markerLayer = editor;

    let result = TikzMarker.getTikzAroundCursor(cursor, editor);
    if (!result) {
      throw new Error("Could not find TikZ picture at cursor");
    }
    this.range = result.range;

    this.view = new TikzView();
    this.view.imageLocation = null;

    this.marker = null;
    this.addTikzView("");
  }

  addTikzView() {
    this.view = new TikzView();
    this.clearBubblesOnRow(this.range);

    this.marker = this.editor.markScreenRange(this.range, {
      invalidate: 'touch'
    });

    let type;
    let position;
    if (atom.config.get('preview-inline.previewMode') === 'none') {
      type = 'overlay';
      position = 'tail';
    } else {
      type = 'block';
      position = 'after';
    }

    this.editor.decorateMarker(this.marker, {
      type: type,
      item: this.view,
      position: position
    });

    this.view.onClose(event => {
      this.marker.destroy();
    });
  }

  destroy() {
    this.tikzContentMarker.destroy();
    this.tikzPosMarker.destroy();
    this.editorListener.dispose();
  }

  clearBubblesOnRow(row) {
    let iterable = this.editor.findMarkers({endRow: row});
    for (let marker of iterable) {
      if (marker !== this.tikzPosMarker && marker !== this.tikzContentMarker) {
        marker.destroy();
      }
    }
  }

  static getTikzPreamble(editor) {
    let fullPreamble=""
    let preambleStart=0;
    let preambleEnd=0;
    // first: read full preamble from the start to \begin{document}
    for (let i=0;i<editor.getLineCount();i++) {
      let curLine=editor.lineTextForBufferRow(i);
      if (curLine.match(/\\documentclass/)) {
        preambleStart=i
      }
      if (curLine.match(/\\begin{document}/)) {
        preambleEnd=i
        break;
      }
    }
    fullPreamble=editor.getTextInBufferRange([[preambleStart,0],[preambleEnd,9999]]);

    // second: extract \usetikzlibrary settings and \tikzset or \tikstyle commands
    // while \tikzstyle is deprecated, it might still be present
    // \usepackage{tikz} will be needed anyway
    let tikzPreamble="\\usepackage{tikz}\n";
    let tikzcommands=fullPreamble.match(/\\(usetikzlibrary|tikzset|tikzstyle){[^}]+?}/g) || [];
    for (let i=0;i<tikzcommands.length;i++) {
      tikzPreamble+=tikzcommands[i];
    }

    return tikzPreamble;
  }

  static getTikzBlock(scopeString, editor) {
    let range = editor.bufferRangeForScopeAtCursor(scopeString);
    let text = editor.getTextInBufferRange(range);

    let minRow = range.start.row;
    let maxRow = range.end.row;
    let curScope = scopeString;
    let curPos = [minRow, 0];

    while (scopeTools.scopeContains(curScope, scopeString)) {
      minRow -= 1;
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

    range = new Range(new Point(minRow + 1, 0), new Point(maxRow - 1, 9999));

    text = editor.getTextInBufferRange(range);

    return {text, range, isBlock: true};
  }

  static getTikzAroundCursor(cursor, editor) {
    let scope = cursor.getScopeDescriptor();

    let scopeString = scopeTools.scopeContainsOne(scope, tikzScopes);
    if (scopeString) {
        return this.getTikzBlock(scopeString, editor);
    } else {
      return null;
    }
  }

}
