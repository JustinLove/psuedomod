define(['Promise'], function(Promise) {
  Promise.wrap = function(coherent) {
    var promise = new Promise()
    coherent.then(promise.resolve, promise.reject)
    return promise
  }

  Promise.performAll = function (iterable) {
    var dfd = Promise(),
    d,
    i = 0,
    n = iterable.length,
    remain = n,
    values = [],
    _fn,
    _doneFn = function (i, val) {
      (i >= 0) && (values[i] = val);

      /* istanbul ignore else */
      if (--remain <= 0) {
        dfd.resolve(values);
      }
    };

    if (remain === 0) {
      _doneFn();
    }
    else {
      for (; i < n; i++) {
        d = iterable[i];

        if (d && typeof d.then === 'function') {
          _fn = _doneFn.bind(null, i); // todo: тест
          if (d.done && d.fail) {
            d.done(_fn).fail(_fn);
          } else {
            d.then(_fn, _fn);
          }
        }
        else {
          _doneFn(i, d);
        }
      }
    }

    return dfd;
  };

  return Promise
})
