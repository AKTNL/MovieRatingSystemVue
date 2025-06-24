import request from "@/utils/request";

const BASE_URL = '/api/movies';

// 获取热映电影
export const getHotMoviesApi = () => request.get(`${BASE_URL}/hot`);

// 获取分页电影列表（和 movieManage.js 里的可以共用）
export const getMovieListApi = (params) => request.get(BASE_URL, { params });

export const searchMoviesApi = (keyword, params) => {
    // params 包含分页信息 { page, size }
    return request.get(`/movies/search?keyword=${keyword}`, { params });
}
