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
  'pamm/palobby',
  'pamm/mereth',
  'pamm/infer_unit_list',
  'pamm/compose_unit_list',

  'pamm/dev',
], function psuedomod_start(
  pamm,
  palobby,
  mereth,
  infer_unit_list,
  compose_unit_list
) {
  "use strict";

  pamm.extensions.scan.push(infer_unit_list)
  pamm.extensions.pamm_mod.push(compose_unit_list)
  pamm.extensions.sources.push(palobby)
  pamm.extensions.sources.push(mereth)

  api.pamm = pamm
  console.timeEnd('page-displayed')
})
