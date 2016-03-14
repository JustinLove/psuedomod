(function() {
  "use strict";

  var config = require.s.contexts._.config
  config.waitSeconds = 0
  config.paths.pamm = 'coui://client_mods/psuedomod/ui/mods/psuedomod'
  config.paths.Promise = 'coui://client_mods/psuedomod/ui/mods/psuedomod/lib/mydeferred'

  // model.uiOptions is not yet loaded
})()

console.timeEnd('mods-run')

require([
  'pamm/pamm',

  'pamm/dev',
], function psuedomod_start(pamm) {
  "use strict";

  api.pamm = pamm
  console.timeEnd('page-displayed')
})
