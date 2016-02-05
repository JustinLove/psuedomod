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
    var blob = zip.generate({type: 'blob'})
    var url = window.URL.createObjectURL(blob)
    return download(url, filename)
  }

  var download = function(url, filename) {
    var promise = $.Deferred()
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

  return {
    mountZippedFiles: mountZippedFiles,
    zip: {
      create: createZip,
    },
  }
})
