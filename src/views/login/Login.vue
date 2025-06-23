<!-- 定义JS，控制模板部分的数据和行为（JS） -->
<script setup>
import { ref } from 'vue'
import { loginApi,registerApi } from '@/api/login'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/userStore'

//控制注册与登录表单的显示， 默认显示注册
const isRegister = ref(false)

//定义数据模型
const registerDate = ref({
    username: '',
    password: '',
    rePassword: ''
})

const loginForm = ref({
  username: '',
  password: '',
})

const loginFormRef = ref(null); // 用于引用表单

// ★ 3. 为登录表单也定义规则
const loginRules = {
    username: [
        { required: true, message: '请输入用户名', trigger: 'blur' },
    ],
    password: [
        { required: true, message: '请输入密码', trigger: 'blur' },
    ]
}

const router = useRouter()
//  登录方法
const login = async () => {
  if (!loginFormRef.value) return;

  try {
    // 在发送API请求前，先对整个表单进行校验
    await loginFormRef.value.validate();

    const result = await loginApi(loginForm.value)
    if(result.code){//登录成功
      // 提示信息
      ElMessage.success('登录成功');

      //存储当前登录的用户信息
      const userStore = useUserStore(); // 2. 获取store实例
      userStore.setUserInfo(result.data); // 3. 调用action来保存用户信息

      //  跳转
      if(result.data.role==='admin'){
        router.push('/admin');
      }else{
        router.push('/home');
      }
    }else{//登录失败
      ElMessage.error(result.msg);
    }

  } catch (validationError) {
    // 校验失败，不执行后续操作
    ElMessage.warning('请将表单填写完整');
 
  }
}

//取消登录
const clear = () => {
  loginForm.value = {username: '', password: ''}
}

//校验密码的函数
const checkRePassword = (rule, value, callback) => {
    if (value === '') {
        callback(new Error('请再次输入密码'))
    } else if (value !== registerDate.value.password) {
        callback(new Error('两次输入密码不一致!'))
    } else {
        callback()
    }
}

//定义表单校验规则
const rules = {
    username: [
        { required: true, message: '请输入用户名', trigger: 'blur' },
        { min: 5,max: 16, message: '长度为5~16位非空字符',trigger: 'blur' }
    ],
    password: [
        { required: true, message: '请输入密码', trigger: 'blur' },
        { min: 5,max: 16, message: '长度为5~16位非空字符',trigger: 'blur' }
    ],
    rePassword: [
        { validator:checkRePassword, trigger: 'blur' }
    ]
}


//定义函数，清空数据模型的数据
const clearRegisterDate = () => {
    registerDate.value = {
        username: '',
        password: '',
        rePassword: ''
    }
}

const registerFormRef = ref(null)

const Register = async() => {
  if (!registerFormRef.value) return;
  
  try{
    await registerFormRef.value.validate();
    
    const dataToSend = {
        username: registerDate.value.username,
        password: registerDate.value.password
      
    };
    let result = await registerApi(dataToSend);

    if (result.code === 1) { // ★ 建议和 login 的成功判断条件保持一致
      ElMessage.success('注册成功！即将切换到登录界面...');
      clearRegisterDate();
      // 延迟切换，让用户看到提示
      setTimeout(() => {
        isRegister.value = false;
      }, 1500);
    } else {
      // 显示后端返回的错误信息，例如“用户名已存在”
      ElMessage.error(result.msg);
    }
  }catch(validationError){
    ElMessage.warning('请将表单信息填写完整且正确');
  }

}


</script>

<!-- 模板部分，控制的是页面的结构（HTML） -->
<template>
  <div class='container'>
    <div class='content'>
      
      <h1 class='title'>电影评分系统</h1> 

      <el-card class='card'>

        <!-- 登录 -->
        <transition name="fade" mode="out-in">
        <el-form 
          v-if="!isRegister"
          :model="loginForm" 
          label-width="80px" 
          style="width: 100%" 
          key="login"
          :rules="loginRules"
          ref="loginFormRef"
          @keyup.enter="login"
        >
      
          <el-form-item label="用户名" style="margin-bottom: 40px ; font-weight: bold" prop="username"> 
            <el-input v-model="loginForm.username" style="width: 100%" size="large" placeholder="请输入用户名" />
          </el-form-item>

          <el-form-item label="密码" style="margin-bottom: 40px ; font-weight: bold" prop="password"> 
            <el-input v-model="loginForm.password" style="width: 100%" size="large" type="password" placeholder="请输入密码" show-password />
          </el-form-item>

          <el-form-item>
        
            <el-button type="primary" plain style="margin-right: 100px ; margin-bottom: 20px" @click="login">登 录</el-button>
            <el-button type="primary" plain style="margin-bottom: 20px" @click="clear">取 消</el-button>
  
          </el-form-item>

          <div style="display: flex; justify-content:center;">
            
            <el-link type="primary" underline="never" @click="isRegister = true ; clearRegisterDate() ; clear()">立即注册</el-link>

            <!-- <el-link type="info" :underline="false">忘记密码</el-link> -->
          </div>

        </el-form>

        <!-- 注册 -->
        <el-form
          v-else
          :model="registerDate"
          :rules="rules"
          ref="registerFormRef"
          label-width="80px"
          style="width: 100%"
          key="register"
          @submit.prevent="Register"
        >

          <el-form-item label="用户名" prop="username" style="margin-bottom: 40px ; font-weight: bold;">
            <el-input v-model="registerDate.username" size="large" placeholder="请输入用户名" />
          </el-form-item>

          <el-form-item label="密码" prop="password" style="margin-bottom: 40px ; font-weight: bold;">
            <el-input v-model="registerDate.password" size="large" type="password" placeholder="请输入密码" show-password />
          </el-form-item>

          <el-form-item label="确认密码" prop="rePassword" style="margin-bottom: 40px ; font-weight: bold;">
            <el-input v-model="registerDate.rePassword" size="large" type="password" placeholder="请再次输入密码" show-password />
          </el-form-item>


          <el-form-item>
            <el-button type="primary" plain @click="Register" style="margin-right: 100px ; ">注 册</el-button>
            <el-button type="info" plain @click="isRegister = false" >返 回</el-button>
          </el-form-item>
        </el-form>

        </transition>
      </el-card>
      
    </div>
  </div>
</template>

<!-- 当前组件的CSS样式 -->
<style scoped>
  .container {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    background-color: #f5f5f5;

    background-image: url("@/assets/login.jpg");
    background-repeat: no-repeat;
    background-size: cover;
  }

  .content {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    margin-top: -50px;
  }

  .title {
    margin-bottom: 24px;
    font-size: 28px;
    color: #222;
    text-align: center;
  }

  .card {
    width: 450px;
    padding: 50px;
    border-radius: 10px;
    background: rgba(255, 255, 255, 0.8);
  }

  .fade-enter-active,
  .fade-leave-active {
    transition: opacity 0.5s;
  }
  .fade-enter-from,
  .fade-leave-to {
    opacity: 0;
  }
  
</style>

