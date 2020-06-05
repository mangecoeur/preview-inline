'use babel';

import {CompositeDisposable} from 'atom';

import ImageView from './image-view';
import MathView from './math-view';
import MathMarker from './math-marker';
import ImageMarker from './image-marker';
import CitationMarker from './citation-marker';
import TikzView from './tikz-view';
import TikzMarker from './tikz-marker';

import * as scopeTools from './scope-tools';
import tikzHelper from './tikz-helper';
import mathjaxHelper from './mathjax-helper';
import {
  mathBlockScopes,
  mathInlineScopes,
  imageScopes,
  citationScopes,
  tikzScopes
} from './previewScopes';

let EditorPreviewMarkerViews = new WeakMap();

// TODO: show all image or math previews for current document

export default {
  config: {
    scope: {
      type: 'array',
      default: ['.source.gfm', '.text.tex.latex', '.text.restructuredtext', '.text.md'],
      items: {
        type: 'string'
      }
    },
    previewMode: {
      title: 'Preview mode',
      description: 'Which previews to show as blocks in the text.',
      type: 'string',
      default: 'except-inline-math',
      enum: ['all', 'except-inline-math', 'none']
    },
    imageBasePath: {
      title: 'Base path for images',
      type: 'string',
      default: ''
    },
    useLatexGraphicspath: {
      title: 'Use graphicspath in Latex files',
      type: 'boolean',
      default: true
    }
  },

  subscriptions: null,

  activate(state) {
    mathjaxHelper.loadMathJax(document);

    this.subscriptions = new CompositeDisposable();
    this.commands = new CompositeDisposable();
    // Explicitly bind callbacks (one day i'll figure out why i need this)
    this.showPreview = this.showPreview.bind(this);
    this.clearPreviews = this.clearPreviews.bind(this);

    this.updateCurrentEditor(atom.workspace.getActiveTextEditor());
    this.subscriptions.add(atom.commands.add('atom-text-editor', {
      ['preview-inline:show']: () => this.showPreview(),
      ['preview-inline:clear']: () => this.clearPreviews()
    }));

    this.subscriptions.add(atom.workspace.observeActivePaneItem(pane => {
      this.updateCurrentEditor(pane);
    }));

    atom.contextMenu.add({'atom-text-editor': [{
      label: 'Preview Inline',
      command: 'preview-inline:show',
      shouldDisplay: event => this.shouldDisplayContextMenu(event)
    }]});
  },

  deactivate() {
    this.active = false;
    this.subscriptions.dispose();
    this.commands.dispose();
    this.clearAllPreviews();
    if (this.provider) {
      this.provider.dispose();
    }
  },

  serialize() {},

  shouldDisplayContextMenu(event) {
    let editor = atom.workspace.getActiveTextEditor();
    if (editor) {
      let allScopes = [...mathBlockScopes, ...mathInlineScopes, ...imageScopes, ...citationScopes, ...tikzScopes];
      let scope = editor.getLastCursor().getScopeDescriptor();
      if (scopeTools.scopeContainsOne(scope, allScopes)) {
        return true;
      }
    }
    return false;
  },

  updateCurrentEditor(editor) {
    if ((!editor) || editor === this.editor) {
      return;
    }
    // make sure this is a text editor, not a pref pane
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

      this.markerViews = EditorPreviewMarkerViews.get(this.editor);
      if (this.markerViews) {
        // this.markerLayer = this.editor.getMarkerLayer(markerLayerID);
      } else {
        this.markerViews = {};
      }
      // if we still didn't set the marklayer
      if (!this.markerViews) {
        this.markerViews = {};
        EditorPreviewMarkerViews.set(this.editor, this.markerViews);
      }
    }
  },

  clearPreviews() {
    // Clear previews for currently active editor
    if (!this.active) {
      return;
    }
    for (let markerID of Object.keys(this.markerViews)) {
      let marker = this.markerViews[markerID];
      marker.destroy();
    }
  },

  clearAllPreviews() {
    // Iterate over all open editors and clear markers within them if they exist in the registry
    let editors = atom.workspace.getTextEditors();
    for (let editor of editors) {
      let markerViews = EditorPreviewMarkerViews.get(editor);
      if (markerViews) {
        for (let markerID of Object.keys(markerViews)) {
          let marker = this.markerViews[markerID];
          marker.destroy();
        }
      }
    }
    this.markerViews = {};
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
        // Math Block and Inline scopes
        try {
          let mark = new MathMarker(cursor, this.editor);
          this.markerViews[mark.mathPosMarker.id] = mark;
        } catch (error) {
          atom.notifications.addWarning(error.message);
        }
        return;
      } else if (scopeTools.scopeContainsOne(scope, citationScopes) && this.enableRefPreview) {
        try {
          let mark = new CitationMarker(cursor, this.editor, this.references);

          this.markerViews[mark.marker.id] = mark;
        } catch (error) {
          atom.notifications.addWarning(error.message);
          return;
        }
      } else if (scopeTools.scopeContainsOne(scope, imageScopes)) {
        // Image Scopes
        try {
          let mark = new ImageMarker(cursor, this.editor);

          this.markerViews[mark.marker.id] = mark;
        } catch (error) {
          atom.notifications.addWarning(error.message);
          return;
        }
      } else if (scopeTools.scopeContainsOne(scope, tikzScopes)) {
        try {
          let mark = new TikzMarker(cursor, this.editor);
          this.markerViews[mark.marker.id] = mark;

          let document="\\documentclass[tikz,border=5pt]{standalone}" +
            TikzMarker.getTikzPreamble(this.editor) +
            "\n\\begin{document}\n" +
            TikzMarker.getTikzAroundCursor(cursor, this.editor).text +
            "\n\\end{document}";

          tikzHelper.compileLatex(document, (path)=> {
            mark.view.imageLocation=path;
          });
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
      let iterable = this.editor.findMarkers({endRow: range.end.row});

      for (let marker of iterable) {
        marker.destroy();
      }
      this.createPreviewMarker(view, range);
    }
  },

  createPreviewMarker(view, range) {
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
      item: view,
      position: position
    });

    this.markerViews[marker.id] = view;

    view.onClose(event => {
      marker.destroy();
    });
  },

  viewForSelectedText(text) {
    // Get the math or image view for the text selection
    // based on whether we can detect something that looks like maths or image data
    try {
      let url = this.getURL(text);
      let view = new ImageView();
      view.imageLocation = url;
      return view;
    } catch (error) {
      try {
        let view = new MathView();
        view.mathText = text;
        return view;
      } catch (error) {
        return atom.notifications.addError(error.message);
      }
    }
  },

  getReferences(provider) {
    this.referenceProvider = provider;
    this.references = provider.references;
    this.enableRefPreview = true;
    // return new Disposable(() => {})
  }
};
