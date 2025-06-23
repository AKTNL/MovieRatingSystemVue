<script setup>
import { ref, onMounted } from 'vue';
import { getAllDirectorsApi, addDirectorApi, updateDirectorApi, deleteDirectorApi } from '@/api/director';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Plus, Edit, Delete } from '@element-plus/icons-vue';

const directorList = ref([]);
const total = ref(0);
const currentPage = ref(1);
const pageSize = ref(10);

const dialogVisible = ref(false);
const formTitle = ref('新增导演');
const directorForm = ref({ name: '' });
const formRef = ref(null);



// --- 修改获取列表的函数，让它支持分页 ---
const search = async (page = 1) => {
  const params = { page: page, size: pageSize.value };
  const res = await getAllDirectorsApi(params);
  if (res.code) {
    directorList.value = res.data.records;
    total.value = res.data.total;
    currentPage.value = page;
  }
};

// --- onMounted 现在只获取第一页 ---
onMounted(() => {
  search(1);
});

// --- 新增处理页码改变的函数 ---
const handlePageChange = (newPage) => {
  search(newPage);
};

const handleSizeChange = (newSize) => {
  pageSize.value = newSize;
  search(1);
};

// 在 handleAdd 函数中
const handleAdd = () => {
  formTitle.value = '新增导演';
  directorForm.value = {
    name: '',
    gender: '男', // 给一个默认值
    birthDate: '',
    nationality: ''
  };
  dialogVisible.value = true;
};

// 打开编辑对话框
const handleEdit = (row) => {
  formTitle.value = '编辑导演';
  directorForm.value = { ...row };
  dialogVisible.value = true;
};

// 保存（新增或更新）
const handleSave = async () => {
  await formRef.value.validate(); // 表单校验
  const api = directorForm.value.directorID ? updateDirectorApi : addDirectorApi;
  const res = await api(directorForm.value);
  if (res.code) {
    ElMessage.success(formTitle.value + '成功');
    dialogVisible.value = false;
    search();
  } else {
    ElMessage.error(res.msg);
  }
};

// 删除
const handleDelete = (id) => {
  ElMessageBox.confirm('确认删除该导演吗?', '警告', { type: 'warning' })
    .then(async () => {
      const res = await deleteDirectorApi(id);
      if (res.code) {
        ElMessage.success('删除成功');
        search();
      } else {
        ElMessage.error(res.msg);
      }
    })
    .catch(() => ElMessage.info('已取消删除'));
};

const rules = {
  name: [{ required: true, message: '请输入导演姓名', trigger: 'blur' }]
};
</script>

<template>
  <div>
    <div class="header">
      <h1>导演管理</h1>
      <el-button type="primary" :icon="Plus" @click="handleAdd">新增导演</el-button>
    </div>
    
    <el-table :data="directorList" border stripe>
      <el-table-column type="index" label="序号" width="80" align="center" />
      <el-table-column prop="name" label="姓名" width="300" align="center" />
      <el-table-column prop="gender" label="性别" width="120" align="center" />
      <el-table-column prop="birthDate" label="出生日期" width="300" align="center" />
      <el-table-column prop="nationality" label="国籍" align="center" />
      <el-table-column label="操作" width="200" align="center">
        <template #default="{ row }">
          <el-button type="primary" :icon="Edit" size="small" @click="handleEdit(row)">编辑</el-button>
          <el-button type="danger" :icon="Delete" size="small" @click="handleDelete(row.directorID)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <div class="pagination-container">
        <el-pagination
            background
      
            layout="sizes, prev, pager, next, jumper, ->, total"
      
            :total="total"

            v-model:page-size="pageSize"
            v-model:current-page="currentPage"

            :page-sizes="[10, 15, 30, 50, 100]"

            @size-change="handleSizeChange"
            @current-change="handlePageChange"
        />
    </div>

    <el-dialog v-model="dialogVisible" :title="formTitle" width="600px">
      <el-form :model="directorForm" :rules="rules" ref="formRef" label-width="100px">
        <el-form-item label="姓名" prop="name">
          <el-input v-model="directorForm.name" placeholder="请输入导演姓名"></el-input>
        </el-form-item>
        
        <el-form-item label="性别" prop="gender">
          <el-radio-group v-model="directorForm.gender">
            <el-radio label="男" />
            <el-radio label="女" />
          </el-radio-group>
        </el-form-item>

        <el-form-item label="出生日期" prop="birthDate">
          <el-date-picker
            v-model="directorForm.birthDate"
            type="date"
            placeholder="请选择日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            style="width: 100%;"
          />
        </el-form-item>

        <el-form-item label="国籍" prop="nationality">
          <el-input v-model="directorForm.nationality" placeholder="请输入导演国籍"></el-input>
        </el-form-item>

      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSave">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}
.pagination-container {
  display: flex;
  justify-content: end;
  margin-top: 20px;
}
</style>