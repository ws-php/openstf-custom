module.exports = function DeviceListFreedeviceDirective(
$rootScope
, gettext
, FreeDeviceService
) {
  return {
    restrict: 'E'
  , template: require('./device-list-freedevice.jade')
  , scope: {
      tracker: '&tracker'
    }
  , link: function(scope) {
      FreeDeviceService.devices()
      .then(function(data){
        console.log(data)
      })
      .catch(function() {});
    }
  }
}
