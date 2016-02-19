define([
  'pamm/registry',
  'pamm/mod_set',
  'pamm/context',
  'pamm/local_state',
], function(registry, ModSet, Context, local_state) {
  "use strict";

  // functionality required synchronously is in start.js

  var pamm = new ModSet()

  pamm.load = function() {
    return local_state.load().then(function(state) {
      pamm.deserialize(state.mods)
      return pamm.write()
    })
  }

  pamm.refresh = function() {
    return local_state.refresh().then(function(state) {
      pamm.deserialize(state.mods)
      return pamm.write()
    })
  }

  pamm.save = function() {
    return local_state.save({
      mods: pamm.serialize(),
    })
  }

  pamm.write = function() {
    var enabled = pamm.enabled()
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
