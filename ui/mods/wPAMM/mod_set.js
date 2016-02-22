define([], function() {
  "use strict";

  // ---------------- set methods -------------

  var ModSet = function ModSet(mods) {
    this.length = 0
    this.merge(mods || [])
  }

  ModSet.prototype.clear = function() {
    for (var i = 0;i < this.length;i++) {
      delete this[i]
    }
    this.length = 0
    return this
  }

  ModSet.prototype.merge = function(mods) {
    var len = mods.length
    var from = 0
    var to = this.length
    for (;from < len;from++,to++) {
      this[to] = mods[from]
    }
    this.length = this.length + len
    return this
  }

  ModSet.prototype.forEach = Array.prototype.forEach

  ModSet.prototype.splice = Array.prototype.splice

  ModSet.prototype.push = Array.prototype.push

  ModSet.prototype.filter = function(f) {
    var set = new ModSet(Array.prototype.filter.call(this, f))
    set.root = this.root || this
    return set
  }

  ModSet.prototype.enabled = function() {
    return this.filter(function(mod) {return mod.enabled})
  }

  ModSet.prototype.context = function(context) {
    return this.filter(function(mod) {return mod.context == context})
  }

  ModSet.prototype.client = function() {
    return this.context('client')
  }

  ModSet.prototype.server = function() {
    return this.context('server')
  }

  ModSet.prototype.filesystem = function() {
    return this.filter(function(mod) {return mod.installedPath && mod.installedPath != ''})
  }

  ModSet.prototype.zip = function() {
    return this.filter(function(mod) {return mod.zipPath})
  }

  ModSet.prototype.find = function(identifiers) {
    if (!Array.isArray(identifiers)) identifiers = [identifiers]
    return this.filter(function(mod) {
      return identifiers.indexOf(mod.identifier) != -1
    })
  }

  var corpus = function(mod) {
    return [
      mod.display_name.toLowerCase(),
      mod.description.toLowerCase(),
      mod.author.toLowerCase(),
      (mod.category || []).join(',').toLowerCase()
    ].join(';')
  }

  ModSet.prototype.search = function(text) {
    text = text.toLowerCase()
    return this.filter(function(mod) {
      if (!mod.copus) mod.corpus = corpus(mod)
      return mod.corpus.match(text)
    })
  }

  ModSet.prototype.withDependencies = function() {
    var my = this
    var root = my.root || my
    var expanded = new ModSet(my.serialize())
    expanded.root = root
    var has = expanded.getIdentifiers()
    var needs = _.uniq(_.flatten(_.compact(
      my.map(function(mod) { return mod.dependencies })
    )))
    var missing = []
    var crazy = 0
    while (needs.length > 0 && crazy++ < 100) {
      var id = needs.pop()
      var mod = _.find(root, {identifier: id})
      if (mod) {
        expanded.push(mod)
        has.push(mod.identifier)
        if (mod.dependencies && mod.dependencies.length > 0) {
          needs = _.difference(mod.dependencies, has, needs, missing).concat(needs)
        }
      } else {
        console.warn(id, 'dependency not found')
        missing.push(id)
      }
    }
    expanded.missing = missing
    return expanded
  }

  ModSet.prototype.withConsumers = function() {
    var my = this
    var root = my.root || my
    var expanded = new ModSet(my.serialize())
    expanded.root = root
    var has = expanded.getIdentifiers()
    var work = has.slice(0)
    var crazy = 0
    while (work.length > 0 && crazy++ < 100) {
      var id = work.pop()
      for (var i in root) {
        var mod = root[i]
        if (mod.dependencies
         && mod.dependencies.indexOf(id) != -1
         && has.indexOf(mod.identifier) == -1) {
          expanded.push(mod)
          has.push(mod.identifier)
          work.push(mod.identifier)
        }
      }
    }
    return expanded
  }

  ModSet.prototype.deserialize = function(state) {
    return this.clear().merge(state)
  }

  // ---------------- accessors -------------

  ModSet.prototype.serialize = function() {
    return Array.prototype.slice.call(this)
  }

  ModSet.prototype.map = Array.prototype.map

  ModSet.prototype.getIdentifiers = function() {
    return this.map(function(mod) {return mod.identifier})
  }

  ModSet.prototype.getMounts = function(path) {
    var mounts = {}
    this.zip().forEach(function(mod) {
      //console.log('will mount ', my.mods[i].zipPath)
      mounts[mod.zipPath] = path
    })
    return mounts
  }

  // ---------------- actions -------------

  var neverEnable = [
    'com.pa.deathbydenim.dpamm',
    'com.pa.raevn.rpamm',
    'com.pa.pamm.server',
  ]

  var neverDisable = [
    'com.wondible.pa.pamm.client',
    'com.wondible.pa.pamm.server',
  ]

  ModSet.prototype.setEnable = function() {
    this.forEach(function(mod) {
      if ((mod.zipPath || (mod.installedPath && mod.installedPath != ''))
          && neverEnable.indexOf(mod.identifier) == -1) {
        mod.enabled = true
      }
    })
    return this
  }

  ModSet.prototype.setDisable = function() {
    this.forEach(function(mod) {
      if (neverDisable.indexOf(mod.identifier) == -1) {
        mod.enabled = false
      }
    })
    return this
  }

  return ModSet
})
