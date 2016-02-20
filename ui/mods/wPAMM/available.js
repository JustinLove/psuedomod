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

  var removeOtherFile = function(mod, filename) {
    var installed = api.pamm.find([mod.identifier]).forEach(function(installed) {
      if (installed.zippath != '/download/'+filename) {
        api.download.delete(installed.zippath.replace('/download/', ''))
        delete installed.zippath
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
      if (!mod.zippath) {
        console.error(mod.identifier, 'has no zip to uninstall')
        return
      }
      api.download.delete(mod.zippath.replace('/download/', ''))
      delete mod.zippath
    })
    return this
  }

  return available
})
