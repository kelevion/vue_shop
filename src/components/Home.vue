<template>

  <!---->
  <el-container class="home-container">
    <!--头部区域-->
    <el-header>
      <div>
        <img alt="" src="../assets/heima.png">
        <span>电商后台管理系统</span>
      </div>
      <el-button type="info" @click="logout">退出</el-button>
    </el-header>
    <!--页面主体区域-->
    <el-container>
      <!--侧边栏-->
      <el-aside v-bind:width="isCollapsed ? '64px' : '200px'">
        <div class="toggle-button" @click="toggleCollapsed">
          |||
        </div>
        <!--侧边栏菜单区域-->
        <el-menu
          :collapse="isCollapsed"
          :collapse-transition="false"
          :default-active="activePath"
          :router="true"
          :unique-opened="true"
          active-text-color="#409EFF"
          background-color="#333744"
          text-color="#fff">
          <!-- 一级菜单-->
          <el-submenu v-for="(item) in menuList" :key="item.id" v-bind:index="item.id + ''">
            <!-- 一级菜单的模板区域-->
            <template slot="title">
              <!-- 图标 -->
              <i v-bind:class="iconObj[item.id]"></i>
              <!-- 文本 -->
              <span>{{ item.authName }}</span>
            </template>

            <!-- 二级菜单 -->
            <el-menu-item v-for="(subItem) in item.children" :key="subItem.id" v-bind:index="'/' + subItem.path"
                          @click="saveNavState('/' + subItem.path)">
              <!-- 二级菜单的模板区域-->
              <template slot="title">
                <!-- 图标 -->
                <i class="el-icon-menu"></i>
                <!-- 文本 -->
                <span>{{ subItem.authName }}</span>
              </template>
            </el-menu-item>
          </el-submenu>
        </el-menu>
      </el-aside>
      <!--右侧内容主体-->
      <el-main>
        <!-- 路由占位符 -->
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
export default {
  data () {
    return {
      // 左侧菜单数据
      menuList: [],
      iconObj: {
        125: 'iconfont icon-user',
        103: 'iconfont icon-tijikongjian',
        101: 'iconfont icon-shangpin',
        102: 'iconfont icon-danju',
        145: 'iconfont icon-baobiao'
      },
      // 是否动态折叠
      isCollapsed: false,
      // 被激活的链接
      activePath: ''
    }
  },
  name: 'Home',
  created () {
    this.getMenuList()
    this.activePath = window.sessionStorage.getItem('activePath')
  },
  methods: {
    logout () {
      // 清空sessionStorage中的token
      window.sessionStorage.clear()
      // 跳转到登录页面
      this.$router.push('/login')
    },
    /**
     * 获取所有的菜单
     */
    async getMenuList () {
      const { data: res } = await this.$http('menus')
      console.log(res)
      if (res.meta.status !== 200) {
        return this.$message.error(res.meta.msg)
      } else {
        this.menuList = res.data
      }
    },
    /**
     * 折叠侧边栏
     */
    toggleCollapsed () {
      this.isCollapsed = !this.isCollapsed
    },
    /**
     * 保存链接的激活状态
     */
    saveNavState (activePath) {
      window.sessionStorage.setItem('activePath', activePath)
      //
      this.activePath = activePath
    }

  }

}
</script>

<style lang="less" scoped>
.home-container {
  height: 100%;
}

.el-header {
  background-color: #373D41;
  display: flex;
  justify-content: space-between;
  padding-left: 0;
  align-items: center;
  color: #fff;
  font-size: 20px;

  > div {
    display: flex;
    align-items: center;

    span {
      margin-left: 15px;
    }
  }
}

.el-aside {
  background-color: #333744;

  .el-menu {
    border-right: none;
  }
}

.el-main {
  background-color: #EAEDF1;
}

.iconfont {
  margin-right: 10px;
}

.toggle-button {
  background-color: #4A5064;
  font-size: 10px;
  line-height: 24px;
  color: #ffffff;
  text-align: center;
  letter-spacing: 0.2em;
  // cursor CSS 属性设置鼠标光标的类型（如果有），以在鼠标指针悬停在元素上时显示
  cursor: pointer;
}
</style>
