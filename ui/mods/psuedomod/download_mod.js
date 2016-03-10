define(['pamm/download_object', 'pamm/promise'], function(File, Promise) {
  "use strict";

  var Mod = function(zip, filename) {
    this.zip = zip
    this.filename = filename || 'unknown'
    this.infoPromise
  }

  Mod.prototype.file = function(path) {
    var my = this
    var info = my.findModinfo()
    path = path.replace(/^\//, '')
    if (info) {
      path = info.name.replace('modinfo.json', '') + path
    }
    var file = my.zip.file(path)
    if (file) {
      return Promise.resolve(new File(file))
    } else {
      return Promise.reject()
    }
  }

  var addModinfo = function(path, file) {
    //console.log('addmodinfo', path, file)
    try {
      var info = JSON.parse(file.asText())
      info.zipPath = path
      if (info.scenes) {
        _.each(info.scenes, function(value, key) {
          info.scenes[key] = value.map(function(filename) {
            return filename.toLowerCase()
          })
        })
      }
      //console.log(info.identifier)
      return Promise.resolve(info)
    } catch(e) {
      console.error('failed to parse modinfo in', path, file.name)
      //console.log(file.asText())
      return promise.reject(e)
    }
  }

  Mod.prototype.modinfo = function() {
    var my = this
    if (my.infoPromise) {
      return my.infoPromise
    }
    var info = my.findModinfo()
    if (info) {
      return my.infoPromise = addModinfo('/download/' + my.filename, info)
    } else {
      return my.infoPromise = Promise.reject()
    }
  }

  Mod.prototype.findModinfo = function() {
    var my = this
    if (my.infoFile) return my.infoFile

    var infos = my.zip.file(/^\/?([^/]+\/)?modinfo.json$/)
    //var infos = my.zip.file(/^\/?[^/]+\/modinfo.json$/)
    if (infos.length == 1) {
      return my.infoFile = infos[0]
    }
    infos = my.zip.file(/modinfo.json$/)
    if (infos.length > 0) {
      console.warn(my.filename, infos.length, 'possible misplaced modinfo')
      infos.forEach(function(file) {console.log('', file.name)})
    } else {
      console.warn(my.filename, 'had no modinfo')
    }
  }

  return Mod
})
