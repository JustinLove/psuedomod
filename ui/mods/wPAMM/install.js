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
    })
  }

  var uninstall = function(mod) {
    if (!mod.zipPath) {
      console.error(mod.identifier, 'has no zip to uninstall')
      return
    }
    var zipPath = mod.zipPath
    delete mod.zipPath
    return api.download.delete(zipPath.replace('/download/', ''))
  }

  return {
    install: install,
    uninstall: uninstall,
  }
})
