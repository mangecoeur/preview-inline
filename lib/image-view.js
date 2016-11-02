'use babel';
import {Emitter} from 'atom';
import {createElement} from './util';

const DEFAULT_ZOOM_AMOUNT = 2;
// const ZOOM_LEVELS = []
class _ImageView extends HTMLElement {

  createdCallback() {
    this.emitter = new Emitter();

    this.onClose = this.onClose.bind(this);
    this.destroy = this.destroy.bind(this);
    this.zoomIn = this.zoomIn.bind(this);
    this.zoomOut = this.zoomOut.bind(this);
    this.reload = this.reload.bind(this);

    this.overlayMode = this.overlayMode.bind(this);

    this.classList.add('preview-inline');
    this.classList.add('output-bubble');
    this.classList.add('image');

    // this.element = createElement('div', {class: 'preview-inline output-bubble image ready'});

    let closeBtn = createElement('div', {class: 'btn btn-error btn-sm close-preview icon icon-x'});
    closeBtn.addEventListener('click', this.destroy);

    let zoomInBtn = createElement('div', {class: 'btn zoom-in icon icon-plus'});
    zoomInBtn.addEventListener('click', this.zoomIn);

    let zoomOutBtn = createElement('div', {class: 'btn zoom-out icon icon-dash'});
    zoomOutBtn.addEventListener('click', this.zoomOut);

    let zoomBtns = createElement('div', {class: 'btn-group btn-group-xs zoom-btns',
                                         children: [zoomInBtn, zoomOutBtn]});

    let reloadBtn = createElement('div', {class: 'btn btn-xs reload icon icon-sync'});
    reloadBtn.addEventListener('click', this.reload);

    let btns = createElement('div', {class: 'action-buttons',
                                     children: [closeBtn, zoomBtns, reloadBtn]});

    this.contents = createElement('div', {class: 'contents'});
    this.contents.appendChild(createElement('div', {class: 'loading loading-spinner-tiny inline-block'}));

    this.appendChild(btns);
    this.appendChild(this.contents);
  }

  set imageLocation(uri) {
    this._imageLocation = uri;
    this.classList.add("ready");
    this.contents.innerHTML = '';
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
    return this.emitter.emit('was-closed');
  }

  getElement() {
    return this;
  }

  overlayMode(modeSwitch) {
    if (modeSwitch) {
      return this.classList.add('overlay');
    } else {
      return this.classList.remove('overlay');
    }
  }

  zoomIn() {
    //TODO set up finer zoom amounts but such that you get exactly 2x zoom back again
    let imageEl = this.contents.querySelector('.image-element');

    let currentWidth = imageEl.clientWidth;
    let currentHeight = imageEl.clientHeight;

    imageEl.style.width = `${currentWidth * DEFAULT_ZOOM_AMOUNT}px`;
    imageEl.style.height = `${currentHeight * DEFAULT_ZOOM_AMOUNT}px`;
  }

  zoomOut() {
    let imageEl = this.contents.querySelector('.image-element');

    let currentWidth = imageEl.clientWidth;
    let currentHeight = imageEl.clientHeight;

    imageEl.style.width = `${currentWidth / DEFAULT_ZOOM_AMOUNT}px`;
    imageEl.style.height = `${currentHeight / DEFAULT_ZOOM_AMOUNT}px`;
  }

  reload() {
    // Add the time stamp as query param which forces true reload
    this.imageLocation = this._imageLocation + '?' + Date.now();
  }
}

let ImageView = document.registerElement('image-view', _ImageView);

export default ImageView;
