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
    this.mounts = {}
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
    }, function(err) {
      console.log('scan failed', err)
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
    file.zip.create(files, my.identifier+'.zip').then(function(status) {
      my.mounts['/download/' + status.file] = '/'
      my.mount()
    }, function(err) {
      console.log('zip failed', err)
    })
  }

  Collection.prototype.mount = function() {
    var my = this
    var promises = []
    _.each(my.mounts, function(root, zip) {
      promises.push(api.file.zip.mount(zip, root))
    })
    $.when.apply($, promises).then(function() {
      api.content.remount()
      console.log('mounted')
    })
  }

  return Collection
})
