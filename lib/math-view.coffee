{Emitter} = require 'atom'
{View, jQuery, $, $$} = require 'space-pen'

katex = require 'katex'
mathjax = require 'MathJax-node'
# View = require 'space-pen'

module.exports =
class MathView extends View

  initialize: (mathText) ->
    @generateMath(mathText)
    @emitter = new Emitter()

  @content: (mathText)  ->
    @div class: 'preview-inline output-bubble math', =>
      @div class: 'action-buttons', =>
        @div class: 'close icon icon-x', click: 'destroy'
      @div class: 'contents', =>
        @div 'Loading', class: 'math-element', outlet: "container"


  generateMath: (mathText) ->
    try
      katex.render(mathText, @container[0])
    catch error
      atom.notifications.addError(error.message)
      # parse with mathjax
      # mathjax.typeset(mathText, (out) ->
      #   console.log out
      #   # container.innerHTML = ''
      #   # container.appendChild(out)
      #   )

  onClose: (callback) ->
    @emitter.on 'was-closed', callback

  destroy: ->
    # @element.innerHTML = ''
    @emitter.emit 'was-closed'
    @element.remove()

  #
  # getElement: ->
  #   @element
