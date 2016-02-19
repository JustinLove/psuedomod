define([
  'pamm/pamm_mod',
  'pamm/file'
], function(pammMod, file) {
  "use strict";

  var Context = function(mods, context, path) {
    this.context = context
    this.path = path
    this.identifier = 'com.wondible.pa.pamm.' + context
    this.mods = mods
    this.mounts = {}
  }

  Context.prototype.enabledIdentifiers = function() {
    var my = this
    if (my.mods.length < 1) {
      return []
    } else if (my.context == 'client') {
      return my.mods.getIdentifiers().concat([my.identifier])
    } else {
      return [my.identifier].concat(my.mods.getIdentifiers())
    }
  }

  Context.prototype.enabledMods = function() {
    return this.mods
  }

  Context.prototype.updateMounts = function() {
    this.mounts = this.mods.getMounts(this.path)
    return this.mounts
  }

  Context.prototype.write = function() {
    var my = this
    console.log(my.context, 'mods', 'enabled', my.mods.length)
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

  return Context
})
