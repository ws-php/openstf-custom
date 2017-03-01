module.exports = angular.module('stf/freedevice', [
  require('stf/device').name
])
  .factory('FreeDeviceService', require('./freedevice-service'))
