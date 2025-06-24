import request from "@/utils/request";

export const addReviewApi = (reviewData) => request.post("/reviews", reviewData);