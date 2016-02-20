define(['pamm/file'], function(file) {
  "use strict";

  var Scan = function() {
    this.mods = []
    this.enabled = []
    this.pending = 0
    this.promise = engine.createDeferred()
  }

  Scan.prototype.addModinfo = function(path, file) {
    //console.log('addmodinfo', path, file)
    var my = this
    var info = JSON.parse(file.asText())
    info.zippath = path
    my.mods.push(info)
    //console.log(info.identifier)
  }

  Scan.prototype.registerMods = function(paths) {
    var my = this
    paths.forEach(function(path) {
      //console.log('register', path)
      if (!path.match(/\.zip$/)) {
        return
      }
      my.pending++
      file.zip.read('coui://download/'+path).then(function(zip) {
        //console.log('zip', zip)
        var infos = zip.file(/^\/?[^/]+\/modinfo.json$/)
        if (infos.length == 1) {
          my.addModinfo('/download/' + path, infos[0])
          my.resolve()
          return
        }
        var infos = zip.file(/modinfo.json$/)
        if (infos.length > 0) {
          console.warn(path, infos.length, 'possible misplaced modinfo')
          infos.forEach(function(file) {console.log('', file.name)})
        } else {
          console.warn(path, 'had no modinfo')
        }
        my.resolve()
      }, function(err) {
        console.warn(path, 'could not be listed', err)
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
