define([], function() {
  var Scan = function(context) {
    this.context = context
    this.identifier = 'com.wondible.pa.pamm.' + context
    this.mods = []
    this.enabled = []
    this.pending = 0
    this.promise = $.Deferred()
  }

  Scan.prototype.addModinfo = function(path) {
    var my = this
    my.pending++
    $.get('coui:/'+path).then(function(info) {
      if (info.context != my.context) {
        console.error(info.identifier, path, 'wrong mod context')
        my.resolve()
        return
      }
      info.installpath = path
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
      my.enabled = my.enabled.filter(function(id) {
        if (id == 'com.pa.deathbydenim.dpamm') {
          return false
        } else if (id == 'com.pa.raevn.rpamm') {
          return false
        } else {
          return true
        }
      })
      if (my.enabled.indexOf(my.identifier) == -1) {
        my.enabled.push(my.identifier)
      }
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
      my.pending++
      api.file.list(path).then(function(top) {
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
