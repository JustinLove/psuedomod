define([], function() {
  "use strict";

  // jquery when, with progress stuff removed

  var slice = Array.prototype.slice

  return function( resolveValues ) {
    var i = 0,
    subordinate = resolveValues[0],
    length = resolveValues.length,

    // the count of uncompleted subordinates
    remaining = length !== 1 || ( subordinate && typeof(subordinate.always) == 'function' ) ? length : 0,

    // the master Deferred. If resolveValues consist of only a single Deferred, just use that.
    deferred = remaining === 1 ? subordinate : engine.createDeferred(),

    // Update function for resolve
    updateFunc = function( i) {
      return function( value ) {
        resolveValues[ i ] = arguments.length > 1 ? slice.call( arguments ) : value;
        if ( !( --remaining ) ) {
          deferred.resolve( resolveValues );
        }
      };
    };

    // Add listeners to Deferred subordinates; treat others as resolved
    if ( length > 1 ) {
      for ( ; i < length; i++ ) {
        if ( resolveValues[ i ] && typeof( resolveValues[ i ].always ) == 'function' ) {
          resolveValues[ i ]
          .always( updateFunc( i ) )
          .otherwise( deferred.reject )
        } else {
          --remaining;
        }
      }
    }

    // If we're not waiting on anything, resolve the master
    if ( !remaining ) {
      deferred.resolve( resolveValues );
    }

    return deferred;
  }
})
