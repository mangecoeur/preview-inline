'use babel';
import {Emitter} from 'atom';
import {createElement} from './util';

const DEFAULT_ZOOM_AMOUNT = 1.5;
// const ZOOM_LEVELS = []
class _TikzView extends HTMLElement {

  createdCallback() {
    this.emitter = new Emitter();

    this.onClose = this.onClose.bind(this);
    this.destroy = this.destroy.bind(this);
    this.zoomIn = this.zoomIn.bind(this);
    this.zoomOut = this.zoomOut.bind(this);

    this.overlayMode = this.overlayMode.bind(this);

    this.classList.add('preview-inline');
    this.classList.add('output-bubble');
    this.classList.add('image');

    this.element = createElement('div', {class: 'preview-inline output-bubble image ready'});

    let closeBtn = createElement('div', {class: 'btn btn-error btn-sm close-preview icon icon-x'});
    closeBtn.addEventListener('click', this.destroy);

    let zoomInBtn = createElement('div', {class: 'btn btn-sm  zoom-in icon icon-plus'});
    zoomInBtn.addEventListener('click', this.zoomIn);

    let zoomOutBtn = createElement('div', {class: 'btn btn-sm zoom-out icon icon-dash'});
    zoomOutBtn.addEventListener('click', this.zoomOut);

    let zoomBtns = createElement('div', {class: 'zoom-btns',
                                         children: [zoomInBtn, zoomOutBtn]});

    let btns = createElement('div', {class: 'action-buttons',
                                     children: [closeBtn, zoomBtns]});

    this.contents = createElement('div', {class: 'contents'});
    this.contents.appendChild(createElement('div', {class: 'loading loading-spinner-tiny inline-block'}));

    this.appendChild(btns);
    this.appendChild(this.contents);
  }

  set imageLocation(uri) {
    if (uri==null) {
      return;
    }
    this._imageLocation = uri;
    this.classList.add("ready");
    this.contents.innerHTML = '';

    let image=new Image();
    image.onload = function () {
       this.classList.add("image-element");
       this.style="width: "+this.naturalWidth+"px; height: "+this.naturalHeight+"px;"
    };
    image.src = uri;

    this.contents.appendChild(image);
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

}

// TODO upgrade to WebComponents v1, while somehow dealing with babel fuckery.
let TikzView = document.registerElement('tikz-view', _TikzView);

export default TikzView;
