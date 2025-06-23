<script setup>
import { ref, reactive, onMounted } from 'vue';
// 1. 导入 actor 相关的API函数
import { getAllActorsApi, addActorApi, updateActorApi, deleteActorApi } from '@/api/actor';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Plus, Edit, Delete } from '@element-plus/icons-vue';

// 2. 将所有变量名改为 actor

const actorList = ref([]);
const dialogVisible = ref(false);

const total = ref(0);
const currentPage = ref(1);
const pageSize = ref(10);



const formTitle = ref('新增演员');
const actorForm = ref({
  name: '',
  gender: '男',
  birthDate: '',
  nationality: ''
});
const formRef = ref(null);

const rules = reactive({
  name: [{ required: true, message: '请输入演员姓名', trigger: 'blur' }],
  
});

// 获取列表
const search = async (page = 1) => {
  const params = {
    page: page,
    size: pageSize.value
  };
  const res = await getAllActorsApi(params);
  if (res.code) {
    actorList.value = res.data.records;
    total.value = res.data.total;
    currentPage.value = page;
  }
};

onMounted(() => {
  search(1);
});

// --- 新增处理页码改变的函数 ---
const handlePageChange = (newPage) => {
  search(newPage);
};


// --- 新增处理“每页数量”改变的函数 ---
const handleSizeChange = (newSize) => {
  // 这个函数会在用户选择新的每页条数时被调用
  // newSize 就是用户选择的那个数字，比如 20

  // 1. 更新我们存储每页数量的状态 (其实v-model已经做了，但为了清晰可以再写一次)
  pageSize.value = newSize;
  
  // 2. 重要：改变每页数量后，应该回到第1页重新查询
  search(1); 
};

// 打开新增对话框
const handleAdd = () => {
  formTitle.value = '新增演员';
  actorForm.value = { name: '', gender: '男', birthDate: '', nationality: '' };
  dialogVisible.value = true;
};

// 打开编辑对话框
const handleEdit = (row) => {
  formTitle.value = '编辑演员';
  actorForm.value = { ...row };
  dialogVisible.value = true;
};

// 保存（新增或更新）
const handleSave = async () => {
  await formRef.value.validate();
  // 3. 根据 actorID 判断是新增还是更新
  const api = actorForm.value.actorID ? updateActorApi : addActorApi;
  const res = await api(actorForm.value);
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
  ElMessageBox.confirm('确认删除该演员吗?', '警告', { type: 'warning' })
    .then(async () => {
      const res = await deleteActorApi(id);
      if (res.code) {
        ElMessage.success('删除成功');
        search();
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
      <h1>演员管理</h1>
      <el-button type="primary" :icon="Plus" @click="handleAdd">新增演员</el-button>
    </div>
    
    <el-table :data="actorList" border stripe>

      <el-table-column type="index" label="序号" width="80" align="center" />
      <el-table-column prop="name" label="姓名" width="300" align="center" />
      <el-table-column prop="gender" label="性别" width="120" align="center" />
      <el-table-column prop="birthDate" label="出生日期" width="300" align="center" />
      <el-table-column prop="nationality" label="国籍" align="center" />
      <el-table-column label="操作" width="200" align="center" fixed="right">
        <template #default="{ row }">
          <el-button type="primary" :icon="Edit" size="small" @click="handleEdit(row)">编辑</el-button>
          <el-button type="danger" :icon="Delete" size="small" @click="handleDelete(row.actorID)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <div class="pagination-container">
      <el-pagination
        background
        
        layout=" sizes, prev, pager, next, jumper, ->, total"
        
        :total="total"
        v-model:page-size="pageSize"
        v-model:current-page="currentPage"
        
        :page-sizes="[10, 15, 30, 50, 100]"

        @size-change="handleSizeChange"
        @current-change="handlePageChange"
      />
    </div>

    <el-dialog v-model="dialogVisible" :title="formTitle" width="600px" :close-on-click-modal="false">
      <el-form :model="actorForm" :rules="rules" ref="formRef" label-width="100px">
        <el-form-item label="姓名" prop="name">
          <el-input v-model="actorForm.name" placeholder="请输入演员姓名"></el-input>
        </el-form-item>
        <el-form-item label="性别" >
          <el-radio-group v-model="actorForm.gender">
            <el-radio label="男" />
            <el-radio label="女" />
          </el-radio-group>
        </el-form-item>
        <el-form-item label="出生日期" >
          <el-date-picker
            v-model="actorForm.birthDate"
            type="date"
            placeholder="请选择日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            style="width: 100%;"
          />
        </el-form-item>
        <el-form-item label="国籍" prop="nationality">
          <el-input v-model="actorForm.nationality" placeholder="请输入演员国籍"></el-input>
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
/* 和 DirectorManage.vue 样式可以共用或保持一致 */
.manage-container {
  padding: 20px;
}
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}
.header h1 {
  font-size: 22px;
  font-weight: 500;
}

.pagination-container {
  display: flex;
  justify-content: end;
  margin-top: 20px;
}
</style>