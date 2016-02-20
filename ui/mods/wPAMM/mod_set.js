define([], function() {
  "use strict";

  // ---------------- set methods -------------

  var ModSet = function ModSet(mods) {
    this.length = 0
    this.merge(mods || [])
  }

  ModSet.prototype.clear = function() {
    for (var i = 0;i < this.length;i++) {
      delete this[i]
    }
    this.length = 0
    return this
  }

  ModSet.prototype.merge = function(mods) {
    var len = mods.length
    var from = 0
    var to = this.length
    for (;from < len;from++,to++) {
      this[to] = mods[from]
    }
    this.length = this.length + len
    return this
  }

  ModSet.prototype.forEach = Array.prototype.forEach

  ModSet.prototype.splice = Array.prototype.splice

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

  ModSet.prototype.filesystem = function() {
    return this.filter(function(mod) {return mod.installpath})
  }

  ModSet.prototype.zip = function() {
    return this.filter(function(mod) {return mod.zippath})
  }

  ModSet.prototype.find = function(identifiers) {
    if (!Array.isArray(identifiers)) identifiers = [identifiers]
    return this.filter(function(mod) {
      return identifiers.indexOf(mod.identifier) != -1
    })
  }

  ModSet.prototype.deserialize = function(state) {
    return this.clear().merge(state)
  }

  // ---------------- accessors -------------

  ModSet.prototype.serialize = function() {
    return Array.prototype.slice.call(this)
  }

  ModSet.prototype.map = Array.prototype.map

  ModSet.prototype.getIdentifiers = function() {
    return this.map(function(mod) {return mod.identifier})
  }

  ModSet.prototype.getMounts = function(path) {
    var mounts = {}
    this.zip().forEach(function(mod) {
      //console.log('will mount ', my.mods[i].zippath)
      mounts[mod.zippath] = path
    })
    return mounts
  }

  // ---------------- actions -------------

  var neverEnable = [
    'com.pa.deathbydenim.dpamm',
    'com.pa.raevn.rpamm',
    'com.pa.pamm.server',
  ]

  var neverDisable = [
    'com.wondible.pa.pamm.client',
    'com.wondible.pa.pamm.server',
  ]

  ModSet.prototype.setEnable = function() {
    this.forEach(function(mod) {
      if ((mod.installpath || mod.zippath)
          && neverEnable.indexOf(mod.identifier) == -1) {
        mod.enabled = true
      }
    })
    return this
  }

  ModSet.prototype.setDisable = function() {
    this.forEach(function(mod) {
      if (neverDisable.indexOf(mod.identifier) == -1) {
        mod.enabled = false
      }
    })
    return this
  }

  return ModSet
})
