import request from "@/utils/request";

export const addReviewApi = (reviewData) => request.post("/reviews", reviewData);

export const getMyReviewApi = (movieId) => request.get("/reviews/my-review",{ params:{ movieId } });

export const updateReviewApi = (data) => request.put("/reviews", data)

export const deleteReviewApi = (reviewId) => request.delete(`/reviews/${reviewId}`)

export const getOtherReviewsApi = (movieId, page, size) => request.get(`/reviews/movie/${movieId}`,{ params: { page, size} })

export const getMyReviewsByPageApi = (params) => request.get(`/reviews/my-list`,{ params })

export const getReviewsForAdminApi = (params) => request.get(`/reviews/admin/list`,{params})
