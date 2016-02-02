define(['pamm/pamm_mod'], function(pammMod) {
  var Collection = function(context, path) {
    this.context = context
    this.path = path
    this.identifier = 'com.wondible.pa.pamm.' + context
    this.mods = []
    this.active = {mount_order: []}
  }

  Collection.prototype.addModinfo = function(path) {
    var my = this
    $.get('coui:/'+path).then(function(info) {
      if (info.context != my.context) {
        console.error(info.identifier, path, 'wrong mod context')
        return
      }
      info.installpath = path
      my.mods.push(info)
      //console.log(info.identifier)
    }, function(err) {
      console.error(path, 'not found', err)
    })
  }

  Collection.prototype.loadActiveMods = function(path) {
    var my = this
    $.get('coui:/'+path).then(function(mods) {
      my.active = mods
      my.active.mount_order = my.active.mount_order.filter(function(id) {
        if (id == 'com.pa.deathbydenim.dpamm') {
          return false
        } else if (id == 'com.pa.raevn.rpamm') {
          return false
        } else {
          return true
        }
      })
      if (my.active.mount_order.indexOf(my.identifier) == -1) {
        my.active.mount_order.push(my.identifier)
      }
    }, function(err) {
      console.error(my.path, 'not found', err)
    })
  }

  Collection.prototype.registerMods = function(paths) {
    var my = this
    paths.forEach(function(path) {
      if (path.match(/mods.json$/)) {
        my.loadActiveMods(path)
        return
      }
      api.file.list(path).then(function(top) {
        for (var i in top) {
          if (top[i].match(/modinfo.json$/)) {
            my.addModinfo(top[i])
            return
          }
        }
        console.warn(path, 'had no modinfo')
      }, function(err) {
        console.warn(path, 'could not be listed', err)
      })
    })
  }

  Collection.prototype.scan = function() {
    var my = this
    my.mods = []
    api.file.list(my.path).then(function(paths) {
      my.registerMods(paths)
    }, function(err) {
      console.error(my.context, 'could not be listed', err)
    })
  }

  Collection.prototype.activate = function(identifier) {
    var my = this
    my.active.mount_order.push(identifier)
    my.write()
  }

  Collection.prototype.enabledMods = function() {
    var my = this
    var active = []
    my.active.mount_order.forEach(function(id) {
      for (var i in my.mods) {
        if (my.mods[i].identifier == id) {
          active.push(my.mods[i])
          return
        }
      }
    })

    return active
  }

  Collection.prototype.write = function() {
    var my = this
    api.file.mountMemoryFiles(pammMod(my))
    api.content.remount()
  }

  return Collection
})
