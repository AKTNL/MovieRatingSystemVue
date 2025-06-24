// src/utils/request.js

import axios from 'axios'
import { useUserStore } from '@/stores/userStore';
import { ElMessage } from 'element-plus';

// 1. 确保这里没有导入 router

// 创建axios实例对象
const request = axios.create({
  baseURL: '/api',
  timeout: 600000
})

// 请求拦截器 (这部分是正确的，保持不变)
request.interceptors.request.use(
  (config) => {
    const userStore = useUserStore();
    const token = userStore.userInfo?.token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
)

// 响应拦截器 (修改处理401错误的部分)
request.interceptors.response.use(
  (response) => {
    if (response.data.code === 1) {
      return response.data;
    }
    ElMessage.error(response.data.msg || '服务异常');
    return Promise.reject(response.data);
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      ElMessage.error('登录已过期，请重新登录');
      const userStore = useUserStore();
      userStore.clearUserInfo();
      
      // 2. !!! 关键修改在这里 !!!
      //    使用浏览器原生跳转，而不是vue-router
      //    这会强制刷新页面并跳转到登录页，从而打破循环依赖
      window.location.href = '/login';

    } else {
      ElMessage.error(error.response?.data?.msg || error.message || '接口访问异常');
    }
    return Promise.reject(error);
  }
)

export default request;






// // src/utils/request.js

// import axios from 'axios'
// import { useUserStore } from '@/stores/userStore';
// import { ElMessage } from 'element-plus';

// //import router from '@/router';

// // 创建axios实例对象
// const request = axios.create({
//   baseURL: '/api',
//   timeout: 600000
// })

// // 添加请求拦截器 (Request Interceptor)
// request.interceptors.request.use(
//   (config) => {
//     console.log("Axios 请求拦截器触发");
//     const userStore = useUserStore();

//     // 1. 从 Pinia store 中获取 token
//     //    使用可选链操作符(?.)，即使userInfo为null也不会报错
//     const token = userStore.userInfo?.token;

//     // 2. 判断 token 是否存在
//     if (token) {
//       console.log("在 Pinia 中找到 Token，准备设置请求头");
//       // 3. 设置标准的 Authorization 请求头

//       config.headers.Authorization = `Bearer ${token}`;
//     } else {
//       console.warn("在 Pinia 中未找到 Token，将以未认证状态发送请求");
//     }

//     return config;
//   },
//   (error) => {
//     return Promise.reject(error);
//   }
// )

// // 添加响应拦截器 (Response Interceptor)
// request.interceptors.response.use(
//   (response) => {
//     if (response.data.code === 1) {
//       return response.data;
//     }
//     ElMessage.error(response.data.msg || '服务异常');
//     return Promise.reject(response.data);
//   },
//   (error) => {
//     if (error.response && error.response.status === 401) {
//       ElMessage.error('登录已过期，请重新登录');
//       const userStore = useUserStore();
//       userStore.clearUserInfo();
//       router.push('/login');
//     } else {
//       ElMessage.error(error.response?.data?.msg || error.message || '接口访问异常');
//     }
//     return Promise.reject(error);
//   }
// )

// export default request;