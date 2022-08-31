<template>
  <div>
    <!--面包屑导航区域-->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>订单管理</el-breadcrumb-item>
      <el-breadcrumb-item>订单列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!--卡片视图区域-->
    <el-card class="box-card">
      <el-row :gutter="20">
        <el-col :span="8">
          <!-- 搜索与添加区域 -->
          <el-input v-model="queryInfo.query" class="input-with-select" clearable placeholder="请输入内容"
                    @keyup.enter.native="getOrdersList">
            <el-button slot="append" icon="el-icon-search" @click="getOrdersList"></el-button>
          </el-input>
        </el-col>
      </el-row>

      <!--订单列表区域-->
      <el-table v-loading="!orderList.length"
                :data="orderList"
                :stripe="true"
                border
                element-loading-text="拼命加载中"
                width="100%">
        <el-table-column label="#"
                         type="index">
        </el-table-column>
        <el-table-column label="订单编号"
                         prop="order_number">
        </el-table-column>
        <el-table-column label="订单价格"
                         prop="order_price">
        </el-table-column>
        <el-table-column label="是否付款"
                         prop="pay_status">
          <template slot-scope="scope">
            <el-tag v-if="scope.row.pay_status === '1'" type="success">已付款</el-tag>
            <el-tag v-else type="danger">未付款</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="是否发货"
                         prop="is_send">
        </el-table-column>
        <el-table-column label="下单时间"
                         prop="create_time">
          <template slot-scope="scope">
            {{ scope.row.create_time | dateFormat }}
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <el-tooltip :enterable="false" class="item" content="修改地址" effect="dark" placement="top">
              <el-button icon="el-icon-edit" size="mini" type="primary" @click="showBox"></el-button>
            </el-tooltip>
            <el-tooltip :enterable="false" class="item" content="物流信息" effect="dark" placement="top">
              <el-button icon="el-icon-location" size="mini" type="success"
                         @click="showProgressBox(scope.row)"></el-button>
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

    <!--修改地址的对话框-->
    <el-dialog
      :visible.sync="addressVisible"
      title="修改地址"
      width="35%"
      @close="addressDialogClosed">
      <el-form ref="addressFormRef" :model="addressForm" :rules="addressFormRules"
               label-width="100px">
        <el-form-item label="省市区/县" prop="address1">
          <el-cascader
            v-model="addressForm.address1"
            :options="cityData"
            :props="cityProps"
            clearable
            expand-trigger="hover"
          ></el-cascader>
        </el-form-item>
        <el-form-item label="详细地址" prop="detailAdd">
          <el-input v-model="addressForm.detailAdd"></el-input>
        </el-form-item>
      </el-form>
    </el-dialog>

    <!-- 展示物流进度的对话框 -->
    <el-dialog
      :visible.sync="progressVisible"
      title="物流进度"
      width="35%">
      <!--时间线
        reverse="true" 表示为倒序
      -->
      <el-timeline :reverse="true">
        <el-timeline-item
          v-for="(activity, index) in progressInfo"
          :key="index"
          :timestamp="activity.time">
          {{ activity.context }}
        </el-timeline-item>
      </el-timeline>
      <span slot="footer" class="dialog-footer">
          <el-button @click="progressVisible = false">取 消</el-button>
          <el-button type="primary" @click="progressVisible = false">确 定</el-button>
        </span>
    </el-dialog>
  </div>
</template>

<script>

import cityData from '../../utils/citydata'

export default {
  name: 'Order',
  data () {
    return {
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 10
      },
      total: 0,
      orderList: [],
      addressVisible: false,
      addressForm: {
        address1: [],
        detailAdd: ''
      },
      addressFormRules: {
        address1: [
          {
            required: true,
            message: '请选择省市区/县',
            trigger: 'blur'
          }
        ],
        detailAdd: [
          {
            required: true,
            message: '请选择详细地址',
            trigger: 'blur'
          }
        ]
      },
      // 省市区/县地址
      cityData: cityData,
      cityProps: {
        // 从el-cascader标签的属性,中移动到这个cascadeProps中
        expandTrigger: 'hover'
      },
      progressVisible: false,
      progressInfo: []
    }
  },
  created () {
    this.getOrdersList()
  },
  methods: {
    /**
     * 获取订单列表
     */
    async getOrdersList () {
      const { data: res } = await this.$http.get('orders', { params: this.queryInfo })
      if (res.meta.status !== 200) {
        return this.$http.error('获取订单列表失败!')
      } else {
        this.total = res.data.total
        this.orderList = res.data.goods
      }
    },
    handleSizeChange (newSize) {
      this.queryInfo.pagesize = newSize
      this.getOrdersList()
    },
    handleCurrentChange (newPage) {
      this.queryInfo.pagenum = newPage
      this.getOrdersList()
    },
    /**
     * 展示修改地址
     */
    showBox () {
      this.addressVisible = true
    },
    /**
     * 监听 修改对话框的事件
     */
    addressDialogClosed () {
      this.$refs.addressFormRef.resetFields()
    },
    /**
     * 获取物流信息
     * @returns {Promise<*>}
     */
    async showProgressBox (row) {
      // 这部分有问题
      // const { data: res } = await this.$http.get('/kuaidi/804909574412544580')
      // if (res.meta.status !== 200) {
      //   return this.$http.error('获取物流信息失败')
      // }

      this.progressInfo = [
        {
          time: '2018-05-10 09:39:00',
          ftime: '2018-05-10 09:39:00',
          context: '已签收,感谢使用顺丰,期待再次为您服务',
          location: ''
        },
        {
          time: '2018-05-10 08:23:00',
          ftime: '2018-05-10 08:23:00',
          context: '[北京市]北京海淀育新小区营业点派件员 顺丰速运 95338正在为您派件',
          location: ''
        },
        {
          time: '2018-05-10 07:32:00',
          ftime: '2018-05-10 07:32:00',
          context: '快件到达 [北京海淀育新小区营业点]',
          location: ''
        },
        {
          time: '2018-05-10 02:03:00',
          ftime: '2018-05-10 02:03:00',
          context: '快件在[北京顺义集散中心]已装车,准备发往 [北京海淀育新小区营业点]',
          location: ''
        },
        {
          time: '2018-05-09 23:05:00',
          ftime: '2018-05-09 23:05:00',
          context: '快件到达 [北京顺义集散中心]',
          location: ''
        },
        {
          time: '2018-05-09 21:21:00',
          ftime: '2018-05-09 21:21:00',
          context: '快件在[北京宝胜营业点]已装车,准备发往 [北京顺义集散中心]',
          location: ''
        },
        {
          time: '2018-05-09 13:07:00',
          ftime: '2018-05-09 13:07:00',
          context: '顺丰速运 已收取快件',
          location: ''
        },
        {
          time: '2018-05-09 12:25:03',
          ftime: '2018-05-09 12:25:03',
          context: '卖家发货',
          location: ''
        },
        {
          time: '2018-05-09 12:22:24',
          ftime: '2018-05-09 12:22:24',
          context: '您的订单将由HLA（北京海淀区清河中街店）门店安排发货。',
          location: ''
        },
        {
          time: '2018-05-08 21:36:04',
          ftime: '2018-05-08 21:36:04',
          context: '商品已经下单',
          location: ''
        }
      ]
      // console.log(this.progressInfo)
      this.progressVisible = true
    }

  }
}
</script>

<style lang="less" scoped>

.el-cascader {
  width: 100%;
}
</style>
