define([
  'pamm/pamm',
  'pamm/mod_set',
], function(
  pamm,
  ModSet
) {
  "use strict";

  pamm.contextEnabled = function(context) {
    api.mods.getMounted(context).then(function(info) {
      console.log('-- ' + context + ' --')
      info.mounted_mods.forEach(function(mod) {
        console.log(mod.identifier)
      })
    })
  }

  pamm.engineEnabled = function() {
    pamm.contextEnabled('client')
    pamm.contextEnabled('server')
  }

  pamm.stressTest = function(start, n) {
    pamm.available.load().then(function() {
      start = start || 0
      n = n || 1
      var work = pamm.available.serialize().slice(start, start+n)
      var nextMod = function() {
        var mod = work.pop()
        console.log('nextmod', mod && mod.url)
        if (mod) {
          new ModSet([mod]).setInstall().always(nextMod)
        }
      }
      nextMod()
    })
  }

  pamm.reinstallAll = function() {
    installed.load().then(function() {
      var reinstallable = installed.zip()
      console.log(reinstallable.getIdentifiers())
      reinstallable.setUninstall().then(function() {
        pamm.available.load().then(function() {
          pamm.available.find(reinstallable.getIdentifiers()).withDependencies().setInstall()
        })
      })
    })
  }

  return pamm
})
