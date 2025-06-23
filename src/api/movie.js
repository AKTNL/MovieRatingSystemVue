import request from "@/utils/request";

const BASE_URL = '/api/movies';

export const getMovieDetailApi = (id) => request.get(`${BASE_URL}/detail/${id}`);

