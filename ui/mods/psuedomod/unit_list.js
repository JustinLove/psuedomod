define(['pamm/promise'], function(Promise) {
  var promise

  var unit_list = {
    refresh: function() {
      var local = new Promise()
      promise = local
      $.get('coui://pa/units/unit_list.json').then(function(units) {
        units.units = _.uniq(units.units)
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
