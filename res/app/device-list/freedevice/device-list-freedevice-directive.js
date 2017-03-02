module.exports = function DeviceListFreedeviceDirective(
$rootScope
, gettext
, FreeDeviceService
) {


  return {
    restrict: 'E'
  , template: require('./device-list-freedevice.jade')
  , scope: {
      freedevices: '&freedevices'
    }
  , link: function(scope, element) {

      // var freedevices = scope.freedevices();

// console.log(freedevices);
      element.on('click', function(e) {



      });

      // FreeDeviceService.devices()
      // .then(function(data){
      //   console.log(data)
      // })
      // .catch(function() {});
    }
  }
}
