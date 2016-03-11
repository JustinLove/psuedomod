define([
  'pamm/pamm_mod',
  'pamm/file',
  'pamm/promise',
], function(pammMod, file, Promise) {
  "use strict";

  var Context = function(mods, context, path) {
    this.context = context
    this.identifier = 'com.wondible.pa.pamm.' + context
    this.myPath = this.identifier
    this.collectionPath = path
    this.mountPoint = path
    this.modsPath = ''
    this.mods = mods.sort()
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

  Context.prototype.write = function(extensions) {
    var my = this
    console.log(my.context, 'mods', 'enabled', my.mods.length)
    var files = pammMod(my)
    return Promise.all((extensions||[]).map(function(ex) {
      return ex(my, files)
    })).then(function() {
      return file.zip.create(files, my.identifier+'.zip').then(function(status) {
        my.mounts = my.mods.getMounts(my.collectionPath)
        my.mounts['/download/' + status.file] = my.mountPoint
        return my
      }, function(err) {
        console.log('zip failed', err)
        return err
      })
    }, function(err) {
      console.log('pamm mod creation failed', err)
      return err
    })
  }

  return Context
})
