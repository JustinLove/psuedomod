define([
  'pamm/filesystem_scan',
  'pamm/download_scan',
  'pamm/promise',
], function(FilesystemScan, DownloadScan, Promise) {
  "use strict";

  var exclude = [
    'com.wondible.pa.pamm.client',
    'com.wondible.pa.pamm.server',
    'com.pa.deathbydenim.dpamm',
    'com.pa.raevn.rpamm',
    'com.pa.pamm.server',
    'community-mods-client',
    'community-mods-server',
  ]

  var key = 'com.wondible.pa.pamm.mods'

  var save = function(state) {
    state.restored = true
    return Promise.wrap(api.memory.store(key, state))
  }

  var load = function() {
    return Promise.wrap(api.memory.load(key)).then(function(state) {
      //state = null
      if (state) {
        return state
      } else {
        return refresh().then(function(state) {
          save(state)
          return Promise.wrap(api.file.permazip.mount('refresh restore'))
            .then(function() { return state })
        })
      }
    }, function(err) {
      console.log('memory fail?', err)
      return err
    })
  }

  var refresh = function(extensions) {
    console.time('scan')
    // prevent feedback on filesystem scans
    api.file.permazip.unmountAllMemoryFiles()

    var state = {
      restored: false,
      mods: [],
      enabled: [],
    }

    var register = function(contexts, label) {
      return function(scan) {
        console.log(label, 'found', scan.mods.length, 'enabled', scan.enabled.length)
        state.enabled = state.enabled.concat(scan.enabled)
        scan.mods.forEach(function(info) {
          if (contexts.indexOf(info.context) != -1) {
            state.mods.push(info)
          } else {
            console.error(info.identifier, info.zipPath || info.installedPath, 'unknown mod context', info.context)
          }
        })
      }
    }

    return Promise.all([
      new FilesystemScan(extensions).scan('/client_mods/')
        .then(register(['client'], 'client')),
      new FilesystemScan(extensions).scan('/server_mods/')
        .then(register(['server'], 'server')),
      new FilesystemScan(extensions).scan('/stockmods/server/')
        .then(register(['server'], 'stock/server')),
      new DownloadScan(extensions).scan()
        .then(register(['client', 'server'], 'download')),
    ]).then(function() {
      state.mods = state.mods.filter(function(mod) {
        return exclude.indexOf(mod.identifier) == -1
      })
      state.enabled = _.difference(state.enabled, exclude)
      state.mods.forEach(function(mod) {
        mod.enabled = state.enabled.indexOf(mod.identifier) != -1
        normalizeMod(mod)
      })
      delete state.enabled
      console.timeEnd('scan')
      return state
    })
  }

  var topLevelScenes = ["global_mod_list", "armory", "building_planets", "connect_to_game", "game_over", "icon_atlas", "live_game", "live_game_econ", "live_game_hover", "load_planet", "lobby", "matchmaking", "new_game", "replay_browser", "server_browser", "settings", "social", "special_icon_atlas", "start", "system_editor", "transit"] // deprecated

  var normalizeMod = function(mod) {
    mod.installed = true
    mod.fileSystem = !!mod.installedPath
    mod.installedPath = mod.installedPath || ''
    mod.icon = mod.icon || ''
    mod.build = mod.build || 'Unknown'
    mod.display_name = mod.display_name || mod.identifier
    mod.description = mod.description || ''
    mod.author = mod.author || ''
    mod.forum = mod.forum || ''
    mod.category || []
    if (mod.priority === undefined) mod.priority = 100
    mod.dependencies = mod.dependencies || []

    if ( mod.date ) {
      var timestamp = Date.parse( mod.date );

      if ( isNaN( timestamp ) ) {
        mod.timestamp = 0;
      } else {
        mod.timestamp = timestamp
        var date = new Date(timestamp)
        mod.date = (1900+date.getYear()) + '-' + zeroPad(1+date.getMonth()) + '-' + zeroPad(1+date.getDate());
      }
    } else {
      mod.date = 'Unknown';
      mod.timestamp = 0;
    }

    topLevelScenes.forEach(function(scene) {
      if (mod[scene]) {
        console.warn(mod.identifier, 'top level scene', scene)
        mod.scenes = mod.scenes || {}
        mod.scenes[scene] = mod[scene]
        delete mod[scene]
      }
    })
  }

  var zeroPad = function(n) {
    var s = '0'+n.toString()
    return s.slice(s.length - 2)
  }

  return {
    load: load,
    refresh: refresh,
    save: save,
  }
})
