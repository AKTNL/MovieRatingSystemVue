import request from "@/utils/request";

// 定义一个基础路径，方便统一管理
const BASE_URL = '/api/actors';

// 获取所有演员
export const getAllActorsApi = (params) => request.get(BASE_URL,{params});

// 新增演员
export const addActorApi = (actor) => request.post(BASE_URL, actor);

// 更新演员
export const updateActorApi = (actor) => request.put(BASE_URL, actor);

// 删除演员
export const deleteActorApi = (id) => request.delete(`${BASE_URL}/${id}`);

export const searchActorsApi = (query) => request.get(`${BASE_URL}/search`, { params: { name: query } });

export const getActorDetailApi = (id) => request.get(`${BASE_URL}/${id}`);

//export const getMoviesByActorApi = (actorId) => request.get(`${BASE_URL}/by-actor/${actorId}`);