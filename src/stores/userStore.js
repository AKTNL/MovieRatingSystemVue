// src/stores/userStore.js

import { defineStore } from 'pinia'
import { ref } from 'vue'

// 定义一个名为 'user' 的 store
export const useUserStore = defineStore('user', () => {
    
    // state: 存储用户信息的核心变量
    // 我们尝试从 localStorage 初始化，这样用户刷新页面后登录状态不会丢失
    const userInfo = ref(JSON.parse(localStorage.getItem('userInfo')) || null);

    // actions: 修改 state 的方法
    
    /**
     * 设置用户信息，在登录和更新信息后调用
  
     * 
     */
    function setUserInfo(newUserInfo) {
        userInfo.value = {...userInfo.value, ...newUserInfo };
        localStorage.setItem('userInfo', JSON.stringify(userInfo.value));
    }

    /**
     * 清除用户信息，在退出登录时调用
     */
    function clearUserInfo() {
        userInfo.value = null;
        localStorage.removeItem('userInfo');
    }

    // 将 state 和 actions return 出去，以便其他组件使用
    return {
        userInfo,
        setUserInfo,
        clearUserInfo
    }
});