define([], function() {
  "use strict";

  var promises = {}
  var starting

  var fetch = function(url, filename) {
    if (!filename) {
      var parts = url.split('/')
      filename = parts[parts.length-1]
    }
    promises[filename] = $.Deferred()
    starting = filename
    api.download.start(url, filename)
    return promises[filename]
  }

  var onDownload = api.download.onDownload
  api.download.onDownload = function(status) {
    onDownload(status)

    if (status.file.match('com.wondible.pa.pamm.')) return
    console.log(status)

    if (status.progress > status.size) {
      status.percent = 0
    } else {
      status.percent = status.progress/status.size
    }

    if (promises[status.file]) {
      var promise = promises[status.file]
      if (status.file == starting) starting = undefined
    } else if (starting) {
      var promise = promises[starting]
      promises[status.file] = promise
      delete promises[starting]
      starting = undefined
    }

    if (promise) {
      if (status.state == 'complete') {
        promise.resolve(status)
        delete promise[status.file]
      } else if (status.state == 'failed') {
        promise.reject(status)
        delete promise[status.file]
      } else {
        promise.notify(status)
      }
    }
  }

  return {
    fetch: fetch,
  }
})
