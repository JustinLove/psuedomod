define([], function() {
  var promise

  var unit_list = {
    refresh: function() {
      var local = engine.createDeferred()
      promise = local
      $.get('coui://pa/units/unit_list.json').then(function(units) {
        local.resolve(units)
      }, function(err) {
        console.error('fetch unit list failed')
        local.reject(err)
      })
      return local
    },
    load: function() {
      if (promise) {
        return promise
      } else {
        return unit_list.refresh()
      }
    },
  }

  return unit_list
})
