import request from "@/utils/request";

//获取电影列表
export const queryAllApi = () => request.get('/movies');

//新增
export const addApi = (movie) => request.post('/movies',movie);

//删除
export const deleteByIdApi = (id) => request.delete(`/movies?MovieID=${id}`);

//修改
export const updateApi = (movieId) => request.put('/movies',movieId);

export const getMovieForEditApi = (id) => request.get(`/movie?MovieID=${id}`);