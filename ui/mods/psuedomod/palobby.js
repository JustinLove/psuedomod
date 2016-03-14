define([
  'pamm/download',
], function(download) {
  "use strict";

  var registryUrl = 'https://palobby.com/api/mods/'
  var cache = 'palobby.json'

  var refresh = function() {
    return download.save(registryUrl, cache)
  }

  var load = function() {
    console.time('load '+cache)
    return download.fetch('coui://download/' + cache).then(function(mods) {
      console.timeEnd('load '+cache)
      return mods
    })
  }

  return {
    refresh: refresh,
    load: load,
  }
})
