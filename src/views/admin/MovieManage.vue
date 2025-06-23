<script setup>
import { ref,onMounted } from 'vue'
import { queryAllApi,addApi,deleteByIdApi,updateApi,getMovieForEditApi } from '@/api/movieManage'
import { ElMessage,ElMessageBox } from 'element-plus';
import { getAllActorsApi } from '@/api/actor'
import { getAllDirectorsApi } from '@/api/director';

const directorList = ref([]);
const actorList = ref([]);

const total = ref(0);
const currentPage = ref(1);
const pageSize = ref(5);

const searchDirectors = async () => {
  const directorRes = await getAllDirectorsApi();
  if (directorRes.code) directorList.value = directorRes.data;
};

const searchActors = async () => {
  const actorRes = await getAllActorsApi();
  if (actorRes.code) actorList.value = actorRes.data;
};

//钩子函数
onMounted(async() => {
    search(1);

    searchDirectors();
    searchActors();

})

// 2. 修改 search 函数以支持分页
const search = async (page = 1) => {
  const params = { page: page, size: pageSize.value };
  const res = await queryAllApi(params);
  if (res.code) {
    movieList.value = res.data.records;
    total.value = res.data.total;
    currentPage.value = page;
  }
};

// 3. 新增处理分页改变的两个函数
const handlePageChange = (newPage) => {
  search(newPage);
};
const handleSizeChange = (newSize) => {
  pageSize.value = newSize;
  search(1); 
};

const movieList = ref([])

const drawerVisible = ref(false)
const movie = ref({
    title:'',
    releaseYear:'',
    duration:'',
    genre:'',
    language:'',
    country:'',
    synopsis:'',
    coverUrl: null,
    directorIds: [],
    actorIds: []
})

const clear = () => {
    movie.value = {
        title:'',
        releaseYear:'',
        duration:'',
        genre:'',
        language:'',
        country:'',
        synopsis:'',
        coverUrl: null,
        directorIds: [],
        actorIds: []
    }
    selectedFile.value = null // 清空时也要重置文件
    coverPreviewUrl.value = ''
}

// 预览图 URL
const coverPreviewUrl = ref('')
const selectedFile = ref(null) // 用来临时存储用户选择的文件对象

// 处理选择图片
const handleCoverChange = (uploadFile) => {
  selectedFile.value = uploadFile.raw

  // 创建本地预览地址
  const reader = new FileReader()
  reader.onload = (e) => {
    coverPreviewUrl.value = e.target.result
  }
  reader.readAsDataURL(uploadFile.raw)
}

const uploadImageToImgBB = async (imageFile) => {
    const apiKey = '2f3918b7d70d16f68930f56499ec9e9d';
    const formData = new FormData();
    formData.append('image', imageFile);

    try {
        const response = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
            method: 'POST',
            body: formData,
        });
        const result = await response.json();
        if (result.success) {
            console.log('ImgBB 上传成功:', result.data.url);
            return result.data.url; // 返回图片的线上URL
        } else {
            throw new Error(result.error.message);
        }
    } catch (error) {
        ElMessage.error(`图片上传失败: ${error.message}`);
        return null;
    }
}

const formRef = ref(null)

const save = async () => { 

    await formRef.value.validate(async (valid, fields) => {
        // valid 是一个布尔值，true 表示验证通过，false 表示失败
        if (valid) {
      
            console.log('验证通过，准备保存！');

            // 1. 图片上传逻辑
            if (selectedFile.value) {
                const imageUrl = await uploadImageToImgBB(selectedFile.value);
                if (!imageUrl) {
                    ElMessage.error('图片上传失败，无法保存电影。');
                    return; 
                }
                movie.value.coverUrl = imageUrl;
            }

            // 2. 调用新增或更新API
            if (movie.value.movieID) {
                const result = await updateApi(movie.value);
             
                if (result.code) {
                    ElMessage.success('更新成功');
                } else {
                    ElMessage.error(result.msg || '更新失败');
                }
            } else {
                const result = await addApi(movie.value);

                if (result.code) {
                    ElMessage.success('新增成功');
                } else {
                    ElMessage.error(result.msg || '新增失败');
                }
            }

            // 3. 关闭抽屉并刷新列表
            drawerVisible.value = false;
            search();
            
        } else {
            // 验证失败
            console.log('表单验证失败!', fields)
            ElMessage.error('请检查表单，必填项不能为空！')
        }
    })

}

const deleteById = async (id) => { 
   
    console.log('即将删除的电影ID是:', id, '，它的类型是:', typeof id);

    if (!id) {
        ElMessage.error('无法获取电影ID');
        return;
    }

    ElMessageBox.confirm('您确认删除该电影吗?','警告',
    {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning',
    })
    .then(async() => {
        const result = await deleteByIdApi(id);
        if(result.code){ 
            ElMessage.success('删除成功');
            search();
        }else{
            ElMessage.error(result.msg);
        }

    })
    .catch(() => {
        ElMessage.info('您已取消删除')
    })
    

}


const formTitle=ref('新增电影');

const handleAdd = () => {
    // 1. 设置抽屉标题为“新增电影”
    formTitle.value = '新增电影';
    
    // 2. 清空上一次的表单数据
    clear();

    // 3. 打开抽屉
    drawerVisible.value = true;
}

// 新增 handleEdit 函数
const handleEdit = async(row) => {
    
    formTitle.value = '编辑电影';
    
    try {
        // 调用我们为“编辑”专门创建的API
        const result = await getMovieForEditApi(row.movieID);
        console.log("2. 收到来自后端的数据:", result); // 打印完整的响应体

        // 健壮性判断：确保result和result.data都存在
        if (result.code) {
            console.log("3. 验证通过，准备填充表单");
            movie.value = result.data; // 将返回的数据赋值给表单模型
            
            coverPreviewUrl.value = result.data.coverUrl || '';
            selectedFile.value = null;
            
            drawerVisible.value = true; // 在所有数据都准备好后，才打开抽屉
            console.log("4. 表单数据已填充，抽屉已打开");
        } else {
            console.error("获取电影详情失败，后端返回:", result);
            ElMessage.error(result?.msg || '获取电影详情失败');
        }
    } catch (error) {
        console.error("请求电影详情时发生异常:", error);
        ElMessage.error('请求电影详情异常，请查看控制台');
    }
}

const handleClose = (done) => {
    ElMessageBox.confirm('您确定要关闭吗？未保存的修改将会丢失。')
        .then(() => {
            done(); // 调用 done() 方法，正式关闭抽屉
        })
        .catch(() => {
            // 用户点击了“取消”，抽屉保持打开
        });
}

const rules = {
    title:[
        { required: true, message: '请输入电影名称', trigger: 'blur' },
    ]
}

</script>

<template>
    <div class="movie-manage-container">
        <div class="header">
            <h1>电影管理</h1>
            <el-button type="primary" :icon="Plus" size="large" @click="handleAdd">新增电影</el-button>
        </div>
    
        <el-table :data="movieList" border style="width: 100%" class="movie-table">


            <el-table-column type="index" label="序号" width="70" align="center"/>

            <!--封面图 -->
            <el-table-column label="封面" width="120" align="center">
                <template #default="{ row }">
                    <img :src="row.coverUrl" 
                    alt= "电影封面"
                    style="width: 60px; height: 80px; object-fit: cover; border-radius: 4px;" 
                    @error="handleImageError"
                    />
                  
                </template>
            </el-table-column>

            <el-table-column prop="title" label="名称" width="200" align="center"/>
            <el-table-column prop="releaseYear" label="发行年份" width="120" align="center"/>
            <el-table-column prop="duration" label="时长（分钟）" width="120" align="center"/>
            <el-table-column prop="genre" label="类型" width="150" align="center"/>
            <el-table-column prop="language" label="语言" width="140" align="center"/>
            <el-table-column prop="country" label="国家" width="120" align="center"/>
            <el-table-column prop="synopsis" label="简介" width="400" align="center"/>
            <el-table-column prop="rating" label="评分" width="100" align="center"/>

            <el-table-column label="操作" align="center"> 
            
                <template #default="scope">

                    <el-button type="primary" size="small" @click="handleEdit(scope.row)"><el-icon><EditPen /></el-icon>编辑</el-button>
                    <el-button type="danger" size="small" @click="deleteById(scope.row.movieID)"><el-icon><Delete /></el-icon>删除</el-button>
                </template>

            </el-table-column>
        </el-table>

        <div class="pagination-container">
            <el-pagination
                background
                layout=" sizes, prev, pager, next, jumper, ->, total"
                :total="total"
                v-model:current-page="currentPage"
                v-model:page-size="pageSize"
                :page-sizes="[5, 10, 15, 50]"
                @size-change="handleSizeChange"
                @current-change="handlePageChange"
            />
        </div>
    </div>


    <el-drawer
        v-model="drawerVisible"
        :title="formTitle"
        :direction="rtl"
        :before-close="handleClose"
        size="40%"
    >
        <el-form :model="movie" label-width="100px" style="width: 100%" class="form" :rules="rules" ref="formRef">
            <el-form-item label="电影名称" label-width="80px" prop="title">
                <el-input v-model="movie.title" placeholder="请输入电影名称" />
            </el-form-item>

            <el-form-item label="导演" label-width="80px">
                <el-select
                    v-model="movie.directorIds"
                    multiple
                    filterable
                    placeholder="请选择或搜索导演"
                    style="width: 100%;"
                >
                    <el-option
                        v-for="director in directorList"
                        :key="director.directorID"
                        :label="director.name"
                        :value="director.directorID"
                    />
                </el-select>
            </el-form-item>

            <el-form-item label="演员" label-width="80px">
                <el-select
                    v-model="movie.actorIds"
                    multiple
                    filterable
                    remote  reserve-keyword
                    placeholder="请选择或搜索演员"
                    style="width: 100%;"
                >
                    <el-option
                        v-for="actor in actorList"
                        :key="actor.actorID"
                        :label="actor.name"
                        :value="actor.actorID"
                    />
                </el-select>
            </el-form-item>

            <el-form-item label="发行年份" label-width="80px" >
                <el-input v-model="movie.releaseYear" placeholder="如 2025"/>
            </el-form-item>

            <el-form-item label="时长(分钟)" label-width="80px">
                <el-input v-model="movie.duration" placeholder="如 120"/>
            </el-form-item>

            <el-form-item label="类型" label-width="80px">
                <el-input v-model="movie.genre" placeholder="如 动作/ 爱情 / 科幻" />
            </el-form-item>


            <el-form-item label="语言" label-width="80px">
                <el-input v-model="movie.language" placeholder="如 汉语 / 英语"/>
            </el-form-item>

            <el-form-item label="国家" label-width="80px">
                <el-input v-model="movie.country" placeholder="如 中国 / 美国"/>
            </el-form-item>

            <el-form-item label="简介" label-width="80px">
                <el-input 
                    type="textarea"
                    v-model="movie.synopsis" 
                    rows="3"
                    placeholder="请输入电影简介"
                />
            </el-form-item>

            <el-form-item label="电影封面" >
                <el-upload
                    class="upload"
                    action=""
                    :show-file-list="false"
                    :auto-upload="false"
                    :on-change="handleCoverChange"
                >
                    <el-button>点击上传</el-button>
                </el-upload>

                <img v-if="coverPreviewUrl" 
                    :src="coverPreviewUrl" 
                    alt="封面预览"
                    style="width: 100px; padding-left: 40px; height: auto; margin-top: 10px; border-radius: 6px;" />
            </el-form-item>

        </el-form>

        <template #footer>
            <div style="text-align:center;">
                <el-button style="margin-right: 100px ; margin-bottom: 100px;" @click="clear">清空</el-button>
                <el-button type="primary" style="margin-bottom: 100px;" @click="save">确定</el-button>
            </div>
        </template>

    </el-drawer>

</template>

<style scoped>

    .movie-manage-container {
        padding: 20px;
        background-color: #f5f7fa;
        min-height: 100vh;
    }

    .header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
    }

    .header h1 {
        font-size: 26px;
        font-weight: bold;
        margin: 0;
        color: #303133;
    }

    .movie-table {
        background-color: #ffffff;
        border-radius: 8px;
        box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
        overflow: hidden;
    }

    .form {
        padding: 10px 20px;
    }

    .upload .elbutton{
        margin-top: 5px;
    }

    .pagination-container {
        display: flex;
        justify-content: end;
        margin-top: 20px;
    }

</style>