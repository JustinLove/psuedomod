define([], function() {
  "use strict";

  var File = function(path) {
    this.name = path
  }

  File.prototype.asText = function() {
    var my = this
    var promise = engine.createDeferred()
    if (my.text) {
      promise.resolve(my.text)
      return promise
    }
    $.get('coui:/'+my.name, null, null, 'text').then(function(text) {
      my.text = text
      promise.resolve(text)
    }, function(err) {
      console.error(my.name, 'not found', err)
      promise.reject(err)
    })
    return promise
  }

  File.prototype.asJson = function() {
    var my = this
    var promise = engine.createDeferred()
    if (my.obj) {
      promise.resolve(my.obj)
      return promise
    }
    $.get('coui:/'+my.name, null, null, 'json').then(function(obj) {
      my.obj = obj
      promise.resolve(obj)
    }, function(err) {
      console.error(my.name, 'not found', err)
      promise.reject(err)
    })
    return promise
  }

  return File
})
