<template>
  <div>
    <!--面包屑导航区域-->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图-->
    <el-card>
      <!--添加角色区域-->
      <el-row>
        <el-col>
          <el-button type="primary" @click="addRoleDialogVisible = true">添加角色</el-button>
        </el-col>
      </el-row>

      <!-- 角色列表区域-->
      <el-table
        v-loading="!rolesList.length"
        :data="rolesList"
        :stripe="true"
        border
        element-loading-text="拼命加载中"
        row-key="id"
        style="width: 100%">
        <!--展开列-->
        <el-table-column type="expand">
          <!--作用域插槽-->
          <template slot-scope="scope">
            <!--<pre>元素表示预先格式化的文本，该文本将完全按照 HTML 文件中所写的方式呈现-->
            <!--<pre>-->
            <!--{{ scope.row }}-->
            <!--</pre>-->
            <el-row v-for="(item, i1) in scope.row.children" :key="item.id"
                    :class="['bd-bottom', i1 ===0 ? 'bd-top': '' ,'vcenter']">
              <!--渲染一级权限-->
              <el-col :span="5">
                <el-tag closable @close="removeRightById(scope.row, item.id)">
                  {{ item.authName }}
                </el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
              <!--渲染二级和三级权限-->
              <el-col :span="19">
                <!--  通过for循环, 嵌套渲染二级权限 -->
                <el-row v-for="(subItem,i2) in item.children" :key="subItem.id"
                        :class="[i2 === 0 ? '':'bd-top', 'vcenter']">
                  <el-col :span="6">
                    <el-tag closable type="success" @close="removeRightById(scope.row, subItem.id)">
                      {{ subItem.authName }}
                    </el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <el-col :span="18">
                    <el-tag v-for="(item3) in subItem.children" :key="item3.id" closable type="warning"
                            @close="removeRightById(scope.row, item3.id)">
                      {{ item3.authName }}
                    </el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <!-- 索引列 -->
        <el-table-column label="#"
                         type="index">
        </el-table-column>
        <el-table-column label="角色名称"
                         prop="roleName">
        </el-table-column>
        <el-table-column label="角色描述"
                         prop="roleDesc">
        </el-table-column>
        <!-- 加上了这个with="300", 保证了页面缩小的时候, 三个按钮都在一行上显示-->
        <el-table-column label="操作" width="300px">
          <template slot-scope="scope">
            <!-- 修改按钮 -->
            <el-button icon="el-icon-edit" size="mini" type="primary" @click="showEditDialog(scope.row.id)">编辑
            </el-button>

            <!-- 删除按钮-->
            <el-button icon="el-icon-delete" size="mini" type="danger" @click="removeRoleById(scope.row.id)">删除
            </el-button>

            <!-- 分配角色按钮-->
            <el-button icon="el-icon-setting" size="mini" type="warning" @click="showSetRightDialog(scope.row)">分配权限
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!--分配权限对话框-->
    <el-dialog
      :visible.sync="setRightDialogVisible"
      title="分配权限"
      width="50%"
      @close="setRightDialogClosed">
      <!-- 树形控件
          bug点:  写出:data="rolesList"  改成 :data="rightsList"
          #
          注意点: 这个  node-key="id"  id 猜测是从
                  :data="rightsList"绑定的rightsList: []数组对象取出来每单个对象的id
      -->
      <el-tree ref="treeRef" :data="rightsList"
               :default-checked-keys="defKeys" :default-expand-all="true"
               :props="treeProps" node-key="id" show-checkbox></el-tree>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRightDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="allotRights">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 添加角色的对话框 -->
    <el-dialog
      :visible.sync="addRoleDialogVisible"
      title="添加角色"
      width="35%"
      @close="addDialogClosed">
      <!-- 内容主体区域 -->
      <el-form ref="addFormRef" :model="addForm" :rules="addFormRules" label-width="70px">
        <!-- prop=username 对应了 addFormRules中的username校验规则-->
        <el-form-item label="角色名称" label-width="85px" prop="roleName">
          <el-input v-model="addForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" label-width="85px" prop="roleDesc">
          <el-input v-model="addForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <!-- 底部区域 -->
      <span slot="footer" class="dialog-footer">
    <el-button @click="addRoleDialogVisible = false">取 消</el-button>
    <el-button type="primary" @click="addRole">确 定</el-button>
  </span>
    </el-dialog>

    <!-- 编辑角色的对话框 -->
    <el-dialog
      :visible.sync="editRoleDialogVisible"
      title="编辑角色"
      width="35%"
      @close="editDialogClosed">
      <!-- 内容主体区域 -->
      <el-form ref="editFormRef" :model="editForm" :rules="addFormRules" label-width="70px">
        <!-- prop=username 对应了 addFormRules中的username校验规则-->
        <el-form-item label="角色名称" label-width="85px" prop="roleName">
          <el-input v-model="editForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" label-width="85px" prop="roleDesc">
          <el-input v-model="editForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <!-- 底部区域 -->
      <span slot="footer" class="dialog-footer">
    <el-button @click="editRoleDialogVisible = false">取 消</el-button>
    <el-button type="primary" @click="editRole">确 定</el-button>
  </span>
    </el-dialog>

  </div>
</template>

<script>
export default {
  name: 'Roles',
  data () {
    return {
      // 所有角色列表数据
      rolesList: [],
      // 控制分配权限对话框的显示与隐藏
      setRightDialogVisible: false,
      // 所有权限数据
      rightsList: [],
      // 树形控件的属性绑定对象
      treeProps: {
        label: 'authName',
        children: 'children'
      },
      // 默认选中的节点id值数组
      defKeys: [],
      // 当前即将分配权限的角色id
      roleId: '',
      // 控制添加角色对话框的显示与隐藏
      addRoleDialogVisible: false,
      // tianjia
      addForm: {
        roleName: '',
        roleDesc: ''
      },
      addFormRules: {
        roleName: [
          {
            required: true,
            message: '请输入角色名称',
            trigger: 'blur'
          },
          {
            min: 2,
            max: 6,
            message: '角色名称长度在 2 到 6 个字符',
            trigger: 'blur'
          }
        ],
        roleDesc: [
          {
            required: true,
            message: '请输入角色描述',
            trigger: 'blur'
          }
        ]
      },
      editForm: {},
      editRoleDialogVisible: false
    }
  },
  created () {
    this.getRolesList()
  },
  methods: {
    /**
     * 获取所有角色列表
     */
    async getRolesList () {
      const { data: res } = await this.$http.get('roles')
      if (res.meta.status !== 200) {
        return this.$message.error('获取角色列表失败!')
      } else {
        this.rolesList = res.data
        console.log(this.rolesList)
      }
    },
    /**
     * 根据id删除对应的权限
     * @param role
     * @param roleId
     */
    async removeRightById (role, roleId) {
      // 弹框提示用户是否要删除
      const confirmResult = await this.$confirm('此操作将永久删除该权限, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch((err) => {
        return err
      })

      if (confirmResult !== 'confirm') {
        return this.$message.error('取消了删除')
      } else {
        // console.log('确认了删除')
        const { data: res } = await this.$http.delete(`roles/${role.id}/rights/${roleId}`)
        /**
         * bug点: 这个 meta.status是一个 数字类型, 不是字符串
         */
        if (res.meta.status !== 200) {
          return this.$message.error('删除权限失败!')
        } else {
          // this.getRolesList()
          role.children = res.data
          this.$message.success('删除权限成功!')
        }
      }
    },
    /**
     * 展示分配权限对话框
     * @param role
     */
    async showSetRightDialog (role) {
      this.roleId = role.id
      // 获取所有权限数据
      const { data: res } = await this.$http.get('rights/tree')
      if (res.meta.status !== 200) {
        return this.$message.error('获取权限数据失败!')
      } else {
        // 获取到权限数据保存到data中
        this.rightsList = res.data
        // 递归获取三级节点的Id
        this.getLeafKeys(role, this.defKeys)

        this.setRightDialogVisible = true
        // console.log(this.rightsList)
      }
    },
    /**
     * 通过递归的形式, 获取角色下的所有三级权限的id, 并保存到defKeys数组中
     * @param node
     * @param arr
     */
    getLeafKeys (node, arr) {
      // 如果当前node节点不包含 children 属性, 则是三级节点
      if (!node.children) {
        return arr.push(node.id)
      }
      node.children.forEach(item => {
        this.getLeafKeys(item, arr)
      })
    },
    /**
     * 监听 分配权限对话框的关闭事件
     */
    setRightDialogClosed () {
      this.defKeys = []
    },
    /**
     * 点击为角色分配权限
     */
    async allotRights () {
      /**
       * ... 代表展开运算符
       * ...this.$refs.treeRef.getCheckedKeys
       */

      /**
       * bug点 : 出错地点 ...this.$refs.treeRef.getCheckedKeys,
       * 原因:  少写了  getCheckedKeys() 后面的 括号. 出现了下面的错误信息
       * [Vue warn]: Error in v-on handler (Promise/async): "TypeError: Invalid attempt to spread non-iterable instance.
       * In order to be iterable, non-array objects must have a [Symbol.iterator]() method."
       * #
       * TypeError: Invalid attempt to spread non-iterable instance.
       * In order to be iterable, non-array objects must have a [Symbol.iterator]() method.
       */
      const keys = [
        ...this.$refs.treeRef.getCheckedKeys(),
        ...this.$refs.treeRef.getHalfCheckedKeys()
      ]
      console.log(keys)

      const idStr = keys.join(',')

      const { data: res } = await this.$http.post(`roles/${this.roleId}/rights`, { rids: idStr })
      if (res.meta.status !== 200) {
        return this.$message.error('分配权限失败!')
      } else {
        this.getRolesList()
        this.setRightDialogVisible = false
        return this.$message.success('分配权限成功!')
      }
    },
    /**
     * 添加角色
     */
    async addRole () {
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) {
          return
        }
        // 可以发起添加角色的网络请求
        const { data: res } = await this.$http.post('roles', this.addForm)
        console.log(res)
        if (res.meta.status !== 201) {
          return this.$message.error('添加角色失败!')
        } else {
          this.addRoleDialogVisible = false
          this.getRolesList()
          this.$message.success('添加角色成功!')
        }
      })
    },
    /**
     * 监听 添加角色对话框的关闭事件
     */
    addDialogClosed () {
      this.$refs.addFormRef.resetFields()
    },
    /**
     * 编辑角色
     */
    async editRole () {
      this.$refs.editFormRef.validate(async valid => {
        if (!valid) {
          return
        }
        const { data: res } = await this.$http.put(`roles/${this.editForm.roleId}`,
          {
            roleName: this.editForm.roleName,
            roleDesc: this.editForm.roleDesc
          }
        )
        if (res.meta.status !== 200) {
          this.$message.error('更新角色信息失败!')
        } else {
          this.editRoleDialogVisible = false
          this.getRolesList()
          this.$message.success('更新角色成功!')
        }
      })
    },
    /**
     * 展示编辑角色的对话框
     * @param roleId
     */
    async showEditDialog (roleId) {
      const { data: res } = await this.$http.get(`roles/${roleId}`)
      if (res.meta.status !== 200) {
        return this.$message.error('查询角色信息失败')
      } else {
        this.editForm = res.data
        this.editRoleDialogVisible = true
      }
    },
    /**
     * 根据角色id删除角色
     * @param roleId
     */
    async removeRoleById (roleId) {
      // 弹框询问用户是否直接删除数据
      const confirmResult = await this.$confirm('此操作将永久删除该角色, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消删除'
        })
      })

      if (confirmResult === 'confirm') {
        console.log('确认了删除')
        const { data: res } = await this.$http.delete(`roles/${roleId}`)
        if (res.meta.status !== 200) {
          return this.$message.error('删除角色失败!')
        } else {
          this.getRolesList()
          return this.$message.success('删除角色成功!')
        }
      }
    },
    /**
     * 监听 修改角色对话框的关闭事件
     */
    editDialogClosed () {
      this.$refs.editFormRef.resetFields()
    }
  }
}
</script>

<style lang="less" scoped>
.el-tag {
  margin: 7px;
}

.bd-top {
  border-top: 1px solid #eee;
}

.bd-bottom {
  border-bottom: 1px solid #eee;
}

.vcenter {
  display: flex;
  align-items: center;
}
</style>
