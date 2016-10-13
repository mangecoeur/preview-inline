'use babel';
import {Emitter} from 'atom';
import {createElement} from './util';

class _ImageView extends HTMLElement {

  createdCallback() {
    this.emitter = new Emitter();

    this.onClose = this.onClose.bind(this);
    this.destroy = this.destroy.bind(this);
    this.getElement = this.getElement.bind(this);
    this.overlayMode = this.overlayMode.bind(this);

    this.classList.add('preview-inline');
    this.classList.add('output-bubble');
    this.classList.add('image');

    // this.element = createElement('div', {class: 'preview-inline output-bubble image ready'});

    let btns = createElement('div', {class: 'action-buttons'});

    let btn = createElement('div', {class: 'btn btn-error close-preview inline-block-tight'});
    btn.appendChild(createElement('span', {class: 'icon icon-x'}));
    btn.addEventListener('click', this.destroy);

    btns.appendChild(btn);
    this.contents = createElement('div', {class: 'contents'});

    this.appendChild(btns);
    this.appendChild(this.contents);
  }

  set imageLocation(uri) {
    this._imageLocation = uri;
    this.classList.add("ready");
    this.contents.appendChild(createElement('img', {class: 'image-element',
                                                    src: this.imageLocation}));
  }

  get imageLocation() {
    return this._imageLocation;
  }

  onClose(callback) {
    return this.emitter.on('was-closed', callback);
  }

  destroy() {
    // @element.innerHTML = ''
    return this.emitter.emit('was-closed');
  }

    // @element?.remove()

  getElement() {
    return this.element;
  }

  overlayMode(modeSwitch) {
    if (modeSwitch) {
      return this.classList.add('overlay');
    } else {
      return this.classList.remove('overlay');
    }
  }
}

let ImageView = document.registerElement('image-view', _ImageView);

export default ImageView;
