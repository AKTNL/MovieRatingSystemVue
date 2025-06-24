import request from "@/utils/request";

export const getSearchSuggestionsApi = (keyword) => {

    return request.get('/search/suggestions', { params: { keyword } });
}