define([], function() {
  var modRegistry = []

  var addModinfo = function(context, path) {
    $.get('coui:/'+path).then(function(info) {
      if (info.context != context) {
        console.error(info.identifier, path, 'wrong mod context')
        return
      }
      info.installpath = path
      modRegistry.push(info)
      console.log(info.identifier)
    }, function(err) {
      console.error(path, 'not found', err)
    })
  }

  var activeMods = {
    client: {mount_order: []},
    server: {mount_order: []},
  }

  var loadActiveMods = function(context, path) {
    $.get('coui:/'+path).then(function(mods) {
      activeMods[context] = mods
    }, function(err) {
      console.error(path, 'not found', err)
    })
  }

  var registerMods = function(context, paths) {
    paths.forEach(function(path) {
      if (path.match(/mods.json$/)) {
        loadActiveMods(context, path)
        return
      }
      api.file.list(path).then(function(top) {
        for (var i in top) {
          if (top[i].match(/modinfo.json$/)) {
            addModinfo(context, top[i])
            return
          }
        }
        console.warn(path, 'had no modinfo')
      }, function(err) {
        console.error(path, 'could not be listed', err)
      })
    })
  }

  var scan = function() {
    modRegistry = []
    api.file.list('/client_mods/').then(function(paths) {
      registerMods('client', paths)
    }, function(err) {
      console.error('client_mods could not be listed', err)
    })
    api.file.list('/server_mods/').then(function(paths) {
      registerMods('server', paths)
    }, function(err) {
      console.error('server_mods could not be listed', err)
    })
  }

  return {
    scan: scan,
    activeMods: activeMods,
  }
})
