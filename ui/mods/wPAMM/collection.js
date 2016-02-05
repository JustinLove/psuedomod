define([
  'pamm/scan',
  'pamm/pamm_mod',
  'pamm/file'
], function(Scan, pammMod, file) {
  var Collection = function(context, path) {
    this.context = context
    this.path = path
    this.identifier = 'com.wondible.pa.pamm.' + context
    this.mods = []
    this.enabled = []
  }

  var inContext = function(context, mods) {
    return mods.filter(function(info) {
      if (info.context != context) {
        console.error(info.identifier, info.installPath, 'wrong mod context')
        return false
      } else {
        return true
      }
    })
  }

  var editEnabled = function(identifier, enabled) {
    if (enabled.indexOf(identifier) == -1) {
      enabled.push(identifier)
    }
    return enabled.filter(function(id) {
      if (id == 'com.pa.deathbydenim.dpamm') {
        return false
      } else if (id == 'com.pa.raevn.rpamm') {
        return false
      } else if (id == 'com.pa.pamm.server') {
        return false
      } else {
        return true
      }
    })
  }

  Collection.prototype.scan = function() {
    var my = this
    return new Scan().scan(my.path).then(function(scan) {
      my.mods = inContext(my.context, scan.mods)
      my.enabled = editEnabled(my.identifier, scan.enabled)
      console.log(my.context, 'found', my.mods.length, 'enabled', my.enabled.length)
      return scan
    })
  }

  Collection.prototype.enable = function(identifier) {
    var my = this
    my.enabled.push(identifier)
    my.write()
  }

  Collection.prototype.enabledMods = function() {
    var my = this
    var enabled = []
    my.enabled.forEach(function(id) {
      for (var i in my.mods) {
        if (my.mods[i].identifier == id) {
          enabled.push(my.mods[i])
          return
        }
      }
    })

    return enabled
  }

  Collection.prototype.write = function() {
    var my = this
    var files = pammMod(my)

    // what we wanted
    //api.file.mountMemoryFiles(files)
    //api.content.remount()

    // what we have
    file.mountZippedFiles(files, my.identifier+'.zip', '/')
  }
  return Collection
})
