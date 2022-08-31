<template>
  <div>
    <!--面包屑导航区域-->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!--卡片视图区域-->
    <el-card class="box-card">
      <el-row :gutter="20">
        <el-col :span="8">
          <!-- 搜索与添加区域 -->
          <el-input v-model="queryInfo.query" class="input-with-select" clearable placeholder="请输入内容"
                    @clear="getUserList" @keyup.enter.native="getUserList">
            <el-button slot="append" icon="el-icon-search" @click="getUserList"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="addDialogVisible = true">添加用户</el-button>
        </el-col>
      </el-row>

      <!--  用户列表区域-->
      <el-table v-loading="!userList.length"
                :data="userList"
                :stripe="true"
                border
                element-loading-text="拼命加载中"
                style="width: 100%">
        <el-table-column label="#"
                         type="index">
        </el-table-column>
        <el-table-column label="用户名"
                         prop="username">
        </el-table-column>
        <el-table-column label="电话"
                         prop="mobile">
        </el-table-column>
        <el-table-column label="邮箱"
                         prop="email">
        </el-table-column>
        <el-table-column label="角色"
                         prop="role_name">
        </el-table-column>
        <el-table-column label="状态">
          <!-- 作用域插槽渲染状态这一列 -->
          <template slot-scope="scope">
            <el-switch
              v-model="scope.row.mg_state"
              active-color="#13ce66"
              inactive-color="#ff4949"
              @change="userStateChanged(scope.row)">
            </el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180">
          <template slot-scope="scope">
            <!-- 修改按钮 -->
            <el-tooltip :enterable="false" class="item" content="修改用户" effect="dark" placement="top">
              <el-button icon="el-icon-edit" size="mini" type="primary"
                         @click="showEditDialog(scope.row.id)"></el-button>
            </el-tooltip>

            <!-- 删除按钮-->
            <el-tooltip :enterable="false" class="item" content="删除用户" effect="dark" placement="top">
              <el-button icon="el-icon-delete" size="mini" type="danger"
                         @click="removeUserById(scope.row.id)"></el-button>
            </el-tooltip>

            <!-- 分配角色按钮-->
            <el-tooltip :enterable="false" class="item" content="分配角色" effect="dark" placement="top">
              <el-button icon="el-icon-setting" size="mini" type="warning" @click="setRole(scope.row)"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <!--分页区域-->
      <el-pagination
        :current-page="queryInfo.pagenum"
        :page-size="this.queryInfo.pagesize"
        :page-sizes="[2, 4, 5, 10]"
        :total="total"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange">
      </el-pagination>
    </el-card>

    <!-- 添加用户的对话框 -->
    <el-dialog
      :visible.sync="addDialogVisible"
      title="添加用户"
      width="35%"
      @close="addDialogClosed">
      <!-- 内容主体区域 -->
      <el-form ref="addFormRef" :model="addForm" :rules="addFormRules" label-width="70px">
        <!-- prop=username 对应了 addFormRules中的username校验规则-->
        <el-form-item label="用户名" prop="username">
          <el-input v-model="addForm.username"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="addForm.password"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="addForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input v-model="addForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <!-- 底部区域 -->
      <span slot="footer" class="dialog-footer">
    <el-button @click="addDialogVisible = false">取 消</el-button>
    <el-button type="primary" @click="addUser">确 定</el-button>
  </span>
    </el-dialog>

    <!--修改用户对话框-->
    <el-dialog
      :visible.sync="editDialogVisible"
      title="修改用户"
      width="35%"
      @close="editDialogClosed">
      <!-- 内容主体区域 -->
      <el-form ref="editFormRef" :model="editForm" :rules="addFormRules" label-width="70px">
        <!-- prop=username 对应了 addFormRules中的username校验规则-->
        <el-form-item label="用户名">
          <el-input v-model="editForm.username" disabled></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="editForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input v-model="editForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
    <el-button @click="editDialogVisible = false">取 消</el-button>
    <el-button type="primary" @click="editUserInfo">确 定</el-button>
  </span>
    </el-dialog>

    <!--分配角色的对话框-->
    <el-dialog
      :visible.sync="setRoleDialogVisible"
      title="分配角色"
      width="35%"
      @close="setRoleDialogClosed">
      <div>
        <p>当前的用户: {{ userInfo.username }}</p>
        <p>当前的角色: {{ userInfo.role_name }}</p>
        <p>分配新角色:
          <el-select v-model="selectedRoled" placeholder="请选择">
            <el-option
              v-for="item in rolesList"
              :key="item.id"
              :label="item.roleName"
              :value="item.id">
            </el-option>
          </el-select>
        </p>

      </div>
      <span slot="footer" class="dialog-footer">
    <el-button @click="setRoleDialogVisible = false">取 消</el-button>
    <el-button type="primary" @click="saveRoleInfo()">确 定</el-button>
  </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'Users.vue',
  data () {
    // 验证邮箱的规则
    var checkEmail = (rule, value, cb) => {
      // 验证邮箱的正则表达式
      const regEmail = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(\.[a-zA-Z0-9_-])+/
      if (regEmail.test(value)) {
        // 合法的邮箱
        return cb()
      }
      cb(new Error('请输入合法的邮箱!'))
    }

    // 验证手机号的规则
    var checkMobile = (rule, value, cb) => {
      const regMobile = /^(0|86|17951)?(13[0-9]|15[012356789]|17[678]|18[0-9]|14[57])[0-9]{8}$/
      if (regMobile.test(value)) {
        // 合法的手机号
        return cb()
      }
      cb(new Error('请输入合法的手机号!'))
    }

    return {
      // 获取用户列表的参数对象
      queryInfo: {
        query: '',
        // 当前的页数
        pagenum: 1,
        pagesize: 2
      },
      userList: [],
      total: 0,
      // 控制添加用户对话框的显示与隐藏
      addDialogVisible: false,
      // 添加用户的表单数据
      addForm: {
        username: '',
        password: '',
        email: '',
        mobile: ''
      },
      // 添加表单的验证规则对象
      addFormRules: {
        username: [
          {
            required: true,
            message: '请输入用户名',
            trigger: 'blur'
          },
          {
            min: 3,
            max: 10,
            message: '用户名长度在 3 到 10 个字符',
            trigger: 'blur'
          }
        ],
        // 验证密码是否合法
        password: [
          {
            required: true,
            message: '请输入密码',
            trigger: 'blur'
          },
          {
            min: 6,
            max: 16,
            message: '密码长度在 6 到 16 个字符',
            trigger: 'blur'
          }
        ],
        email: [{
          required: true,
          message: '请输入邮箱',
          trigger: 'blur'
        }, {
          validator: checkEmail,
          trigger: 'blur'
        }],
        mobile: [
          {
            required: true,
            message: '请输入手机号',
            trigger: 'blur'
          }, {
            validator: checkMobile,
            trigger: 'blur'
          }
        ]
      },
      // 控制修改用户对话框的显示和隐藏
      editDialogVisible: false,
      // 查询到的用户信息对象
      editForm: {
        id: '',
        username: '',
        email: '',
        mobile: '',
        rid: ''
      },
      // 控制分配角色对话框的显示与隐藏
      setRoleDialogVisible: false,
      // 需要被分配角色的用户信息
      userInfo: {},
      // 所有角色的数据列表
      rolesList: [],
      // 已选中的角色Id值
      selectedRoled: '',
      // loading状态控制
      loading: false
    }
  },
  created () {
    this.getUserList()
  },
  methods: {
    async getUserList () {
      this.loading = true
      const { data: res } = await this.$http.get('users', { params: this.queryInfo })
      if (res.meta.status !== 200) {
        return this.$message.error('获取用户列表失败!')
      }
      this.userList = res.data.users
      this.total = res.data.total
      this.loading = false
      console.log(res)
    },
    /**
     * 监听 pagesize 改变的事件
     * @param newSize
     */
    handleSizeChange (newSize) {
      // console.log(newSize)
      this.queryInfo.pagesize = newSize
      this.getUserList()
    },
    /**
     * 监听 页面值 改变的事件
     * @param newPage
     */
    handleCurrentChange (newPage) {
      // console.log(newPage)
      this.queryInfo.pagenum = newPage
      this.getUserList()
    },
    /**
     * 监听 Switch 开关改变, 改变用户状态
     * @param userInfo
     */
    async userStateChanged (userInfo) {
      console.log(userInfo)
      const { data: res } = await this.$http.put(`users/${userInfo.id}/state/${userInfo.mg_state}`)
      if (res.meta.status !== 200) {
        userInfo.mg_state = !userInfo.mg_state
        return this.$message.error('更新用户状态失败!')
      }
      this.$message.success('更新用户状态成功!')
    },
    /**
     * 监听 添加用户对话框的关闭事件
     */
    addDialogClosed () {
      this.$refs.addFormRef.resetFields()
    },
    /**
     * 点击按钮, 添加新用户
     */
    addUser () {
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) {
          return
        }
        // 可以发起添加用户的网络请求
        const { data: res } = await this.$http.post('users', this.addForm)
        console.log(res)
        if (res.meta.status !== 201) {
          this.$message.error('添加用户失败!')
        } else {
          // 先隐藏添加用户的对话框
          this.addDialogVisible = false
          // 再重新获取用户列表, 来刷新页面
          this.getUserList()
          // 最后提示添加成功
          this.$message.success('添加用户成功!')
        }
      })
    },
    /**
     * 展示编辑用户的对话框
     * @param id
     */
    async showEditDialog (id) {
      // console.log(id)
      const { data: res } = await this.$http.get(`users/${id}`)
      if (res.meta.status !== 200) {
        //
        this.$message.error('查询用户信息失败!')
      }
      console.log(res)
      this.editForm = res.data
      this.editDialogVisible = true
    },
    /**
     * 监听修改用户对话框的关闭事件
     */
    editDialogClosed () {
      // 当第一次打开修改表单, 若触发数据校验提示, 在第二次打开还会出来
      // 这时候就是需要使用下面这行代码重置修改表单
      this.$refs.editFormRef.resetFields()
    },
    /**
     * 修改用户信息并提交
     */
    async editUserInfo () {
      this.$refs.editFormRef.validate(async valid => {
        if (!valid) {
          return
        }
        // 可以发送修改用户的网络请求
        const { data: res } = await this.$http.put(`users/${this.editForm.id}`, {
          email: this.editForm.email,
          mobile: this.editForm.mobile
        })
        if (res.meta.status !== 200) {
          this.$message.error('更新用户信息失败!')
        } else {
          // 先隐藏修改用户的对话框
          this.editDialogVisible = false
          // 再重新获取用户列表, 来刷新页面
          this.getUserList()
          // 最后提示修改成功
          this.$message.success('更新用户信息成功!')
        }
      })
    },
    /**
     * 根据Id删除对应的用户信息
     * @param id
     */
    async removeUserById (id) {
      // console.log(id)
      // 弹框询问用户是否删除数据
      const confirmResult = await this.$confirm('此操作将永久删除该用户, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => {
        return err
      })
      // 如果用户确认删除, 则返回值为字符串 confirm
      // 如果用户取消删除, 则返回值为字符串 cancel
      // console.log(confirmResult)
      if (confirmResult !== 'confirm') {
        return this.$message.info('已取消删除!')
      } else {
        console.log('确认了删除!')
        const { data: res } = await this.$http.delete(`users/${id}`)
        if (res.meta.status !== 200) {
          return this.$message.error('删除用户失败!')
        } else {
          // 重新获取用户列表, 来刷新页面
          this.getUserList()
          return this.$message.success('删除用户成功!')
        }
      }
    },
    /**
     * 展示分配角色的对话框, 并把用户信息保存起来到一个变量userInfo中
     * @param userInfo 用户信息
     */
    async setRole (userInfo) {
      this.userInfo = userInfo

      // 在展示对话框之前, 获取所有的角色列表
      const { data: res } = await this.$http.get('roles')
      if (res.meta.status !== 200) {
        return this.$message.error('获取用户列表失败!')
      }

      this.rolesList = res.data
      console.log(this.rolesList)
      this.setRoleDialogVisible = true
    },
    /**
     * 点击按钮, 分配角色
     */
    async saveRoleInfo () {
      if (!this.selectedRoled) {
        return this.$message.error('请选择角色')
      }
      const { data: res } = await this.$http.put(`users/${this.userInfo.id}/role`, {
        rid: this.selectedRoled
      })
      if (res.meta.status !== 200) {
        return this.$message.error('更新角色失败!')
      } else {
        this.getUserList()
        // 隐藏对话框
        this.setRoleDialogVisible = false
        return this.$message.success('更新角色成功!')
      }
    },
    /**
     * 监听分配角色对话框的关闭事件
     */
    setRoleDialogClosed () {
      this.selectedRoled = ''
    }
  }
}
</script>

<style lang="less" scoped>

</style>
