<script setup>
import { ref, reactive, onMounted } from 'vue';
// 导入所有需要的API函数
import { getMyReviewsByPageApi, updateReviewApi, deleteReviewApi } from '@/api/review';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Edit, Delete, Star } from '@element-plus/icons-vue';

// --- 分页与列表状态 ---
const reviewList = ref([]);
const total = ref(0);
const currentPage = ref(1);
const pageSize = ref(5); // 影评列表可以少一点，比如每页5条

// --- 修改对话框的状态 ---
const dialogVisible = ref(false);
const editingReview = ref({});
const formRef = ref(null);

// --- 方法 ---

// 获取我的影评列表（分页）
const searchMyReviews = async (page = 1) => {
  const params = { page, size: pageSize.value };
  try {
    const res = await getMyReviewsByPageApi(params);
    if (res.code) {
      reviewList.value = res.data.records;
      total.value = res.data.total;
      currentPage.value = page;
    }
  } catch (error) {
    console.error("获取我的影评列表失败", error);
  }
};

onMounted(() => {
  searchMyReviews(1);
});

// 分页事件处理
const handlePageChange = (newPage) => {
  searchMyReviews(newPage);
};

// 打开编辑对话框
const handleEdit = (row) => {
  editingReview.value = {
    reviewID: row.reviewID,
    rating: row.rating / 2, // 从10分制转为5星制
    comment: row.comment,
  };
  dialogVisible.value = true;
};

// 保存修改
const handleSave = async () => {
  try {
    const dataToUpdate = {
      ...editingReview.value,
      rating: editingReview.value.rating * 2, // 从5星制转回10分制
    };
    const res = await updateReviewApi(dataToUpdate);
    if (res.code) {
      ElMessage.success('修改成功');
      dialogVisible.value = false;
      searchMyReviews(currentPage.value); // 刷新当前页
    } else {
      ElMessage.error(res.msg);
    }
  } catch (error) {
    console.error("修改影评失败", error);
  }
};

// 删除影评
const handleDelete = (reviewId) => {
  ElMessageBox.confirm('确认删除这条影评吗?', '警告', { type: 'warning' })
    .then(async () => {
      try {
        const res = await deleteReviewApi(reviewId);
        if (res.code) {
          ElMessage.success('删除成功');
          searchMyReviews(currentPage.value); // 刷新当前页
        } else {
          ElMessage.error(res.msg);
        }
      } catch (error) {
        console.error("删除影评失败", error);
      }
    })
    .catch(() => ElMessage.info('已取消删除'));
};
</script>

<template>
  <div class="my-reviews-container">
    <el-card shadow="never">
      <template #header>
        <h3>我的影评</h3>
      </template>

      <el-table :data="reviewList" border stripe>
        <el-table-column label="电影" width="300">
          <template #default="{ row }">
            <div class="movie-cell">
              <el-image :src="row.movieCoverUrl" class="cell-poster" fit="cover" />
              <span class="cell-movie-title">{{ row.movieTitle }}</span>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="我的评分" width="180" align="center">
          <template #default="{ row }">
            <el-rate :model-value="row.rating / 2" disabled />
          </template>
        </el-table-column>

        <el-table-column prop="comment" label="我的评论" show-overflow-tooltip />

        <el-table-column prop="reviewDate" label="发表时间" width="180" align="center" />

        <el-table-column label="操作" width="180" align="center" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" :icon="Edit" link @click="handleEdit(row)">修改</el-button>
            <el-button type="danger" :icon="Delete" link @click="handleDelete(row.reviewID)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-container">
        <el-pagination
            background
            layout="total, prev, pager, next, ->, jumper"
            :total="total"
            v-model:current-page="currentPage"
            v-model:page-size="pageSize"
            @current-change="handlePageChange"
        />
      </div>
    </el-card>

    <el-dialog v-model="dialogVisible" title="修改我的评价" width="500px">
      <div class="edit-rating">
        <span>修改评分</span>
        <el-rate v-model="editingReview.rating" size="large" allow-half show-text />
      </div>
      <el-input
        v-model="editingReview.comment"
        :rows="5"
        type="textarea"
        placeholder="修改你的影评..."
      />
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSave">保存修改</el-button>
      </template>
    </el-dialog>

  </div>
</template>

<style scoped>
.my-reviews-container h3 {
  font-size: 18px;
  font-weight: 500;
  margin: 0;
}
.movie-cell {
  display: flex;
  align-items: center;
  gap: 10px;
}
.cell-poster {
  width: 45px;
  height: 60px;
  flex-shrink: 0;
}
.cell-movie-title {
  font-weight: 500;
}
.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}
.edit-rating {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 16px;
  font-size: 16px;
}
</style>