# how to use

1.下载release下的 ext.zip

2.解压

3.在支持chrome插件的浏览器 如chrome/edge... 加载已解压的扩展程序， 即可在右上角插件图标点击激活使用

![image](https://github.com/blakelu/chat_chrome_ext/assets/13463232/7a5a1670-ca08-48d0-99fe-e9d7c8cda3c8)



# chrome插件开发学习记录（mv3版本）

## manifest.json 文件
关键属性

action 用于电机插件图片弹出的窗口页面

content_scripts  用户嵌入到tab页面内的dom

background 全局js，v2版本用的是html v3版本用的是service worker

web_accessible_resources 插件中用到的静态资源

host_permissions  允许跨域，访问后端服务的地址配置


## chrome如何加载插件  （如何结合vue开发？）
读取 manifest.json 文件
