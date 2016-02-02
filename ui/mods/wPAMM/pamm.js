define([
  'pamm/registry',
  'pamm/collection',
], function(registry, Collection) {
  "use strict";

  var client = new Collection('client', '/client_mods/')
  var server = new Collection('server', '/server_mods/')

  return {
    client: client,
    server: server
  }
})
