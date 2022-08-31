import Vue from 'vue'
import App from './App.vue'
// 下面那句话等同这句话, router是一个路径, 省略了后面的index.js文件 import router from './router/index.js'
import router from './router'
/**
 * 通过CDN优化ElementUI的打包
 * 1.在main-prod.js中, 注释掉element-ui按需加载的代码
 * 2.在index.html的头部区域中, 通过CDN加载element-ui的js和css样式
 */
// import './plugins/element.js'
// 导入全局样式
import './assets/css/global.css'
// 导入字体图标
import './assets/fonts/iconfont.css'
//
import axios from 'axios'

import TreeTable from 'vue-table-with-tree-grid'

// 导入富文本编辑器
import VueQuillEditor from 'vue-quill-editor'
// 导入富文本编辑器对应的样式
// import 'quill/dist/quill.core.css'
// import 'quill/dist/quill.snow.css'
// import 'quill/dist/quill.bubble.css'
// 导入 NProgress 包对应的JS和CSS
import NProgress from 'nprogress'
// import 'nprogress/nprogress.css'

Vue.prototype.$http = axios
// 配置请求的根路径
axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'
// 配置
// 在request拦截器中, 展示进度条 NProgress.start()
axios.interceptors.request.use(config => {
  NProgress.start()
  // console.log(config)
  config.headers.Authorization = window.sessionStorage.getItem('token')
  // 在最后必须 return config
  return config
})
// 在response拦截器中, 隐藏进度条 NProgress.done()
axios.interceptors.response.use(config => {
  NProgress.done()
  return config
})
Vue.config.productionTip = false

Vue.filter('dateFormat', function (originVal) {
  const dt = new Date(originVal)
  const year = dt.getFullYear()
  const month = (dt.getMonth() + 1 + '').padStart(2, '0')
  const day = (dt.getDate() + '').padStart(2, '0')
  const hour = (dt.getHours() + '').padStart(2, '0')
  const minute = (dt.getMinutes() + '').padStart(2, '0')
  const second = (dt.getSeconds() + '').padStart(2, '0')

  return `${year}-${month}-${day} ${hour}:${minute}:${second}`
})

// 全局挂载
Vue.component('tree-table', TreeTable)
// 将富文本编辑器, 注册为全局可用的组件
Vue.use(VueQuillEditor)

new Vue({
  // 将路由挂载到实例对象中
  router,
  render: h => h(App)
}).$mount('#app')
