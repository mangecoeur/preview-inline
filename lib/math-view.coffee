{Emitter} = require 'atom'
{View, jQuery, $, $$} = require 'space-pen'

katex = require 'katex'
# mathjax = require 'MathJax-node'

# mathjaxHelper = require './mathjax-helper'

# mjAPI = require("../node_modules/MathJax-node/lib/mj-single.js")
# View = require 'space-pen'

module.exports =
class MathView extends View

  initialize: (mathText) ->
    @generateMath(mathText)
    @emitter = new Emitter()
    mathjaxHelper.loadMathJax()
    # if (argv.font === "STIX") argv.font = "STIX-Web";


    # mathjax.config({displayMessages: true,
    # displayErrors: true})

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
      atom.notifications.addWarning(error.message)
      @container.append("<img src='http://latex.codecogs.com/svg.latex?#{mathText}' />")

      # math =  @container[0]
      # mathText = '$$ \n' + mathText.replace('<br>','') + '\\n $$'
      # math.innerText = mathText
      # MathJax.Hub.Queue(["Typeset", MathJax.Hub, math])


  onClose: (callback) ->
    @emitter.on 'was-closed', callback

  destroy: ->
    # @element.innerHTML = ''
    @emitter.emit 'was-closed'
    @element.remove()

  #
  # getElement: ->
  #   @element
