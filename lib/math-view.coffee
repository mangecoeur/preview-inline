katex = require 'katex'
mathjax = require 'MathJax-node'
View = require 'space-pen'

module.exports =
class MathView extends View
  @content: (mathText) ->
    @div class: ['preview-inline', 'output-bubble', 'math'], =>
      @div class: ['close-button', 'icon', 'icon-x'], click: 'destroy'
      @div class: ['bubble-contents'], outlet: "container", =>
        @generateMath mathText, this

  generateMath: (mathText, element) ->
    try
      katex.render(mathText, element)
    catch error
      atom.notifications.addError(error.message)
      #parse with mathjax
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
