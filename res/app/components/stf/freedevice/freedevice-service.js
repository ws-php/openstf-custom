var oboe = require('oboe')
var _ = require('lodash')
var EventEmitter = require('eventemitter3')

module.exports = function FreeDeviceServiceFactory(
	$http, socket, DeviceService, gettext
) {
	var freeDeviceService = {}

	function FreeDevice($scope, options){
		var devices = [];

		// 用于监听增减设备时触发事件
		var scopedSocket = socket.scoped($scope)

		var devicesBySerial = Object.create(null)
		var digestTimer, lastDigest

	    $scope.$on('$destroy', function() {
	      clearTimeout(digestTimer)
	    })

	    function digest() {
	      // Not great. Consider something else
	      if (!$scope.$$phase) {
	        $scope.$digest()
	      }

	      lastDigest = Date.now()
	      digestTimer = null
	    }

	    function notify(event) {
	      if (!options.digest) {
	        return
	      }

	      if (event.important) {
	        // Handle important updates immediately.
	        //digest()
	        window.requestAnimationFrame(digest)
	      }
	      else {
	        if (!digestTimer) {
	          var delta = Date.now() - lastDigest
	          if (delta > 1000) {
	            // It's been a while since the last update, so let's just update
	            // right now even though it's low priority.
	            digest()
	          }
	          else {
	            // It hasn't been long since the last update. Let's wait for a
	            // while so that the UI doesn't get stressed out.
	            digestTimer = setTimeout(digest, delta)
	          }
	        }
	      }
	    }

		function sync(data) {
	      // usable IF device is physically present AND device is online AND
	      // preparations are ready AND the device has no owner or we are the
	      // owner
	      data.usable = data.present && data.status === 3 && data.ready &&
	        (!data.owner || data.using)

	      // Make sure we don't mistakenly think we still have the device
	      if (!data.usable || !data.owner) {
	        data.using = false
	      }

	      // console.log(data)
	    }

	    function get(data) {
	      return devices[devicesBySerial[data.serial]]
	    }

		var insert = function insert(data) {
	      devicesBySerial[data.serial] = devices.push(data) - 1
	      sync(data)
	      this.emit('add', data)
	    }.bind(this)

	    var modify = function modify(data, newData) {
	      _.merge(data, newData, function(a, b) {
	        // New Arrays overwrite old Arrays
	        if (_.isArray(b)) {
	          return b
	        }
	      })
	      sync(data)
	      this.emit('change', data)
	    }.bind(this)

	    var remove = function remove(data) {
	      var index = devicesBySerial[data.serial]
	      if (index >= 0) {
	        devices.splice(index, 1)
	        delete devicesBySerial[data.serial]
	        this.emit('remove', data)
	      }
	    }.bind(this)

	    function fetch(data) {
	      DeviceService.load(data.serial)
	        .then(function(device) {
	          return changeListener({
	            important: true
	          , data: device
	          })
	        })
	        .catch(function() {})
	    }


	    function addListener(event) {
	      var device = get(event.data)
	      if (device) {
	        modify(device, event.data)
	        notify(event)
	      }
	      else {
	        if (options.filter(event.data)) {
	          insert(event.data)
	          notify(event)
	        }
	      }
	    }

	    function changeListener(event) {
	      var device = get(event.data)

	      if (device) {
	        modify(device, event.data)

	        console.log('change: had', device)
	        if (!options.filter(device)) {
	          remove(device)
	        }
	        notify(event)
	      }
	      else {
	      	console.log('change: new', event.data)
	        if (options.filter(event.data)) {

	          insert(event.data)
	          // We've only got partial data
	          fetch(event.data)
	          notify(event)
	        }
	      }
	    }

	    scopedSocket.on('device.add', addListener)
	    scopedSocket.on('device.remove', changeListener)
	    scopedSocket.on('device.change', changeListener)

		this.add = function(device) {
	      addListener({
	        important: true
	      , data: device
	      })
	    }

	    this.devices = devices
	}

	FreeDevice.prototype = new EventEmitter()

	function isUsable(device)
	{
		return device.present && device.status === 3 && device.ready &&
	        (!device.owner || device.using)
	}

	// 获取初始值
	freeDeviceService.getAll = function($scope) {
	    var freeDevice = new FreeDevice($scope, {
	      filter: function(device) {
	      	var usable = isUsable(device);
	      	console.log(usable,device.using,device)
	      	return usable
	      }
	      , digest: false
	  	})

	    oboe('/api/v1/devices?kenis=123')
	      .node('devices[*]', function(device) {
	        freeDevice.add(device)
	      })

	    return freeDevice
	  }

	// 返回可用设备的列表(Deferred类型)
	freeDeviceService.deferredDevices = function()
	{
		return $http.get('/api/v1/devices?kenis=123')
		      .then(function(response) {
		        return response.data
		      }) 
	}

	return freeDeviceService
}