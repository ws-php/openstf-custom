/*
用于自定义前端域名使用
 */
console.log('CustomD')
module.exports = angular.module('stf.custom-domain', [

])
  .provider('CustomDomain', require('./custom-domain-provider.js'))
