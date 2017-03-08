module.exports = angular.module('stf.app-state', [
	require('stf/custom-domain').name
]).provider('AppState', require('./app-state-provider.js'))
