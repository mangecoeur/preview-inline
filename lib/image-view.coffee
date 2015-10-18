{Emitter} = require 'atom'

{View} = require 'space-pen'

module.exports =
class ImageView extends View
  @content: (imageLocation)  ->
    # ImageView is born ready
    @div class: 'preview-inline output-bubble image ready', =>
      @div class: 'action-buttons', =>
        @div class: 'btn btn-error close-preview inline-block-tight', click: 'destroy', =>
          @span class: 'icon icon-x'
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
