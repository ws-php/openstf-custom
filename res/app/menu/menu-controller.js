module.exports = function MenuCtrl($scope, $rootScope, SettingsService,
  $location) {
 if ($location.path().search('/ycb/') !== -1)
 {
  $scope.showis = false
 }
 else
 {
  $scope.showis = true
 }
  

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
