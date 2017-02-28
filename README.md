# openstf-custom

openstf是什么,服务器端环境如何安装配置此处就不表了,参见: https://testerhome.com/topics/2988


最近需要在openstf上进行二次开发,前端团队这块主要针对界面的程序界面上进行功能调整,由于电脑不是mac,不能在本地私有部署stf环境,所以想依托公共的stf服务端环境 **10.0.2.124:7100**, 在本地开发调试其前端的js代码.

首选肯定是 nginx,原因参见[前端测试环境构建小讲](http://www.jianshu.com/p/5c2f114476bc)

首先在hosts文件新增一行
```
127.0.0.1 stf.local
```
其次在nginx配置文件中新增如下行:
```
server {
    listen 80;
    server_name stf.local;

    default_type 'text/html; charset=UTF-8';

    location /static/app/build/ {
        alias C:/work/space/stf/res/build/;
    }

    location / {
        proxy_pass http://10.0.2.124:7100/;
        proxy_set_header   X-Forwarded-For $proxy_add_x_forwarded_for; 
        proxy_pass_header Server;

        proxy_redirect http://10.0.2.124:7100/ http://stf.local/;
        proxy_set_header Host $proxy_host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Scheme $scheme;
        
    }
}
#server stf.local end}
```
因为 stf会在响应头中大量使用重定向到服务端地址,故使用 proxy_redirect 将响应头中的location 里的*http://10.0.2.124:7100/* 转换成 *http://stf.local/*. 再将 /static/app/build/ 的路径指到本地的代码路径*C:/work/space/stf/res/build/*,此目录是使用webpack生成的压缩代码.

现在我们就可以在本地访问 http://stf.local 会打开一个登录页,输入用户名和邮箱之后,点击提交按钮,接着会跳到: 
```
http://10.0.2.124:7100/?jwt=eyJhbGciOiJIUzI1NiIsImV4cCI6MTQ4ODE5MDA1NzEyOH0.eyJlbWFpbCI6Inh4QHFxLmNvbSIsIm5hbWUiOiJ4eCJ9.DOOT1yZx6MXtCGzUWoPFxYuJYCw_wIHLslCJxEh5sp8
```
但这并不是我想要的结果,我想它变成:
```
http://stf.local/?jwt=eyJhbGciOiJIUzI1NiIsImV4cCI6MTQ4ODE5MDA1NzEyOH0.eyJlbWFpbCI6Inh4QHFxLmNvbSIsIm5hbWUiOiJ4eCJ9.DOOT1yZx6MXtCGzUWoPFxYuJYCw_wIHLslCJxEh5sp8
```
通过分析代码发现,在 
```
C:\work\space\stf\res\build\5.72bd91b15fb1f9d91db5.chunk.js:32557
因为重定向的页面地址是服务端json串中返回的,所以nginx的proxy_redirect设置并不能防治,所以需要手动将其进行如下修改:
$http.post('/auth/api/v1/mock', data)
	      .success(function (response) {
	        $scope.error = null;
	        console.log(response);
	        var redirect = response.redirect.replace('10.0.2.124:7100', 'stf.local');
	        location.replace(redirect);
	        //return ;
	        //location.replace(response.redirect);
	      })
```

此时,就可以完整进行登录,上传,安装等操作.

至此实现了第一个目标,能在本地修改代码并使用本地的前端代码跑起来了.但是缺点是只能修改webpack生成的合并后的代码,开发仍然是很麻烦,下一个目标就是解决此问题.

在昨天的工作中初步构建一个本地基本可修改运行的前端环境,但毕竟是在webpack合并的代码中进行修改,不利于自定义开发,故今天仍然是在整理这个环境,使其能够满足编辑代码实时合并刷新页面看到效果.

本来以为这个过程非常简易完成,谁知道摸索了1天的时间才完成90%的工作量.首先通过阅读stf根目录下的 ``package.json`` 文件,发现要用到webpack,gulp,bower等构建工具.

首先配置npm 源
```
修改源地址为淘宝 NPM 镜像
npm config set registry http://registry.npm.taobao.org/
修改源地址为官方源
npm config set registry https://registry.npmjs.org/
```

简单的想通过运行: 
```
npm install
bower install 
```
来完成构建工作.

谁知道在此遇到巨大的坑,首先是webpack的版本要求, 不要使用webpack2,变动太大,还有 phantomjs总是下不下来,分析才知道 phantomjs 是用来做测试使用的,我当前用不到,直接剔除就行了.所以移除如下两行:
```
"karma-phantomjs-launcher": "^1.0.0",
"phantomjs-prebuilt": "^2.1.3",
```
紧接着 node-sass 的问题,咨询朋友得知可能与node版本有关系,我当前是5.3.0,索性升级到6.10.解决此问题

```
npm install webpack@1.14.1 -g
npm install webpack-dev-server@1.14.1 -g
npm install gulp@3.9.1 -g
npm install bower@1.8.0 -g
npm install node-sass --save-dev
npm install node-gyp rebuild -g
```
期间遇到很多次安装失败,都是网络原因,库下载不下来,幸好最终还是下载完成了.

接着分析 ``gulpfile.js`` 文件.在里面新增一行:
```
gulp.task('mb', ['clean','jade','webpack:others', 'webpack:build'])
```
方便代码生成.当前还是不知道如何像使用grunt watch 一样来监听代码的变动做到自动生成合并.

接着 执行 ``gulp md`` 来生成res/build目录下的代码,打开浏览器访问 http://stf.local 发现可以登录,也可以去到设备列表,但是直接弹出一个连接失败的提示框,关闭之后,在设备列表中选择可以使用的设备时弹出找不到设备的错误提示.

仔细比对 10.0.2.124 的代码发现是websocket链接获取不到cookie造成的, ``
ws://10.0.2.124:7110/socket.io/uip=127.0.0.1&EIO=3&transport=websocket
``

由于websocket的服务是由 http://10.0.2.124:7100/app/api/v1/state.js 接口传回来的数据设置的,其中结果大致如下:
```
var GLOBAL_APPSTATE = {"config":{"websocketUrl":"http://10.0.2.124:7110/?uip=127.0.0.1"},"user":{"createdAt":"2017-02-28T12:30:51.993Z","email":"xsd@c.cn","forwards":[],"group":"xAC2VJzvQIOxmUXdKVSK2g==","ip":"127.0.0.1","lastLoggedInAt":"2017-02-28T12:30:51.993Z","name":"xxx","settings":{}}}
```
因为端口号不同,所以对nginx配置进行了一些调整:
```
server {
    listen 80;
    server_name stf.local;

    default_type 'text/html; charset=UTF-8';

    location /static/app/build/ {
        alias C:/work/space/stf-all/stf-2.0.0/res/build/;
        #alias C:/work/space/stf/res/build/;
    }

    location / {
        proxy_pass http://10.0.2.124:7100/;
        proxy_set_header   X-Forwarded-For $proxy_add_x_forwarded_for; 
        proxy_pass_header Server;

        proxy_redirect http://10.0.2.124:7100/ http://stf.local/;
        proxy_set_header Host $proxy_host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Scheme $scheme;      
    }
}

map $http_upgrade $connection_upgrade {  
    default upgrade;  
    '' close;  
}
upstream stf-websocket {  
    server 10.0.2.124:7110;  
}  
server {  
    listen 7110;
    server_name stf.local;
    location / {  
        proxy_pass http://stf-websocket;  
        proxy_http_version 1.1;  
        proxy_set_header Upgrade $http_upgrade;  
        proxy_set_header Connection "Upgrade";  
    }  
}
#server stf.local end}
```
新增一个 websocket的转发代理,另外搜索

通过搜索 `GLOBAL_APPSTATE `找到文件 `C:\work\space\stf-all\stf-2.0.0\res\app\components\stf\app-state\app-state-provider.js`
将其中部分代码调整成如下所示:
```
/* global GLOBAL_APPSTATE:false */
  if (typeof GLOBAL_APPSTATE !== 'undefined') {
    console.log(GLOBAL_APPSTATE);
    values = angular.extend(values, GLOBAL_APPSTATE);
    // replace
    values.config.websocketUrl = values.config.websocketUrl.replace('10.0.2.124', 'stf.local');
    console.log(values);
  }
```

执行 ``gulp md`` 重新访问stf.local,就正常操作.

至此 我们已经可以修改实际的源码,并通过 指令来合并代码了. 先这么用着吧,代码热更新的话留着之后再说吧,明天终于可以动手进行stf的深入学习了.