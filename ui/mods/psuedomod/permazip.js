(function() {
  "use strict";

  var pz = api.file.permazip = {}
  pz.mounts = ko.observable({}).extend({local: 'com.wondible.pa.pamm.mounts'})
  pz.mount = function permazip_mount(reason) {
    var promise = engine.createDeferred()
    var loadMods = api.settings.isSet('ui', 'pamm_load_mods', true) || 'LOAD'
    if (loadMods == 'OFF') return
    console.time('mount')
    var promises = []
    var total = Object.keys(pz.mounts()).length
    var count = total
    _.each(pz.mounts(), function each_permazip_mounts(root, zip) {
      console.log(zip, root)
      api.file.zip.mount(zip, root).always(function mount_countdown() {
        count--
        if (count < 1) {
          console.time('remount')
          engine.call('content.mountUntilReset', api.content.active())
          //api.content.remount()
            .then(function() {
              promise.resolve()
              console.timeEnd('remount')
            })
          console.timeEnd('mount')
          console.log('permazip mounted ' + total.toString() + ': ' + reason)
        }
      })
    })
    return promise
  }

  pz.unmountAllMemoryFiles = api.file.unmountAllMemoryFiles

  // automatic mount/unmount in atlas can cause infinite loop
  if (window.location.protocol == 'atlas:') return

  // for possible: api.file.permazip.mounts_subscription.dispose()
  pz.mounts_subscription = pz.mounts.subscribe(function() {
    pz.unmountAllMemoryFiles()
    pz.mount('mounts updated')
  })

  api.file.unmountAllMemoryFiles = function permazip_unmountAllMemoryFiles() {
    pz.unmountAllMemoryFiles()
    pz.mount('unmounted')
  }

  api.game.getSetupInfo().then(function (payload) {
    if (parseUIOptions(payload.ui_options).nomods) {
      pz.mounts_subscription.dispose()
      api.file.unmountAllMemoryFiles = pz.unmountAllMemoryFiles

      if (window.location.href == 'coui://ui/main/main.html') {
        pz.unmountAllMemoryFiles()
      }
    } else {
      if (window.location.href == 'coui://ui/main/main.html') {
        pz.mount('application start')
      }
    }
  })
  console.time('mods-run')
  console.time('page-displayed')
})()
