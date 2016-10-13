'use babel';
import fs from 'fs';
import path from 'path';
// import {getTextForScope} from './scopeTools';
import {getURL} from './util';
import ImageView from './image-view';

export default class ImageMarker {
  constructor(cursor, editor) {
    this.editor = editor;
    let scopeString = ".markup.underline.link.gfm";
    // let result = getTextForScope(".markup.underline.link.gfm");

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
    let pattern = /\((.*)\)/;
    let result = pattern.exec(this.text);
    if (result === null) {
      throw new Error("Regex match failed");
    }

    let linkURL = this.parseImageLocation(result[1], path.dirname(this.editor.getPath()));
    this.view = new ImageView();
    this.view.imageLocation = linkURL;

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

  findImageLocation(cursor) {
    // which row is this? make sure you ignore soft-wrap
    let row = cursor.getBufferRow();
    let buffer = this.editor.getBuffer();
    if (buffer.isRowBlank(row) || this.editor.languageMode.isLineCommentedAtBufferRow(row)) {
      return;
    }

    let text = buffer.getTextInRange({
      start: {
        row,
        column: 0
      },
      end: {
        row,
        column: 9999999
      }});
    return this.parseImageLocation(text, path.dirname(this.editor.getPath()));
  }

  parseImageLocation(text, basePath) {
    let imagePath = text.trim();
    // try to parse selected text as md link
    let mdLink = this.parseMarkdownLink(imagePath);
    if (mdLink) {
      imagePath = mdLink.location;
    }
    let st;
    // imagePath = path.normalize(imagePath)
    if (path.isAbsolute(imagePath)) {
      try {
        st = fs.statSync(imagePath);
        if (!st.isFile()) {
          throw new Error(`no image ${imagePath}`);
        }
      } catch (error) {
        throw new Error(`no image ${imagePath}`);
      }
    } else if (basePath) {
      let absPath = path.resolve(basePath, imagePath);
      try {
        st = fs.statSync(absPath);
        if (st.isFile()) {
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

  getImageURL(imagePath) {
    try {
      return getURL(imagePath);
    } catch (error) {
      throw new Error(`no image ${imagePath}`);
    }
  }

  checkFile(filePath, onErr) {
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

  parseMarkdownLink(text) {
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
