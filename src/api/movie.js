import request from "@/utils/request";

const BASE_URL = '/api/movies';

export const getMovieDetailApi = (id) => request.get(`${BASE_URL}/detail/${id}`);

export const getMoviesByDirectorApi = (directorId) => request.get(`${BASE_URL}/by-director/${directorId}`);

export const getMoviesByActorApi = (actorId) => request.get(`${BASE_URL}/by-actor/${actorId}`);

export const getAllMoviesForSelectApi = () => {
  // 调用我们为这个功能专门创建的后端接口
  return request.get(`${BASE_URL}/list-for-select`);
};