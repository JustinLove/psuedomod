define([
  'pamm/mod_set',
  'pamm/download',
  'pamm/lib/ba-issemver',
  'pamm/palobby',
  'pamm/mereth',
  'pamm/promise',
], function(ModSet, download, isSemVer, palobby, mereth, Promise) {
  "use strict";

  var cache = 'available_mods.json'

  var sources = [
    palobby,
    mereth,
  ]

  var available = new ModSet()

  var refreshAll = function() {
    return Promise.performAll(sources.map(function(s) {return s.refresh()}))
  }

  var loadAll = function() {
    return Promise.performAll(sources.map(function(s) {return s.load()}))
  }

  var byVersion = function(a, b) {
    if (isSemVer(a, '<'+b)) {
      return -1
    } else if (isSemVer(a, '>'+b)) {
      return 1
    } else {
      return 0
    }
  }

  var mashup = function(lists) {
    var mods = {}
    lists.forEach(function(list) {
      if (!list) return
      list.forEach(function(mod) {
        mods[mod.identifier] = mods[mod.identifier] || []
        mods[mod.identifier].push(mod)
      })
    })
    var best = Object.keys(mods).map(function(id) {
      var ordered = mods[id].sort(byVersion).reverse()
      return ordered[0]
    })
    return best
  }

  available.refresh = function() {
    return refreshAll().then(function() {
      return loadAll().then(mashup).then(function(mods) {
        return download.saveFile(JSON.stringify(mods, null, 2), cache)
      })
    })
  }

  available.load = function() {
    console.time('available.load')
    return Promise.wrap($.get('coui://download/'+cache)).then(function(mods) {
      available.deserialize(mods)
      console.timeEnd('available.load')
      return available
    })
  }

  return available
})
