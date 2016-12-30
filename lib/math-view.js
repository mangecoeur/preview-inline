'use babel';

import {Emitter} from 'atom';
import {createElement} from './util';
import mathjaxHelper from './mathjax-helper';
// import mathjaxHelper from 'mathjax-electron';

// mjAPI = require("../node_modules/MathJax-node/lib/mj-single.js")

class _MathView extends HTMLElement {

  createdCallback() {
    this.emitter = new Emitter();
    this.classList.add('preview-inline');
    this.classList.add('output-bubble');

    // this.element = createElement('div', {class: 'preview-inline output-bubble math'});

    let btns = createElement('div', {class: 'action-buttons'});

    let btn = createElement('div', {class: 'btn btn-error btn-sm close-preview icon icon-x'});
    btn.addEventListener('click', this.destroy.bind(this));

    btns.appendChild(btn);
    // TODO what is contents for?
    let contents = createElement('div', {class: 'contents'});
    this.container = createElement('div', {class: 'math-element'});
    this.container.appendChild(createElement('div', {class: 'loading loading-spinner-tiny inline-block'}));
    this.container.appendChild(createElement('div', {class: 'bugfix-overlay'}));

    contents.appendChild(this.container);

    this.appendChild(btns);
    this.appendChild(contents);
    this._mathText = '';
  }

  set mathText(text) {
    this._mathText = text;
    // this.classList.remove("ready");

    let mathEl = document.createElement('script');
    mathEl.type = 'math/tex; mode=display';
    mathEl.innerHTML = this._mathText.replace('<br>', '');
    this.container.appendChild(mathEl);

    mathjaxHelper.typesetMath(mathEl, () => {
      this.classList.add("ready");
      // let el = this.container.querySelectorAll('.MathJax_SVG_Display');
      // if (el) {
      //   let scriptEl = this.container.querySelectorAll('script');
      //   if (el.length > 1) {
      //     this.container.removeChild(el[0]);
      //     this.container.removeChild(scriptEl[0]);
      //   }
      // }
    });

    let el = this.container.querySelector('.MathJax_SVG_Display');
    if (el) {
      let scriptEl = this.container.querySelector('script');
      this.container.removeChild(el);
      this.container.removeChild(scriptEl);
    }
    this.container.appendChild(mathEl);
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
