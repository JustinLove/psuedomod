define(['pamm/filesystem_object', 'pamm/promise'], function(File, Promise) {
  "use strict";

  var Mod = function(root) {
    this.root = root
    this.path = root
    this.infoPromise
  }

  Mod.prototype.file = function(path) {
    var my = this
    var promise = new Promise()
    path = path.replace(/^\//, '')
    var match = path.match(/(^.*\/)?[^\/]+$/)
    if (match) {
      var dir = my.path + (match[1] || '')
    } else {
      promise.reject()
      return promise
    }
    list(dir).then(function(paths) {
      for (var i in paths) {
        if (paths[i] == my.path + path) {
          promise.resolve(new File(paths[i]))
          return
        }
      }
      promise.reject()
    })
    return promise
  }

  Mod.prototype.modinfo = function() {
    var my = this
    if (my.infoPromise) {
      return my.infoPromise
    }
    my.infoPromise = my.file('modinfo.json').then(function(file) {
      return file.asJson().then(function(info) {
        info.installedPath = my.root
        //console.log(info.identifier)
        return info
      }, function(err) {
        console.error(my.root, ' modinfo.json not found', err)
        return err
      })
    }, function(err) {
      console.warn(my.root, 'had no modinfo')
      return err
    })

    return my.infoPromise
  }

  var list = function(root, recurse) {
    var promise = new Promise()
    engine.call('file.list', String(root), !!recurse).then(function(files) {
      if (files && files !== '') {
        promise.resolve(JSON.parse(files))
      } else {
        promise.reject(root + ' is not listable')
      }
    });
    return promise
  }

  return Mod
})
