<script setup>
import { ref, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Delete } from '@element-plus/icons-vue';
// 1. 我们现在只需要获取列表和删除用户的API
import { getAllUsersApi, deleteUserApi } from '@/api/userManage';

const userList = ref([]);
const total = ref(0);
const currentPage = ref(1);
const pageSize = ref(10);

// 获取用户列表（分页）
const searchUsers = async (page = 1) => {
  const params = { page, size: pageSize.value };
  try {
    const res = await getAllUsersApi(params);
    if (res.code) {
      userList.value = res.data.records;
      total.value = res.data.total;
      currentPage.value = page;
    }
  } catch (error) {
    console.error("获取用户列表失败", error);
  }
};

onMounted(() => {
  searchUsers(1);
});

// 分页事件处理
const handlePageChange = (newPage) => searchUsers(newPage);
const handleSizeChange = (newSize) => {
  pageSize.value = newSize;
  searchUsers(1);
};

// 2. 删除了 handleStatusChange 函数，只保留删除逻辑
const handleDelete = (user) => {
  ElMessageBox.confirm(
    `您确定要永久删除用户 “<strong>${user.username}</strong>” 吗？<br/>此操作将不可逆，请谨慎操作！`, 
    '严重警告', 
    {
      dangerouslyUseHTMLString: true, // 允许在消息中使用HTML标签
      confirmButtonText: '我意已决，执行删除',
      cancelButtonText: '我再想想',
      type: 'warning',
    }
  ).then(async () => {
      try {
        const res = await deleteUserApi(user.userID);
        if (res.code) {
          ElMessage.success(`用户 “${user.username}” 已被删除`);
          // 刷新当前页的列表
          searchUsers(currentPage.value);
        } else {
          ElMessage.error(res.msg);
        }
      } catch (error) {
        console.error("删除用户失败", error);
      }
    })
    .catch(() => {
      ElMessage.info('已取消删除操作');
    });
};
</script>

<template>
  <div class="manage-container">
    <div class="header">
      <h1>用户管理</h1>
      </div>
    
    <el-table :data="userList" border stripe>
      <el-table-column type="index" label="序号" width="70" align="center" />

        <el-table-column label="头像" width="100" align="center">
            <template #default="{ row }">
                <el-avatar :size="50" :src="row.avatarUrl" />
            </template>
        </el-table-column>

      <el-table-column prop="username" label="用户名" width="200" align="center" />
      <el-table-column prop="email" label="电子邮箱" show-overflow-tooltip  align="center" />

      <el-table-column prop="registrationDate" label="注册时间" width="250" align="center" />

      <el-table-column label="操作" width="120" align="center" fixed="right">
        <template #default="{ row }">
          <el-button type="danger" :icon="Delete" size="small" @click="handleDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <div class="pagination-container">
      <el-pagination
          background
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          @size-change="handleSizeChange"
          @current-change="handlePageChange"
      />
    </div>
    
    </div>
</template>

<style scoped>
/* 样式可以保持不变 */
.manage-container { padding: 20px; }
.header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.header h1 { font-size: 22px; font-weight: 500; }
.pagination-container { display: flex; justify-content: center; margin-top: 20px; }
</style>