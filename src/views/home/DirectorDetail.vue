<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { getDirectorDetailApi } from '@/api/director';
import { getMoviesByDirectorApi } from '@/api/movie';
import { ArrowLeft } from '@element-plus/icons-vue';

const route = useRoute();
const router = useRouter();

const directorDetail = ref(null);
const movieList = ref([]);

onMounted(async () => {
  const directorId = route.params.id;
  if (directorId) {
    // 并行获取导演信息和电影列表
    const [resDetail, resMovies] = await Promise.all([
      getDirectorDetailApi(directorId),
      getMoviesByDirectorApi(directorId)
    ]);

    if (resDetail.code) {
      directorDetail.value = resDetail.data;
    }
    if (resMovies.code) {
      movieList.value = resMovies.data;
    }
  }
});
</script>

<template>
  <div class="page-container" v-if="directorDetail">
    <el-page-header :icon="ArrowLeft" @back="()=>router.go(-1)" :title="`返回`">
      <template #content>
        <div class="header-content">
          <el-avatar :size="60" :src="directorDetail.photoUrl" /> <span class="header-title">{{ directorDetail.name }}</span>
        </div>
      </template>
    </el-page-header>

    <el-divider />

    <el-descriptions :column="2" border title="基本信息">
      <el-descriptions-item label="姓名">{{ directorDetail.name }}</el-descriptions-item>
      <el-descriptions-item label="性别">{{ directorDetail.gender }}</el-descriptions-item>
      <el-descriptions-item label="出生日期">{{ directorDetail.birthDate }}</el-descriptions-item>
      <el-descriptions-item label="国籍">{{ directorDetail.nationality }}</el-descriptions-item>
    </el-descriptions>

    <h2 class="section-title">主要作品</h2>
    <div class="movie-list-container">
      <div class="movie-row" v-for="movie in movieList" :key="movie.movieID">
        <el-image :src="movie.coverUrl" class="movie-poster" />
        <div class="info-block">
          <router-link :to="`/movie/${movie.movieID}`" class="title-link">
            <h3 class="title">{{ movie.title }} <span class="year">({{ movie.releaseYear }})</span></h3>
          </router-link>
          </div>
        <div class="rating-block">
            </div>
      </div>
    </div>
    <el-empty v-if="movieList.length === 0" description="暂无相关电影作品" />

  </div>
</template>

<style scoped>
.page-container { padding: 24px; }
.header-content { display: flex; align-items: center; gap: 16px; font-size: 20px; }
.section-title { font-size: 20px; font-weight: 500; margin: 24px 0 16px; }

</style>