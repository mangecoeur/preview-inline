'use babel';

import {Emitter} from 'atom';
import {createElement} from './util';
import mathjaxHelper from './mathjax-helper';

// mjAPI = require("../node_modules/MathJax-node/lib/mj-single.js")

class _MathView extends HTMLElement {

  createdCallback() {
    this.emitter = new Emitter();
    this.classList.add('preview-inline');
    this.classList.add('output-bubble');

    // this.element = createElement('div', {class: 'preview-inline output-bubble math'});

    let btns = createElement('div', {class: 'action-buttons'});

    let btn = createElement('div', {class: 'btn btn-error close-preview icon icon-x'});
    btn.addEventListener('click', this.destroy.bind(this));

    btns.appendChild(btn);

    let contents = createElement('div', {class: 'contents'});
    this.container = createElement('div', {class: 'math-element'});
    this.container.appendChild(createElement('div', {class: 'loading loading-spinner-tiny inline-block'}));
    this.container.appendChild(createElement('div', {class: 'overlay'}));

    contents.appendChild(this.container);

    this.appendChild(btns);
    this.appendChild(contents);
    this._mathText = '';
  }

  set mathText(text) {
    this._mathText = text;
    this.classList.remove("ready");

    this.mathEl = document.createElement('script');
    this.mathEl.type = 'math/tex; mode=display';
    this.mathEl.innerHTML = this._mathText.replace('<br>', '');
    mathjaxHelper.mathProcessor(this.mathEl, () => {
      this.classList.add("ready");
    }
      );
    // first remove the old child...
    let el = this.container.querySelector('.MathJax_SVG_Display');
    if (el) {
      this.container.removeChild(el);
    }
    this.container.appendChild(this.mathEl);
  }

  get mathText() {
    return this._mathText;
  }


  onClose(callback) {
    this.emitter.on('was-closed', callback);
  }

  destroy() {
    this.emitter.emit('was-closed');
  }

  overlayMode(modeSwitch) {
    if (modeSwitch) {
      return this.element.classList.add('overlay');
    } else {
      return this.element.classList.remove('overlay');
    }
  }
}

let MathView = document.registerElement('math-view', _MathView);

export default MathView;
