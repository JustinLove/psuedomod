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
    this.enabled = [this.identifier]
    this.mounts = {}
  }

  var inContext = function(context, mods) {
    return mods.filter(function(info) {
      if (info.context != context) {
        console.error(info.identifier, info.installpath || info.zippath, 'wrong mod context')
        return false
      } else {
        return true
      }
    })
  }

  Collection.prototype.injest = function(mods) {
    var my = this
    my.mods = my.mods.concat(inContext(my.context, mods))
    return engine.createDeferred().resolve(my)
  }

  var exclude = [
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
    return engine.createDeferred().resolve(true)
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
    console.log(my.context, 'found', my.mods.length, 'enabled', my.enabled.length)
    var files = pammMod(my)
    return file.zip.create(files, my.identifier+'.zip').then(function(status) {
      my.mounts['/download/' + status.file] = '/'
      my.persist()
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
    my.mods = state.mods
    my.enabled = state.enabled
    my.mounts = state.mounts
  }

  Collection.prototype.persist = function() {
    var my = this
    return api.memory.store(my.identifier, encode(my.serialize()))
  }

  Collection.prototype.load = function() {
    var my = this
    return api.memory.load(my.identifier).then(function(string) {
      string = null
      if (string) {
        my.deserialize(decode(string))
      }
      return my
    }, function(err) {
      console.log('memory fail?', err)
      return err
    })
  }

  return Collection
})
