import request from "@/utils/request";

export const userinfoApi = (username) => request.get(`/users/${username}`);

export const updateUserinfoApi = (userinfo) => request.put('/users',userinfo);

export const changePwdApi = (pwd) => request.put('/password',pwd);