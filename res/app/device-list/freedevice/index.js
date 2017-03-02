module.exports = angular.module('stf.device-list.freedevice', [
	require('stf/freedevice').name,
	require('../monkey').name
])
  .directive('deviceListFreedevice', require('./device-list-freedevice-directive'))
