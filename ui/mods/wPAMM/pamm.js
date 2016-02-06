define([
  'pamm/registry',
  'pamm/collection',
  'pamm/download_scan',
], function(registry, Collection) {
  "use strict";

  // functionality required synchronously is in start.js

  var client = new Collection('client', '/client_mods/')
  var server = new Collection('server', '/server_mods/')

  var pamm = {
    client: client,
    server: server,
  }

  pamm.load = function() {
    $.when(client.load(), server.load()).then(function(c, s) {
      pamm.write()
    })
  }

  pamm.write = function() {
    pamm.mounts = _.extend({}, client.mounts, server.mounts)
    sessionStorage.setItem(pamm.sessionKey, encode(pamm.mounts))
    pamm.mount('collections updated')
  }

  return pamm
})
