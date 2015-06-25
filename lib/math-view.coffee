katex = require 'katex'
MathJax = require 'MathJax-node'

module.exports =
class MathView
  mathText: null

  constructor: (@mathText) ->
    # TODO: DOCs suggest using HTML5 custom elements for views.
    # how to do this? how to add template?
    # FIXME: use SpacePen for the above https://github.com/atom/space-pen
    @element = document.createElement('div')
    @element.classList.add('image-inline')
    @element.classList.add('output-bubble')

    @spinner = @buildSpinner()
    @element.appendChild(@spinner)

    @outputContainer = document.createElement('div')
    @outputContainer.classList.add('bubble-output-container')
    @element.appendChild(@outputContainer)

    @resultContainer = document.createElement('div')
    @resultContainer.classList.add('bubble-result-container')
    @outputContainer.appendChild(@resultContainer)

    @richCloseButton = document.createElement('div')
    @richCloseButton.classList.add('rich-close-button', 'icon', 'icon-x')
    @richCloseButton.onclick = => @destroy()
    @element.appendChild(@richCloseButton)

    @actionPanel = document.createElement('div')
    @actionPanel.classList.add('bubble-action-panel')
    @element.appendChild(@actionPanel)

    @closeButton = document.createElement('div')
    @closeButton.classList.add('action-button', 'close-button', 'icon', 'icon-x')
    @closeButton.onclick = => @destroy()
    @actionPanel.appendChild(@closeButton)


    padding = document.createElement('div')
    padding.classList.add('padding')
    @actionPanel.appendChild(padding)

    @generateMath(@mathText)

    return this

  generateMath: (mathText) ->
    container = @resultContainer
    container.innerHTML = container.innerHTML.trim().replace('<br>', '')

    @element.classList.add('rich')
    katex.render(mathText, container)

    @setMultiline(true)

  setMultiline: (multiline) ->
    @multiline = multiline
    if @multiline
      @element.classList.add('multiline')
    else
      @element.classList.remove('multiline')


  buildSpinner: ->
    container = document.createElement('div')
    container.classList.add('spinner')

    rect1 = document.createElement('div')
    rect1.classList.add('rect1')
    rect2 = document.createElement('div')
    rect2.classList.add('rect2')
    rect3 = document.createElement('div')
    rect3.classList.add('rect3')
    rect4 = document.createElement('div')
    rect4.classList.add('rect4')
    rect5 = document.createElement('div')
    rect5.classList.add('rect5')

    container.appendChild(rect1)
    container.appendChild(rect2)
    container.appendChild(rect3)
    container.appendChild(rect4)
    container.appendChild(rect5)

    return container

  spin: (shouldSpin) ->
    if shouldSpin
      @spinner.style.display = 'block'
    else
      @spinner.style.display = 'none'


  destroy: ->
    # @marker.destroy()
    @element.innerHTML = ''
    @element.remove()

  getElement: ->
    @element
