import request from "@/utils/request";
export const getHotMoviesApi = () => request.get('/hot');

export const getMovieListApi = (params) => request.get('/list',{params});
