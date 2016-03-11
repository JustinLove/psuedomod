define([
  'pamm/download_mod',
  'pamm/file',
  'pamm/promise',
], function(Mod, file, Promise) {
  "use strict";

  var Scan = function(extensions) {
    var my = this
    this.steps = (extensions || []).slice(0)
    this.steps.unshift(function(mod) {
      return mod.modinfo().then(function(info) {
        my.mods.push(info)
      })
    })
    this.mods = []
    this.enabled = []
    this.pending = 0
    this.promise = new Promise()
  }

  Scan.prototype.loadEnabledMods = function(file) {
    var my = this
    try {
      var mods = JSON.parse(file.asText())
      my.enabled = my.enabled.concat(mods.mount_order)
    } catch(e) {
      console.error('failed to parse mods.json', file.name)
      //console.log(file.asText())
    }
  }

  Scan.prototype.examineZip = function(filename, zip) {
    //console.log(filename, zip)

    var my = this
    var mods = zip.file('mods.json')
    if (mods) {
      my.loadEnabledMods(mods)
    } else {
      mods = zip.file(/mods.json$/)
      if (mods.length > 0) {
        console.warn(filename, mods.length, 'possible misplaced mods.json')
        mods.forEach(function(file) {console.log('', file.name)})
      }
    }

    var mod = new Mod(zip, filename)
    my.pending++
    Promise.performAll(my.steps.map(function(step) {
      return step(mod)
    })).always(function() {my.resolve()})

    return my.promise
  }

  Scan.prototype.registerMods = function(downloads) {
    var my = this
    downloads.forEach(function(item) {
      //console.log('register', item)
      if (!item.match(/\.zip$/)) {
        return
      }
      if (item.match(/^cache-/)) {
        return
      }
      my.pending++
      file.zip.read('coui://download/'+item).then(function(zip) {
        my.examineZip(item, zip)
        my.resolve()
      }, function(err) {
        console.warn(item, 'could not be listed', err)
        my.resolve()
      })
    })
  }

  Scan.prototype.scan = function() {
    var my = this
    my.mods = []
    my.pending++
    api.download.list().then(function(paths) {
      //console.log('downloads', paths)
      my.registerMods(paths)
      my.resolve()
    }, function(err) {
      console.error('downloads could not be listed', err)
      my.reject(err)
    })

    return my.promise
  }

  Scan.prototype.resolve = function() {
    this.pending--
    if (this.pending < 1) this.promise.resolve(this)
  }

  Scan.prototype.reject = function(err) {
    this.pending--
    if (this.pending < 1) this.promise.reject(err)
  }

  return Scan
})
