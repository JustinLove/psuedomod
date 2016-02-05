(function() {
  "use strict";

  var config = require.s.contexts._.config
  config.waitSeconds = 0
  config.paths.pamm = 'coui://client_mods/wPAMM/ui/mods/wPAMM'

  api.pamm = {}
  api.pamm.sessionKey = 'com.wondible.pa.pamm.mounts'
  api.pamm.mounts = sessionStorage.getItem(api.pamm.sessionKey) || {},
  api.pamm.mount = function(reason) {
    var promises = []
    _.each(api.pamm.mounts, function(root, zip) {
      promises.push(api.file.zip.mount(zip, root))
    })
    $.when.apply($, promises).then(function() {
      api.content.remount()
      console.log('pamm mounted: ' + reason)
    })
  }
  api.pamm.mount('page load')

  api.pamm.unmountAllMemoryFiles = api.file.unmountAllMemoryFiles
  api.file.unmountAllMemoryFiles = function() {
    api.pamm.unmountAllMemoryFiles()
    api.pamm.mount('unmounted')
  }
})()

require([
  'pamm/pamm'
], function(pamm) {
  "use strict";

  _.assign(pamm, api.pamm)
  api.pamm = pamm

  api.pamm.load()
})
