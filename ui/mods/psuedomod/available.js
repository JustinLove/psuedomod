define([
  'pamm/mod_set',
  'pamm/download',
], function(ModSet, download) {
  "use strict";

  var registryUrl = 'https://palobby.com/api/mods/'
  var url = 'coui://download/available_mods.json'

  var available = new ModSet()

  available.refresh = function() {
    download.fetch(registryUrl, 'available_mods.json').then(available.load)
  }

  available.load = function() {
    console.time('available.load')
    var promise = engine.createDeferred()
    $.get(url).then(function(mods) {
      available.deserialize(mods)
      promise.resolve(available)
      console.timeEnd('available.load')
    })
    return promise
  }

  return available
})
