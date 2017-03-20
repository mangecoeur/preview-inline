'use babel';
import {Emitter} from 'atom';
import {createElement} from './util';
import path from 'path';

// const ZOOM_LEVELS = []
class _CitationView extends HTMLElement {

  createdCallback() {
    this.emitter = new Emitter();

    this.onClose = this.onClose.bind(this);
    this.destroy = this.destroy.bind(this);

    this.classList.add('preview-inline');
    this.classList.add('output-bubble');
    this.classList.add('image');

    let closeBtn = createElement('div', {class: 'btn btn-error btn-sm close-preview icon icon-x'});
    closeBtn.addEventListener('click', this.destroy);

    let btns = createElement('div', {class: 'action-buttons',
                                     children: [closeBtn]});

    this.contents = createElement('div', {class: 'contents'});
    this.contents.appendChild(createElement('div', {class: 'loading loading-spinner-tiny inline-block'}));

    this.appendChild(btns);
    this.appendChild(this.contents);
  }

  set citation(entry) {
    if (!entry) {
      throw new Error('No citation for this key in library');
    }
    this._citation = entry;
    let typeClass = "icon-mortar-board";
    if (entry.entryTags.journal) {
      typeClass = "icon-file-text";
    } else if (entry.entryTags.booktitle) {
      typeClass = "icon-repo";
    }
    let file = entry.entryTags.file.split(':')[1];
    let filename = path.basename(file);
    this.classList.add("ready");
    this.contents.innerHTML = `<div>
        <div class="entry">
          <div class="author-line">
            <div><i class="icon ${typeClass}"></i> ${entry.entryTags.prettyAuthors}</div>
          </div>
          <div class="title-line">
            ${entry.entryTags.title}
          </div>

        </div>
      </div>`;
      //           <div class="file-line">
                // <a href="file:///${file}">${filename}</a>
                // </div>
  }

  get citation() {
    return this._citation;
  }

  onClose(callback) {
    return this.emitter.on('was-closed', callback);
  }

  destroy() {
    return this.emitter.emit('was-closed');
  }

  getElement() {
    return this;
  }
}

let CitationView = document.registerElement('citation-view', _CitationView);

export default CitationView;
