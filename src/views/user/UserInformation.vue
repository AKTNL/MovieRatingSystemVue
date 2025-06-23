<script setup>

import { ref,computed,reactive } from 'vue';
import { ElMessage } from 'element-plus';
import { updateUserinfoApi } from '@/api/user';
import { useUserStore } from '@/stores/userStore';
import { storeToRefs } from 'pinia';

const userStore = useUserStore();

const { userInfo } = storeToRefs(userStore);


//  (优化) 创建一个计算属性来格式化日期
const formattedRegistrationDate = computed(() => {
  if (userInfo.value && userInfo.value.registrationDate) {
    // 将 "2025-01-15T10:30:00" 这样的日期格式截取为 "2025-01-15"
    return userInfo.value.registrationDate.substring(0, 10);
  }
  return '未知'; // 如果日期不存在，显示默认值
});

const selectedAvatarFile = ref(null);
const avatarPreviewUrl = ref('');
const handleAvatarChange = (uploadFile) => {
  // 1. 暂存文件对象，用于稍后上传
  selectedAvatarFile.value = uploadFile.raw;

  // 2. 创建本地预览URL
  const reader = new FileReader();
  reader.onload = (e) => {
    avatarPreviewUrl.value = e.target.result;
  };
  reader.readAsDataURL(uploadFile.raw);
}

const editDialogVisible = ref(false);
const editForm = ref({});
const editFormRef = ref(null);

const handleEdit = () =>{
  if (!userInfo.value) {
    ElMessage.error('用户信息不存在，无法编辑');
    return;
  }
  editForm.value = JSON.parse(JSON.stringify(userInfo.value));
  avatarPreviewUrl.value = userInfo.value.avatarUrl || '';
  selectedAvatarFile.value = null;
  editDialogVisible.value = true;
}

const uploadImageToImgBB = async (imageFile) => {
  const apiKey = '2f3918b7d70d16f68930f56499ec9e9d'; 
  const formData = new FormData();
  formData.append('image', imageFile);
  try {
    const response = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
      method: 'POST',
      body: formData,
    });
    const result = await response.json();
    if (result.success) {
      return result.data.url;
    } else {
      throw new Error(result.error.message);
    }
  } catch (error) {
    ElMessage.error(`图片上传失败: ${error.message}`);
    return null;
  }
}

const handleSave = async () =>{ 
    if (!editFormRef.value) return; // 防御性编程

    // 1. 首先，对整个表单进行校验
    await editFormRef.value.validate(async (valid) => {
    
    // 如果 valid 为 true，说明表单验证通过
    if (valid) {
      
      // 2. (已有逻辑) 如果用户选择了新头像文件，则先上传它
      if (selectedAvatarFile.value) {
        const newAvatarUrl = await uploadImageToImgBB(selectedAvatarFile.value);
        if (!newAvatarUrl) {
          // 上传失败，中断保存流程
          return; 
        }
        // 将ImgBB返回的新URL赋值给我们的表单数据
        editForm.value.avatarUrl = newAvatarUrl;
      }


      // 3. 调用后端的更新API
      try {

        const dataToUpdate = {
            userID: editForm.value.userID,
            username: editForm.value.username,
            email: editForm.value.email,
            avatarUrl: editForm.value.avatarUrl
        };

        const result = await updateUserinfoApi(dataToUpdate);
        
        if (result.code) {
          ElMessage.success('信息更新成功！');
          userStore.setUserInfo(result.data);
          editDialogVisible.value = false; // 关闭对话框

        } else {
          ElMessage.error(result.msg || '更新失败');
        }
      } catch (error) {
        ElMessage.error('更新请求异常');
        console.error(error);
      }

    } else {
      // 表单验证失败
      console.log('表单验证失败!', fields);
      ElMessage.error('请检查输入的信息是否正确');
    }
  });
}

const editFormRules = reactive({
  username: [
    { required: true, message: '用户名不能为空', trigger: 'blur' },
  ],
  email: [
    { required: true, message: '请输入电子邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱地址', trigger: ['blur', 'change']}
  ]
})

</script>

<template>

    <div class="info-page-container" v-if="userInfo">
    
        <div class="identity-section">
            <el-avatar :size="120" :src="userInfo.avatarUrl" />
            <div class="identity-info">
                <h1 class="username">{{ userInfo.username }}</h1>
            </div>
            <el-button class="edit-btn" type="primary" plain :icon="EditPen" @click="handleEdit">
                修改信息
            </el-button>
        </div>

        <el-divider />

        <div class="details-section">
            <el-descriptions
                title="基本资料"
                :column="2"
                size="large"
                border
            >
                <el-descriptions-item label="用户ID">{{ userInfo.userID }}</el-descriptions-item>
                <el-descriptions-item label="用户名">{{ userInfo.username }}</el-descriptions-item>
                <el-descriptions-item label="电子邮箱">{{ userInfo.email }}</el-descriptions-item>
                <el-descriptions-item label="注册时间">{{ formattedRegistrationDate }}</el-descriptions-item>
            </el-descriptions>
        </div>

    </div>

    <el-dialog
        v-model="editDialogVisible"
        title="编辑个人资料"
        width="600px"
    >
        <el-form :model="editForm" label-width="100px" :rules="editFormRules" ref="editFormRef"> 
            <el-form-item label="更换头像">
                <el-upload
                action=""
                :show-file-list="false"
                :auto-upload="false"
                :on-change="handleAvatarChange"
                >
                    <el-button type="primary">点击上传</el-button>
                </el-upload>
                <el-avatar 
                    v-if="avatarPreviewUrl" 
                    :size="100" 
                    :src="avatarPreviewUrl"
                    style="margin-left: 20px;"
                />
            </el-form-item>

            <el-form-item label="用户名" prop="username">
            <el-input v-model="editForm.username" />
            </el-form-item>
            <el-form-item label="电子邮箱" prop="email">
                <el-input v-model="editForm.email" />
            </el-form-item>
        </el-form>

        <template #footer>
            <div class="dialog-footer">
                <el-button @click="editDialogVisible = false">取消</el-button>
                <el-button type="primary" @click="handleSave">
                    保存
                </el-button>
            </div>
        </template>
    </el-dialog>
</template>

<style scoped>
    .info-page-container {
        background-color: #ffffff;
        padding: 32px 40px;
        border-radius: 8px;
        min-height: 100%;
    }

    /* 顶部身份信息区域 */
    .identity-section {
        display: flex;
        align-items: center;
        padding-bottom: 32px;
    }

    .identity-info {
        margin-left: 24px;
        flex-grow: 1; /* 关键属性：让信息区占据所有剩余空间，把按钮推到最右边 */
    }

    .username {
        font-size: 36px; /* 大大的用户名 */
        font-weight: 600;
        margin: 0 0 8px 0;
        color: #303133;
    }

    .role-tag {
        font-size: 16px;
        color: #909399;
        margin: 0;
    }

    .edit-btn {
        margin-left: 20px; /* 和信息区保持一点距离 */
    }

    /* 详细信息区域 */
    .details-section {
        margin-top: 32px;
    }
</style>