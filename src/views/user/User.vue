<script setup>
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { useUserStore } from '@/stores/userStore';

const router = useRouter();
const userStore = useUserStore();
const goToMyHomepage = () => {
  // 检查 Pinia store 中是否存在用户信息以及角色信息
  if (userStore.userInfo?.role === 'admin') {
    // 如果是管理员，跳转到管理员主页
    router.push('/admin/home'); 
  } else {
    // 否则（包括普通用户或任何其他角色），跳转到普通用户主页
    router.push('/home');
  }
};

</script>

<template>
  <div class="user-layout">
    <el-container>
      <el-header class="header">
        个人中心
        <el-button @click="goToMyHomepage"><el-icon><Back /></el-icon>返回</el-button>

    </el-header>

    
      <el-container>
        <el-aside width="200px" class="aside">
            <el-menu router>

                <el-menu-item index="/user/userInfo"><el-icon><User /></el-icon>个人信息</el-menu-item>
                <el-menu-item index="/user/changePwd"><el-icon><Setting /></el-icon>修改密码</el-menu-item>
                <el-menu-item index="/user/myReviews"><el-icon><ChatLineSquare /></el-icon>我的影评</el-menu-item>

            </el-menu>
        </el-aside>
        <el-main class="main-content">
            <router-view></router-view>
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<style scoped>
    .user-layout .el-container{
        height: 100vh; 
    }

    .header{
        background-color: #ffffff;
        border-bottom: 1px solid #e4e7ed;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .aside {
        background-color: #ffffff;
        border-right: 1px solid #e4e7ed;
    }
    .el-menu {
        border-right: none; /* 去掉菜单自带的右边框 */
    }
    .main-content {
        background-color: #f5f7fa;
        padding: 20px;
    }

</style>