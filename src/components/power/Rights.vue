<template>
  <div>
    <!--面包屑导航区域-->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>权限列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图-->
    <el-card>

      <!-- 权限列表区域
        stripe 条纹
      -->
      <el-table
        v-loading="!rightsList.length"
        :data="rightsList" :stripe="true"
        border
        element-loading-text="拼命加载中"
        style="width: 100%">
        <el-table-column label="#"
                         type="index">
        </el-table-column>
        <el-table-column label="权限名称"
                         prop="authName">
        </el-table-column>
        <el-table-column label="路径"
                         prop="path">
        </el-table-column>
        <el-table-column label="权限等级"
                         prop="level">
          <!-- 作用域插槽模式, 自定义输出格式
              注意: 这个权限scope.row.level 是一个字符串, 不能用数字进行判断
              v-if   v-else-if  v-else的写法注意下, 最后一个v-else可以不加判断条件
          -->
          <template slot-scope="scope">
            <el-tag v-if="scope.row.level === '0'">一级</el-tag>
            <el-tag v-else-if="scope.row.level === '1'" type="success">二级</el-tag>
            <el-tag v-else type="info">三级</el-tag>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script>
export default {
  name: 'Rights',
  data () {
    return {
      rightsList: []
    }
  },
  created () {
    this.getRightsList()
  },
  methods: {
    /**
     * 获取所有权限列表
     */
    async getRightsList () {
      const { data: res } = await this.$http.get('rights/list')
      if (res.meta.status !== 200) {
        return this.$message.error('获取权限列表失败!')
      } else {
        this.rightsList = res.data
        console.log(this.rightsList)
      }
    }
  }
}
</script>

<style lang="less" scoped>

</style>
