module.exports = function DeviceListMonkeyDirective() {
  return {
    restrict: 'E'
  , template: require('./device-list-monkey.jade')
  , scope: {
      freedevices: '&freedevices'
    }
  , link: function(scope) {
      /*
      上面的 scope中指定的属性必须在模版中指定,并以 & 符号接过来.
      调用的时候可以直接使用 scope.shuxing()
       */
      // 异步的数据要使用回调的形式来搞,不然踩坑严重
      var freedevices = scope.freedevices()

console.log("不要踩异步数据的坑",freedevices.devices.length);

      scope.empty = !freedevices.devices.length

      function update() {
        var oldEmpty = scope.empty
        var newEmpty = !freedevices.devices.length
console.log('可用设备个数: ', freedevices.devices)
        if (oldEmpty !== newEmpty) {
          scope.$apply(function() {
            scope.empty = newEmpty
          })
        }
      }

      freedevices.on('add', update)
      freedevices.on('change', update)
      freedevices.on('remove', update)

      scope.$on('$destroy', function() {
        freedevices.removeListener('add', update)
        freedevices.removeListener('change', update)
        freedevices.removeListener('remove', update)
      })
    }
  }
}
