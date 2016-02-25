define([
  'pamm/download',
  'pamm/fix_paths',
], function(download, fix_paths) {
  "use strict";

  var install = function(mod) {
    if (!mod.url) {
      console.error(mod.identifier, 'has no url to install')
      return
    }
    var cache = 'cache-'+mod.identifier + '_v' + mod.version + '.zip'
    var target = mod.identifier + '.zip'
    return api.download.list().then(function install_download_list(downloads) {
      if (downloads.indexOf(cache) == -1) {
        return download.fetch(mod.url, cache).then(function(status) {
          return fix_paths(status.file, target, mod.identifier)
        })
      } else {
        return fix_paths(cache, target, mod.identifier)
      }
    }).then(function install_touchup(status) {
      mod.zipPath = '/download/'+status.file;
      mod.installed = true
      return status
    }, function install_failed(status) {
      return status
    })
  }

  var uninstall = function(mod) {
    if (!mod.zipPath) {
      console.error(mod.identifier, 'has no zip to uninstall')
      return
    }
    var downloadItem = mod.zipPath.replace('/download/', '') 
    delete mod.zipPath
    mod.installed = false
    return api.download.delete(downloadItem)
  }

  return {
    install: install,
    uninstall: uninstall,
  }
})
