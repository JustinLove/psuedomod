define(['pamm/promise'], function(Promise) {
  "use strict";

  var File = function(file) {
    this.name = file.name
    this.file = file
  }

  File.prototype.asText = function() {
    return Promise.resolve(this.file.asText())
  }

  File.prototype.asJson = function() {
    try {
      return Promise.resolve(JSON.parse(this.file.asText()))
    } catch(err) {
      return Promise.reject(err)
    }
  }

  return File
})
