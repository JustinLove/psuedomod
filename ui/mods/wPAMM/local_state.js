define([
  'pamm/filesystem_scan',
  'pamm/download_scan',
], function(FilesystemScan, DownloadScan) {
  "use strict";

  var exclude = [
    'com.pa.deathbydenim.dpamm',
    'com.pa.raevn.rpamm',
    'com.pa.pamm.server',
  ]

  var key = 'com.wondible.pa.pamm.mods'

  var join = function(promises) {
    var complete = engine.createDeferred()
    var count = promises.length
    var done = function(v) {
      count--
      if (count < 1) {
        complete.resolve(true)
      }
    }
    promises.forEach(function(p) {p.always(done)})
    return complete
  }

  var save = function(state) {
    state.restored = true
    return api.memory.store(key, state)
  }

  var load = function() {
    return api.memory.load(key).then(function(string) {
      //string = null
      if (string) {
        return string
      } else {
        return refresh()
      }
    }, function(err) {
      console.log('memory fail?', err)
      return err
    })
  }

  var refresh = function() {
    // prevent feedback on filesystem scans
    api.file.permazip.unmountAllMemoryFiles()

    var state = {
      restored: false,
      mods: [],
      enabled: [],
    }

    return join([
      new FilesystemScan().scan('/client_mods/').then(function(scan) {
        console.log('client found', scan.mods.length, 'enabled', scan.enabled.length)
        state.enabled = state.enabled.concat(scan.enabled)
        scan.mods.forEach(function(info) {
          if (info.context == 'client') {
            state.mods.push(info)
          } else {
            console.error(info.identifier, info.zipPath || info.installedPath, 'unknown mod context', info.context)
          }
        })
      }),
      new FilesystemScan().scan('/server_mods/').then(function(scan) {
        console.log('server found', scan.mods.length, 'enabled', scan.enabled.length)
        state.enabled = state.enabled.concat(scan.enabled)
        scan.mods.forEach(function(info) {
          if (info.context == 'server') {
            state.mods.push(info)
          } else {
            console.error(info.identifier, info.zipPath || info.installedPath, 'unknown mod context', info.context)
          }
        })
      }),
      new DownloadScan().scan().then(function(scan) {
        console.log('download found', scan.mods.length, 'enabled', scan.enabled.length)
        state.enabled = state.enabled.concat(scan.enabled)
        scan.mods.forEach(function(info) {
          if (info.context == 'client') {
            state.mods.push(info)
          } else if (info.context == 'server') {
            state.mods.push(info)
          } else {
            console.error(info.identifier, info.zipPath || info.installedPath, 'unknown mod context', info.context)
          }
        })
      }),
    ]).then(function() {
      state.mods = state.mods.filter(function(mod) {
        return exclude.indexOf(mod.identifier) == -1
      })
      state.enabled = _.difference(state.enabled, exclude)
      state.mods.forEach(function(mod) {
        mod.enabled = state.enabled.indexOf(mod.identifier) != -1

        // ui compatiblity
        mod.installed = true
        mod.fileSystem = !!mod.installedPath
        mod.installedPath = mod.installedPath || ''
        mod.icon = mod.icon || ''
      })
      delete state.enabled
      return state
    })
  }

  return {
    load: load,
    refresh: refresh,
    save: save,
    join: join,
  }
})
