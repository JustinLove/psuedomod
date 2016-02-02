define([], function() {
  var Collection = function(context, path) {
    this.context = context
    this.path = path
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
        console.error(path, 'could not be listed', err)
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
    var files = {}
    files[my.path + 'mods.json'] = JSON.stringify(my.active)
    api.file.mountMemoryFiles(files)
    api.content.remount()
  }

  return Collection
})
