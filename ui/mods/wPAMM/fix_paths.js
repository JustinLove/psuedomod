define(['pamm/file'], function(file) {
  var fix = function(path) {
    return file.zip.read('coui://download/'+path).then(function(zip) {
      //console.log(zip)
      var infos = zip.file(/modinfo.json$/)
      if (infos.length == 1) {
        var name = infos[0].name
        var keep = name.match(/[^/]+\/modinfo.json$/)[0]
        var remove = name.replace(keep, '')
        if (remove == '') return zip
        console.info('fix', path, 'removing', remove)
        Object.keys(zip.files).forEach(function(path) {
          var fixed = path.replace(remove, '')
          if (fixed == path) return
          var obj = zip.files[path]
          delete zip.files[path]
          // OSX helpfully adds an extra dir when opening files without a base directory
          if (fixed != ''){ // && fixed.match('/')) {
            zip.files[fixed] = obj
            obj.name = fixed
          }
        })
        //console.log(zip)
        return file.zip.write(zip, path)
      } else {
        console.error('cannot fix zip with', infos.length, 'modinfo.json')
        return false
      }
    })
  }

  return fix
})
