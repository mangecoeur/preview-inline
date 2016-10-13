'use babel';

import {CompositeDisposable} from 'atom';

import ImageView from './image-view';
import MathView from './math-view';
import MathMarker from './math-marker';
import ImageMarker from './image-marker';

import * as scopeTools from './scope-tools';
import _destroyThese from './util';
import mathjaxHelper from './mathjax-helper';
import {mathBlockScopes, mathInlineScopes, imageScopes} from './previewScopes';

let EditorPreviewMarkerViews = new WeakMap();

// TODO: clean up TEX support, incl displaymath \[ and \( syntax for LaTex (vs $$ used in Tex)
// TODO: show all image or math previews for current document

export default {
  config: {
    scope: {
      type: 'array',
      default: ['.source.gfm', '.text.tex.latex', '.text.restructuredtext'],
      items: {
        type: 'string'
      }
    },
    previewMode: {
      title: 'Preview mode',
      description: 'Which previews to show as blocks in the text. Otherwise previews will be shown as overlays.',
      type: 'string',
      default: 'except-inline-math',
      enum: ['all', 'except-inline-math', 'none']
    }
  },

  subscriptions: null,
  // markerLayer: {},

  activate(state) {
    this.subscriptions = new CompositeDisposable();
    this.commands = new CompositeDisposable();
    // TODO figure out how to show/hide commands for grammars
    this.subscriptions.add(atom.commands.add('atom-text-editor', {
      ['preview-inline:show']: () => this.showPreview(),
      ['preview-inline:clear']: () => this.clearPreviews()
    }));

    this.subscriptions.add(atom.workspace.observeActivePaneItem(pane => {
      this.updateCurrentEditor(pane);
    }));

    this.active = false;

    // this.editor = atom.workspace.getActiveTextEditor();
    this.updateCurrentEditor(atom.workspace.getActiveTextEditor());
    mathjaxHelper.loadMathJax();
  },

  deactivate() {
    this.subscriptions.dispose();
    this.commands.dispose();
    this.clearPreviews();
  },

  serialize() {},

  updateCurrentEditor(editor) {
    if ((!editor) || editor === this.editor) {
      return;
    }
    // make sure this is a text editor...
    if (editor.getRootScopeDescriptor) {
      let rightScope = scopeTools.scopeIn(
              editor.getRootScopeDescriptor().toString(),
              atom.config.get("preview-inline.scope"));

      if (rightScope) {
        this.active = true;
      } else {
        this.active = false;
      }

      this.editor = editor;

      // let markerLayerID = EditorPreviewMarkerLayer.get(this.editor);
      this.markerViews = EditorPreviewMarkerViews.get(this.editor);
      if (this.markerViews) {
        // this.markerLayer = this.editor.getMarkerLayer(markerLayerID);
      } else {
        // this.markerLayer = null;
        this.markerViews = {};
      }
      // if we still didn't set the marklayer
      if (!this.markerViews) {
        // this.markerLayer = this.editor.addMarkerLayer();
        this.markerViews = {};
        // EditorPreviewMarkerLayer.set(this.editor, this.markerLayer.id);
        EditorPreviewMarkerViews.set(this.editor, this.markerViews);
      }
    }
  },

  clearPreviews() {
    if (!this.active) {
      return;
    }
    for (let markerID of Object.keys(this.markerViews)) {
      let marker = this.markerViews[markerID];
    // for (let marker of this.editor.getMarkers()) {
      // let item = this.markerLayer[markerId];
      // this.markerViews[marker.id].destroy();
      marker.destroy();
    }
  },

  clearAllPreviews() {
    for (let markerViews of EditorPreviewMarkerViews) {
      for (let marker of markerViews) {
        // this.markerViews[marker.id].destroy();
        marker.destroy();
      }
    }

    EditorPreviewMarkerViews = new WeakMap();
  },

  showPreview() {
    if (!this.active) {
      return;
    }
    let cursor = this.editor.getLastCursor();
    let text = this.editor.getSelectedText();
    let view;
    let range;

    if (text === '') {
      let scope = cursor.getScopeDescriptor();

      if (scopeTools.scopeContainsOne(scope, mathBlockScopes.concat(mathInlineScopes))) {
        try {
          let mark = new MathMarker(cursor, this.editor);

          this.markerViews[mark.mathPosMarker.id] = mark;
        } catch (error) {
          atom.notifications.addWarning(error.message);
        }
        return;
      } else if (scopeTools.scopeContainsOne(scope, imageScopes)) {
        try {
          let mark = new ImageMarker(cursor, this.editor);

          this.markerViews[mark.marker.id] = mark;
        } catch (error) {
          atom.notifications.addWarning(error.message);
          return;
        }
      } else {
        atom.notifications.addWarning("Could not find anything to preview at cursor");
        return;
      }
    } else {
      // If you have selected text already, try to generate a preview for it directly
      view = this.viewForSelectedText(text);
      range = this.editor.getSelectedBufferRange();
      this.clearBubblesOnRow(range.end.row);
      this.createPreviewMarker(view, range);
    }
  },

  createPreviewMarker: (view, range) => {
    let marker = this.editor.markBufferPosition({
      row: range.end.row,
      column: range.start.column
    }, {
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

    this.editor.decorateMarker(marker, {
      type: type,
      item: this.view,
      position: position
    });

    // TODO: maybe use subscriptions here instead
    // this.markerViews[marker.id] = view;

    marker.onDidChange(event => {
      if (!event.isValid) {
        view.destroy();
        // delete this.markerLayer[marker.id];
        return marker.destroy();
      }
    }
    );

    return view.onClose(event => {
      return this.markerLayer.getMarker(marker.id).destroy();
      // return marker.destroy();
    }
    );
  },

  deletePreview(marker, mathContent, editorListener) {
    // delete this.markerViews[marker.id];
    // marker.detroy()
    // delete this.markerLayer[marker.id];
    _destroyThese(marker, mathContent);
    return editorListener.dispose();
  },

  viewForSelectedText(text) {
    try {
      let url = this.getURL(text);
      return new ImageView(url);
    } catch (error) {
      try {
        return new MathView(text);
      } catch (error) {
        return atom.notifications.addError(error.message);
      }
    }
  }
};
