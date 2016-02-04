define(['pamm/lib/jszip'], function(JSZip) {
  var mountZippedFiles = function(files, filename) {
    var zip = new JSZip()
    _.each(files, function(content, path) {
      zip.file(path, content)
    })
    var blob = zip.generate({type: 'blob'})
    var url = window.URL.createObjectURL(blob)
    api.download.start(url, filename)
    watchDownload(url, filename)
  }

  var watchDownload = function(url, filename) {
    api.download.status(filename).then(function(status) {
      console.log(status)
      console.log(status.state)
      if (status.state == 'complete') {
        URL.revokeObjectURL(url)
        api.file.zip.catalog('/download/'+filename).then(first, first)
        api.file.zip.mount('/download/'+filename, '/')
        api.content.remount()
        console.log('mounted')
      } else if (status.state == 'activated' || status.state == 'downloading') {
        setTimeout(watchDownload, 100, url, filename)
      } else {
        console.error('unhandled download state ' + status.state)
        console.log(status)
        URL.revokeObjectURL(url)
      }
    }, first)
  }

  return {
    mountZippedFiles: mountZippedFiles,
  }
})
