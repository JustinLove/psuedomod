define([], function() {
  var downloadAvailable = function() {
    api.download.start('https://pamm-mereth.rhcloud.com/api/mod', 'available_mods.json')
  }

  return {
    downloadAvailable: downloadAvailable,
  }
})
