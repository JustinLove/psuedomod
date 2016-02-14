(function() {
  "use strict";

  var config = require.s.contexts._.config
  config.waitSeconds = 0
  config.paths.pamm = 'coui://client_mods/wPAMM/ui/mods/wPAMM'
})()

require([
  'pamm/pamm'
], function wPAMM_start(pamm) {
  "use strict";

  _.assign(pamm, api.pamm)
  api.pamm = pamm

  api.pamm.load()
})
