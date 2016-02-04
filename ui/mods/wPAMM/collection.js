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

  Collection.prototype.scan = function() {
    var my = this
    var scan = new Scan(my.context)
    return scan.scan(my.path).then(function(scan) {
      my.mods = scan.mods
      my.enabled = scan.enabled
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
    file.mountZippedFiles(files, my.identifier+'.zip')
  }
  return Collection
})
