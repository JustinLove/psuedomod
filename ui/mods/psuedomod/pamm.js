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
      return install.install(mod).then(function setInstall_installed(status) {
        installed.push(mod);
      }, function setInstall_failed(status) {
        console.log('install failed', status)
      })
    }))
  }

  ModSet.prototype.setUninstall = function() {
    return join(this.setDisable().map(function(mod) {
      return install.uninstall(mod).then(function setUninstall_uninstalled() {
        installed.remove(mod)
      })
    }))
  }

  var installed = new ModSet()
  var pamm = installed

  pamm.installed = installed
  pamm.available = available

  pamm.load = function() {
    console.time('pamm.load')
    return local_state.load().then(function(state) {
      installed.deserialize(state.mods)
      return pamm.write().then(function(result) {
        console.timeEnd('pamm.load')
        return result
      })
    })
  }

  pamm.refresh = function() {
    console.time('pamm.refresh')
    return local_state.refresh().then(function(state) {
      var enabled = installed.enabled().getIdentifiers()
      state.mods.forEach(function(mod) {
        if (!mod.enabled) {
          mod.enabled = enabled.indexOf(mod.identifier) != -1
        }
      })
      installed.deserialize(state.mods)
      return pamm.write().then(function(result) {
        console.timeEnd('pamm.refresh')
        return result
      })
    })
  }

  pamm.save = function() {
    return local_state.save({
      mods: installed.serialize(),
    })
  }

  pamm.write = function() {
    console.time('pamm.write')
    var enabled = installed.enabled()
    var client = new Context(enabled.client(), 'client', '/client_mods/')
    var server = new Context(enabled.server(), 'server', '/server_mods/')
    return join([
      pamm.save(),
      client.write(),
      server.write(),
    ]).then(function() {
      api.file.permazip.mounts(_.extend({}, client.mounts, server.mounts))
      console.timeEnd('pamm.write')
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

  pamm.stressTest = function(start, n) {
    pamm.available.load().then(function() {
      start = start || 0
      n = n || 1
      var work = pamm.available.serialize().slice(start, start+n)
      var nextMod = function() {
        var mod = work.pop()
        console.log('nextmod', mod && mod.url)
        if (mod) {
          new ModSet([mod]).setInstall().always(nextMod)
        }
      }
      nextMod()
    })
  }

  return pamm
})
