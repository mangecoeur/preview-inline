'use babel';
import CitationView from './citation-view';
import {citationScopes, citationPatterns} from './previewScopes';

export default class CitationMarker {
  constructor(cursor, editor, references) {
    let scopes = cursor.getScopeDescriptor().getScopesArray();
    let scopeString;
    this.references = references;

    for (let bufScope of scopes) {
      for (let cScope of citationScopes) {
        if (bufScope.includes(cScope)) {
          scopeString = '.' + cScope;
          this.scopePattern = citationPatterns[cScope];
        }
      }
    }

    this.editor = editor;

    let range = editor.bufferRangeForScopeAtCursor(scopeString);
    if (range) {
      this.text = editor.getTextInBufferRange(range);
      this.range = editor.screenRangeForBufferRange(range);
    } else {
      throw new Error('No citation key found at cursor');
    }

    this.addCitationView();
  }

  addCitationView() {
    let result = this.scopePattern.exec(this.text);
    if (result === null) {
      throw new Error("Citation match failed");
    }

    let key = result[1];
    let citation = this.references.filter(item => item.id === key)[0];
    this.view = document.createElement('citation-view');
    this.view.citation = citation;

    this.clearBubblesOnRow(this.range);
    this.marker = this.editor.markScreenPosition({
      row: this.range.end.row,
      column: this.range.start.column
    }, {
      invalidate: 'touch'
    });

    let type;
    let position;
    if (atom.config.get('preview-inline.previewMode') === 'none') {
      type = 'overlay';
      position = 'head';
    } else {
      this.range.start.column = 0;
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

  clearBubblesOnRow(range) {
    let bufRange = this.editor.bufferRangeForScreenRange(range);

    let iterable = this.editor.findMarkers({endBufferRow: bufRange.end.row});
    for (let marker of iterable) {
      if (marker !== this.marker) {
        marker.destroy();
      }
    }
  }

  destroy() {
    this.marker.destroy();
  }
}
