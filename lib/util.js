'use babel';

function createElement(tagName, attributes = {}, textContent = '') {
  let el = document.createElement(tagName);
  el.textContent = textContent;
  for (let key of Object.keys(attributes)) {
    let value = attributes[key];
    el.setAttribute(key, value);
  }

  return el;
}

let _destroyThese = (...elements) =>
  elements.map(el =>
    el.destroy())
;

function * entries(obj) {
  for (let key of Object.keys(obj)) {
    yield [key, obj[key]];
  }
}

let urlPattern = /^((https?:\/\/)((([a-z\d]([a-z\d-]*[a-z\d])*)\.)+[a-z]{2,}|((\d{1,3}\.){3}\d{1,3}))(:\d+)?(\/[-a-z\d%_.~+]*)*(\?[;&a-z\d%_.~+=-]*)?(#[-a-z\d_]*)?$)/gi;

function getURL(text) {
  // pull a url out of a line of text
  let result = text.match(urlPattern);
  if (result) {
    return result[0];
  } else {
    throw new Error('no URL in this text');
  }
}

export {_destroyThese, createElement, entries, getURL};
