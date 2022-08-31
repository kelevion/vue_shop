# vue_project



## 步骤①: 启动后台服务

### 1.文档对应目录

gitee上对应目录 `doc/vue电商/3.vue-项目实战day1/素材`

![image-20211201161503831](https://gitee.com/hliushi/pic-go_-image/raw/master/img/work/image-20211201161503831.png)



clone到磁盘上目录

![image-20211201161732379](https://gitee.com/hliushi/pic-go_-image/raw/master/img/work/image-20211201161732379.png)





### 2.解压vue_api_server

> Tips: 
>
> 压缩包里面是没有`node_modules`依赖, 笔者原本想把`node_modules`依赖放进入压缩包的, 但是体积过大, 超过了gitee一次提交上传最大限制
>
> 所以需要先使用`npm install`按照依赖!!!

![image-20211201161938615](https://gitee.com/hliushi/pic-go_-image/raw/master/img/work/image-20211201161938615.png)





### 3.npm install安装依赖

![image-20211201162453569](https://gitee.com/hliushi/pic-go_-image/raw/master/img/work/image-20211201162453569.png)





### 4.初始化数据库

进入`vue_api_server\db`目录, 里面只有一个`mysql.sql`, 这是项目的初始化sql文件. 然后使用一些常见的mysql数据库工具, 把脚本导入进入, 完成**`后台项目的数据库创建`**



![image-20211201163441920](https://gitee.com/hliushi/pic-go_-image/raw/master/img/work/image-20211201163441920.png)



### 5.配置后台服务的数据库地址

进入`vue_api_server\config`目录, 修改里面的`default.json`配置文件, 修改里面的mysql数据库地址



> `default.json`配置修改如下
>
> 主要修改`db_config`节点中的`host`、`database`、`user`、`password`字段, 修改为上一步数据库的地址

![image-20211201163731489](https://gitee.com/hliushi/pic-go_-image/raw/master/img/work/image-20211201163731489.png)







### 5.使用 node app.js 运行服务

![image-20211201162708612](https://gitee.com/hliushi/pic-go_-image/raw/master/img/work/image-20211201162708612.png)



> 如果看到这个界面, 就证明了后台服务启动成功了

![image-20211201163856459](https://gitee.com/hliushi/pic-go_-image/raw/master/img/work/image-20211201163856459.png)





## 步骤②: 启动前端服务

`clone`或`download`项目后, 直接在对应的目录执行`npm install`, 直接把前端服务所需要的依赖全部安装, 然后在执行对应的`npm run serve`即可启动前端服务





### Customize configuration

See [Configuration Reference](https://cli.vuejs.org/config/).

```
安装 依赖
npm install vue-table-with-tree-grid@0.2.4
npm i vue-quill-editor@3.0.6
npm i lodash@4.17.11
npm i echarts@4.1.0
npm i nprogress@0.2.0
安装开发依赖
npm i babel-plugin-transform-remove-console@6.9.4 --save-dev
npm i @babel/plugin-syntax-dynamic-import@7.2.0 --save-dev
全局安装nodemon包
npm install -g nodemon
#
使用pm2管理应用
在服务器中安装pm2: npm i pm2 -g
启动项目: pm2 start 脚本 --name 自定义名称
查看运行项目: pm2 ls
重启项目: pm2 restart 自定义名称
停止项目: pm2 stop 自定义名称
删除项目: pm2 delete 自定义名称

启动服务端  node app.js
```

