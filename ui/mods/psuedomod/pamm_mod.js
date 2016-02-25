define([], function() {
  "use strict";

  var mod = function(collection) {
    var files = {}
    var path = collection.identifier
    files[path + '/modinfo.json'] = modinfo(collection)
    var ui = ui_mod_list(collection)
    files[path + '/ui/mods/ui_mod_list.js'] = ui
    if (collection.context != 'client') {
      files[path + '/ui/mods/ui_mod_list_for_client.js'] = ui
    }
    if (collection.context != 'server') {
      files[path + '/ui/mods/ui_mod_list_for_server.js'] = ui
    }
    files['mods.json'] = mods(collection)
    return files
  }

  var mods = function(collection) {
    return JSON.stringify({mount_order: collection.enabledIdentifiers()})
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

    if (collection.context == 'server') {
      return server_ui_mod_list(global_mod_list, scene_mod_list)
    } else {
      return client_ui_mod_list(global_mod_list, scene_mod_list)
    }
  }

  var client_ui_mod_list = function(global_mod_list, scene_mod_list) {
      return "var global_mod_list = " + JSON.stringify(global_mod_list, null, 4) + ";\n\nvar scene_mod_list = " + JSON.stringify(scene_mod_list, null, 4) + ";";
  }

  var server_ui_mod_list = function(global_mod_list, scene_mod_list) {
      return "var global_server_mod_list = " + JSON.stringify(global_mod_list, null, 4) + ";\n\nvar scene_server_mod_list = " + JSON.stringify(scene_mod_list, null, 4) + ";\n\ntry { \n\nloadScript('coui://ui/mods/ui_mod_list_for_server.js');\n\ntry { global_mod_list = _.union( global_mod_list, global_server_mod_list ) } catch (e) { console.log(e); } ;\n\ntry { _.forOwn( scene_server_mod_list, function( value, key ) { if ( scene_mod_list[ key ] ) { scene_mod_list[ key ] = _.union( scene_mod_list[ key ], value ) } else { scene_mod_list[ key ] = value } } ); } catch (e) { console.log(e); } \n\n\} catch (e) {\n\nconsole.log(e);\n\nvar global_mod_list = global_server_mod_list;\n\nvar scene_mod_list = scene_server_mod_list;\n\n}\n\n";
  }

  var modinfo = function(collection) {
    var info = {
      "author": "wondible",
      "context": collection.context,
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
