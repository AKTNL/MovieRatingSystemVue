<script setup>
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { ArrowLeft, Film, User, Calendar, Clock, ChatDotSquare, Star } from '@element-plus/icons-vue';
// import { getMovieDetailApi } from '@/api/movieApi'; // 假设的API

const router = useRouter();
const route = useRoute();

// --- 使用占位数据来构建界面 ---
const movieDetail = ref({
  movieID: 1,
  title: '盗梦空间',
  releaseYear: 2010,
  coverUrl: 'https://img1.doubanio.com/view/photo/s_ratio_poster/public/p513344864.jpg',
  rating: 9.4,
  duration: 148,
  genre: '剧情 / 科幻 / 悬疑 / 冒险',
  country: '美国 / 英国',
  language: '英语 / 日语 / 法语',
  directorName: '克里斯托弗·诺兰',
  actorsList: '莱昂纳多·迪卡普里奥 / 约瑟夫·高登-莱维特 / 艾利奥特·佩吉 / 汤姆·哈迪 / 渡边谦 / 迪利普·劳 / 基里安·墨菲 / 玛丽昂·歌迪亚',
  synopsis: '道姆·柯布（莱昂纳多·迪卡普里奥 饰）与同事阿瑟（约瑟夫·高登-莱维特 饰）和纳什（卢卡斯·哈斯 饰）在一次针对日本能源大亨齐藤（渡边谦 饰）的盗梦行动中失败，反被齐藤利用。齐藤威逼利诱，让他率领团队去挑战一项不可能完成的任务——植入思想...'
});

// --- 用于评论和评分的响应式变量 ---
const userRating = ref(0);
const userComment = ref('');

// 返回上一页
const goBack = () => {
  router.go(-1);
};

// 提交评论（功能占位）
const submitReview = () => {
  console.log('用户评分:', userRating.value);
  console.log('用户评论:', userComment.value);
  ElMessage.success('评论提交成功！（功能待实现）');
};

// --- 将来获取真实数据的逻辑 ---
onMounted(() => {
  const movieId = route.params.id; // 从路由中获取电影ID
  console.log('当前电影ID:', movieId);
  // fetchMovieDetail(movieId);
});

// const fetchMovieDetail = async (id) => {
//   const res = await getMovieDetailApi(id);
//   if (res.code) {
//     movieDetail.value = res.data;
//   }
// };
</script>

<template>
  <div class="detail-page-container">
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
            <el-descriptions-item label="导演">{{ movieDetail.directorName }}</el-descriptions-item>
            <el-descriptions-item label="主演">{{ movieDetail.actorsList }}</el-descriptions-item>
            <el-descriptions-item label="类型">{{ movieDetail.genre }}</el-descriptions-item>
            <el-descriptions-item label="制片国家/地区">{{ movieDetail.country }}</el-descriptions-item>
            <el-descriptions-item label="语言">{{ movieDetail.language }}</el-descriptions-item>
            <el-descriptions-item label="片长">{{ movieDetail.duration }} 分钟</el-descriptions-item>
          </el-descriptions>

          <div class="rating-section">
            <span class="rating-label">综合评分</span>
            <div class="rating-value">
              <strong>{{ movieDetail.rating }}</strong>
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