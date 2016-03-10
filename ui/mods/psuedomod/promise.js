define(['Promise'], function(Promise) {
  Promise.wrap = function(coherent) {
    var promise = new Promise()
    coherent.then(promise.resolve, promise.reject)
    return promise
  }

  return Promise
})
