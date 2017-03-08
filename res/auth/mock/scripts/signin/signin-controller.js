module.exports = function SignInCtrl($scope, $http, CustomDomain) {

  $scope.error = null

  $scope.submit = function() {
    var data = {
      name: $scope.signin.username.$modelValue
      , email: $scope.signin.email.$modelValue
    }
    $scope.invalid = false
    $http.post('/auth/api/v1/mock', data)
      .success(function(response) {
        $scope.error = null;
        console.log('{api}/auth/api/v1/mock',response);
        var redirect = CustomDomain.getWwwUrl(response.redirect);
        console.log(redirect);
        location.replace(redirect);
      })
      .error(function(response) {
        switch (response.error) {
          case 'ValidationError':
            $scope.error = {
              $invalid: true
            }
            break
          case 'InvalidCredentialsError':
            $scope.error = {
              $incorrect: true
            }
            break
          default:
            $scope.error = {
              $server: true
            }
            break
        }
      })
  }
}
