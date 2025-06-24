import request from "@/utils/request";

export const getAllUsersApi = (params) => request.get(`/users`,{ params });

export const deleteUserApi = (userId) => request.delete(`/users/${userId}`);