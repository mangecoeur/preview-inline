
module.exports.createElement = (tagName, attributes = {}) ->
  el = document.createElement(tagName)

  for own key, value of attributes
    el.setAttribute(key, value)

  return el
