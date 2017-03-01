module.exports = function DeviceListMonkeyDirective() {
  return {
    restrict: 'E'
  , template: require('./device-list-monkey.jade')
  , scope: {
      tracker: '&tracker'
    }
  , link: function(scope) {
      var tracker = scope.tracker()

      scope.monkey = !tracker.devices.length

      function update() {
        var oldEmpty = scope.monkey
        var newEmpty = !tracker.devices.length

        if (oldEmpty !== newEmpty) {
          scope.$apply(function() {
            scope.monkey = newEmpty
          })
        }
      }

      tracker.on('add', update)
      tracker.on('change', update)
      tracker.on('remove', update)

      scope.$on('$destroy', function() {
        tracker.removeListener('add', update)
        tracker.removeListener('change', update)
        tracker.removeListener('remove', update)
      })
    }
  }
}
