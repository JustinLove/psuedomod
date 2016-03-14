define([
  'pamm/download',
], function(download) {
  "use strict";

  var registryUrl = 'https://pamm-mereth.rhcloud.com/api/mod'
  var cache = 'mereth.json'

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
