define([
  'pamm/pamm_mod',
  'pamm/file'
], function(pammMod, file) {
  "use strict";

  var Collection = function(context, path) {
    this.context = context
    this.path = path
    this.identifier = 'com.wondible.pa.pamm.' + context
    this.mods = []
    this.enabled = []
    this.mounts = {}
  }

  Collection.prototype.allowed = function(mods) {
    var my = this
    return mods.filter(function(info) {
      if (info.identifier == my.identifier) {
        console.log(info.identifier, info.installpath || info.zippath, 'should not manage myself')
        return false
      } else if (info.context != my.context) {
        console.error(info.identifier, info.installpath || info.zippath, 'wrong mod context')
        return false
      } else {
        return true
      }
    })
  }

  Collection.prototype.injest = function(mods) {
    var my = this
    my.mods = my.mods.concat(my.allowed(mods))
    var promise = engine.createDeferred()
    promise.resolve(my)
    return promise
  }

  var exclude = [
    'com.wondible.pa.pamm.client',
    'com.wondible.pa.pamm.server',
    'com.pa.deathbydenim.dpamm',
    'com.pa.raevn.rpamm',
    'com.pa.pamm.server',
  ]

  Collection.prototype.enable = function(identifiers) {
    var my = this
    if (!Array.isArray(identifiers)) identifiers = [identifiers]
    identifiers.forEach(function(id) {
      if (exclude.indexOf(id) == -1 && my.enabled.indexOf(id) == -1) {
        my.enabled.push(id)
      }
    })
    var promise = engine.createDeferred()
    promise.resolve(true)
    return promise
  }

  Collection.prototype.enabledIdentifiers = function() {
    var my = this
    if (my.enabled.length < 1) {
      return []
    } else if (my.context == 'client') {
      return my.enabled.concat([my.identifier])
    } else {
      return [my.identifier].concat(my.enabled)
    }
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

  Collection.prototype.updateMounts = function() {
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

  Collection.prototype.write = function() {
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

  Collection.prototype.serialize = function() {
    var my = this
    return {
      mods: my.mods,
      enabled: my.enabled,
      mounts: my.mounts,
    }
  }

  Collection.prototype.deserialize = function(state) {
    //console.log('deser', state)
    var my = this
    my.mods = []
    my.injest(state.mods)
    my.enabled = []
    my.enable(state.enabled)
    my.mounts = state.mounts || {}
  }

  Collection.prototype.engineEnabled = function() {
    var my = this
    api.mods.getMountedMods(my.context, function(mods) {
      console.log(['--', my.context, '--'])
      mods.forEach(function(mod) {
        console.log(mod.identifier)
      })
    })
  }

  Collection.prototype.installed = function() {
    var my = this
    console.log(['--', my.context, '--'])
    my.mods.forEach(function(mod) {
      console.log(mod.identifier)
    })
  }

  return Collection
})
