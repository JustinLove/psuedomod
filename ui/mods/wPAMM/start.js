(function() {
  "use strict";

  var config = require.s.contexts._.config
  config.waitSeconds = 0
  config.paths.pamm = 'coui://client_mods/wPAMM/ui/mods/wPAMM'

  // model.uiOptions is not yet loaded
})()

require([
  'pamm/pamm'
], function wPAMM_start(pamm) {
  "use strict";

  _.assign(pamm, api.pamm)
  api.pamm = pamm

  if (model.uiOptions && model.uiOptions().nomods) return

  api.pamm.load().then(function() {
    if (model.installedMods) {
      model.installedMods(api.pamm.serialize())
    }
  })
})
