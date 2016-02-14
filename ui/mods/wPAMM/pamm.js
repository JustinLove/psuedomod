define([
  'pamm/registry',
  'pamm/collection',
  'pamm/local_state',
], function(registry, Collection, local_state) {
  "use strict";

  // functionality required synchronously is in start.js

  var client = new Collection('client', '/client_mods/')
  var server = new Collection('server', '/server_mods/')

  var pamm = {
    client: client,
    server: server,
  }

  pamm.load = function() {
    return local_state.load().then(function(state) {
      pamm.client.deserialize(state.client)
      pamm.server.deserialize(state.server)
      return pamm.write()
    })
  }

  pamm.refresh = function() {
    return local_state.refresh().then(function(state) {
      pamm.client.deserialize(state.client)
      pamm.server.deserialize(state.server)
      return pamm.write()
    })
  }

  pamm.save = function() {
    return local_state.save({
      client: pamm.client.serialize(),
      server: pamm.server.serialize(),
    })
  }

  pamm.write = function() {
    return local_state.join([
      pamm.save(),
      client.write(),
      server.write(),
    ]).then(function() {
      pamm.mounts(_.extend({}, client.mounts, server.mounts))
      return true
    })
  }

  pamm.engineEnabled = function() {
    pamm.client.engineEnabled()
    pamm.server.engineEnabled()
  }

  return pamm
})
