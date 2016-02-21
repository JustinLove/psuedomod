define([
  'pamm/mod_set',
  'pamm/download',
  'pamm/fix_paths',
], function(ModSet, download, fix_paths) {
  "use strict";

  var registryUrl = 'https://palobby.com/api/mods/'
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

  var removeOtherFile = function(mod, filename) {
    var installed = api.pamm.find([mod.identifier]).forEach(function(installed) {
      if (installed.zipPath != '/download/'+filename) {
        api.download.delete(installed.zipPath.replace('/download/', ''))
        delete installed.zipPath
      }
    })
  }

  ModSet.prototype.setInstall = function() {
    this.forEach(function(mod) {
      if (!mod.url) {
        console.error(mod.identifier, 'has no url to install')
        return
      }
      return download.fetch(mod.url, mod.identifier + '.zip').then(function(status) {
        removeOtherFile(mod, status.file)
        return fix_paths(status.file)
      })
    })
    return this
  }

  ModSet.prototype.setUninstall = function() {
    this.setDisable().forEach(function(mod) {
      if (!mod.zipPath) {
        console.error(mod.identifier, 'has no zip to uninstall')
        return
      }
      api.download.delete(mod.zipPath.replace('/download/', ''))
      delete mod.zipPath
    })
    return this
  }

  return available
})
