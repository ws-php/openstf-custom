module.exports = angular.module('stf.device-list.freedevice', [
	require('stf/freedevice').name
])
  .directive('deviceListFreedevice', require('./device-list-freedevice-directive'))
