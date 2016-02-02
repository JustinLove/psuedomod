(function() {
  var config = require.s.contexts._.config
  config.waitSeconds = 0
  config.paths.pamm = 'coui://ui/mods/wPAMM'

  // make the object keys exist for Panel.ready
  var stub = function() {}
  _.defaults(handlers, {
  })
})()

require([
  'pamm/registry',
  'pamm/collection',
], function(registry, collection) {
  "use strict";
  console.log('run')
})
