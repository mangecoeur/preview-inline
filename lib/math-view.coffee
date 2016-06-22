{Emitter} = require 'atom'
{createElement} = require './util'

mathjaxHelper = require './mathjax-helper'

# mjAPI = require("../node_modules/MathJax-node/lib/mj-single.js")

module.exports =
class MathView
  constructor: (@mathText) ->
    # mathjaxHelper.loadMathJax()

    @element = createElement('div', {class: 'preview-inline output-bubble math'})

    btns = createElement('div', {class: 'action-buttons'})

    btn = createElement('div', {class: 'btn btn-error close-preview inline-block-tight'})
    btn.appendChild(createElement('span', {class: 'icon icon-x'}))
    btn.addEventListener('click', @destroy)

    btns.appendChild(btn)

    contents = createElement('div', {class: 'contents'})
    @container = createElement('div', {class: 'math-element'})
    @container.appendChild(createElement('div', {class: 'loading loading-spinner-tiny inline-block'}))

    contents.appendChild(@container)

    @element.appendChild(btns)
    @element.appendChild(contents)

    @generateMath(mathText)
    @emitter = new Emitter()


  generateMath: (mathText) =>
    @element.classList.remove("ready")

    @mathEl = document.createElement('script')
    @mathEl.type='math/tex; mode=display'
    @mathEl.innerHTML = mathText.replace('<br>','')
    mathjaxHelper.mathProcessor(@mathEl, =>
      @element.classList.add("ready")
      )
    # first remove the old child...
    el = @container.querySelector('.MathJax_SVG_Display')
    if el?
      @container.removeChild(el)
    # else
    @container.appendChild(@mathEl)

    # @element.classList.add("ready")

  onClose: (callback) =>
    @emitter.on 'was-closed', callback

  destroy: =>
    # @element.innerHTML = ''
    # if atom.config.get('preview-inline.previewMode') == 'none'
    #   @element?.remove()

    @emitter.emit 'was-closed'


    # @element?.remove()

  getElement: =>
    @element

  overlayMode: (modeSwitch) =>
    if modeSwitch
      @element.classList.add('overlay')
    else
      @element.classList.remove('overlay')
