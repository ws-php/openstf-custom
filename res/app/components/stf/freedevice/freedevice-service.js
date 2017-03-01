var oboe = require('oboe')

module.exports = function FreeDeviceServiceFactory(
	$http, DeviceService, gettext
) {
	var freeDeviceService = {}

	freeDeviceService.devices = function()
	{
		return $http.get('/api/v1/devices?kenis=123')
		      .then(function(response) {
		        return response.data
		      }) 
	}

	return freeDeviceService
}