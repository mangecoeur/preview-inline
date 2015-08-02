fs = require 'fs'
path = require 'path'
{CompositeDisposable, Range, Point} = require 'atom'

ImageView = require './image-view'
MathView = require './math-view'
scopeTools = require './scope-tools'

# {allowUnsafeEval, allowUnsafeNewFunction} = require 'loophole'
# allowUnsafeNewFunction ->
# mjAPI = require("../node_modules/MathJax-node/lib/mj-single.js")

# next
# TODO: show all image or math previews for current document


# TODO: support other languages that have math scopes
# TODO: scope to markdown files
# TODO: add MathJax fallback
# TODO instead of specific markdown scope selectors, use lang:selector map
# TODO Live update of maths as you type with small delay
# TODO: make possible show images in block in text
# FIXME: make it so the image preview aligns correctly with soft-wrap lines

urlPattern = ///
  ^((https?:\/\/)                              # protocol (optional)
  ((([a-z\d]([a-z\d-]*[a-z\d])*)\.)+[a-z]{2,}| # domain name
  ((\d{1,3}\.){3}\d{1,3}))                     # OR ip (v4) address
  (\:\d+)?(\/[-a-z\d%_.~+]*)*                  # port and path
  (\?[;&a-z\d%_.~+=-]*)?                       # query string
  (\#[-a-z\d_]*)?$)                             # fragment locater
///gi

module.exports = PreviewInline =
  config:
    scope:
      type: 'array'
      default: ['.source.gfm']
      items:
        type: 'string'
  mathBlockScopes: ['markup.math.block',
                  'markup.raw.gfm',
                  'markup.code.latex.gfm']
  mathInlineScopes: ['markup.math.inline']
  imageScopes: ["markup.underline.link.gfm"]
  subscriptions: null
  markerBubbleMap: {}

  activate: (state) ->
    @subscriptions = new CompositeDisposable

    # Register command that toggles this view
    @subscriptions.add atom.commands.add 'atom-workspace',
        'preview-inline:show': => @showPreview()
        'preview-inline:clear': => @clearPreviews()

    @subscriptions.add(atom.workspace.observeActivePaneItem(
      @updateCurrentEditor.bind(this)))

    @editor = atom.workspace.getActiveTextEditor()

  deactivate: ->
    @subscriptions.dispose()
    @clearPreviews()

  serialize: ->
    # imageInlineViewState: @imageInlineView.serialize()

  updateCurrentEditor: (currentPaneItem) ->
    return if not currentPaneItem? or currentPaneItem is @editor

    @editor = currentPaneItem

  clearPreviews: ->
    for markerId, bubble of @markerBubbleMap
      bubble.destroy()
    @markerBubbleMap = {}

  clearBubblesOnRow: (row) ->
    buffer = @editor.getBuffer()
    for marker in buffer.findMarkers({endRow: row})
      if @markerBubbleMap[marker.id]?
        @markerBubbleMap[marker.id].destroy()
        delete @markerBubbleMap[marker.id]

  showPreview: () ->
    rootScope = @editor.getRootScopeDescriptor()

    if not scopeTools.scopeIn(rootScope.toString(), atom.config.get("preview-inline.scope"))
      return

    buffer = @editor.getBuffer()
    cursor = @editor.getLastCursor()

    row = cursor.getBufferRow()
    lineLength = buffer.lineLengthForRow(row)

    text = @editor.getSelectedText()

    if text != ''
      view = @viewForSelectedText(text)
      range = @editor.getSelectedBufferRange()

    # TODO: allow you to define a set of languages that support this method
    else
      scope = cursor.getScopeDescriptor()

      if scopeTools.scopeContainsOne(scope, @mathBlockScopes.concat(@mathInlineScopes)) != false
        result = @getMathAroundCursor(cursor)

        if result?
          range = result.range
          view = new MathView(result.text)
          @addMathView(view, range, result.isBlock)
          return
        else
          atom.notifications.addWarning("Could not find math at cursor")
          return

      else if scopeTools.scopeContainsOne(scope, ["markup.underline.link.gfm"])
        result = @getTextForScope(".markup.underline.link.gfm")
        range = result.range
        range.start.column = 0
        try
          view = @mdImageView(result.text)
        catch error
          atom.notifications.addWarning(error.message)
          return
      else
        atom.notifications.addWarning("Could not find anything to preview at cursor")
        return

    @clearBubblesOnRow(range.end.row)


    marker = @editor.markBufferPosition {
      row: range.end.row
      column: range.start.column
    }, {
      invalidate: 'touch'
    }

    @editor.decorateMarker marker, {
      type: 'overlay'
      item: view
      position: 'tail'
    }


    # TODO: maybe use subscriptions here instead
    @markerBubbleMap[marker.id] = view
    marker.onDidChange (event) =>
      if not event.isValid
        view.destroy()
        delete @markerBubbleMap[marker.id]
        marker.destroy()

    # clean up the marker when the bubble is closed
    view.onClose (event) =>
      delete @markerBubbleMap[marker.id]
      marker.destroy()

  addMathView: (view, range, isBlock) ->

    @clearBubblesOnRow(range.end.row)

    mathContent = @editor.markBufferRange range, {
      invalidate: 'overlap'
    }

    @editor.decorateMarker mathContent, {
      type: 'highlight'
      # item: view
      # position: 'head'
      # class:'highlight-green'
    }

    markRow = if isBlock
      range.end.row + 1
    else
      range.start.row

    # markCol = if isBlock

    marker = @editor.markBufferRange [{
      row: markRow
      column: range.start.column
    },{
      row: markRow
      column: range.start.column + 1
    }], {
      invalidate: 'overlap'
    }

    @editor.decorateMarker marker, {
      type: 'overlay'
      item: view
      position: 'tail'
    }

    # TODO: maybe use subscriptions here instead
    @markerBubbleMap[marker.id] = view
    marker.onDidChange (event) =>
      if not event.isValid
        view.destroy()
        delete @markerBubbleMap[marker.id]
        marker.destroy()

    # clean up the marker when the bubble is closed
    view.onClose (event) =>
      delete @markerBubbleMap[marker.id]
      marker.destroy()

  mdImageView: (text) ->
    # by default the gfm selection starts/ends with brakets, remove
    pattern = /\((.*)\)/
    result = pattern.exec(text)
    if result == null
      throw new Error("Regex match failed")
    linkURL = result[1]

    linkURL = @parseImageLocation(linkURL,
                                  path.dirname(@editor.getPath()))
    view = new ImageView(linkURL)
    return view

  getTextForScope: (scopeString) ->
    buffer = @editor.getBuffer()
    range = @editor.bufferRangeForScopeAtCursor(scopeString)
    if range?
      return text: buffer.getTextInRange(range), range: range
    else
      throw new Error('no matching scope under cursor')

  getMathInline: (scopeString) ->
    range = @editor.bufferRangeForScopeAtCursor(scopeString)
    text = @editor.getBuffer().getTextInRange(range)
    pattern = /\$(.*)\$/
    result = pattern.exec(text)
    if result == null
      throw new Error("Regex match failed")
    text = result[1]
    return text: text, range: range, isBlock: false

  getMathBlock: (scopeString) ->
    range = @editor.bufferRangeForScopeAtCursor(scopeString)
    buffer = @editor.getBuffer()
    text = buffer.getTextInRange(range)

    minRow = range.start.row
    maxRow = range.end.row
    curScope = scopeString
    curPos = [minRow, 0]

    while scopeTools.scopeContains(curScope, scopeString)
      minRow = minRow - 1
      curPos = [minRow, 0]
      curScope = @editor.scopeDescriptorForBufferPosition(curPos)
      line = @editor.lineTextForBufferRow(minRow)

    curScope = scopeString
    curPos = [maxRow, 0]

    while scopeTools.scopeContains(curScope, scopeString)
      maxRow = maxRow + 1
      curPos = [maxRow, 0]
      curScope = @editor.scopeDescriptorForBufferPosition(curPos)
      line = @editor.lineTextForBufferRow(minRow)

    range = new Range(new Point(minRow + 2, 0), new Point(maxRow - 2 , 9999 ))

    text = buffer.getTextInRange(range)

    return text: text, range: range, isBlock: true

  getMathAroundCursor: (cursor) ->
    scope = cursor.getScopeDescriptor()

    scopeString = scopeTools.scopeContainsOne(scope, @mathInlineScopes)
    if scopeString
      return @getMathInline(scopeString)
    else
      scopeString = scopeTools.scopeContainsOne(scope, @mathBlockScopes)
      if scopeString
        @getMathBlock(scopeString)
      else
        return null

  viewForSelectedText: (text) ->
    try
      url = @getURL(text)
      return new ImageView(url)
    catch error
      try
        return new MathView(text)
      catch error
        atom.notifications.addError(error.message)

  findImageLocation: ->
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
    result =  text.match(urlPattern)
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
