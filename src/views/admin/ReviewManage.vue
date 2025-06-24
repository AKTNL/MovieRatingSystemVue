<script setup>
import { ref, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Delete } from '@element-plus/icons-vue';
// 假设你创建了一个新的API文件或在其中添加了新函数
import { getReviewsForAdminApi, deleteReviewApi,searchReviewsByMovieApi } from '@/api/review';
import { getAllMoviesForSelectApi } from '@/api/movie'; 

const reviewList = ref([]);
const total = ref(0);
const currentPage = ref(1);
const pageSize = ref(10);
const movieTitleFilter = ref(''); // 新增：用于绑定搜索框

const movieListForSelect = ref([]); // 存放所有电影，用于下拉框
const filterMovieId = ref(''); // 绑定下拉框 v-model 的值

const search = async (page = 1) => {
  const params = { page, size: pageSize.value };
  let res;
  // 如果搜索框有内容，就调用新的搜索API
  if (filterMovieId.value) {
    res = await searchReviewsByMovieApi(filterMovieId.value, params);
  } else {
    // 否则，调用原来的获取全部列表的API
    res = await getReviewsForAdminApi(params);
  }

  if (res.code) {
    reviewList.value = res.data.records;
    total.value = res.data.total;
    currentPage.value = page;
  }

};

const handleFilterChange = () => {
  search(1); // 总是从第一页开始显示筛选结果
};

// 新增：搜索按钮的点击事件
const handleSearch = () => {
  searchReviews(1); // 搜索时，总是从第一页开始
};

onMounted(() => {
  search(1); // 默认加载所有评论
  
  // 获取电影列表用于筛选
  const fetchMoviesForSelect = async () => {
    const res = await getAllMoviesForSelectApi();
    if (res.code) {
      movieListForSelect.value = res.data;
    }
  };
  fetchMoviesForSelect();
});
const handlePageChange = (newPage) => search(newPage);
const handleSizeChange = (newSize) => {
  pageSize.value = newSize;
  search(1);
};

// 删除评论的逻辑是可复用的
const handleDelete = (id) => {
  ElMessageBox.confirm('确认删除该用户的这条评论吗? 这会影响电影的平均分。', '警告', { type: 'warning' })
    .then(async () => {
      // 这里调用的是我们之前为用户端创建的、通用的删除API
      const res = await deleteReviewApi(id);
      if (res.code) {
        ElMessage.success('删除成功');
        search(currentPage.value); // 刷新当前页
      } else {
        ElMessage.error(res.msg);
      }
    })
    .catch(() => ElMessage.info('已取消删除'));
};
</script>

<template>
  <div class="manage-container">
    <div class="header">
      <h1>电影评论管理</h1>
      <div class="filter-area">
        <el-select
          v-model="filterMovieId"
          placeholder="按电影名称筛选"
          filterable
          clearable
          @change="handleFilterChange"
          style="width: 300px;"
        >
          <el-option
            v-for="movie in movieListForSelect"
            :key="movie.movieID"
            :label="movie.title"
            :value="movie.movieID"
          />
        </el-select>
      </div>
    </div>
    
    <el-table :data="reviewList" border stripe>
      <el-table-column type="index" label="序号" width="70" align="center" />

      <el-table-column prop="movieTitle" label="电影" width="200" align="center"/>
      <el-table-column prop="username" label="评论用户" width="150" align="center"/>
      <el-table-column prop="comment" label="评论内容" show-overflow-tooltip />
      <el-table-column prop="rating" label="评分" width="100" align="center" />
      <el-table-column prop="reviewDate" label="评论时间" width="180" align="center" />
      <el-table-column label="操作" width="120" align="center" fixed="right">
        <template #default="{ row }">
          <el-button type="danger" :icon="Delete" size="small" @click="handleDelete(row.reviewID)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <div class="pagination-container">
      <el-pagination
          background
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          @size-change="handleSizeChange"
          @current-change="handlePageChange"
      />
    </div>
  </div>
</template>

<style scoped>
/* 样式可以完全复用 DirectorManage.vue 或 MovieManage.vue 的 */
.manage-container { padding: 20px; }
.header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.header h1 { font-size: 22px; font-weight: 500; }
.pagination-container { display: flex; justify-content: center; margin-top: 20px; }
</style>