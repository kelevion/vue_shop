<template>
  <div>
    <!--面包屑导航区域-->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>分类参数</el-breadcrumb-item>
    </el-breadcrumb>

    <!--卡片视图区域-->
    <el-card>
      <!--警告区域-->
      <el-alert
        :closable="false"
        show-icon
        title="注意: 只允许为三级分类设置相关参数!"
        type="warning">
      </el-alert>

      <!--  选择商品分类区域 -->
      <el-row class="cat_opt">
        <el-col>
          <span>选择商品分类: </span>
          <!-- 选择商品分类的级联选择框 -->
          <el-cascader
            v-model="selectedKeys"
            :options="cateList"
            :props="cateProps"
            clearable
            expand-trigger="hover"
            @change="handleChange"></el-cascader>
        </el-col>
      </el-row>

      <!-- tab页签区域 -->
      <el-tabs v-model="activeName" @tab-click="handleTabClick">
        <!-- 添加动态参数的面板 -->
        <el-tab-pane label="动态参数" name="many">
          <!-- 添加参数按钮
            注意: disabled返回值是一个TRUE/FALSE, 所以需要 v-bind:disabled 属性绑定
          -->
          <el-button :disabled="isBtnDisabled" size="mini" type="primary" @click="addDialogVisible= true">添加参数
          </el-button>
          <!-- 动态参数表格 -->
          <el-table v-loading="manyTableLoading"
                    :data="manyTableData"
                    border
                    element-loading-text="拼命加载中"
                    stripe>
            <el-table-column type="expand">
              <!-- 作用域插槽-->
              <template slot-scope="scope">
                <!-- 循环渲染Tag标签 -->
                <el-tag v-for="(item, i) in scope.row.attr_vals" :key="i" closable @close="handleClose(i,scope.row)">
                  {{ item }}
                </el-tag>
                <!-- 输入的文本框-->
                <el-input
                  v-if="scope.row.inputVisible"
                  ref="saveTagInput"
                  v-model="scope.row.inputValue"
                  class="input-new-tag"
                  size="small"
                  @blur="handleInputConfirm(scope.row)"
                  @keyup.enter.native="handleInputConfirm(scope.row)">
                </el-input>
                <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag
                </el-button>
              </template>
            </el-table-column>
            <!--索引列-->
            <el-table-column label="#" type="index"></el-table-column>
            <el-table-column label="参数名称" prop="attr_name"></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button icon="el-icon-edit" size="mini" type="primary" @click="showEditDialog(scope.row)">编辑
                </el-button>
                <el-button icon="el-icon-delete" size="mini" type="danger" @click="removeParams(scope.row.attr_id)">删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <!-- 添加静态属性的面板 -->
        <el-tab-pane label="静态属性" name="only">
          <!-- 添加属性按钮-->
          <el-button :disabled="isBtnDisabled" size="mini" type="primary" @click="addDialogVisible = true">添加属性
          </el-button>
          <!-- 静态属性表格 -->
          <el-table v-loading="onlyTableLoading"
                    :data="onlyTableData"
                    border
                    element-loading-text="拼命加载中"
                    stripe>
            <!--展开行-->
            <el-table-column type="expand">
              <!-- 作用域插槽-->
              <template slot-scope="scope">
                <!-- 循环渲染Tag标签 -->
                <el-tag v-for="(item, i) in scope.row.attr_vals" :key="i" closable @close="handleClose(i,scope.row)">
                  {{ item }}
                </el-tag>
                <!-- 输入的文本框-->
                <el-input
                  v-if="scope.row.inputVisible"
                  ref="saveTagInput"
                  v-model="scope.row.inputValue"
                  class="input-new-tag"
                  size="small"
                  @blur="handleInputConfirm(scope.row)"
                  @keyup.enter.native="handleInputConfirm(scope.row)">
                </el-input>
                <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag
                </el-button>
              </template>
            </el-table-column>
            <!--索引列-->
            <el-table-column label="#" type="index"></el-table-column>
            <el-table-column label="属性名称" prop="attr_name"></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button icon="el-icon-edit" size="mini" type="primary" @click="showEditDialog(scope.row)">编辑
                </el-button>
                <el-button icon="el-icon-delete" size="mini" type="danger" @click="removeParams(scope.row.attr_id)">删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <!-- 添加参数对话框-->
    <el-dialog :title="
                '添加' + this.titleText"
               :visible.sync="addDialogVisible"
               width="35%"
               @close="addDialogClosed">
      <el-form ref="addFormRef" :model="addForm" :rules="addFormRules" label-width="100px">
        <el-form-item :label="this.titleText" prop="attr_name">
          <el-input v-model="addForm.attr_name" autocomplete="off"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addParams">确 定</el-button>
      </div>
    </el-dialog>

    <!-- 添加修改对话框-->
    <el-dialog :title="'修改' + this.titleText"
               :visible.sync="editDialogVisible"
               width="35%"
               @close="editDialogClosed">
      <el-form ref="editFormRef" :model="editForm" :rules="addFormRules" label-width="100px">
        <el-form-item :label="this.titleText" prop="attr_name">
          <el-input v-model="editForm.attr_name" autocomplete="off"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editParams">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'Params',
  data () {
    return {
      // 商品分类列表
      cateList: [],
      // 级联选择框双向绑定到的数组
      selectedKeys: [],
      cateProps: {
        value: 'cat_id',
        label: 'cat_name',
        children: 'children',
        // 从el-cascader标签的属性,中移动到这个cascadeProps中
        expandTrigger: 'hover'
      },
      // 被激活的页签的名称
      activeName: 'many',
      // 动态参数的数据
      manyTableData: [],
      // 静态参数的数据
      onlyTableData: [],
      // 控制添加对话框的显示与隐藏
      addDialogVisible: false,
      // 控制修改对话框的显示与隐藏
      editDialogVisible: false,
      // 添加参数的表单对象
      addForm: {
        attr_name: ''
      },
      // 添加表单的校验规则对象
      addFormRules: {
        attr_name: [
          {
            required: true,
            message: '请输入参数名称',
            trigger: 'blur'
          }
        ]
      },
      // 修改参数的表单对象
      editForm: {},
      onlyTableLoading: false,
      manyTableLoading: false
    }
  },
  created () {
    this.getCategories()
  },
  computed: {
    // 如果按钮需要被警用, 则返回TRUE, 否则返回FALSE
    isBtnDisabled () {
      return this.selectedKeys.length !== 3
    },
    // 当前选中的三级分裂Id
    cateId () {
      if (this.selectedKeys.length === 3) {
        return this.selectedKeys[2]
      }
      return null
    },
    // 动态计算标题文本
    titleText () {
      if (this.activeName === 'many') {
        return '动态参数'
      } else {
        return '静态属性'
      }
    }
  },
  methods: {
    /**
     * 获取所有商品列表
     */
    async getCategories () {
      const { data: res } = await this.$http.get('categories')
      if (res.meta.status !== 200) {
        this.$message.error('获取商品分类失败!')
      }
      this.cateList = res.data
      console.log(this.cateList)
    },
    /**
     * 级联选择框选中项变化, 会触发这个函数
     */
    handleChange () {
      this.getParamsData()
    },
    /**
     * tab页面点击事件的处理函数
     */
    handleTabClick () {
      console.log(this.activeName)
      this.getParamsData()
    },
    /**
     * 获取参数的列表数据
     */
    async getParamsData () {
      // 证明选中的不是三级分类
      if (this.selectedKeys.length !== 3) {
        this.selectedKeys = []
        this.manyTableData = []
        this.onlyTableData = []
      } else {
        // 证明是三级分类
        console.log(this.selectedKeys)
        // if (this.activeName === 'many') {
        //   this.manyTableLoading = true
        // } else {
        //   this.onlyTableLoading = true
        // }
        // 这里判断下当前激活的页签名称
        // 使用es6语法的属性表达式 + 模板字符串, 优雅解决上面判断问题
        this[`${this.activeName}TableLoading`] = true

        // 然后在发起请求, 根据所选分类的Id, 和当前所处的面板, 获取对应的参数
        const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes`, {
          params: { sel: this.activeName }
        })
        if (res.meta.status !== 200) {
          return this.$message.error('获取参数列表失败')
        } else {
          console.log(res.data)

          /**
           * 注意: ''.split(' ') 空字符串切分的时候, 会获得只有一个空串的数组 [""]
           */
          res.data.forEach(item => {
            // 三元表达式
            item.attr_vals = item.attr_vals ? item.attr_vals.split(' ') : []
            // 控制输入框与按钮的切换形式
            item.inputVisible = false
            // 文本框中输入的值
            item.inputValue = ''
          })

          // 请求只会发起一次请求, 但是结果有两种情况, 所以需要进行判断处理
          // if (this.activeName === 'many') {
          //   this.manyTableData = res.data
          // } else {
          //   this.onlyTableData = res.data
          // }
          this[`${this.activeName}TableData`] = res.data
          this[`${this.activeName}TableLoading`] = false
        }
      }
    },
    /**
     * 监听添加对话框的关闭事件
     */
    addDialogClosed () {
      this.$refs.addFormRef.resetFields()
    },
    /**
     * 点击按钮, 添加参数
     */
    addParams () {
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) {

        } else {
          const { data: res } = await this.$http.post(`categories/${this.cateId}/attributes`, {
            attr_name: this.addForm.attr_name,
            attr_sel: this.activeName
          })
          if (res.meta.status !== 201) {
            return this.$message.error('添加参数失败!')
          } else {
            this.getParamsData()
            this.addDialogVisible = false
            return this.$message.success('添加参数成功!')
          }
        }
      })
    },
    /**
     * 显示修改对话框的事件
     *@param row
     */
    async showEditDialog (row) {
      /**
       * bug点: 错误写法 `categories/${this.cateId}/attributes/${this.row.attr_id}`
       * row中加上了 this关键字, 这样的话 this引用的是 data(){} 中的row数据对象, 而不是形参row
       * 小结: 这个this关键字, 不引用data(){}, 不要随便乱加上
       */
      const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes/${row.attr_id}`,
        { params: { attr_sel: this.activeName } })
      if (res.meta.status !== 200) {
        return this.$message.error('获取参数信息失败')
      } else {
        this.editForm = res.data
        console.log(this.editForm)
        this.editDialogVisible = true
      }
    },
    /**
     * 监听修改对话框的关闭事件
     */
    editDialogClosed () {
      this.$refs.editFormRef.resetFields()
    },
    /**
     * 点击按钮, 修改参数
     */
    editParams () {
      this.$refs.editFormRef.validate(async valid => {
        if (!valid) {
          return this.$message.error('校验不通过, 请重新输入')
        } else {
          const { data: res } = await this.$http.put(`categories/${this.cateId}/attributes/${this.editForm.attr_id}`, {
            attr_name: this.editForm.attr_name,
            attr_sel: this.activeName
          })
          if (res.meta.status !== 200) {
            return this.$message.error('更新参数失败!')
          } else {
            this.editDialogVisible = false
            this.getParamsData()
            return this.$message.success('更新参数成功!')
          }
        }
      })
    },
    /**
     * 根据Id删除对应的 参数/属性
     * @param attrId
     */
    async removeParams (attrId) {
      // 弹框询问用户是否删除数据
      const confirmResult = await this.$confirm(`此操作将永久删除该${this.titleText}, 是否继续?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => {
        return err
      })
      if (confirmResult !== 'confirm') {
        return this.$message.info('已取消删除!')
      } else {
        const { data: res } = await this.$http.delete(`categories/${this.cateId}/attributes/${attrId}`)
        if (res.meta.status !== 200) {
          return this.$message.error(`删除${this.titleText}失败!`)
        } else {
          this.getParamsData()
          return this.$message.success(`删除${this.titleText}成功!`)
        }
      }
    },
    /**
     * 文本框失去焦点, 或按下enter都会触发
     * @param row
     */
    handleInputConfirm (row) {
      if (row.inputValue.trim().length === 0) {
        row.inputVisible = false
        row.inputValue = ''
        return
      }
      // 如果没有return, 这里证明输入的内容, 需要做后序处理
      row.attr_vals.push(row.inputValue.trim())
      row.inputValue = ''
      row.inputVisible = false
      // 发起请求, 保存这次操作
      this.saveAttrVals(row)
    },
    /**
     *点击按钮, 展示文本输入框
     * @param row
     */
    showInput (row) {
      row.inputVisible = true
      // 让文本框自动获取焦点
      // $nextTick方法的作用, 就是放页面上元素被重新渲染之后, 才会指定回调函数中的代码
      this.$nextTick(_ => {
        this.$refs.saveTagInput.$refs.input.focus()
      })
    },
    /**
     * 删除对应的参数可选项
     * @param index
     * @param row
     */
    handleClose (index, row) {
      row.attr_vals.splice(index, 1)
      this.saveAttrVals(row)
    },
    /**
     * 将对 attr_vals的操作保存到数据库
     * @param row
     */
    async saveAttrVals (row) {
      const { data: res } = await this.$http.put(`categories/${this.cateId}/attributes/${row.attr_id}`, {
        attr_name: row.attr_name,
        attr_sel: this.activeName,
        attr_vals: row.attr_vals.join(' ')
      })
      if (res.meta.status !== 200) {
        return this.$message.error('修改参数项失败!')
      } else {
        this.$message.success('修改参数项成功!')
      }
    }
  }
}
</script>

<style lang="less" scoped>
.cat_opt {
  margin: 15px 0;
}

.el-tag + .el-tag {
  margin-left: 10px;
}

.button-new-tag {
  margin-left: 10px;
  height: 32px;
  line-height: 30px;
  padding-top: 0;
  padding-bottom: 0;
}

.input-new-tag {
  width: 90px;
  margin-left: 10px;
  vertical-align: bottom;
}
</style>
