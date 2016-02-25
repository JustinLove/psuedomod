define([
  'pamm/available',
  'pamm/install',
  'pamm/mod_set',
  'pamm/context',
  'pamm/local_state',
  'pamm/coherent_join',
], function(available, install, ModSet, Context, local_state, join) {
  "use strict";

  ModSet.prototype.setInstall = function() {
    return join(this.map(function(mod) {
      return install.install(mod).then(function setInstall_installed(zip) {
        mod.zipPath = '/download/'+zip.file;
        mod.installed = true
        installed.push(mod);
      })
    }))
  }

  ModSet.prototype.setUninstall = function() {
    return join(this.setDisable().map(function(mod) {
      return install.uninstall(mod).then(function setUninstall_uninstalled() {
        delete mod.zipPath
        mod.installed = false
        installed.remove(mod)
      })
    }))
  }

  var installed = new ModSet()
  var pamm = installed

  pamm.installed = installed
  pamm.available = available

  pamm.load = function() {
    return local_state.load().then(function(state) {
      installed.deserialize(state.mods)
      return pamm.write()
    })
  }

  pamm.refresh = function() {
    return local_state.refresh().then(function(state) {
      var enabled = installed.enabled().getIdentifiers()
      state.mods.forEach(function(mod) {
        if (!mod.enabled) {
          mod.enabled = enabled.indexOf(mod.identifier) != -1
        }
      })
      installed.deserialize(state.mods)
      return pamm.write()
    })
  }

  pamm.save = function() {
    return local_state.save({
      mods: installed.serialize(),
    })
  }

  pamm.write = function() {
    var enabled = installed.enabled()
    var client = new Context(enabled.client(), 'client', '/client_mods/')
    var server = new Context(enabled.server(), 'server', '/server_mods/')
    return join([
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
