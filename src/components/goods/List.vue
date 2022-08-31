<template>

  <div>
    <!--面包屑导航区域-->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!--卡片视图区域-->
    <el-card class="box-card">
      <el-row :gutter="20">
        <el-col :span="8">
          <!-- 搜索与添加区域 -->
          <el-input v-model="queryInfo.query" class="input-with-select" clearable placeholder="请输入内容"
                    @clear="getGoodsList" @keyup.enter.native="getGoodsList">
            <el-button slot="append" icon="el-icon-search" @click="getGoodsList"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="goAddpage">添加商品</el-button>
        </el-col>
      </el-row>

      <!--  用户列表区域-->
      <el-table v-loading="!goodsList.length"
                :data="goodsList"
                :stripe="true"
                border
                element-loading-text="拼命加载中"
                width="100%">
        <el-table-column label="#"
                         type="index">
        </el-table-column>
        <el-table-column label="商品名称"
                         prop="goods_name">
        </el-table-column>
        <el-table-column label="商品价格(元)"
                         prop="goods_price" width="95px">
        </el-table-column>
        <el-table-column label="数量"
                         prop="goods_number" width="70px">
        </el-table-column>
        <el-table-column label="创建时间"
                         prop="add_time" width="140px">
          <template slot-scope="scope">
            {{ scope.row.add_time | dateFormat }}
          </template>
        </el-table-column>
        <el-table-column label="状态"
                         prop="goods_state" width="95px">
          <template slot-scope="scope">
            <el-tag v-if="scope.row.goods_state === 0" type="info">未通过</el-tag>
            <el-tag v-else-if="scope.row.goods_state === 1" type="warning">审核中</el-tag>
            <el-tag v-else type="success">已审核</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="130px">
          <template slot-scope="scope">
            <!-- 修改按钮 -->
            <el-tooltip :enterable="false" class="item" content="修改商品" effect="dark" placement="top">
              <el-button icon="el-icon-edit" size="mini" type="primary"
              ></el-button>
            </el-tooltip>

            <!-- 删除按钮-->
            <el-tooltip :enterable="false" class="item" content="删除商品" effect="dark" placement="top">
              <el-button icon="el-icon-delete" size="mini" type="danger"
                         @click="removeGoodsById(scope.row.goods_id)"></el-button>
            </el-tooltip>

          </template>
        </el-table-column>
      </el-table>
      <!--分页区域-->
      <el-pagination
        :current-page="queryInfo.pagenum"
        :page-size="queryInfo.pagesize"
        :page-sizes="[5,10,15,20]"
        :total="total"
        background
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange">
      </el-pagination>
    </el-card>
  </div>

</template>

<script>
export default {
  name: 'List',
  data () {
    return {
      // 查询列表参数
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 5
      },
      // 商品总数
      total: 0,
      // 商品列表
      goodsList: []
    }
  },
  created () {
    this.getGoodsList()
  },
  methods: {
    /**
     * 根据分页获取对应的商品列表
     */
    async getGoodsList () {
      /**
       * get请求, 参数上都加一个 params属性
       */
      const { data: res } = await this.$http.get('goods', { params: this.queryInfo })
      if (res.meta.status !== 200) {
        return this.$message.error('获取商品列表失败!')
      } else {
        this.goodsList = res.data.goods
        this.total = res.data.total
      }
    },
    handleSizeChange (newSize) {
      this.queryInfo.pagesize = newSize
      this.getGoodsList()
    },
    handleCurrentChange (newPage) {
      this.queryInfo.pagenum = newPage
      this.getGoodsList()
    },
    /**
     * @param goodsId
     */
    async removeGoodsById (goodsId) {
      const confirmResult = await this.$confirm('此操作将永久删除该商品, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => {
        return err
      })
      // 如果用户确认删除, 则返回值为字符串 confirm
      // 如果用户取消删除, 则返回值为字符串 cancel
      if (confirmResult !== 'confirm') {
        return this.$message.info('已取消删除!')
      } else {
        const { data: res } = await this.$http.delete(`goods/${goodsId}`)
        if (res.meta.status !== 200) {
          return this.$message.error('删除商品失败!')
        } else {
          // 重新获取用户列表, 来刷新页面
          this.getGoodsList()
          return this.$message.success('删除商品成功!')
        }
      }
    },
    /**
     * 跳转页面添加
     */
    goAddpage () {
      this.$router.push('/goods/add')
    }
  }
}
</script>

<style lang="less" scoped>

</style>
