(function() {
  "use strict";

  var config = require.s.contexts._.config
  config.waitSeconds = 0
  config.paths.pamm = 'coui://client_mods/wPAMM/ui/mods/wPAMM'

  // model.uiOptions is not yet loaded
})()

require([
  'pamm/download',
  'pamm/pamm'
], function wPAMM_start(download, pamm) {
  "use strict";

  _.assign(pamm, api.pamm)
  api.pamm = pamm

  /*
  download.fetch('coui://download/two_color_icons.zip', 'tci.foo')
  download.fetch('https://github.com/Stuart1998/ClassicWater/archive/oldwater_v1.0.zip')
    .then(function(status) {
      console.log('success', status)
    }, function(status) {
      console.log('failed', status)
    })
    */

  if (!model.uiOptions().nomods) {
    api.pamm.load()
  }
})
