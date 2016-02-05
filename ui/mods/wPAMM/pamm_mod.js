define([], function() {
  "use strict";

  var mod = function(collection) {
    var files = {}
    var path = collection.path + collection.identifier
    files[path + '/modinfo.json'] = modinfo(collection)
    var ui = ui_mod_list(collection)
    files[path + '/ui/mods/ui_mod_list.js'] = ui
    if (collection.context != 'client') {
      files[path + '/ui/mods/ui_mod_list_for_client.js'] = ui
    }
    if (collection.context != 'server') {
      files[path + '/ui/mods/ui_mod_list_for_server.js'] = ui
    }
    files[collection.path + 'mods.json'] = mods(collection)
    return files
  }

  var mods = function(collection) {
    return JSON.stringify({mount_order: collection.enabled})
  }

  var ui_mod_list = function(collection) {
    var enabled = collection.enabledMods()
    var global_mod_list = []
    var scene_mod_list = {}
    enabled.forEach(function(mod) {
      if (!mod.scenes) return;
      _.each(mod.scenes, function(paths, scene) {
        if (scene === 'global_mod_list') {
          global_mod_list = global_mod_list.concat(paths)
        } else {
          if (!scene_mod_list[scene]) scene_mod_list[scene] = []
          scene_mod_list[scene] = scene_mod_list[scene].concat(paths)
        }
      })
    })

    return "var global_mod_list = " + JSON.stringify(global_mod_list, null, 4) + ";\n\nvar scene_mod_list = " + JSON.stringify(scene_mod_list, null, 4) + ";";
  }

  var modinfo = function(collection) {
    var info = {
      "author": "wondible",
      "context": collection.context,
      "date": "2016/01/31",
      "description": collection.identifier,
      "display_name": collection.identifier,
      "identifier": collection.identifier,
      "priority": 0,
      "signature": "not yet implemented",
      "version": "0.0.1"
    }
    return JSON.stringify(info, null, 4)
  }

  return mod
})
