define(['pamm/download', 'pamm/lib/jszip'], function(download, JSZip) {
  "use strict";

  var mountZippedFiles = function(files, filename, root) {
    createZip(files, filename).then(function(status) {
      //api.file.zip.catalog('/download/'+filename).then(first, first)
      api.file.zip.mount('/download/'+filename, root).then(function() {
        api.content.remount()
        console.log('mounted zipped files')
      }, function() {
        console.error('zip mount failed', filename, root)
      })
    })
  }

  var createZip = function(files, filename) {
    var zip = new JSZip()
    _.each(files, function(content, path) {
      zip.file(path, content)
    })
    return writeZip(zip, filename)
  }

  var writeZip = function(zip, filename) {
    console.time('generate '+filename)
    var blob = zip.generate({type: 'blob'})
    console.timeEnd('generate '+filename)
    var url = window.URL.createObjectURL(blob)
    return download.fetch(url, filename).always(function(status) {
      window.URL.revokeObjectURL(url)
      return status
    })
  }

  var loadBinary = function(url, type) {
    var xhr = new XMLHttpRequest();
    xhr.open("GET", url);
    xhr.responseType = type || 'arraybuffer'
    //xhr.setRequestHeader('Pragma', 'no-cache')
    //xhr.setRequestHeader('Cache-Control', 'no-cache')
    var promise = engine.createDeferred()

    xhr.onload = function () {
      if (this.status === 200) {
        promise.resolve(xhr.response)
      } else {
        promise.reject(xhr)
      }
    };
    xhr.onerror = function() {
      promise.reject(xhr)
    }
    xhr.send();
    return promise
  }

  var readZip = function(url) {
    return loadBinary(url).then(function readZip_convertToJSZip(stuff) {
      try {
        return new JSZip(stuff)
      } catch(e) {
        return new JSZip()
      }
    })
  }

  return {
    mountZippedFiles: mountZippedFiles,
    zip: {
      create: createZip,
      write: writeZip,
      read: readZip,
    },
  }
})
