<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { ElMessage } from 'element-plus';
import { ArrowLeft, Film, User, Calendar, Clock, ChatDotSquare, Star } from '@element-plus/icons-vue';
import { getMovieDetailApi } from '@/api/movie'; 

import { getReviewsByMovieIdApi,addReviewApi,updateReviewApi,deleteReviewApi } from '@/api/review';
import { useUserStore } from '@/stores/userStore';

const userStore = useUserStore();

const router = useRouter();
const route = useRoute();

// --- 使用占位数据来构建界面 ---
const movieDetail = ref(null);

// --- 用于评论和评分的响应式变量 ---
const userRating = ref(0);
const userComment = ref('');

// 6. 创建获取数据的函数
const fetchMovieDetail = async (id) => {
  try {
    const res = await getMovieDetailApi(id);
    if (res.code) {
      movieDetail.value = res.data;
    } else {
      ElMessage.error(res.msg || '获取电影详情失败');
    }
  } catch (error) {
    ElMessage.error('请求详情数据异常');
    console.error(error);
  }
};


// 返回上一页
const goBack = () => {
  router.go(-1);
};

// 提交评论
const submitReview = async () => {
  // 1. 前端校验
  if (userRating.value === 0) {
    ElMessage.warning('请先为电影评分');
    return;
  }
  if (!userComment.value.trim()) {
    ElMessage.warning('请输入评论内容');
    return;
  }

  // 2. 准备提交给后端的数据包
  const reviewData = {
    movieID: movieDetail.value.movieID,
    rating: userRating.value * 2, // el-rate是5分制，我们的数据库是10分制，所以乘以2
    comment: userComment.value
  };

  try {
    // 3. 调用API
    const res = await addReviewApi(reviewData);
    if (res.code) {
      ElMessage.success('评论发表成功！');
      // 4. 成功后可以清空表单
      userRating.value = 0;
      userComment.value = '';
      // 5. 重新获取一次电影详情，以更新平均分和显示新评论
      fetchMovieDetail(movieDetail.value.movieID);
    } else {
      ElMessage.error(res.msg);
    }
  } catch (error) {
    console.error(error);
  }
};

// --- 获取真实数据的逻辑 ---
onMounted(() => {
  const movieId = route.params.id; // 从路由中获取电影ID
  console.log('当前电影ID:', movieId);
  if (movieId) {
    fetchMovieDetail(movieId);
  }
});


const myReview = ref({
  reviewID: 101,
  rating: 10.0, // 10分制
  comment: '在我心中是无法被超越的神作！每次看都有新的感受。',
  createTime: '2025-06-20'
});
// 如果myReview为null，则显示评论框

// 其他用户的影评列表
const otherReviews = ref([
  { reviewID: 201, username: '影迷A', avatarUrl: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png', rating: 9.0, comment: '结构精巧，叹为观止。', createTime: '2025-06-15', likes: 128 },
  { reviewID: 202, username: '小C', avatarUrl: 'https://cube.elemecdn.com/9/c2/f0ee8a3c7c9638a54940382568c9dpng.png', rating: 10.0, comment: '诺兰从不让人失望！', createTime: '2025-05-11', likes: 99 },
]);

// 新评论和评分的数据模型
const newRating = ref(0);
const newComment = ref('');

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

      <div class="review-section">
        <h2 class="section-title">发表我的看法</h2>
        <el-card shadow="never">
          <div class="my-rating">
            <span>我的评分</span>
            <el-rate v-model="userRating" size="large" allow-half show-text />
          </div>
          <el-input
            v-model="userComment"
            :rows="4"
            type="textarea"
            placeholder="写下你的影评..."
            class="comment-input"
          />
          <el-button type="primary" @click="submitReview" class="submit-btn">提交</el-button>
        </el-card>
      </div>

    </div>
  </div>
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
</style>