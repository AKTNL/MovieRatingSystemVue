<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { ElMessage,ElMessageBox } from 'element-plus';
import { ArrowLeft, Film, User, Calendar, Clock, ChatDotSquare, Star } from '@element-plus/icons-vue';
import { getMovieDetailApi } from '@/api/movie'; 

import { getMyReviewApi,addReviewApi,updateReviewApi,deleteReviewApi,getOtherReviewsApi } from '@/api/review';
import { useUserStore } from '@/stores/userStore';

const userStore = useUserStore();

const router = useRouter();
const route = useRoute();

// --- 使用占位数据来构建界面 ---
const movieDetail = ref(null);


// 返回上一页
const goBack = () => {
  router.go(-1);
};


// --- 获取真实数据的逻辑 ---
onMounted(() => {
  const movieId = route.params.id; // 从路由中获取电影ID
  console.log('当前电影ID:', movieId);
  if (movieId) {
    fetchAllData(movieId);
  }
});


const myReview = ref(null);

// 其他用户的影评列表
const otherReviews = ref([]);

// 新评论和评分的数据模型
const newRating = ref(0);
const newComment = ref('');

// --- 新增：用于“修改评论”弹窗的状态 ---
const editDialogVisible = ref(false);
const editingReview = ref({});

// --- 获取所有页面数据 ---
const fetchAllData = async (movieId) => {
  // 我们将三个API请求并行发出，以提升加载速度
  try {
    const [detailRes, myReviewRes, othersRes] = await Promise.all([
      getMovieDetailApi(movieId),
      getMyReviewApi(movieId),
      getOtherReviewsApi(movieId, 1, 10) // 默认加载第一页，每页10条
    ]);

    // 分别处理返回结果
    if (detailRes.code) movieDetail.value = detailRes.data;
    if (myReviewRes.code) myReview.value = myReviewRes.data;
    if (othersRes.code) otherReviews.value = othersRes.data.records; // 假设他人评论是分页的

  } catch (error) {
    ElMessage.error('加载页面数据时出错，请稍后重试');
    console.error("加载页面数据出错:", error);
  }
};

// --- 新增：删除评论的逻辑 ---
const handleDeleteReview = (reviewId) => {
  ElMessageBox.confirm('您确定要删除这条评论吗？此操作无法撤销。', '警告', {
    confirmButtonText: '确定删除',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(async () => {
    try {
      const res = await deleteReviewApi(reviewId);
      if (res.code) {
        ElMessage.success('评论删除成功！');
        // 删除成功后，重新加载所有数据以刷新页面
        await fetchAllData(movieDetail.value.movieID);
      } else {
        ElMessage.error(res.msg);
      }
    } catch (error) { console.error(error); }
  }).catch(() => {
    ElMessage.info('已取消删除');
  });
};

// --- 新增：处理“修改”按钮点击事件 ---
const handleEditReview = () => {
  // 1. 将当前评论的数据填充到编辑对象中
  editingReview.value = {
    reviewID: myReview.value.reviewID,
    rating: myReview.value.rating / 2, // 数据库是10分制，el-rate是5分制
    comment: myReview.value.comment,
  };
  // 2. 打开编辑对话框
  editDialogVisible.value = true;
};

// --- 新增：保存修改后的评论 ---
const saveUpdatedReview = async () => {
  // 准备提交给后端的数据
  const updatedData = {
    reviewID: editingReview.value.reviewID,
    rating: editingReview.value.rating * 2, // 转回10分制
    comment: editingReview.value.comment,
  };

  try {
    const res = await updateReviewApi(updatedData);
    if (res.code) {
      ElMessage.success('评论修改成功！');
      editDialogVisible.value = false; // 关闭对话框
      fetchAllData(movieDetail.value.movieID); // 刷新页面
    } else {
      ElMessage.error(res.msg);
    }
  } catch (error) { console.error(error); }
};

const submitNewReview = async () => {
  if (newRating.value === 0) {
    ElMessage.warning('请先为电影评分');
    return;
  }
  if (!newComment.value.trim()) {
    ElMessage.warning('请输入评论内容');
    return;
  }
  const reviewData = {
    movieID: movieDetail.value.movieID,
    rating: newRating.value * 2,
    comment: newComment.value
  };
  try {
    const res = await addReviewApi(reviewData);
    if (res.code) {
      ElMessage.success('评论发表成功！');
      newRating.value = 0;
      newComment.value = '';
      // Refresh all data on the page
      await fetchAllData(movieDetail.value.movieID);
    } else {
      ElMessage.error(res.msg);
    }
  } catch (error) { console.error(error); }
};
</script>

<template>
  <div v-if="movieDetail" class="detail-page-container">
    <div class="detail-content-wrapper">
      
      <el-page-header :icon="ArrowLeft" @back="goBack">
        <template #content>
          <span class="text-large font-600 mr-3"> 电影详情 </span>
        </template>
      </el-page-header>

      <el-divider />

      <div class="main-info-section">
        <el-image :src="movieDetail.coverUrl" class="poster-image" fit="cover" />

        <div class="text-info-section">
          <h1 class="movie-title">{{ movieDetail.title }} <span class="release-year">({{ movieDetail.releaseYear }})</span></h1>
          
          <el-descriptions :column="1" class="movie-meta">

            <el-descriptions-item label="导演:">{{ movieDetail.directorName }}</el-descriptions-item>
            <el-descriptions-item label="主演:">{{ movieDetail.actorsList }}</el-descriptions-item>
            <el-descriptions-item label="类型:">{{ movieDetail.genre }}</el-descriptions-item>
            <el-descriptions-item label="制片国家/地区:">{{ movieDetail.country }}</el-descriptions-item>
            <el-descriptions-item label="语言:">{{ movieDetail.language }}</el-descriptions-item>
            <el-descriptions-item label="片长:">{{ movieDetail.duration }} 分钟</el-descriptions-item>
          </el-descriptions>

          <div class="rating-section">
            <span class="rating-label">综合评分</span>
            <div class="rating-value">
              <strong>{{ movieDetail.rating.toFixed(1) }}</strong>
            </div>
            <el-rate :model-value="movieDetail.rating / 2" disabled size="large" />
          </div>
        </div>
      </div>
      
      <div class="synopsis-section">
        <h2 class="section-title">剧情简介</h2>
        <p class="synopsis-text">{{ movieDetail.synopsis }}</p>
      </div>

      <div class="my-review-section">
        <h2 class="section-title">发表我的看法</h2>
        <el-card shadow="never" class="review-card">
          <div v-if="myReview" class="my-review-display">
            <div class="display-rating">
              <span>我的评分:</span>
              <el-rate :model-value="myReview.rating / 2" disabled size="large" allow-half />
              <span class="my-score">{{ myReview.rating.toFixed(1) }}</span>
            </div>
            <p class="my-comment-text">"{{ myReview.comment }}"</p>
            <div class="my-review-actions">
              <span class="my-review-time">发表于: {{ myReview.reviewDate }}</span>
              <div>
                <el-button :icon="Edit" type="primary" link @click="handleEditReview">修改我的评价</el-button>
                <el-button :icon="Delete" type="danger" link @click="handleDeleteReview(myReview.reviewID)">删除</el-button>
              </div>
            </div>
          </div>
          
          <div v-else>
            <div class="my-rating">
              <span>我的评分</span>
              <el-rate v-model="newRating" size="large" allow-half show-text />
            </div>
            <el-input v-model="newComment" :rows="4" type="textarea" placeholder="写下你的影评..." />
            <div class="submit-wrapper">
              <el-button type="primary" class="submit-btn" @click="submitNewReview">发表评论</el-button>
            </div>
          </div>
        </el-card>
      </div>

      <div class="others-review-section">
        <h2 class="section-title">热门影评</h2>
        <div v-if="otherReviews.length > 0" class="review-list">
          <div v-for="review in otherReviews" :key="review.reviewID" class="review-item">
            <div class="review-header">
              <el-avatar :size="40" :src="review.userAvatarUrl" />
              <div class="review-author-info">
                <span class="review-username">{{ review.username }}</span>
                <el-rate :model-value="review.rating / 2" disabled size="small" />
              </div>
              <span class="review-time">{{ review.reviewDate }}</span>
            </div>
            <p class="review-text">{{ review.comment }}</p>
            <!-- <div class="review-actions">
              <el-button :icon="Pointer" text>{{ review.likes || 0 }} 人觉得有用</el-button>
              <el-button :icon="ChatDotSquare" text>回复</el-button>
            </div> -->
          </div>
        </div>
        <el-empty v-else description="还没有人评论，快来抢沙发吧！" />
      </div>

    </div>
  </div>

  <el-dialog v-model="editDialogVisible" title="修改我的评价" width="50%">
    <div class="my-rating">
      <span>修改评分</span>
      <el-rate v-model="editingReview.rating" size="large" allow-half show-text />
    </div>
    <el-input
      v-model="editingReview.comment"
      :rows="4"
      type="textarea"
      placeholder="修改你的影评..."
    />
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="editDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveUpdatedReview">保存修改</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<style scoped>
.detail-page-container {
  padding: 24px;
  background-color: #f5f7fa;
  display: flex;
  justify-content: center;
}
.detail-content-wrapper {
  width: 100%;
  max-width: 1000px;
  background-color: #fff;
  padding: 24px 32px;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.05);
}
.main-info-section {
  display: flex;
  margin-top: 24px;
  gap: 32px;
}
.poster-image {
  width: 250px;
  height: 375px;
  border-radius: 8px;
  flex-shrink: 0;
}
.text-info-section {
  flex-grow: 1;
}
.movie-title {
  font-size: 32px;
  font-weight: 600;
  margin: 0;
}
.release-year {
  font-size: 28px;
  color: #909399;
  margin-left: 8px;
}
.movie-meta {
  margin-top: 20px;
}
.rating-section {
  margin-top: 24px;
  background-color: #fafafa;
  padding: 16px;
  border-radius: 6px;
  display: flex;
  align-items: center;
}
.rating-label {
  font-size: 16px;
  color: #606266;
}
.rating-value {
  font-size: 28px;
  font-weight: bold;
  color: #ff9900;
  margin: 0 16px;
}
.synopsis-section, .review-section {
  margin-top: 40px;
}
.section-title {
  font-size: 20px;
  font-weight: 500;
  color: #409eff;
  border-bottom: 2px solid #409eff;
  padding-bottom: 8px;
  margin-bottom: 16px;
}
.synopsis-text {
  font-size: 15px;
  line-height: 1.8;
  color: #303133;
}
.my-rating {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 16px;
  font-size: 16px;
}
.comment-input {
  margin-bottom: 16px;
}
.submit-btn {
  float: right;
}
:deep(.el-descriptions__label) {
  width: 120px;
}
.review-card {
  background-color: #fafcff;
}
/* 我的评价 - 已评价的显示样式 */
.my-review-display .display-rating { display: flex; align-items: center; gap: 10px; font-size: 16px; }
.my-review-display .my-score { font-size: 18px; font-weight: bold; color: #ff9900; }
.my-review-display .my-comment-text { margin: 16px 0; font-size: 16px; color: #303133; line-height: 1.7; }
.my-review-display .my-review-actions { display: flex; justify-content: space-between; align-items: center; font-size: 14px; color: #909399; }
/* 我的评价 - 提交表单样式 */
.my-rating { display: flex; align-items: center; gap: 16px; margin-bottom: 16px; font-size: 16px; }
.submit-wrapper { text-align: right; margin-top: 16px; }

/* 其他人影评列表样式 */
.review-item { padding: 20px 0; border-bottom: 1px solid #e4e7ed; }
.review-item:last-child { border-bottom: none; }
.review-header { display: flex; align-items: center; gap: 12px; }
.review-author-info { flex-grow: 1; }
.review-username { font-weight: 500; }
.review-time { font-size: 14px; color: #909399; }
.review-text { margin: 12px 0; font-size: 15px; color: #303133; line-height: 1.8; }
.review-actions { text-align: right; }
</style>