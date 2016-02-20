define([], function() {
  "use strict";

  var fileStatus = {}
  var starting

  var startNext = function() {
    starting = undefined
    for (var filename in fileStatus) {
      if (fileStatus[filename].status == 'new') {
        //console.log('begin', filename)
        fileStatus[filename].status = 'started'
        api.download.start(fileStatus[filename].url, filename)
        starting = filename
        return
      }
    }
  }

  var fetch = function(url, filename) {
    if (!filename) {
      var parts = url.split('/')
      filename = parts[parts.length-1]
    }
    fileStatus[filename] = {
      promise: $.Deferred(),
      url: url,
      filename: filename,
      status: 'new',
    }
    if (!starting) startNext()
    return fileStatus[filename].promise
  }

  var onDownload = api.download.onDownload
  api.download.onDownload = function(status) {
    onDownload(status)

    if (status.file.match('com.wondible.pa.pamm.')) return
    //console.log(status)

    if (status.progress > status.size) {
      status.percent = 0
    } else {
      status.percent = status.progress/status.size
    }

    var info = fileStatus[status.file]
    if (info) {
      if (starting == info.filename) startNext()
    } else if (starting) {
      info = fileStatus[starting]
      fileStatus[status.file] = info
      delete fileStatus[starting]
      startNext()
    }

    if (info) {
      if (status.state == 'complete') {
        if (status.file == info.filename) {
          info.promise.resolve(status)
          delete fileStatus[status.file]
        } else {
          api.download.move(status.file, info.filename).then(function() {
            var filename = info.filename
            console.info('renamed', status.file, filename)
            delete fileStatus[status.file]
            status.file = filename
            info.promise.resolve(status)
          }, function() {
            console.error('failed to move', status.file, info.filename, arguments)
            info.promise.resolve(status)
            delete fileStatus[status.file]
          })
        }
      } else if (status.state == 'activated' || status.state == 'downloading') {
        info.promise.notify(status)
        info.status = status.state
      } else {
        console.error('unhandled download state ' + status.state)
        console.warn(status)
        info.promise.reject(status)
        delete fileStatus[status.file]
      }
    }
  }

  return {
    fetch: fetch,
  }
})
