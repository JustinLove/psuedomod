define([
  'pamm/mod_set',
  'pamm/download',
], function(ModSet, download) {
  "use strict";

  var registryUrl = 'https://palobby.com/api/mods/'
  var url = 'coui://download/available_mods.json'

  var available = new ModSet()

  available.refresh = function() {
    return download.save(registryUrl, 'available_mods.json').then(available.load)
  }

  available.load = function() {
    console.time('available.load')
    return download.fetch(url).then(function(mods) {
      available.deserialize(mods)
      console.timeEnd('available.load')
      return available
    })
  }

  return available
})
