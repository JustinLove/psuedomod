(function() {
  "use strict";

  api.pamm = {}
  api.pamm.mounts = ko.observable({}).extend({local: 'com.wondible.pa.pamm.mounts'})
  api.pamm.mount = function pamm_mount(reason) {
    var promises = []
    var count = Object.keys(api.pamm.mounts()).length
    _.each(api.pamm.mounts(), function each_pamm_mounts(root, zip) {
      console.log(zip, root)
      api.file.zip.mount(zip, root).always(function mount_countdown() {
        count--
        if (count < 1) {
          api.content.remount()
          console.log('pamm mounted: ' + reason)
        }
      })
    })
  }
  api.pamm.mount('page load')

  api.pamm.mounts.subscribe(function() {
    api.pamm.unmountAllMemoryFiles()
    api.pamm.mount('mounts updated')
  })

  api.pamm.unmountAllMemoryFiles = api.file.unmountAllMemoryFiles
  api.file.unmountAllMemoryFiles = function pamm_unmountAllMemoryFiles() {
    api.pamm.unmountAllMemoryFiles()
    api.pamm.mount('unmounted')
  }
})()
