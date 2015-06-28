katex = require 'katex'
mathjax = require 'MathJax-node'
# View = require 'space-pen'
{View, jQuery, $, $$} = require 'space-pen'

module.exports =
class MathView extends View

  initialize: (mathText) ->
    @generateMath(mathText)

  @content: (mathText)  ->
    @div class: 'preview-inline output-bubble math', =>
      @div class: 'action-buttons', =>
        @div class: 'close icon icon-x', click: 'destroy'
        # @div class: ['open-ext', 'icon', 'icon-x'], click: 'destroy'
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

  buildSpinner: ->
    container = document.createElement('div')
    container.classList.add('spinner')

    return container

  spin: (shouldSpin) ->
    if shouldSpin
      @spinner.style.display = 'block'
    else
      @spinner.style.display = 'none'

  destroy: ->
    @element.innerHTML = ''
    @element.remove()
  #
  # getElement: ->
  #   @element
