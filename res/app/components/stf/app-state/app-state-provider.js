module.exports = function AppStateProvider(CustomDomainProvider) {

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
    // console.log('GLOBAL_APPSTATE: ', GLOBAL_APPSTATE);
    values = angular.extend(values, GLOBAL_APPSTATE);
    // replace 
    values.config.websocketUrl = CustomDomainProvider.$get().getWebsocketUrl(values.config.websocketUrl);
    console.log('GLOBAL_APPSTATE: ', values)
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
