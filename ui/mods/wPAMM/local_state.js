define([
  'pamm/collection',
  'pamm/filesystem_scan',
  'pamm/download_scan',
], function(Collection, FilesystemScan, DownloadScan) {
  "use strict";

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
    var state = {
      restored: false,
      client: {
        mods: [],
        enabled: [],
      },
      server: {
        mods: [],
        enabled: [],
      },
    }
    return join([
      new FilesystemScan().scan('/client_mods/').then(function(scan) {
        console.log('client found', scan.mods.length, 'enabled', scan.enabled.length)
        state.client.mods = state.client.mods.concat(scan.mods)
        state.client.enabled = state.client.enabled.concat(scan.enabled)
      }),
      new FilesystemScan().scan('/server_mods/').then(function(scan) {
        console.log('server found', scan.mods.length, 'enabled', scan.enabled.length)
        state.server.mods = state.server.mods.concat(scan.mods)
        state.server.enabled = state.server.enabled.concat(scan.enabled)
      }),
      new DownloadScan().scan().then(function(scan) {
        console.log('download found', scan.mods.length)
        scan.mods.forEach(function(info) {
          if (info.context == 'client') {
            state.client.mods.push(info)
          } else if (info.context == 'server') {
            state.server.mods.push(info)
          } else {
            console.error(info.identifier, info.installpath || info.zippath, 'unknown mod context')
          }
        })
      }),
    ]).then(function() {return state})
  }

  return {
    load: load,
    refresh: refresh,
    save: save,
    join: join,
  }
})