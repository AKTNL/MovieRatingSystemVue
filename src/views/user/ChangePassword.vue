<script setup>
import { ref, reactive } from 'vue';
import { ElMessage,ElMessageBox } from 'element-plus';
import { changePwdApi } from '@/api/user';
import { useRouter } from 'vue-router';
import { useUserStore } from '@/stores/userStore';

const formRef = ref(null);
const userStore = useUserStore();
const router = useRouter();

const passwordForm = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: '',
});

const validateConfirmPassword = (rule, value, callback) => {
  if (value === '') {
    callback(new Error('请再次输入新密码'));
  } else if (value !== passwordForm.newPassword) {
    callback(new Error("两次输入的密码不一致!"));
  } else {
    callback();
  }
};

const rules = reactive({
  oldPassword: [
    { required: true, message: '请输入原密码', trigger: 'blur' },
  ],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度应在6到20个字符之间', trigger: 'blur' },
  ],
  confirmPassword: [
    { validator: validateConfirmPassword, trigger: 'blur' },
  ],
});

const submitForm = () => {
  if (!formRef.value) return;

  formRef.value.validate(async (valid) => {
    if (valid) {
      try {
        // 1. 调用后端API
        const result = await changePwdApi({
          oldPassword: passwordForm.oldPassword,
          newPassword: passwordForm.newPassword
        });

        // 2. 根据后端返回结果进行处理
        if (result.code) {
          // 修改成功
          ElMessageBox.alert(
            '密码已成功修改，为了您的账户安全，请重新登录。', 
            '操作成功', 
            {
              confirmButtonText: '好的',
              callback: () => {
                // 3. 清空前端所有登录状态
                userStore.clearUserInfo();
                // 4. 跳转到登录页
                router.push('/login');
              },
            }
          );
        } else {
          // 显示后端返回的错误信息，例如“原密码不正确！”
          ElMessage.error(result.msg);
        }
      } catch (error) {
        ElMessage.error('请求异常，请稍后再试');
        console.error(error);
      }
    } else {
      ElMessage.error('请检查输入的内容');
      return false;
    }
  });
};

const resetForm = () => {
  if (!formRef.value) return;
  formRef.value.resetFields();
};
</script>

<template>
  <div class="change-password-container">
    <el-card class="password-card" shadow="never">
      <template #header>
        <div class="card-header">
          <h3>修改密码</h3>
        </div>
      </template>

      <el-form
        ref="formRef"
        :model="passwordForm"
        :rules="rules"
        label-width="140px"
        class="password-form"
        status-icon
        size="large" 
      >
        <el-form-item label="原密码" prop="oldPassword">
          <el-input 
            v-model="passwordForm.oldPassword" 
            type="password"
            show-password
            placeholder="请输入当前使用的密码"
          />
        </el-form-item>
        <el-form-item label="新密码" prop="newPassword">
          <el-input 
            v-model="passwordForm.newPassword" 
            type="password"
            show-password
            placeholder="请输入6-20位新密码"
          />
        </el-form-item>
        <el-form-item label="确认新密码" prop="confirmPassword">
          <el-input 
            v-model="passwordForm.confirmPassword" 
            type="password"
            show-password
            placeholder="请再次输入新密码"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="submitForm">确认修改</el-button>
          <el-button @click="resetForm">重置</el-button>
        </el-form-item>
      </el-form>

    </el-card>
  </div>
</template>

<style scoped>
/* 1. 修改容器样式，实现居中 */
.change-password-container {
  display: flex;
  justify-content: center; /* 水平居中 */
  align-items: center;     /* 垂直居中 */
  width: 100%;
  height: 100%;
}

/* 2. 拉宽卡片 */
.password-card {
  width: 100%;
  max-width: 700px;
}

/* 3. 放大标题字号 */
.card-header h3 {
  font-size: 20px; 
  font-weight: 500;
  margin: 0;
  text-align: center; /* 标题也居中 */
}

.password-form {
  margin-top: 20px;
}
</style>