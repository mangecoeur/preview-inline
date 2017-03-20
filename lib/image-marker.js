'use babel';
import fs from 'fs';
import path from 'path';
import {getURL} from './util';
import ImageView from './image-view';
import {imageScopes, imagePatterns} from './previewScopes';

export default class ImageMarker {
  constructor(cursor, editor) {
    let scopes = cursor.getScopeDescriptor().getScopesArray();
    let scopeString;

    for (let bufScope of scopes) {
      for (let imScope of imageScopes) {
        if (bufScope.includes(imScope)) {
          scopeString = '.' + imScope;
          this.scopePattern = imagePatterns[imScope];
        }
      }
    }

    this.editor = editor;

    let range = editor.bufferRangeForScopeAtCursor(scopeString);
    if (range) {
      this.text = editor.getTextInBufferRange(range);
      this.range = editor.screenRangeForBufferRange(range);
    } else {
      throw new Error('No image found at cursor');
    }

    this.range.start.column = 0;

    this.addImageView();
  }

  addImageView() {
    // by default the gfm selection starts/ends with brakets, remove
    let result = this.scopePattern.exec(this.text);
    if (result === null) {
      throw new Error("Image regex match failed");
    }

    let basePath = ImageMarker.getBasePath(this.editor);
    let linkURL = ImageMarker.parseImageLocation(result[1], basePath);

    this.view = new ImageView();
    this.view.imageLocation = linkURL;
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

  static getBasePath(editor) {
    let basePath = atom.config.get('preview-inline.imageBasePath');

    if (atom.config.get('preview-inline.useLatexGraphicspath')) {
      // TODO support list of paths http://tex.stackexchange.com/questions/139401/how-to-use-graphicspath#139403
      let gfxpathRe = /\\graphicspath{{(.*)}}/;
      // TODO maybe make this static and not depend on this.editor...
      // TODO maybe extract into own function
      let result = gfxpathRe.exec(editor.getBuffer());
      if (result) {
        basePath = result[1];
      } else {
        basePath = null;
      }
    }

    if (!basePath) {
      basePath = path.dirname(editor.getPath());
    }
    return basePath;
  }

  static parseImageLocation(text, basePath) {
    let imagePath = text.trim();
    // try to parse selected text as md link
    let mdLink = this.parseMarkdownLink(imagePath);
    if (mdLink) {
      imagePath = mdLink.location;
    }
    if (path.isAbsolute(imagePath)) {
      imagePath = this.getImagePath(imagePath);
    } else if (basePath) {
      let absPath = path.resolve(basePath, imagePath);
      try {
        absPath = this.getImagePath(absPath);
        if (absPath) {
          imagePath = absPath;
        } else {
          imagePath = this.getImageURL(imagePath);
        }
      } catch (error) {
        imagePath = this.getImageURL(imagePath);
      }
    } else {
      imagePath = this.getImageURL(imagePath);
    }

    return imagePath;
  }

  static getImageURL(imagePath) {
    try {
      let path = getURL(imagePath);
      if (!path) {
        throw new Error(`no image ${imagePath}`);
      } else {
        return path;
      }
    } catch (error) {
      throw new Error(`no image ${imagePath}`);
    }
  }

  static getImagePath(imagePath) {
    try {
      let st = fs.statSync(imagePath);
      if (st.isFile()) {
        return imagePath;
      }
    } catch (error) {
      // file not found - just continue
    }
    // should get here if try raised exception or if not st.isFile

    let extensions = ['.jpg', '.png', '.gif', '.svg'];
    for (let ext of extensions) {
      let newPath = imagePath + ext;
      try {
        let st = fs.statSync(newPath);
        if (st.isFile()) {
          return newPath;
        }
      } catch (error) {
      }
    }
    // If we didn't find any files...
    return false;
  }

  static checkFile(filePath, onErr) {
    try {
      let st = fs.statSync(filePath);
      if (st.isFile()) {
        return filePath;
      } else {
        return onErr(filePath);
      }
    } catch (error) {
      return onErr(filePath);
    }
  }

  static parseMarkdownLink(text) {
    // get the link part from  a markdown image link text
    let pattern = /\[([^\[]+)\]\(([^\)]+)\)/;

    let result = pattern.exec(text);
    if (result === null) {
      return;
    }
    let imageDescription = result[1];
    let imageLocation = result[2];
    return {location: imageLocation, description: imageDescription};
  }

}
