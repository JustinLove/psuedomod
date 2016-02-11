define([
  'pamm/registry',
  'pamm/collection',
  'pamm/filesystem_scan',
  'pamm/download_scan',
], function(registry, Collection, FilesystemScan, DownloadScan) {
  "use strict";

  // functionality required synchronously is in start.js

  var client = new Collection('client', '/client_mods/')
  var server = new Collection('server', '/server_mods/')

  var pamm = {
    client: client,
    server: server,
  }

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

  pamm.load = function() {
    return join([
      client.load(),
      server.load(),
    ]).then(pamm.scan)
  }

  pamm.scan = function() {
    return join([
      new FilesystemScan().scan(client.path).then(function(scan) {
        console.log(client.path, 'found', scan.mods.length, 'enabled', scan.enabled.length)
        client.injest(scan.mods)
        client.enable(scan.enabled)
      }),
      new FilesystemScan().scan(server.path).then(function(scan) {
        console.log(server.path, 'found', scan.mods.length, 'enabled', scan.enabled.length)
        server.injest(scan.mods)
        server.enable(scan.enabled)
      }),
      new DownloadScan().scan().then(function(scan) {
        console.log('download found', scan.mods.length)
        var cm = []
        var sm = []
        scan.mods.forEach(function(info) {
          if (info.identifier == client.identifier) {
            // pass
          } else if (info.identifier == server.identifier) {
            // pass
          } else if (info.context == 'client') {
            cm.push(info)
          } else if (info.context == 'server') {
            sm.push(info)
          } else {
            console.error(info.identifier, info.installpath || info.zippath, 'unknown mod context')
          }
        })
        client.injest(cm)
        server.injest(sm)
      }),
    ]).then(pamm.write)
  }

  pamm.write = function() {
    return join([
      client.write(),
      server.write(),
    ]).then(function() {
      pamm.mounts = _.extend({}, client.mounts, server.mounts)
      sessionStorage.setItem(pamm.sessionKey, encode(pamm.mounts))
      pamm.mount('collections updated')
      return true
    })
  }

  return pamm
})
