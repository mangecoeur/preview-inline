{Emitter} = require 'atom'
{createElement} = require './util'

# {View} = require 'space-pen'


# createElement: (tagName, attributes = {}) ->
#   el = document.createElement(tagName)
#
#   for own key, value of attributes
#     el.setAttribute(key, value)
#
#   return el

module.exports =
class ImageView #extends View

  constructor: (@imageLocation)  ->
    @element = createElement('div', {class: 'preview-inline output-bubble image ready'})

    btns = createElement('div', {class: 'action-buttons'})

    btn = createElement('div', {class: 'btn btn-error close-preview inline-block-tight'})
    btn.appendChild(createElement('span', {class: 'icon icon-x'}))
    btn.addEventListener('click', @destroy)

    btns.appendChild(btn)

    contents = createElement('div', {class: 'contents'})
    contents.appendChild(createElement('img', {class: 'image-element', src: @imageLocation}))

    @element.appendChild(btns)
    @element.appendChild(contents)

    @emitter = new Emitter()

  # initialize: (imageLocation) ->
  #   @emitter = new Emitter()

  onClose: (callback) =>
    @emitter.on 'was-closed', callback

  destroy: =>
    # @element.innerHTML = ''
    @emitter.emit 'was-closed'
    @element.remove()

  getElement: =>
    @element

  overlayMode: (modeSwitch) =>
    if modeSwitch
      @element.classList.add('overlay')
    else
      @element.classList.remove('overlay')
