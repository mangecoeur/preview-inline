{Emitter} = require 'atom'

{View} = require 'space-pen'

module.exports =
class ImageView extends View
  @content: (imageLocation)  ->
    @div class: 'preview-inline output-bubble image', =>
      @div class: 'action-buttons', =>
        @div class: 'close icon icon-x', click: 'destroy'
        # @div class: ['open-ext', 'icon', 'icon-x'], click: 'open'
      @div class: 'contents', =>
        @img class: 'image-element', outlet: "image",
         src: imageLocation,

  initialize: (imageLocation) ->
    @emitter = new Emitter()

  onClose: (callback) ->
    @emitter.on 'was-closed', callback

  destroy: ->
    # @element.innerHTML = ''
    @emitter.emit 'was-closed'
    @element.remove()

  #
  # getElement: ->
  #   @element
