define([
  'pamm/registry',
  'pamm/collection',
  'pamm/context',
  'pamm/mod_set',
  'pamm/local_state',
], function(registry, Collection, Context, ModSet, local_state) {
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
      return pamm.write()
    })
  }

  pamm.refresh = function() {
    return local_state.refresh().then(function(state) {
      pamm.client.deserialize(state.client)
      pamm.server.deserialize(state.server)
      pamm.set.deserialize(state.mods)
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
    var enabled = set.enabled()
    var client = new Context(enabled.client(), 'client', '/client_mods/')
    var server = new Context(enabled.server(), 'server', '/server_mods/')
    return local_state.join([
      pamm.save(),
      client.write(),
      server.write(),
    ]).then(function() {
      api.file.permazip.mounts(_.extend({}, client.mounts, server.mounts))
      return true
    })
  }

  pamm.contextEnabled = function(context) {
    api.mods.getMounted(context).then(function(info) {
      console.log('-- ' + context + ' --')
      info.mounted_mods.forEach(function(mod) {
        console.log(mod.identifier)
      })
    })
  }

  pamm.engineEnabled = function() {
    pamm.contextEnabled('client')
    pamm.contextEnabled('server')
  }

  return pamm
})
