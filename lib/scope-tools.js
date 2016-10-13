'use babel';

let arrayEqual = (a, b) => a.length === b.length && a.every((elem, i) => elem === b[i]);

// Does the given scope match one of a list of scopes
function scopeIn(scope, scopeList) {
  for (let i = 0; i < scopeList.length; i++) {
    let matchScope = scopeList[i];
    if (scopeEqual(scope, matchScope)) {
      return true;
    }
  }
  return false;
}

function scopeEqual(scopeOne, scopeTwo) {
  // TODO: handle mixed string/array scopes
  if (typeof scopeOne === 'string' && typeof scopeTwo === 'string') {
    return scopeOne === scopeTwo;
  }
  let arrayOne;
  let arrayTwo;

  if (scopeOne.getScopesArray !== null) {
    arrayOne = scopeOne.getScopesArray();
  } else {
    arrayOne = scopeOne;  // how to copy?
  }
  if (scopeTwo.getScopesArray !== null) {
    arrayTwo = scopeTwo.getScopesArray();
  } else {
    arrayTwo = scopeTwo;  // how to copy?
  }

  return arrayEqual(arrayOne, arrayTwo);
}

function scopeContainsOne(scope, scopeList) {
  for (let i = 0; i < scopeList.length; i++) {
    let matchScope = scopeList[i];
    if (scopeContains(scope, matchScope)) {
      return matchScope;
    }
  }
  return false;
};

function scopeContains(outerScope, innerScope) {
  if (typeof outerScope === 'string' && typeof outerScope === 'string') {
    return outerScope.includes(innerScope);
  }
  let arrayOne;
  let arrayTwo;
  let oScope;

  if (outerScope.getScopesArray) {
    arrayOne = outerScope.getScopesArray();
  } else {
    arrayOne = outerScope;
  }

  if (innerScope.getScopesArray) {
    arrayTwo = innerScope.getScopesArray();
  } else {
    arrayTwo = innerScope;
  }

  if (typeof arrayTwo === 'string') {
    for (let i = 0; i < arrayOne.length; i++) {
      oScope = arrayOne[i];
      if (oScope.includes(arrayTwo)) {
        return true;
      }
    }
    return false;
  }
  for (let j = 0; j < arrayOne.length; j++) {
    oScope = arrayOne[j];
    for (let k = 0; k < arrayTwo.length; k++) {
      let iScope = arrayTwo[k];
      if (oScope.includes(iScope)) {
        return true;
      }
    }
  }
  return false;
}

function getTextForScope(scopeString, editor) {
  let range = editor.bufferRangeForScopeAtCursor(scopeString);
  if (range) {
    return {
      text: editor.getTextInBufferRange(range),
      range: editor.screenRangeForBufferRange(range)
    };
  }
  throw new Error('no matching scope under cursor');
}

export {scopeEqual, scopeIn, scopeContains, scopeContainsOne, getTextForScope};
