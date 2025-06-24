<script setup>
import { ref, watch, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { searchMoviesApi } from '@/api/home'; 
import { ElMessage } from 'element-plus';

const route = useRoute();
const searchResultList = ref([]);
const total = ref(0);
const currentPage = ref(1);
const pageSize = ref(10);
const currentKeyword = ref(route.query.keyword || '');

const doSearch = async (keyword, page = 1) => {
  if (!keyword) return;
  const params = { page, size: pageSize.value };
  try {
    const res = await searchMoviesApi(keyword, params);
    if (res.code) {
      searchResultList.value = res.data.records;
      total.value = res.data.total;
      currentPage.value = page;
    }
  } catch (error) {
    console.error("搜索失败", error);
  }
};

// 监听路由参数的变化，如果用户在搜索页进行了新的搜索，页面能响应
watch(() => route.query.keyword, (newKeyword) => {
  currentKeyword.value = newKeyword;
  doSearch(newKeyword, 1);
});

// 页面加载时，执行第一次搜索
onMounted(() => {
  doSearch(currentKeyword.value);
});

const handlePageChange = (newPage) => {
  doSearch(currentKeyword.value, newPage);
};
</script>

<template>
  <div class="search-result-page">
    <h1>“{{ currentKeyword }}” 的搜索结果</h1>
    <p v-if="total > 0">共为您找到 {{ total }} 条相关结果</p>
    
    <div class="movie-list-container">
       </div>

    <div class="pagination-container">
       <el-pagination
          background
          layout="prev, pager, next, ->, total"
          :total="total"
          v-model:current-page="currentPage"
          @current-change="handlePageChange"
        />
    </div>

    <el-empty v-if="total === 0" description="没有找到相关的信息，换个关键词试试吧" />
  </div>
</template>

<style scoped>
.search-result-page { padding: 24px; }
.pagination-container { display: flex; justify-content: center; margin-top: 20px; }
/* ... 复用 Home.vue 的列表样式 ... */
</style>