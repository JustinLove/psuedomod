define(['pamm/unit_list'], function(unitList) {
  "use strict";

  var diffUnitList = function(list, master) {
    return {
      add_units: _.difference(list.units, master.units),
      remove_units: _.difference(master.units, list.units),
    }
  }

  var infer = function(mod) {
    return mod.file('pa/units/unit_list.json').then(function(file) {
      return file.asJson().then(function(list) {
        if (list && list.units) {
          return mod.modinfo().then(function(info) {
            return unitList.load().then(function(master) {
              info.unit_list = diffUnitList(list, master)
              //console.log(info.identifier)
              //console.log(info.unit_list)
              return info
            }, function(err) {
              console.error(path, 'master unit list could not be loaded')
              return err
            })
          })
        }
      })
    })
  }

  return infer
})
