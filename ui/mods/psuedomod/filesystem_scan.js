define(['pamm/unit_list'], function(unitList) {
  "use strict";

  var Scan = function() {
    this.mods = []
    this.enabled = []
    this.pending = 0
    this.promise = engine.createDeferred()
  }

  Scan.prototype.addModinfo = function(path, paPath) {
    var my = this
    my.pending++
    $.get('coui:/'+path).then(function(info) {
      info.installedPath = path
      my.mods.push(info)
      //console.log(info.identifier)
      if (paPath && !info.unit_list) my.checkForUnitList(paPath, info)
      my.resolve()
    }, function(err) {
      console.error(path, 'not found', err)
      my.resolve()
    })
  }

  Scan.prototype.checkForUnitList = function(path, info) {
    var my = this
    my.pending++
    api.file.list(path, true).then(function(pa) {
      if (pa.length < 1) {
        my.resolve()
        return
      }
      for (var i in pa) {
        if (pa[i].match(/unit_list.json$/)) {
          console.log(path, 'found unit list')
          my.loadUnitList(pa[i], info)
          my.resolve()
          return
        }
      }
      my.resolve()
    }, function(err) {
      console.error(path, 'error listing path we found')
      my.resolve()
    })
  }

  Scan.prototype.loadUnitList = function(path, info) {
    var my = this
    unitList.load()
    my.pending++
    $.get('coui:/'+path).then(function(list) {
      if (list && list.units) {
        my.pending++
        unitList.load().then(function(master) {
          info.unit_list = my.diffUnitList(list, master)
          my.resolve()
        }, function(err) {
          console.error(path, 'master unit list could not be loaded')
          my.reject(err)
        })
      }
      my.resolve()
    }, function(err) {
      console.error(path, 'could not be loaded')
      my.reject(err)
    })
  }

  Scan.prototype.diffUnitList = function(list, master) {
    return {
      add_units: _.difference(list.units, master.units),
      remove_units: _.difference(master.units, list.units),
    }
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
        var paPath
        for (var i in top) {
          if (top[i].match('/pa/')) {
            paPath = top[i]
            break
          }
        }
        for (var i in top) {
          if (top[i].match(/modinfo.json$/)) {
            my.addModinfo(top[i], paPath)
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
