define([
  'pamm/mod_set',
  'pamm/download',
  'pamm/fix_paths',
], function(ModSet, download, fix_paths) {
  "use strict";

  var registryUrl = 'https://pamm-mereth.rhcloud.com/api/mod'
  //var url = registryUrl
  var url = 'coui://download/available_mods.json'

  var available = new ModSet()

  available.fix = fix_paths

  available.downloadAvailable = function() {
    api.download.start(registryUrl, 'available_mods.json')
  }

  available.load = function() {
    var promise = engine.createDeferred()
    $.get(url).then(function(mods) {
      available.deserialize(mods)
      promise.resolve(available)
    })
    return promise
  }

  ModSet.prototype.setInstall = function() {
    this.forEach(function(mod) {
      if (!mod.url) {
        console.error(mod.identifier, 'has no url to install')
        return
      }
      return download.fetch(mod.url, mod.identifier + '.zip').then(function(status) {
        return fix_paths(status.file)
      })
    })
  }

  return available
})
