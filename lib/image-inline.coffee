ImageView = require './image-view'
{CompositeDisposable} = require 'atom'

fs = require 'fs'
path = require 'path'

# TODO: prevent multiple previews being added for same link/marker
# TODO: add Specs
# TODO: add caption to MD image, only in case you HAVE an MD image
# TODO: nice decorations - show close buttons on hover etc
# FIXME: make it so the image preview aligns correctly with soft-wrap lines
# - align with last screen space row
# FIXME: sort out image sizing, make dependent on position and window width.
# make responsive (is already partly so)


module.exports = ImageInline =
  imageInlineView: null
  modalPanel: null
  subscriptions: null
  markerBubbleMap: {}

  activate: (state) ->
    console.log 'Loading image-inline'

    # This is just from the example package layout.Actually will want many views
    @imageInlineView = new ImageView('/Users/jonathanchambers/Pictures/gravatar.jpg')
    @modalPanel = atom.workspace.addModalPanel({
      item: @imageInlineView.getElement(),
      visible: false})

    @subscriptions = new CompositeDisposable

    # Register command that toggles this view
    @subscriptions.add atom.commands.add 'atom-workspace',
        # 'image-inline:toggle': => @toggle(),
        'image-inline:show': => @showUnderCursor()

    # @subscriptions.add atom.commands.add 'atom-text-editor',
    #     'image-inline:show': => @showUnderCursor()

    @subscriptions.add(atom.workspace.observeActivePaneItem(
      @updateCurrentEditor.bind(this)))

    #TODO: change editor...
    @editor = atom.workspace.getActiveTextEditor()


  deactivate: ->
    @modalPanel.destroy()
    @subscriptions.dispose()
    @imageInlineView.destroy()

  serialize: ->
    imageInlineViewState: @imageInlineView.serialize()

  updateCurrentEditor: (currentPaneItem) ->
    return if not currentPaneItem? or currentPaneItem is @editor
    @editor = currentPaneItem

  toggle: ->
    console.log 'ImageInline was toggled!'

    if @modalPanel.isVisible()
      @modalPanel.hide()
    else
      @modalPanel.show()


  showUnderCursor: () ->

    buffer = @editor.getBuffer()

    cursor = @editor.getLastCursor()
    row = cursor.getBufferRow()

    lineLength = buffer.lineLengthForRow(row)

    marker = @editor.markBufferPosition {
      row: row
      column: lineLength
    }, {
      invalidate: 'touch'
    }

    imageLocation = @findImageLocation()

    view = new ImageView(imageLocation)
    # view.spin(true)
    element = view.getElement()

    lineHeight = @editor.getLineHeightInPixels()
    topOffset = lineHeight
    element.setAttribute('style', "top: -#{topOffset}px;")
    # view.spinner.setAttribute('style',
            # "width: #{lineHeight + 2}px; height: #{lineHeight - 4}px;")

    @editor.decorateMarker marker, {
      type: 'overlay'
      item: element
      position: 'tail'
    }

    @markerBubbleMap[marker.id] = view
    marker.onDidChange (event) =>
      console.log event
      if not event.isValid
        view.destroy()
        marker.destroy()
        delete @markerBubbleMap[marker.id]

    return view



  parseImageLocation: (text) ->
    console.log(text)
    imageLocation = @getURL(text)
    if imageLocation == null
      #FIXME: for now just assume that you selected only a file path...
      # could at least check that file exists or something...
      imageLocation = text.trim()
      #try to parse selected text as md link
      mdLink = @parseMarkdownLink(imageLocation)
      if mdLink?
        imageLocation = mdLink.location
    console.log(imageLocation)

    imageLocation = path.normalize(imageLocation)

    if not path.isAbsolute(imageLocation)
      basePath = path.dirname @editor.getPath()
      imageLocation = path.resolve(basePath, imageLocation)

    try
      st = fs.statSync(imageLocation)
      if not st.isFile()
        throw new Error("no image at given location")
    catch error
      throw new Error("no image at given location")

    return imageLocation

  findImageLocation: ->
    # TODO: replace this with "search around" current cursor.
    # TODO: add way to just select all image elements and get path, add image
    text = @editor.getSelectedText()

    if text != ''
      # should maybe have error if you selected a range. could be annoying...
      selectedRange = @editor.getSelectedBufferRange()
      # image link should not be on more than one row...
      if selectedRange.start.row != selectedRange.end.row
        #error probably just do nothing...
        console.log "Selected more than one row, aborting"
        return
    else
      cursor = @editor.getLastCursor()
      # which row is this? make sure you ignore soft-wrap
      row = cursor.getBufferRow()
      buffer = @editor.getBuffer()
      if buffer.isRowBlank(row) or @editor.languageMode.isLineCommentedAtBufferRow(row)
        return

      text = buffer.getTextInRange(
        start:
          row: row
          column: 0
        end:
          row: row
          column: 9999999)

    return @parseImageLocation(text)


  getURL: (text) ->
    # pull a url out of a line of text
    pattern = ///
      (https?:\/\/)?                              # protocol (optional)
      ((([a-z\d]([a-z\d-]*[a-z\d])*)\.)+[a-z]{2,}| # domain name
      ((\d{1,3}\.){3}\d{1,3}))                     # OR ip (v4) address
      (\:\d+)?(\/[-a-z\d%_.~+]*)*                  # port and path
      (\?[;&a-z\d%_.~+=-]*)?                       # query string
      (\#[-a-z\d_]*)?$                             # fragment locater
    ///
    result =  text.match(pattern)
    if result?
      return result[0]
    else
      return null

  parseMarkdownLink: (text) ->
    # get the link part from  a markdown image link text
    pattern = /\[([^\[]+)\]\(([^\)]+)\)/

    result = pattern.exec(text)
    if result == null
      return
    imageDescription = result[1]
    imageLocation = result[2]
    return {location: imageLocation, description: imageDescription}
