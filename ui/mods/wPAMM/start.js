(function() {
  var config = require.s.contexts._.config
  config.waitSeconds = 0
  config.paths.pamm = 'coui://client_mods/wPAMM/ui/mods/wPAMM'

  // make the object keys exist for Panel.ready
  var stub = function() {}
  _.defaults(handlers, {
  })
})()

require([
  'pamm/pamm',
  'pamm/pamm_mod'
], function(pamm) {
  "use strict";

  pamm.client.scan()
  pamm.server.scan()
})
