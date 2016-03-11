define(['pamm/unit_list', 'pamm/promise'], function(unitList, Promise) {
  "use strict";

  var compose = function(collection, files) {
    var promise = new Promise()

    var changes = unitChanges(collection)
    if (changes.add_units.length > 0 || changes.remove_units.length > 0) {
      console.log('unit list changes +', changes.add_units.length, -changes.remove_units.length)
      //console.log(unitList)
      unitList.load().then(function(list) {
        //console.log('got units', list)
        files[collection.myPath+'/pa/units/unit_list.json'] = unit_list(list, changes)
      }).always(function() {
        //console.log('resolve')
        promise.resolve(files)
      })
    } else {
      promise.resolve(files)
    }

    return promise
  }

  var unitChanges = function(collection) {
    var enabled = collection.enabledMods()
    var add_units = [];
    var remove_units = [];
    enabled.forEach(function(mod) {
      if ( mod.unit_list ) {
        if ( mod.unit_list.add_units ) {
          add_units = add_units.concat(mod.unit_list.add_units);
        }
        if ( mod.unit_list.remove_units ) {
          remove_units = remove_units.concat(mod.unit_list.remove_units);
        }
      }
    })

    return {
      add_units: add_units,
      remove_units: remove_units,
    }
  }

  var unit_list = function(list, changes) {
    list.units = _.difference(list.units, changes.remove_units);
    list.units = _.union(list.units, changes.add_units);
    console.log('created unit list', list.units.length)
    return JSON.stringify(list);
  }

  return compose
})
