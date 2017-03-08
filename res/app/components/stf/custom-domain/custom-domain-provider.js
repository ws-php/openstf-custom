module.exports = function CustomDomainProvider() {
  var provider = {} 

  provider.getWwwUrl = function(wwwUrl)
  {
  	return wwwUrl.replace('10.0.2.124:7100', 'stf23.local');
  }

  provider.getWebsocketUrl = function(websocketUrl)
  {
  	return websocketUrl.replace('10.0.2.124:7110', 'stf23.local:7110');
  }
  
  return {
    $get: function() {
      return provider
    }
  }
}

