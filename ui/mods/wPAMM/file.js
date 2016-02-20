define(['pamm/lib/jszip'], function(JSZip) {
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
    var blob = zip.generate({type: 'blob'})
    var url = window.URL.createObjectURL(blob)
    return download(url, filename)
  }

  var download = function(url, filename) {
    var promise = engine.createDeferred()
    api.download.start(url, filename)
    watchDownload(url, filename, promise)
    return promise
  }

  var watchDownload = function(url, filename, promise) {
    api.download.status(filename).then(function(status) {
      //console.log(status)
      //console.log(status.state)
      if (status.state == 'complete') {
        URL.revokeObjectURL(url)
        promise.resolve(status)
      } else if (status.state == 'activated' || status.state == 'downloading') {
        setTimeout(watchDownload, 100, url, filename, promise)
      } else {
        console.error('unhandled download state ' + status.state)
        console.warn(status)
        promise.reject(status)
        URL.revokeObjectURL(url)
      }
    }, function(err) {
      promise.reject(err)
      console.warn('download status failed', err)
    })
  }

  var loadBinary = function(url, type) {
    var xhr = new XMLHttpRequest();
    xhr.open("GET", url);
    xhr.responseType = type || 'arraybuffer'
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
    return loadBinary(url).then(function(stuff) {
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
