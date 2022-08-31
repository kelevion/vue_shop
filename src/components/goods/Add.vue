<template>
  <div>
    <!--面包屑导航区域-->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>添加商品</el-breadcrumb-item>
    </el-breadcrumb>

    <!--卡片视图-->
    <el-card>
      <!-- 提示区域 -->
      <el-alert
        :closable="false"
        center
        show-icon
        title="添加商品信息"
        type="info">
      </el-alert>

      <!--步骤条区域-->
      <el-steps :active="activeIndex - 0" :space="200" align-center finish-status="success">
        <el-step title="基本信息"></el-step>
        <el-step title="商品参数"></el-step>
        <el-step title="商品属性"></el-step>
        <el-step title="商品图片"></el-step>
        <el-step title="商品内容"></el-step>
        <el-step title="完成"></el-step>
      </el-steps>

      <!-- 注意一下嵌套规则, 表格form嵌套tabs-->
      <el-form ref="addFormRef" :model="addForm" :rules="addFormRules" label-position="top" label-width="100px">
        <!-- tab栏区域
          before-leave: 切换标签之前的钩子函数, 若发挥FALSE或返回Promise且被reject, 则阻止切换
                        类型  Function(activeName, oldActiveName)
        -->
        <el-tabs v-model="activeIndex" :before-leave="beforeTabLeave"
                 :tab-position="tabPosition" @tab-click="tabClicked">
          <el-tab-pane label="基本信息" name="0">
            <!-- 在Form组件中, 每个表单域由一个Form-Item组件构成, 表单域中可以放置各种类型的表单控件,
                包括Input, Select, CheckBox, Radio, Switch, DatePicker, TimePicker
            -->
            <el-form-item label="商品名称" prop="goods_name">
              <el-input v-model="addForm.goods_name"></el-input>
            </el-form-item>
            <el-form-item label="商品价格" prop="goods_price">
              <el-input v-model="addForm.goods_price" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品重量" prop="goods_weight">
              <el-input v-model="addForm.goods_weight" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品数量" prop="goods_number">
              <el-input v-model="addForm.goods_number" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品分类" prop="goods_cat">
              <!--  选择商品分类区域 -->
              <el-row>
                <el-col>
                  <!-- 选择商品分类的级联选择框 -->
                  <el-cascader
                    v-model="addForm.goods_cat"
                    :options="cateList"
                    :props="cateProps"
                    clearable
                    @change="handleChange"></el-cascader>
                </el-col>
              </el-row>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品参数" name="1">
            <!--渲染表单的Item项-->
            <el-form-item v-for="(item) in manyTableData" :key="item.attr_id" :label="item.attr_name">
              <!--复选框组-->
              <el-checkbox-group v-model="item.attr_vals">
                <el-checkbox v-for="(cb,i)  in item.attr_vals" :key="i" :label="cb" border size="small"></el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品属性" name="2">
            <el-form-item v-for="(item) in onlyTableData" :key="item.attr_id" :label="item.attr_name">
              <el-input v-model="item.attr_vals"></el-input>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品图片" name="3">
            <!-- action 表示图片要上传到后台的API地址
                :on-success-->
            <el-upload
              :action="uploadUrl"
              :headers="headerObj"
              :on-preview="handlePreview"
              :on-remove="handleRemove"
              :on-success="handleSuccess"
              class="upload-demo"
              list-type="picture">
              <el-button size="small" type="primary">点击上传</el-button>
            </el-upload>
          </el-tab-pane>
          <el-tab-pane label="商品内容" name="4">
            <!-- 富文本编辑器组件-->
            <quill-editor v-model="addForm.goods_introduce">
            </quill-editor>
            <!--添加商品的按钮-->
            <el-button class="btnAdd" type="primary" @click="add">添加商品</el-button>
          </el-tab-pane>
        </el-tabs>
      </el-form>
    </el-card>

    <!-- 图片预览 -->
    <el-dialog
      :visible.sync="previewVisible"
      title="图片预览"
      width="50%">
      <img :src="previewPath" alt="#" class="previewImg">
    </el-dialog>
  </div>
</template>

<script>
import _ from 'lodash'

export default {
  name: 'Add',
  data () {
    return {
      activeIndex: '0',
      // 选项卡所在的位置
      tabPosition: 'left',
      // 添加商品的表单对象
      addForm: {
        goods_name: '',
        // 商品所属的分类数组
        goods_cat: [],
        goods_price: 0,
        goods_number: 0,
        goods_weight: 0,
        // 商品的详情描述
        goods_introduce: '',
        // 上传的图片临时路径
        pics: [],
        attrs: []
      },
      // 添加商品的表单校验对象
      addFormRules: {
        goods_name: [
          {
            required: true,
            message: '请输入商品名称',
            trigger: 'blur'
          }
        ],
        goods_price: [
          {
            required: true,
            message: '请输入商品价格',
            trigger: 'blur'
          }
        ],
        goods_weight: [
          {
            required: true,
            message: '请输入商品重量',
            trigger: 'blur'
          }
        ],
        goods_number: [
          {
            required: true,
            message: '请输入商品数量',
            trigger: 'blur'
          }
        ],
        goods_cat: [
          {
            required: true,
            message: '请输入商品分类',
            trigger: 'blur'
          }
        ]
      },
      // 商品列表数据
      cateList: [],
      // 为 options数据源, 配置键名 [选项标签名label / 选项标签对的值value]
      cateProps: {
        // 指定选项标签的值: 选项对象的某个属性值
        label: 'cat_name',
        // 指定选项的值: 选项对象的某个属性值
        value: 'cat_id',
        // 指定选项的子选项
        children: 'children',
        // 从el-cascader标签的属性,中移动到这个cascadeProps中
        expandTrigger: 'hover'
      },
      // 动态参数列表数据
      manyTableData: [],
      // 动态参数列表数据
      onlyTableData: [],
      // 上传图片的url
      uploadUrl: 'http://127.0.0.1:8888/api/private/v1/upload',
      // 图片上传组件的headers请求头对象
      headerObj: {
        Authorization:
          window.sessionStorage.getItem('token')
      },
      previewPath: '',
      previewVisible: false
    }
  },
  created () {
    this.getCateList()
  },
  computed: {
    cateId () {
      if (this.addForm.goods_cat.length === 3) {
        return this.addForm.goods_cat[2]
      }
      return null
    }
  },
  methods: {
    async getCateList () {
      const { data: res } = await this.$http.get('categories')
      if (res.meta.status !== 200) {
        return this.$message.error('获取商品列表失败!')
      }

      this.cateList = res.data
      console.log(this.cateList)
    },
    /**
     *
     */
    handleChange () {
      console.log(this.addForm.goods_cat)
      if (this.addForm.goods_cat.length !== 3) {
        this.addForm.goods_cat = []
        return
      }
      // todo
    },
    /**
     * 阻止标签页的切换
     */
    beforeTabLeave (activeName, oldActiveName) {
      // console.log('即将离开的标签也名字是' + oldActiveName)
      // console.log('即将进入的标签也名字是' + activeName)
      if (oldActiveName === '0' && this.addForm.goods_cat.length !== 3) {
        this.$message.error('请先选择商品分类!')
        return false
      }
      return true
    },
    /**
     *
     */
    async tabClicked () {
      // console.log(this.activeIndex)
      // 证明访问的是动态参数面板
      if (this.activeIndex === '1') {
        console.log('动态参数列表')
        const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes`, {
          params: { sel: 'many' }
        })
        if (res.meta.status !== 200) {
          return this.$message.error('获取动态参数列表失败!')
        }
        res.data.forEach(item => {
          item.attr_vals = item.attr_vals.length === 0 ? [] : item.attr_vals.split(' ')
        })

        this.manyTableData = res.data
      } else if (this.activeIndex === '2') {
        console.log('静态属性列表')
        const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes`, {
          params: { sel: 'only' }
        })
        if (res.meta.status !== 200) {
          return this.$message.error('获取静态属性列表失败!')
        }
        this.onlyTableData = res.data
        console.log(this.onlyTableData)
        // todo
      }
    },
    /**
     * 处理移除图片的操作
     */
    handleRemove (file, fileList) {
      console.log(file, fileList)

      // 1.获取将要删除的图片的临时路径
      const filePath = file.response.data.tmp_path
      // 2.从pics数组中, 找到这个图片对应的索引值
      const index = this.addForm.pics.findIndex(item => {
        return item.pic === filePath
      })
      // 3.调用数组的splice方法, 把图片信息对象, 从pics数组中移除
      this.addForm.pics.splice(index, 1)
    },
    /**
     * 处理图片预览效果
     * @param file
     */
    handlePreview (file) {
      console.log(file)
      this.previewPath = file.response.data.url
      this.previewVisible = true
    },
    /**
     * 监听图片上传的成功的事件
     */
    handleSuccess (response) {
      // 1.拼接得到一个图片信息对象
      const picInfo = { pic: response.data.tmp_path }
      // 2.将图片信息对象, push到 pics数组中
      this.addForm.pics.push(picInfo)
      console.log(this.addForm)
    },
    /**
     * 添加商品按钮
     */
    add () {
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) {
          return this.$message.error('请填写必要的表单项!')
        }
        // 执行添加的业务逻辑
        /**
         * 级联选择器中 v-model绑定的只能是数组吗?  疑问: 老师的element-ui版本和我这个版本不一样
         * 将数组转换为字符串
         * @type {*}
         */// 对addForm进行深拷贝  lodash cloneDeep(obj)
        const form = _.cloneDeep(this.addForm)
        form.goods_cat = form.goods_cat.join(',')
        // this.addForm.goods_cat = this.addForm.goods_cat.join(',')

        // 处理动态参数
        this.manyTableData.forEach(item => {
          const newInfo = {
            attr_id: item.attr_id,
            attr_value: item.attr_vals.join(' ')
          }
          this.addForm.attrs.push(newInfo)
        })
        // 处理静态属性
        this.onlyTableData.forEach(item => {
          const newInfo = {
            attr_id: item.attr_id,
            attr_value: item.attr_vals
          }
          this.addForm.attrs.push(newInfo)
        })
        form.attrs = this.addForm.attrs
        console.log(form)
        const { data: res } = await this.$http.post('goods', form)
        if (res.meta.status !== 201) {
          return this.$message.error('添加商品失败!')
        }
        this.$message.success('添加商品成功!')
        // 编程式导航, 跳转页面
        await this.$router.push('/goods')
      })
    }
  }
}
</script>

<style lang="less" scoped>

.el-checkbox {
  // margin 上 右 下 左
  margin: 0 15px 0 0 !important;
}

.btnAdd {
  margin-top: 15px;
}

.previewImg {
  width: 100%;
}
</style>
