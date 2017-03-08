require('./signin.css')

module.exports = angular.module('stf.signin', [
		require('stf/custom-domain').name
	])
  .config(function($routeProvider) {
    $routeProvider
      .when('/auth/mock/', {
        template: require('./signin.pug')
      })
  })
  .controller('SignInCtrl', require('./signin-controller'))
