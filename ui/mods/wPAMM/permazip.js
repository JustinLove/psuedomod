(function() {
  "use strict";

  var pz = api.file.permazip = {}
  pz.mounts = ko.observable({}).extend({local: 'com.wondible.pa.pamm.mounts'})
  pz.mount = function permazip_mount(reason) {
    var promises = []
    var total = Object.keys(pz.mounts()).length
    var count = total
    _.each(pz.mounts(), function each_permazip_mounts(root, zip) {
      console.log(zip, root)
      api.file.zip.mount(zip, root).always(function mount_countdown() {
        count--
        if (count < 1) {
          api.content.remount()
          console.log('permazip mounted ' + total.toString() + ': ' + reason)
        }
      })
    })
  }

  if (window.location.href == 'coui://ui/main/main.html') {
    pz.mount('application start')
  }

  pz.mounts.subscribe(function() {
    pz.unmountAllMemoryFiles()
    pz.mount('mounts updated')
  })

  pz.unmountAllMemoryFiles = api.file.unmountAllMemoryFiles
  api.file.unmountAllMemoryFiles = function permazip_unmountAllMemoryFiles() {
    pz.unmountAllMemoryFiles()
    pz.mount('unmounted')
  }
})()
