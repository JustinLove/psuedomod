define([], function() {
  "use strict";

  var Scan = function() {
    this.mods = []
    this.enabled = []
    this.pending = 0
    this.promise = engine.createDeferred()
  }

  Scan.prototype.addModinfo = function(path) {
    var my = this
    my.pending++
    $.get('coui:/'+path).then(function(info) {
      info.installedPath = path
      my.mods.push(info)
      //console.log(info.identifier)
      my.resolve()
    }, function(err) {
      console.error(path, 'not found', err)
      my.resolve()
    })
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
      my.pending++
      api.file.list(path).then(function(top) {
        if (top.length < 1) {
          my.resolve()
          return
        }
        for (var i in top) {
          if (top[i].match(/modinfo.json$/)) {
            my.addModinfo(top[i])
            my.resolve()
            return
          }
        }
        console.warn(path, 'had no modinfo')
        my.resolve()
      }, function(err) {
        console.warn(path, 'could not be listed', err)
        my.resolve()
      })
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
