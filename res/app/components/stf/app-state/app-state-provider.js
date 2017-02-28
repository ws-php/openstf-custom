module.exports = function AppStateProvider() {
  var values = {
    config: {
      websocketUrl: ''
    },
    user: {
      settings: {}
    }
  }

  /* global GLOBAL_APPSTATE:false */
  if (typeof GLOBAL_APPSTATE !== 'undefined') {
    console.log(GLOBAL_APPSTATE);
    values = angular.extend(values, GLOBAL_APPSTATE);
    // replace
    values.config.websocketUrl = values.config.websocketUrl.replace('10.0.2.124', 'stf.local');
    console.log(values);
  }

  return {
    set: function(constants) {
      angular.extend(values, constants)
    },
    $get: function() {
      return values
    }
  }
}
