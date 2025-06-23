import request from "@/utils/request"

// 登录

export const loginApi = (loginData) => request.post("/login",loginData)

export const registerApi = (registerData) => request.post("/register",registerData)

