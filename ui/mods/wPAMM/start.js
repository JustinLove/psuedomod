(function() {
  "use strict";

  var config = require.s.contexts._.config
  config.waitSeconds = 0
  config.paths.pamm = 'coui://client_mods/wPAMM/ui/mods/wPAMM'

  // model.uiOptions is not yet loaded
})()

console.timeEnd('mods-run')

require([
  'pamm/pamm'
], function wPAMM_start(pamm) {
  "use strict";

  api.pamm = pamm
  console.timeEnd('page-displayed')
})
