(function() {
  var config = require.s.contexts._.config
  config.waitSeconds = 0
  config.paths.pamm = 'coui://client_mods/wPAMM/ui/mods/wPAMM'

  // make the object keys exist for Panel.ready
  var stub = function() {}
  _.defaults(handlers, {
  })

  api.pamm = {}
  api.pamm.unmountAllMemoryFiles = api.file.unmountAllMemoryFiles
  api.file.unmountAllMemoryFiles = function() {
    console.log('hooked')
    api.pamm.unmountAllMemoryFiles()
  }
})()

require([
  'pamm/pamm',
  'pamm/pamm_mod'
], function(pamm) {
  "use strict";

  console.log('start')

  _.assign(pamm, api.pamm)
  api.pamm = pamm

  api.pamm.client.load()
  api.pamm.server.load()
})
