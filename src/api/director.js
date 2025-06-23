import request from "@/utils/request";

export const getAllDirectorsApi = (params) => request.get('/directors', { params });

// 新增导演
export const addDirectorApi = (director) => request.post('/directors', director);

// 更新导演
export const updateDirectorApi = (director) => request.put('/directors', director);

// 删除导演
export const deleteDirectorApi = (id) => request.delete(`/directors?DirectorID=${id}`);

export const searchDirectorsApi = (query) => request.get(`/directors/search`, { params: { name: query } });