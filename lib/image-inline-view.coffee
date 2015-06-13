module.exports =
class ImageInlineView
  constructor: (@marker) ->
    # Create root element
    @element = document.createElement('div')
    @element.classList.add('image-inline')

    # Create message element
    message = document.createElement('div')
    message.textContent = "The ImageInline package has reloaded!"
    message.classList.add('message')
    @element.appendChild(message)
    @resultContainer = message

    @addImage(loc)


    @setMultiline(false)

  # Returns an object that can be retrieved when package is activated
  serialize: ->

  # Tear down any state and detach
  destroy: ->
    @element.remove()

  getElement: ->
    @element

  fetchImage: (location) ->
    # TODO: make non-url image path absolute, not sure what the working dir of the script is. Should be possible to get dir of the file for rel paths

    if validURL(location) # is a url:
      # fetch the image from the url and Returns
      console.log 'this url is valid'
    else # image is a valid file path
      # load image from path
      console.log 'this is probably a path'

  validURL: (str) ->
    pattern = ///
      ^(https?:\/\/)?                              # protocol
      ((([a-z\d]([a-z\d-]*[a-z\d])*)\.)+[a-z]{2,}| # domain name
      ((\d{1,3}\.){3}\d{1,3}))                     # OR ip (v4) address
      (\:\d+)?(\/[-a-z\d%_.~+]*)*                  # port and path
      (\?[;&a-z\d%_.~+=-]*)?                       # query string
      (\#[-a-z\d_]*)?$                             # fragment locater
    ///
    if(!pattern.test(str))
      return false
    else
      return true

  setMultiline: (multiline) ->
    @multiline = multiline
    if @multiline
        @element.classList.add('multiline')
    else
        @element.classList.remove('multiline')

  addImage: (image_path) ->
      console.log "rendering as image"
      container = @resultContainer

      container.innerHTML = container.innerHTML.trim().replace('<br>', '')

      # @resultType = 'image'
      # @element.classList.add('rich')
      # TODO: make image path absolute, not sure what the working dir of the script is. Should be possible to get dir of the file for rel paths
      image = document.createElement('img')
      image.setAttribute('src', image_path)
      container.appendChild(image)
      @setMultiline(true)
