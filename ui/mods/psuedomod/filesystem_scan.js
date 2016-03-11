define([
  'pamm/filesystem_mod',
  'pamm/promise',
], function(Mod, Promise) {
  "use strict";

  var Scan = function(extensions) {
    var my = this
    this.steps = (extensions || []).slice(0)
    this.steps.unshift(function(mod) {
      return mod.modinfo().then(function(info) {
        my.mods.push(info)
      })
    })
    this.mods = []
    this.enabled = []
    this.pending = 0
    this.promise = new Promise()
  }

  Scan.prototype.loadEnabledMods = function(path) {
    var my = this
    my.pending++
    $.get('coui:/'+path).then(function(mods) {
      my.enabled = mods.mount_order
      my.resolve()
    }, function(err) {
      console.error(path, 'not found', err)
      my.resolve()
    })
  }

  Scan.prototype.registerMods = function(paths) {
    var my = this
    paths.forEach(function(path) {
      if (path.match(/mods.json$/)) {
        my.loadEnabledMods(path)
        return
      }

      if (path[path.length-1] != '/') return

      var mod = new Mod(path)
      my.pending++
      Promise.performAll(my.steps.map(function(step) {
        return step(mod)
      })).always(function() {my.resolve()})
    })
  }

  Scan.prototype.scan = function(path) {
    var my = this
    my.mods = []
    my.pending++
    api.file.list(path).then(function(paths) {
      my.registerMods(paths)
      my.resolve()
    }, function(err) {
      console.error(path, 'could not be listed', err)
      my.reject(err)
    })

    return my.promise
  }

  Scan.prototype.resolve = function() {
    this.pending--
    if (this.pending < 1) this.promise.resolve(this)
  }

  Scan.prototype.reject = function(err) {
    this.pending--
    if (this.pending < 1) this.promise.reject(err)
  }

  return Scan
})
