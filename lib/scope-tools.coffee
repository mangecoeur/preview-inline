arrayEqual = (a, b) ->
  a.length is b.length and a.every (elem, i) -> elem is b[i]

# Does the given scope match one of a list of scopes
scopeIn = (scope, scopeList) ->
  for matchScope in scopeList
    if scopeEqual(scope, matchScope)
      return true
  return false

scopeEqual = (scopeOne, scopeTwo) ->
  # TODO: handle mixed string/array scopes
  if typeof scopeOne is 'string' and typeof scopeTwo is 'string'
    return scopeOne == scopeTwo

  if scopeOne.getScopesArray?
    arrayOne = scopeOne.getScopesArray()
  else
    arrayOne = scopeOne  # how to copy?
  if scopeTwo.getScopesArray?
    arrayTwo = scopeTwo.getScopesArray()
  else
    arrayTwo = scopeTwo  # how to copy?

  return arrayEqual(arrayOne, arrayTwo)

scopeContainsOne = (scope, scopeList) ->
  for matchScope in scopeList
    if scopeContains(scope, matchScope)
      return matchScope
  return false

scopeContains = (outerScope, innerScope) ->
  if typeof outerScope is 'string' and typeof outerScope is 'string'
    return outerScope.includes(innerScope)

  if outerScope.getScopesArray?
    arrayOne = outerScope.getScopesArray()
  else
    arrayOne = outerScope

  if innerScope.getScopesArray?
    arrayTwo = innerScope.getScopesArray()
  else
    arrayTwo = innerScope

  if typeof arrayTwo is 'string'
    for oScope in arrayOne
      if oScope.includes(arrayTwo)
        return true
    return false


  for oScope in arrayOne
    for iScope in arrayTwo
      if oScope.includes(iScope)
        return true
  return false

module.exports.scopeEqual = scopeEqual
module.exports.scopeIn = scopeIn
module.exports.scopeContains = scopeContains
module.exports.scopeContainsOne = scopeContainsOne
