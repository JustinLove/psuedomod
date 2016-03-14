define([
  'pamm/available',
  'pamm/install',
  'pamm/mod_set',
  'pamm/context',
  'pamm/local_state',
  'pamm/lib/ba-issemver',
  'pamm/infer_unit_list',
  'pamm/compose_unit_list',
  'pamm/promise',
], function(
  available,
  install,
  ModSet,
  Context,
  local_state,
  isSemVer,
  infer_unit_list,
  compose_unit_list,
  Promise
) {
  "use strict";

  ModSet.prototype.setInstall = function() {
    return Promise.all(this.map(function(mod) {
      return install.install(mod, pamm.extensions.scan).then(function setInstall_installed(status) {
        installed.push(mod);
      }, function setInstall_failed(status) {
        console.log('install failed', status)
      })
    }))
  }

  ModSet.prototype.setUninstall = function() {
    return Promise.all(this.setDisable().map(function(mod) {
      return install.uninstall(mod).then(function setUninstall_uninstalled() {
        installed.remove(mod)
      })
    }))
  }

  ModSet.prototype.outdated = function() {
    return installed.find(this.getIdentifiers()).filter(function(mod) {
      var a = available.find(mod.identifier)
      for (var i = 0;i < a.length;i++) {
        if (isSemVer(mod.version, '<'+a[i].version)) {
          //console.log(mod.identifier, mod.version, a[i].version)
          return true
        }
      }
    })
  }

  var installed = new ModSet()
  var pamm = installed

  pamm.installed = installed
  pamm.available = available

  pamm.extensions = {
    scan: [
      infer_unit_list,
    ],
    pamm_mod: [
      compose_unit_list,
    ],
  }

  pamm.load = function() {
    console.time('pamm.load')
    return local_state.load().then(function(state) {
      installed.deserialize(state.mods)
      console.timeEnd('pamm.load')
      return installed
    })
  }

  pamm.refresh = function() {
    console.time('pamm.refresh')
    return local_state.refresh(pamm.extensions.scan).then(function(state) {
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
    return Promise.all([
      pamm.save(),
      client.write(pamm.extensions.pamm_mod),
      server.write(pamm.extensions.pamm_mod),
    ]).then(function() {
      api.file.permazip.mounts(_.extend({}, client.mounts, server.mounts))
      console.timeEnd('pamm.write')
      return true
    })
  }

  pamm.Promise = Promise

  return pamm
})
