{Emitter} = require 'atom'
{View} = require 'space-pen'

# katex = require 'katex'
# mathjax = require 'MathJax-node'

mathjaxHelper = require './mathjax-helper'

# mjAPI = require("../node_modules/MathJax-node/lib/mj-single.js")
# View = require 'space-pen'

module.exports =
class MathView extends View

  initialize: (mathText) ->
    @generateMath(mathText)
    @emitter = new Emitter()
    mathjaxHelper.loadMathJax()

  @content: (mathText)  ->
    @div class: 'preview-inline output-bubble math', =>
      @div class: 'action-buttons', =>
        @div class: 'btn btn-error close-preview inline-block-tight', click: 'destroy', =>
          @span class: 'icon icon-x'
      @div class: 'contents', =>
        @div class: 'math-element', outlet: "container", =>
          @div class: 'loading loading-spinner-tiny inline-block'
# outlet: "container",


  generateMath: (mathText) ->
    @element.classList.remove("ready")
    # @container[0].innerHTML = "<div class='loading loading-spinner-small inline-block'></div>"
    # try
    #   katex.render(mathText, @container[0])
    # catch error
    # atom.notifications.addWarning(error.message)
    @mathEl = document.createElement('script')
    @mathEl.type='math/tex; mode=display'
    @mathEl.innerHTML = mathText.replace('<br>','')
    mathjaxHelper.mathProcessor(@mathEl, =>
      # @container[0].innerHTML = ""
      # @container[0].appendChild(@mathEl)
      @element.classList.add("ready")
      )
    # @container[0].innerHTML = ""
    # first remove the old child...
    el = @container[0].querySelector('.MathJax_SVG_Display')
    if el?
      @container[0].removeChild(el)
      # @container[0].replaceChild(el, @mathEl)
    # else
    @container[0].appendChild(@mathEl)

    # @element.classList.add("ready")

  onClose: (callback) ->
    @emitter.on 'was-closed', callback

  destroy: ->
    # @element.innerHTML = ''
    @emitter.emit 'was-closed'
    @element.remove()

  #
  # getElement: ->
  #   @element
