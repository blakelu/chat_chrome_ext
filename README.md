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
