define([
  'pamm/registry',
  'pamm/collection',
  'pamm/mod_set',
  'pamm/local_state',
], function(registry, Collection, ModSet, local_state) {
  "use strict";

  // functionality required synchronously is in start.js

  var client = new Collection('client', '/client_mods/')
  var server = new Collection('server', '/server_mods/')
  var set = new ModSet()

  var pamm = {
    client: client,
    server: server,
    set: set,
  }

  pamm.load = function() {
    return local_state.load().then(function(state) {
      pamm.client.deserialize(state.client)
      pamm.server.deserialize(state.server)
      pamm.set.deserialize(state.mods)
      pamm.set.disable().find(state.enabled).enable()
      return pamm.write()
    })
  }

  pamm.refresh = function() {
    return local_state.refresh().then(function(state) {
      pamm.client.deserialize(state.client)
      pamm.server.deserialize(state.server)
      pamm.set.deserialize(state.mods)
      pamm.set.disable().find(state.enabled).enable()
      return pamm.write()
    })
  }

  pamm.save = function() {
    return local_state.save({
      client: pamm.client.serialize(),
      server: pamm.server.serialize(),
      mods: pamm.set.serialize(),
    })
  }

  pamm.write = function() {
    return local_state.join([
      pamm.save(),
      client.write(),
      server.write(),
    ]).then(function() {
      api.file.permazip.mounts(_.extend({}, client.mounts, server.mounts))
      return true
    })
  }

  pamm.engineEnabled = function() {
    pamm.client.engineEnabled()
    pamm.server.engineEnabled()
  }

  return pamm
})
