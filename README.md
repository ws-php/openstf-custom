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

至此实现了第一个目标,能在本地修改代码并使用本地的前端代码跑起来了.但是缺点是只能修改webpack生成的合并后的代码,开发仍然是很麻烦,下一个目标就是解决此问题