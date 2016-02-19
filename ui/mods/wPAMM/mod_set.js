define([
  'pamm/pamm_mod',
  'pamm/file'
], function(pammMod, file) {
  "use strict";

  var ModSet = function ModSet(mods) {
    this.length = 0
    this.merge(mods || [])
  }

  ModSet.prototype.merge = function(mods) {
    var len = mods.length
    var from = 0
    var to = this.length
    for (;from < len;from++,to++) {
      this[to] = mods[from]
    }
    this.length = this.length + len
  }

  ModSet.prototype.forEach = Array.prototype.forEach

  ModSet.prototype.map = Array.prototype.map

  ModSet.prototype.splice = Array.prototype.splice

  ModSet.prototype.serialize = function() {
    return this.map(function(x) {return x})
  }

  ModSet.prototype.deserialize = function(state) {
    return this.merge(state)
  }

  ModSet.prototype.filter = function(f) {
    return new ModSet(Array.prototype.filter.call(this, f))
  }

  ModSet.prototype.enabled = function() {
    return this.filter(function(mod) {return mod.enabled})
  }

  ModSet.prototype.context = function(context) {
    return this.filter(function(mod) {return mod.context == context})
  }

  ModSet.prototype.client = function() {
    return this.context('client')
  }

  ModSet.prototype.server = function() {
    return this.context('server')
  }

  ModSet.prototype.find = function(identifiers) {
    if (!Array.isArray(identifiers)) identifiers = [identifiers]
    return this.filter(function(mod) {
      return identifiers.indexOf(mod.identifier) != -1
    })
  }

  ModSet.prototype.identifiers = function() {
    return this.map(function(mod) {return mod.identifier})
  }

  var exclude = [
    'com.wondible.pa.pamm.client',
    'com.wondible.pa.pamm.server',
    'com.pa.deathbydenim.dpamm',
    'com.pa.raevn.rpamm',
    'com.pa.pamm.server',
  ]

  ModSet.prototype.enable = function() {
    this.forEach(function(mod) {
      if (exclude.indexOf(mod.identifier) == -1) {
        mod.enabled = true
      }
    })
    return this
  }

  ModSet.prototype.disable = function() {
    this.forEach(function(mod) {
      if (exclude.indexOf(mod.identifier) == -1) {
        mod.enabled = false
      }
    })
    return this
  }

  /*
  ModSet.prototype.enabledIdentifiers = function() {
    var my = this
    if (my.enabled.length < 1) {
      return []
    } else if (my.context == 'client') {
      return my.enabled.concat([my.identifier])
    } else {
      return [my.identifier].concat(my.enabled)
    }
  }

  ModSet.prototype.enabledMods = function() {
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

  ModSet.prototype.updateMounts = function() {
    var my = this
    my.mounts = {}
    my.enabled.forEach(function(id) {
      for (var i in my.mods) {
        if (my.mods[i].identifier == id && my.mods[i].zippath) {
          console.log('will mount ', my.mods[i].zippath)
          my.mounts[my.mods[i].zippath] = my.path
          return
        }
      }
    })
  }

  ModSet.prototype.write = function() {
    var my = this
    console.log(my.context, 'mods', my.mods.length, 'enabled', my.enabled.length)
    var files = pammMod(my)
    return file.zip.create(files, my.identifier+'.zip').then(function(status) {
      my.updateMounts()
      my.mounts['/download/' + status.file] = my.path
      return my
    }, function(err) {
      console.log('zip failed', err)
      return err
    })
  }

  ModSet.prototype.serialize = function() {
    var my = this
    return {
      mods: my.mods,
      enabled: my.enabled,
      mounts: my.mounts,
    }
  }

  ModSet.prototype.deserialize = function(state) {
    //console.log('deser', state)
    var my = this
    my.mods = []
    my.injest(state.mods)
    my.enabled = []
    my.enable(state.enabled)
    my.mounts = state.mounts || {}
  }

  ModSet.prototype.engineEnabled = function() {
    var my = this
    api.mods.getMountedMods(my.context, function(mods) {
      console.log(['--', my.context, '--'])
      mods.forEach(function(mod) {
        console.log(mod.identifier)
      })
    })
  }

  ModSet.prototype.installed = function() {
    var my = this
    console.log(['--', my.context, '--'])
    my.mods.forEach(function(mod) {
      console.log(mod.identifier)
    })
  }
  */

  return ModSet
})
