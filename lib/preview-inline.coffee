ImageView = require './image-view'
MathView = require './math-view'
{CompositeDisposable} = require 'atom'
scopeTools = require './scope-tools'

fs = require 'fs'
path = require 'path'
katex = require 'katex'

# {View} = require 'space-pen'
# {TextEditorView} = require 'atom-space-pen-views'

# TODOS for first release
# TODO: get maths from under cursor
# TODO: sort out bubble formatting to adjust image size and container size
# TODO: sort out bubble formatting to stretch to contain maths
# TODO: nice decorations - show close buttons on hover etc
# TODO: show all image or math previews for current document
# TODO: scope to markdown files

# TODOS for later
# TODO instead of specific markdown scope selectors, use lang:selector map
# TODO Live update of maths as you type with small delay
# TODO require MathJax
# TODO: add caption to MD image, only in case you HAVE an MD image
# TODO: make possible show images in block in text
# FIXME: make it so the image preview aligns correctly with soft-wrap lines
# - align with last screen space row
# FIXME: sort out image sizing, make dependent on position and window width.
# TODO: make responsive (is already partly so)


module.exports = PreviewInline =
  imageInlineView: null
  modalPanel: null
  subscriptions: null
  markerBubbleMap: {}

  activate: (state) ->
    console.log 'Loading preview-inline'
    # MathJax.typeset("x = \frac{1}{2}", (res) -> console.log res)
    @subscriptions = new CompositeDisposable

    # Register command that toggles this view
    @subscriptions.add atom.commands.add 'atom-workspace',
        'preview-inline:show': => @showUnderCursor()
        'preview-inline:show-math': => @showMath()

    # @subscriptions.add atom.commands.add 'atom-text-editor',
    #     'image-inline:show': => @showUnderCursor()

    @subscriptions.add(atom.workspace.observeActivePaneItem(
      @updateCurrentEditor.bind(this)))

    #TODO: change editor...
    @editor = atom.workspace.getActiveTextEditor()
    # console.log atom.views.getView(@editor)
    # console.log katex.render('x = \frac{1}{2}', atom.views.getView(@editor))


  deactivate: ->
    @subscriptions.dispose()
    @clearResultBubbles()
    # @imageInlineView.destroy()

  serialize: ->
    # imageInlineViewState: @imageInlineView.serialize()

  updateCurrentEditor: (currentPaneItem) ->
    return if not currentPaneItem? or currentPaneItem is @editor
    @editor = currentPaneItem

  clearResultBubbles: ->
    for markerId, bubble of @markerBubbleMap
      bubble.destroy()
    @markerBubbleMap = {}

  clearBubblesOnRow: (row) ->
    buffer = @editor.getBuffer()
    for marker in buffer.findMarkers({endRow: row})
      if @markerBubbleMap[marker.id]?
        @markerBubbleMap[marker.id].destroy()
        delete @markerBubbleMap[marker.id]

  markdownHandler: () ->
    #TODO: merge all of these handers
    buffer = @editor.getBuffer()
    rootScope = @editor.getRootScope()

    cursor = @editor.getLastCursor()
    row = cursor.getBufferRow()
    lineLength = buffer.lineLengthForRow(row)

    # TODO: allow you to define a set of languages that support this method
    if scopeTools.scopeEqual(rootScope.toString(), '.source.gfm')
      scope = cursor.getScopeDescriptor()
      if scopeTools.scopeContains(scope, 'markup.math')
        mathText = @getTextForScope(".markup.math")
        view = new MathView(mathText)
      else if scopeTools.scopeContains(scope, "markup.underline.link.gfm")
        linkText = @getTextForScope(".markup.underline.link.gfm")
        linkText = @parseImageLocation(linkText, path.dirname(@editor.getPath()))
        view = new ImageView(linkText)


      @clearBubblesOnRow(row)

      marker = @editor.markBufferPosition {
        row: row
        column: lineLength
      }, {
        invalidate: 'touch'
      }

      @editor.decorateMarker marker, {
        type: 'overlay'
        item: view.getElement()
        position: 'tail'
      }

      @markerBubbleMap[marker.id] = view
      marker.onDidChange (event) =>
        # console.log event
        if not event.isValid
          view.destroy()
          marker.destroy()
          delete @markerBubbleMap[marker.id]

  showMath: () ->
    #TODO get math text function
    # mathText = @getMathText()

    # TODO catch error, show notification if no text or not renderable
    mathText = @getMathUnderCursor()
    mathview = new MathView(mathText)
    element = mathview.getElement()

    # TODO can be common with showUnderCursor
    buffer = @editor.getBuffer()
    cursor = @editor.getLastCursor()
    row = cursor.getBufferRow()
    lineLength = buffer.lineLengthForRow(row)

    @clearBubblesOnRow(row)

    marker = @editor.markBufferPosition {
      row: row
      column: lineLength
    }, {
      invalidate: 'touch'
    }

    @editor.decorateMarker marker, {
      type: 'overlay'
      item: element
      position: 'tail'
    }


    @markerBubbleMap[marker.id] = mathview
    marker.onDidChange (event) =>
      console.log event
      if not event.isValid
        mathview.destroy()
        marker.destroy()
        delete @markerBubbleMap[marker.id]

  getTextForScope: (scopeString) ->
    buffer = @editor.getBuffer()
    range = @editor.bufferRangeForScopeAtCursor(scopeString)
    if range?
      return buffer.getTextInRange(range)
    else
      throw new Error('no markdown math scope under cursor')

  getMathUnderCursor: () ->
    #TODO: only handle non-MD case - probably requires using only selected txt
    text = @editor.getSelectedText()

    if text != ''
      # return the selected text if there is any. doesn't guarantee that it will all be math
      return @editor.getSelectedBufferRange()

      throw new Error('no math selected under cursor')


  showUnderCursor: () ->
    buffer = @editor.getBuffer()
    cursor = @editor.getLastCursor()
    row = cursor.getBufferRow()

    @clearBubblesOnRow(row)
    # @clearResultBubbles()

    lineLength = buffer.lineLengthForRow(row)

    marker = @editor.markBufferPosition {
      row: row
      column: lineLength
    }, {
      invalidate: 'touch'
    }

    try
      imageLocation = @findImageLocation()
    catch error
      # don't show the view if the image doesn't exist
      # TODO: maybe want to display as a placeholder
      console.warn  error
      atom.notifications.addWarning(error.message)
      return null


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
    return @parseImageLocation(text, path.dirname(@editor.getPath()))


  parseImageLocation: (text, basePath) ->

    #FIXME: for now just assume that you selected only a file path...
    # could at least check that file exists or something...
    imagePath = text.trim()
    #try to parse selected text as md link
    mdLink = @parseMarkdownLink(imagePath)
    if mdLink?
      imagePath = mdLink.location

    # imagePath = path.normalize(imagePath)
    if not path.isAbsolute(imagePath)
      if basePath?
        absPath = path.resolve(basePath, imagePath)
        try
          st = fs.statSync(absPath)
          if not st.isFile()
            imagePath = @getImageURL(imagePath)
          else
            imagePath = absPath
        catch error
          imagePath = @getImageURL(imagePath)
      else
        imagePath = @getImageURL(imagePath)
    else
      try
        st = fs.statSync(imagePath)
        if not st.isFile()
          throw new Error("no image " + imagePath)
      catch error
        throw new Error("no image " + imagePath)
    return imagePath

  checkFile: (filePath, onErr) ->
    try
      st = fs.statSync(filePath)
      if not st.isFile()
        onErr(filePath)
      else
        return filePath
    catch error
      onErr(filePath)

  getImageURL: (imagePath) ->
    try
      return @getURL(imagePath)
    catch error
      throw new Error("no image " + imagePath)

  getURL: (text) ->
    # pull a url out of a line of text
    pattern = ///
      ^((https?:\/\/)                              # protocol (optional)
      ((([a-z\d]([a-z\d-]*[a-z\d])*)\.)+[a-z]{2,}| # domain name
      ((\d{1,3}\.){3}\d{1,3}))                     # OR ip (v4) address
      (\:\d+)?(\/[-a-z\d%_.~+]*)*                  # port and path
      (\?[;&a-z\d%_.~+=-]*)?                       # query string
      (\#[-a-z\d_]*)?$)                             # fragment locater
    ///gi
    result =  text.match(pattern)
    if result?
      return result[0]
    else
      throw new Error('no URL in this text')

  parseMarkdownLink: (text) ->
    # get the link part from  a markdown image link text
    pattern = /\[([^\[]+)\]\(([^\)]+)\)/

    result = pattern.exec(text)
    if result == null
      return
    imageDescription = result[1]
    imageLocation = result[2]
    return {location: imageLocation, description: imageDescription}
