define(['pamm/file'], function(file) {
  var locateModinfo = function(zip, identifier) {
      var infos = zip.file(/(^|\/)modinfo.json$/)

      if (infos.length < 1) {
        console.error('cannot fix zip with no modinfo.json')
        return false
      } else if (infos.length == 1) {
        return infos[0]
      } else if (identifier) {
        infos = infos.filter(function(info) {
          try {
            var modinfo = JSON.parse(info.asText());
            return modinfo.identifier == identifier
          } catch(e) {
            console.error('invalid modinfo.json', info.name, identifier)
            //console.log(info.asText())
            return false
          }
        })
        if (infos.length == 1) {
          return infos[0]
        } else {
          console.error('cannot fix zip with', infos.length, 'matching modinfo.json')
          return false
        }
      } else {
        console.error('cannot fix zip with', infos.length, 'modinfo.json and no identifier to match')
        return false
      }
  }

  var reorganize = function(zip, from, to) {
    from = new RegExp('^'+from)

    Object.keys(zip.files).forEach(function(path) {
      if (!path.match(from)) {
        delete zip.files[path]
        return
      }

      var fixed = path.replace(from, to)
      if (fixed == path) return

      var obj = zip.files[path]
      delete zip.files[path]

      // OSX helpfully adds an extra dir when opening files without a base directory
      if (fixed != ''){ // && fixed.match('/')) {
        zip.files[fixed] = obj
        obj.name = fixed
      }
    })
  }

  var fix = function(source, target, identifier) {
    console.time('fix '+identifier)
    return file.zip.read('coui://download/'+source).then(function fix_paths_read_zip(zip) {
      //console.log(zip)

      var info = locateModinfo(zip, identifier)
      if (!info) return false

      var basepath = info.name.match(/^(.*)modinfo.json$/)[1]
      var newpath = identifier+'/'

      if (basepath && basepath != '') {
        console.info(source, 'rename', basepath, '->', newpath)
        reorganize(zip, basepath, newpath)
        //console.log(zip)
      }
      return file.zip.write(zip, target).then(function(status) {
        /*
        $.get('coui://download/'+source+'.dlmeta').then(function(sourcestatus) {
          sourcestatus = JSON.parse(sourcestatus)
          window.sizes = window.sizes || {}
          console.log(window.sizes[identifier] = [sourcestatus.size, status.size, status.size / (sourcestatus.size || 1)])
        })
        */
        console.timeEnd('fix '+identifier)
        return status
      })
    })
  }

  return fix
})
