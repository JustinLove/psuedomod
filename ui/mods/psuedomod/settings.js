(function() {
  model.resetMods = function() {
    api.file.permazip.mounts({})
    api.file.permazip.unmountAllMemoryFiles()
    api.memory.clear('com.wondible.pa.pamm.mods')
    api.download.delete('com.wondible.pa.pamm.client.zip')
    api.download.delete('com.wondible.pa.pamm.server.zip')
    api.content.remount()
  }

  var pamm_settings = {
    pamm_load_mods: {
      title: 'Load Mods',
      type: 'select',
      options: ['LOAD', 'OFF'],
      default: 'LOAD',
    },
  }

  _.extend(api.settings.definitions.ui.settings, pamm_settings)

  // force model.settingsLists to update
  model.settingDefinitions(api.settings.definitions)

  var $group = $('<div class="sub-group"></div>').appendTo('.option-list.ui .form-group')
  $group.append('<div class="sub-group-title">Mods</div>')

  Object.keys(pamm_settings).forEach(function(setting) {
    $group.append('<div class="option" data-bind="template: { name: \'setting-template\', data: $root.settingsItemMap()[\'ui.' + setting + '\'] }"></div>')
  })

  $group.append(
    '<div class="option">' +
      '<div class="btn_std" id="reset_mods"' +
          'data-bind="click: resetMods, click_sound: \'default\', rollover_sound: \'default\'">'+
        '<div class="btn_label" style="">'+
          'Reset Mods' +
        '</div>'+
      '</div>' +
    '</div>')
})()
