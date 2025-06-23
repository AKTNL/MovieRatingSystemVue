import request from "@/utils/request";

const BASE_URL = '/api/movies'; // 所有请求都基于 /api/movies

// queryAllApi现在应该调用分页接口
export const queryAllApi = (params) => request.get(BASE_URL, { params });

export const addApi = (movie) => request.post(BASE_URL, movie);

export const updateApi = (movie) => request.put(BASE_URL, movie);

// 删除接口现在需要拼接ID
export const deleteByIdApi = (id) => request.delete(`${BASE_URL}/${id}`);

// 获取单个电影的接口也需要拼接ID
export const getMovieForEditApi = (id) => request.get(`${BASE_URL}/${id}`);