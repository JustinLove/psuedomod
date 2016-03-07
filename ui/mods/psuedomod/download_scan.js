define(['pamm/file', 'pamm/unit_list'], function(file, unitList) {
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
      my.mods.push(info)
      //console.log(info.identifier)
      return info
    } catch(e) {
      console.error('failed to parse modinfo in', path, file.name)
      //console.log(file.asText())
    }
  }

  Scan.prototype.loadUnitList = function(file, info) {
    var my = this
    try {
      var list = JSON.parse(file.asText())
      my.pending++
      unitList.load().then(function(master) {
        info.unit_list = my.diffUnitList(list, master)
        //console.log(file.name, info.unit_list)
        my.resolve()
      }, function(err) {
        console.error(path, 'master unit list could not be loaded')
        my.reject(err)
      })
    } catch(e) {
      console.error('failed to parse unit_list in', file.name)
      //console.log(file.asText())
    }
  }

  Scan.prototype.diffUnitList = function(list, master) {
    return {
      add_units: _.difference(list.units, master.units),
      remove_units: _.difference(master.units, list.units),
    }
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

    var unitLists = zip.file(/unit_list.json$/)
    var unit_list
    if (unitLists.length == 1) {
      unitList.load()
      unit_list = unitLists[0]
    }

    var infos = zip.file(/^\/?([^/]+\/)?modinfo.json$/)
    //var infos = zip.file(/^\/?[^/]+\/modinfo.json$/)
    if (infos.length == 1) {
      var info = my.addModinfo('/download/' + filename, infos[0])
      if (unit_list && !info.unit_list) {
        my.loadUnitList(unit_list, info)
      }
      return my.promise
    }
    infos = zip.file(/modinfo.json$/)
    if (infos.length > 0) {
      console.warn(filename, infos.length, 'possible misplaced modinfo')
      infos.forEach(function(file) {console.log('', file.name)})
    } else {
      console.warn(filename, 'had no modinfo')
    }

    // if we loaded it ourselves as part of a scan, should still be at least one pending
    if (my.pending < 1) {
      my.promise.reject()
    }

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
