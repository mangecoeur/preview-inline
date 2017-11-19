// 'use babel';
// Don't use babel because it messes with the html custom elements
// import {Emitter} from 'atom';
// import {createElement} from './util';
// import path from 'path';
const {Emitter} = require('atom');
const {createElement} = require('./util');

const small = "(a|an|and|as|at|but|by|en|for|if|in|of|on|or|the|to|v[.]?|via|vs[.]?)";
const punct = "([!\"#$%&'()*+,./:;<=>?@[\\\\\\]^_`{|}~-]*)";

function titleCaps(title) {
  let parts = [];
  let split = /[:.;?!] |(?: |^)["Ò]/g;
  let index = 0;

  while (true) {
    var m = split.exec(title);

    parts.push(title.substring(index, m ? m.index : title.length)
			.replace(/\b([A-Za-z][a-z.'Õ]*)\b/g, function(all) {
  return /[A-Za-z]\.[A-Za-z]/.test(all) ? all : upper(all);
})
			.replace(RegExp("\\b" + small + "\\b", "ig"), lower)
			.replace(RegExp("^" + punct + small + "\\b", "ig"), function(all, punct, word) {
  return punct + upper(word);
})
			.replace(RegExp("\\b" + small + punct + "$", "ig"), upper));

    index = split.lastIndex;

    if (m) parts.push(m[0]);
    else break;
  }

  return parts.join("").replace(/ V(s?)\. /ig, " v$1. ")
		.replace(/(['Õ])S\b/ig, "$1s")
		.replace(/\b(AT&T|Q&A)\b/ig, function(all) {
  return all.toUpperCase();
});
}

function lower(word) {
  return word.toLowerCase();
}

function upper(word) {
  return word.substr(0, 1).toUpperCase() + word.substr(1);
}

function prettifyTitle(title) {
  let colon;
  if (!title) {
    return;
  }
  if (((colon = title.indexOf(':')) !== -1) && (title.split(" ").length > 5)) {
    title = title.substring(0, colon);
  }

      // make title into titlecaps, trim length to 30 chars(ish) and add elipsis
  title = titleCaps(title);
  const l = title.length > 70 ? 70 : title.length;
  title = title.slice(0, l);
  const n = title.lastIndexOf(" ");
  return title.slice(0, n) + "...";
}

function prettifyAuthors(authors) {
  if ((authors == null)) {
    return '';
  }
  if (!authors.length) {
    return '';
  }

  let name = this.prettifyName(authors[0]);

      // remove leading and trailing {}
  name = name.replace(/(^\{|\}$)/g, "");

  if (authors.length > 1) {
    return `${name} et al.`;
  }
  return `${name}`;
}

function prettifyName(person, inverted, separator) {
  if (inverted === null || inverted === undefined) {
    inverted = false;
  }
  if (separator === null || separator === undefined) {
    separator = ' ';
  }
  if (inverted) {
    return this.prettifyName({
      given: person.family,
      family: person.given
    }, false, ', ');
  }
  return ((person.given) ? person.given : '') +
        ((person.given) && (person.family) ? separator : '') +
        ((person.family) ? person.family : '');
}

class CitationView extends HTMLElement {
  constructor() {
    super();
    this.emitter = new Emitter();

    this.onClose = this.onClose.bind(this);
    this.destroy = this.destroy.bind(this);
  }

  static get observedAttributes() {
    return ['citation'];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    this.contents.innerHTML = `<div>
        <div class="entry">
          <div class="author-line">
            <div><i class="icon ${this.typeClass}"></i> ${this.prettyAuthors}</div>
          </div>
          <div class="title-line">
            ${this.title}
          </div>

        </div>
      </div>`;
  }

  connectedCallback() {
    this.classList.add('preview-inline');
    this.classList.add('output-bubble');
    this.classList.add('image');
    this.innerHTML = '';

    let closeBtn = createElement('div', {class: 'btn btn-error btn-sm close-preview icon icon-x'});
    closeBtn.addEventListener('click', this.destroy);

    let btns = createElement('div', {class: 'action-buttons',
      children: [closeBtn]});
    this.appendChild(btns);

    this.contents = createElement('div', {class: 'contents'});
    // this.contents.appendChild(createElement('div', {class: 'loading loading-spinner-tiny inline-block'}));

    this.appendChild(this.contents);
    this.classList.add("ready");
    this.contents.innerHTML = `<div>
        <div class="entry">
          <div class="author-line">
            <div><i class="icon ${this.typeClass}"></i> ${this.prettyAuthors}</div>
          </div>
          <div class="title-line">
            ${this.citation.title}
          </div>

        </div>
      </div>`;
      //           <div class="file-line">
                // <a href="file:///${file}">${filename}</a>
                // </div>
  }

  set citation(entry) {
    this._citation = entry;
    this.typeClass = "icon-mortar-board";
    if (entry.journal) {
      this.typeClass = "icon-file-text";
    } else if (entry.booktitle) {
      this.typeClass = "icon-repo";
    }
    // let file = entry.file.split(':')[1];
    // let filename = path.basename(file);

    this.prettyAuthors = 'Unknown';
    if (entry.authors) {
      this.prettyAuthors = prettifyAuthors(entry.authors);
    }

    this.title = 'Unknown';
    if (entry.title) {
      this.title = entry.title.replace(/(^\{|\}$)/g, "");
      this.title = prettifyTitle(this.title);
    }
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

// let CitationView = document.registerElement('citation-view', CitationView);
window.customElements.define('citation-view', CitationView);

module.export = {CitationView};
