module.exports = function MenuCtrl($scope, $rootScope, SettingsService,
  $location) {

  $scope.showis = $location.path().search('/ycb/') === -1

  SettingsService.bind($scope, {
    target: 'lastUsedDevice'
  })

  SettingsService.bind($rootScope, {
    target: 'platform',
    defaultValue: 'native'
  })

  $scope.$on('$routeChangeSuccess', function() {
    $scope.isControlRoute = $location.path().search('/control') !== -1
  })

}
