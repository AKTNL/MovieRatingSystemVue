<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { getActorDetailApi } from '@/api/actor';
import { getMoviesByActorApi } from '@/api/movie';
import { ArrowLeft, User, Calendar, Flag, Picture } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';

const route = useRoute();
const router = useRouter();

const actorDetail = ref(null);
const movieList = ref([]);
const isLoading = ref(true);

onMounted(() => {
  const actorId = route.params.id;
  if (actorId) {
    fetchAllData(actorId);
  }
});

const fetchAllData = async (actorId) => {
  isLoading.value = true;
  try {
    const [resDetail, resMovies] = await Promise.all([
      getActorDetailApi(actorId),
      getMoviesByActorApi(actorId)
    ]);
    if (resDetail.code) actorDetail.value = resDetail.data;
    if (resMovies.code) movieList.value = resMovies.data;
  } catch (error) {
    ElMessage.error("加载数据失败，请稍后再试");
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <div class="page-container" v-loading="isLoading" element-loading-text="正在拼命加载...">
    <el-card class="page-header-card" shadow="never">
      <el-page-header :icon="ArrowLeft" @back="() => router.go(-1)" :title="`返回`">
        <template #content>
          <div class="header-content">
            <el-avatar :size="64" :src="actorDetail?.photoUrl">
              <el-icon :size="30"><User /></el-icon>
            </el-avatar>
            <div class="header-text">
              <span class="header-title">{{ actorDetail?.name }}</span>
              <span class="header-subtitle">演员详情</span>
            </div>
          </div>
        </template>
      </el-page-header>
    </el-card>

    <div v-if="actorDetail" class="detail-grid">
      <div class="left-panel">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>基本信息</span>
            </div>
          </template>
          <el-descriptions :column="1" border>
            <el-descriptions-item>
              <template #label><el-icon><User /></el-icon> 姓名</template>
              {{ actorDetail.name }}
            </el-descriptions-item>
            <el-descriptions-item>
              <template #label><el-icon><Female v-if="actorDetail.gender==='女'"/><Male v-else/></el-icon> 性别</template>
              {{ actorDetail.gender }}
            </el-descriptions-item>
            <el-descriptions-item>
              <template #label><el-icon><Calendar /></el-icon> 出生日期</template>
              {{ actorDetail.birthDate }}
            </el-descriptions-item>
            <el-descriptions-item>
              <template #label><el-icon><Flag /></el-icon> 国籍</template>
              {{ actorDetail.nationality }}
            </el-descriptions-item>
          </el-descriptions>
        </el-card>
      </div>

      <div class="right-panel">
        <h2 class="section-title">主要作品 ({{ movieList.length }})</h2>
        <div class="movie-list-container">
          <div class="movie-row" v-for="movie in movieList" :key="movie.movieID">
            <el-image :src="movie.coverUrl" lazy class="movie-poster">
              <template #error><div class="image-slot"><el-icon><Picture /></el-icon></div></template>
            </el-image>
            <div class="info-block">
              <router-link :to="`/movie/${movie.movieID}`" class="title-link">
                <h3 class="title">{{ movie.title }} <span class="year">({{ movie.releaseYear }})</span></h3>
              </router-link>
              <div class="info-line">
                <span class="label">导演:</span><span class="value">{{ movie.directorName }}</span>
              </div>
              <div class="info-line">
                <span class="label">主演:</span><span class="value actors">{{ movie.actorsList }}</span>
              </div>
            </div>
            <div class="rating-block">
              <template v-if="movie.rating > 0">
                <div class="rating-score">{{ movie.rating.toFixed(1) }}</div>
                <el-rate :model-value="movie.rating / 2" disabled size="small" />
              </template>
              <div v-else class="no-rating">暂无评分</div>
            </div>
          </div>
        </div>
        <el-empty v-if="movieList.length === 0" description="暂无相关电影作品" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.page-container {
  padding: 20px;
}
.page-header-card {
  margin-bottom: 20px;
  /* 去掉卡片默认的内边距，让PageHeader撑满 */
  --el-card-padding: 0px; 
}
.header-content {
  display: flex;
  align-items: center;
  gap: 16px;
}
.header-text {
  display: flex;
  flex-direction: column;
}
.header-title {
  font-size: 22px;
  font-weight: 500;
}
.header-subtitle {
  font-size: 14px;
  color: #909399;
  margin-top: 4px;
}

/* 采用Grid布局，创建更灵活的两栏结构 */
.detail-grid {
  display: grid;
  grid-template-columns: 320px 1fr; /* 左侧固定320px，右侧自适应 */
  gap: 20px;
  align-items: flex-start;
}

.left-panel .card-header {
  font-size: 18px;
  font-weight: 500;
}
.left-panel .el-descriptions__label {
  width: 110px;
}
.left-panel .el-icon {
  vertical-align: middle;
  margin-right: 5px;
}

.right-panel .section-title {
  font-size: 20px;
  font-weight: 500;
  margin: 0 0 16px;
}
.movie-row {
  display: flex;
  padding: 16px 0;
  border-bottom: 1px solid #f0f2f5;
}
.movie-row:last-child {
  border-bottom: none;
}
.movie-poster {
  width: 80px;
  height: 120px;
  flex-shrink: 0;
  border-radius: 4px;
}
.info-block {
  flex-grow: 1;
  margin: 0 20px;
}
.title-link { text-decoration: none; }
.title {
  font-size: 18px;
  font-weight: 500;
  color: #303133;
  margin: 0 0 10px 0;
}
.title:hover { color: #409eff; }
.year {
  color: #909399;
  font-size: 16px;
  margin-left: 8px;
}
.info-line {
  font-size: 13px;
  color: #606266;
  margin-top: 6px;
}
.label {
  margin-right: 8px;
}
.actors {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
}
.rating-block {
  text-align: right;
  flex-shrink: 0;
}
.rating-score {
  font-size: 22px;
  font-weight: bold;
  color: #ff9900;
}
.no-rating {
  font-size: 14px;
  color: #909399;
}
</style>