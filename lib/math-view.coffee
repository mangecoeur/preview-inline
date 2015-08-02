{Emitter} = require 'atom'
{View,} = require 'space-pen'

katex = require 'katex'
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
        @div class: 'close icon icon-x', click: 'destroy'
      @div class: 'contents', =>
        @div class: 'math-element', outlet: "container", =>
          @span class: 'loading loading-spinner-small inline-block'



  generateMath: (mathText) ->
    try
      # @container[0].innerHTML = ''
      katex.render(mathText, @container[0])
    catch error
      # atom.notifications.addWarning(error.message)

      mathEl = document.createElement('script')
      mathEl.type='math/tex; mode=display'
      mathEl.innerHTML = mathText.replace('<br>','')
      @container[0].appendChild(mathEl)
      # MathJax.Hub.Queue(["Typeset", MathJax.Hub, math])
      mathjaxHelper.mathProcessor(mathEl)

  onClose: (callback) ->
    @emitter.on 'was-closed', callback

  destroy: ->
    # @element.innerHTML = ''
    @emitter.emit 'was-closed'
    @element.remove()

  #
  # getElement: ->
  #   @element
