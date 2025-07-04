<script setup>
import { ref,onMounted,watch,computed } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage,ElMessageBox } from 'element-plus';
import { useUserStore } from '@/stores/userStore';
import { storeToRefs } from 'pinia';
import { getHotMoviesApi,getMovieListApi } from '@/api/home';
import { getSearchSuggestionsApi } from '@/api/search';

const userStore = useUserStore();
const { userInfo } = storeToRefs(userStore);

// 2. 定义搜索框绑定的变量
const searchKeyword = ref('')

const router = useRouter();

const userAvatar=ref('');

const hotMovies = ref([]);

const movieList = ref([]);
const totalMovies = ref(0); 
const currentPage = ref(1);
const pageSize = ref(10);

// --- 新增：筛选和排序的状态 ---
const selectedGenre = ref('');
const selectedYear = ref('');
const sortBy = ref('releaseYear'); // 默认按年份排序

// --- 新增：动态生成年份选项 ---
const currentYear = new Date().getFullYear();
const yearOptions = computed(() => {
  const years = [];
  for (let i = currentYear; i >= 1990; i--) {
    years.push(i);
  }
  return years;
});

// --- 关键：使用 watch 来监听筛选条件的变化 ---
watch([selectedGenre, selectedYear, sortBy], () => {
  // 任何筛选条件变化，都回到第1页重新搜索
  fetchMovieList(1);
});

onMounted(() => {
  fetchHotMovies();
  fetchMovieList(1);
});

const fetchHotMovies = async () => {
  try {
    const result = await getHotMoviesApi();
    if (result.code) {
      hotMovies.value = result.data; // 将从后端获取的数据赋值给hotMovies
      console.log('获取到的热映电影:', hotMovies.value); // 可以在控制台查看数据
    } else {
      ElMessage.error(result.msg || '获取热映电影失败');
    }
  } catch (error) {
    console.error(error);
  }
};

const fetchMovieList = async (page) => { 
    try {
        const params = { 
            page, 
            size: pageSize.value,
            genre: selectedGenre.value, // 筛选条件
            year: selectedYear.value, // 筛选条件
            sortBy: sortBy.value, // 排序条件
        };
        const result = await getMovieListApi(params);
        if (result.code) {
            movieList.value = result.data.records; // 后端PageResult里的当前页数据
            totalMovies.value = result.data.total; // 后端PageResult里的总数
            currentPage.value = page; // 更新当前页码状态
        } else {
            ElMessage.error(result.msg || '获取电影列表失败');
        }
    } catch (error) {
        console.error(error);
    }
}

// 5. 新增处理页码改变的函数
const handlePageChange = (newPage) => {
  console.log(`切换到第 ${newPage} 页`);
  fetchMovieList(newPage);
};

const handleSizeChange = (newSize) => {
  console.log(`每页显示数量变为 ${newSize} 条`);
  pageSize.value = newSize;
  // 改变每页数量后，通常应该回到第1页重新查询
  fetchMovieList(1); 
}

// 4. 定义处理下拉菜单点击事件的方法
const handleUserCommand = (command) => {
  if (command === 'user-center') {
    router.push('/user')
  } else if (command === 'logout') {
    
    ElMessageBox.confirm('您确认退出登录吗?','警告',
    {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning',
    })
    .then(async() => {
        
        userStore.clearUserInfo();

        ElMessage.success('已退出');
        
        router.push('/login');
    })
    .catch(() => {
        ElMessage.info('已取消')
    })
    
  }
}

const onSearch = () => {
    // 避免空内容搜索
    if (!searchKeyword.value.trim()) {
        ElMessage.error('请输入搜索内容！')
        return
    }

    router.push({ path: '/search', query: { keyword: searchKeyword.value } });
}

const querySearchAsync = async (queryString, cb) => {
  if (!queryString) {
    cb([]); // 如果输入为空，返回空列表
    return;
  }
  // 调用后端API获取建议
  const res = await getSearchSuggestionsApi(queryString);
  if (res.code) {
    cb(res.data); // 调用回调函数 cb，将建议列表传给 el-autocomplete
  } else {
    cb([]);
  }
};

// 当用户从下拉列表中选择一项时触发
const handleSelect = (item) => {
  console.log('选中的项目:', item);
  // 根据类型跳转到不同的详情页
  if (item.type === 'movie') {
    router.push(`/movie/${item.id}`);
  } else if (item.type === 'director') {
    router.push(`/directors/${item.id}`); // 导演详情页
  } else if (item.type === 'actor') {
    router.push(`/actors/${item.id}`); // 演员详情页
  }
};

</script>

<template>
    <el-container class="home-container">
        <el-header class="home-header is-sticky">

            <div class="header-logo">
                <el-icon><Film /></el-icon>
                <span>电影评分系统</span>
            </div>

            <div class="header-search">
                <el-autocomplete
                    v-model="searchKeyword"
                    :fetch-suggestions="querySearchAsync"
                    placeholder="搜索电影、导演、演员..."
                    @select="handleSelect"
                    class="search-input"
                    clearable
                >
                    <template #default="{ item }">
                        <div class="suggestion-item">
                            <span class="value">{{ item.value }}</span>
                            <el-tag size="small" type="info">{{ item.type }}</el-tag>
                            <!-- <span class="type-tag">{{ item.type }}</span> -->
                        </div>
                    </template>
                </el-autocomplete>
            </div>

            <div class="header-user">

                <el-dropdown v-if="userInfo" trigger="hover" @command="handleUserCommand">
                    <span class="user-info-trigger">
                        <el-avatar :size="40" :src="userInfo.avatarUrl" />
                        <span class="username">{{ userInfo.username }}</span>
                    </span>
                    <template #dropdown> 
                        <el-dropdown-menu>
                            <el-dropdown-item command="user-center">
                                <el-icon><User /></el-icon>个人中心
                            </el-dropdown-item>
                            <el-dropdown-item command="logout" divided>
                                <el-icon><SwitchButton /></el-icon>退出登录
                            </el-dropdown-item>
                        </el-dropdown-menu>
                    </template>
                </el-dropdown>

                <div v-else class="login-buttons">
                    <el-button type="primary" @click="router.push('/login')">登录</el-button>
                    <!-- <el-button type="primary" @click="router.push('/register')">注册</el-button> -->
                </div>

            </div>
        </el-header>
        <el-main class="home-main">
            <section class="section hot-section">
                <h2 class="section-title">热映电影</h2>
                <el-carousel height="400px" :autoplay="true" :interval="4000" type="card">
                    <el-carousel-item v-for="movie in hotMovies" :key="movie.movieID" class="carousel-item">
                        <router-link :to="`/movie/${movie.movieID}`" class="carousel-link">
                            <div 
                                class="carousel-content" 
                                :style="{ backgroundImage: `url(${movie.coverUrl})` }"
                            >
                                <div class="carousel-overlay"></div>
                                <div class="carousel-text">
                                    <h3 class="carousel-title">{{ movie.title }}</h3>

                                    <div class="carousel-rating">
                                        <el-rate :model-value="movie.rating / 2" disabled size="small" text-color="#ff9900" />
                                        <span class="rating-score">{{ movie.rating.toFixed(1) }}分</span>

                                    </div>
                            
                                </div>
                            </div>
                        </router-link>
                    </el-carousel-item>
                </el-carousel>
            </section>
            <el-divider border-style="double" />
            
            <section class="filter-section">
                <el-select v-model="selectedGenre" placeholder="所有类型" clearable style="width: 180px;">
                    <el-option label="剧情" value="剧情" />
                    <el-option label="喜剧" value="喜剧" />
                    <el-option label="动作" value="动作" />
                    <el-option label="科幻" value="科幻" />
                </el-select>

                <el-select v-model="selectedYear" placeholder="所有年份" clearable style="width: 180px;">
                    <el-option v-for="year in yearOptions" :key="year" :label="`${year}年`" :value="year" />
                </el-select>

                <el-radio-group v-model="sortBy">
                    <el-radio-button label="releaseYear">按时间排序</el-radio-button>
                    <el-radio-button label="rating">按评分排序</el-radio-button>
                </el-radio-group>
            </section>

            <section class="section list-section">
                <div class="section-header">
                    <h2 class="section-title">电影列表</h2>
                    <div class="search-bar"></div>
                </div>
  
                <div class="movie-list-container">
                    <div class="movie-row" v-for="movie in movieList" :key="movie.movieID">
      
                        <el-image :src="movie.coverUrl" lazy class="movie-poster">
                            <template #error>
                                <div class="image-slot">
                                    <el-icon><Picture /></el-icon>
                                </div>
                            </template>
                        </el-image>

                        <div class="info-block">
                            <router-link :to="`/movie/${movie.movieID}`" class="title-link">
                                <h3 class="title">{{ movie.title }} <span class="year">({{ movie.releaseYear }})</span></h3>
                            </router-link>
                            <div class="info-line">
                                <span class="label">导演:</span>
                                <span class="value">{{ movie.directorName }}</span>
                            </div>
                            <div class="info-line">
                                <span class="label">主演:</span>
                                <span class="value actors">{{ movie.actorsList }}</span>
                            </div>
                        </div>

                        <div class="rating-block">
                            <template v-if="movie.rating > 0">
                                <div class="rating-label">综合评分</div>
                                <div class="rating-score">{{ movie.rating.toFixed(1)}}</div>
                            </template>
                            <div v-else class="no-rating">
                                暂无评分
                            </div>
                        </div>

                    </div>
                </div>

                <br/>

                <div class="pagination-container">
                    <el-pagination
                        background
                        layout="total, sizes, prev, pager, next, jumper" 
                        :total="totalMovies"
                        v-model:page-size="pageSize" 
                        v-model:current-page="currentPage"
                        @size-change="handleSizeChange"
                        @current-change="handlePageChange"
                    />
                </div>
            </section>
        </el-main>
    </el-container>
</template>

<style scoped>
    /* 全局容器与布局 */
    .home-container {
        height: 100vh;
        display: flex;
        flex-direction: column;
    }

    

    /* 头部布局 */
    .home-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0 24px;
        height: 64px;
        background-color: #fff;
        border-bottom: 1px solid #eee;
        flex-shrink: 0;

        overflow: visible;
        position: relative;
        z-index: 10;
    }

.header-logo {
    display: flex;
    align-items: center;
    font-size: 20px;
    font-weight: bold;
    color: #409EFF; /* 或者你的主题色 */
    gap: 8px;
}

    /* 头部搜索框 */
    .header-search { 
       
        display: flex;
        justify-content: center; /* 让内部的搜索框在容器内居中 */
    }

    .search-input {
        width: 50%; /* 宽度占据父容器的一半 */
        max-width: 600px; /* 但最宽不超过600px */
        min-width: 300px; /* 最窄也不低于300px，防止在小屏幕上变得过窄 */
    }

    .el-input__icon{
        cursor: pointer;
    }

    .header-user {
        display: flex;
        align-items: center;
    }

    .user-avatar-wrapper { 
        cursor: pointer;
    }

    .user-avatar{
        background-color: #ccc;
    }

    .user-info-trigger {
        display: flex; /* 1. 启用 Flex 布局 */
        align-items: center; /* 2. 让所有子元素在交叉轴上（垂直方向）居中对齐 */
        cursor: pointer; /* 保持可点击的小手光标 */
        outline: none; /* 点击时去掉可能会出现的蓝色边框 */
    }

    /* 这是用户名的 span */
    .username {
        margin-left: 10px; /* 3. 在用户名左侧添加一些间距，让它和头像分开 */
        font-size: 16px;
        color: #303133;
    }

    /* 主体布局 */
    .home-main {
        flex: 1;
        padding: 24px;
        background-color: #f5f7fa;
        overflow-y: auto;
    }

    .section{
        margin-bottom: 24px;
    }

    .hot-section .section-title {
        font-size: 24px;
        font-weight: 600;
        margin-bottom: 20px;
    }
    
    .carousel-item {
        border-radius: 10px;
        overflow: hidden;
    }

    .carousel-link {
        display: block;
        width: 100%;
        height: 100%;
        text-decoration: none; /* 去掉链接下划线 */
    }

    .carousel-content {
        width: 100%;
        height: 100%;
        background-size: cover;
        background-position: center;
        position: relative;
        color: white;
        display: flex; /* 使用flex布局让内容垂直居底 */
        flex-direction: column;
        justify-content: flex-end; /* 内容靠下 */
        padding: 24px;
    }
    .carousel-overlay {
        content: '';
        position: absolute;
        top: 0; left: 0; right: 0; bottom: 0;
        background: linear-gradient(to top, rgba(0,0,0,0.85) 10%, rgba(0,0,0,0) 70%);
        z-index: 1;
    }
    .carousel-text {
        position: relative;
        z-index: 2;
        text-shadow: 1px 1px 2px rgba(0,0,0,0.8);
        margin-bottom: 20px;
    }
    .carousel-title {
        font-size: 26px;
        font-weight: bold;
        margin: 0 0 8px 0;
    }
    .carousel-rating {
        display: flex;
        align-items: center;
        margin-bottom: 8px;
    }
    .carousel-rating .el-rate {
        position: relative;
        top: -1px;
    }
    .rating-score {
        font-size: 18px;
        font-weight: bold;
        color: #E6A23C;
        margin-left: 10px;
        margin-bottom: 8px;
    }
    .carousel-director {
        font-size: 14px;
        margin: 0;
        opacity: 0.9;
    }

    .hot-movie-item { 
        width: 100%;
        height: 300px;
        display: flex;
        justify-content: center;
        align-items: center;
        background-color: #f0f0f0;
        border-radius: 10px;
    }

    .hot-movie-poster { 
        width: 80%;
        height: 80%;
        background-color: #e0e0e0;
        border-radius: 8px;
    }

.filter-section {
  display: flex;
  gap: 16px;
  align-items: center;
  margin-bottom: 24px;
  padding: 16px;
  background-color: #ffffff;
  border-radius: 8px;
}

    .list-section {
        margin-top: 40px;
    }
    .section-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
    }
    .section-title {
        font-size: 24px;
        font-weight: 600;
    }

    /* 电影列表容器 */
    .movie-list-container {
        border-top: 1px solid #e0e0e0;
    }

    /* 每一行电影的样式 */
    .movie-row {
        display: flex;
        align-items: flex-start; /* 顶部对齐 */
        padding: 20px 0;
        border-bottom: 1px solid #e0e0e0;
    }

    /* 左侧海报 */
    .movie-poster {
        width: 120px;
        height: 180px;
        flex-shrink: 0; /* 防止海报被压缩 */
        border-radius: 6px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    .image-slot {
        display: flex;
        justify-content: center;
        align-items: center;
        width: 100%;
        height: 100%;
        background: #f5f7fa;
        color: #c0c4cc;
        font-size: 30px;
    }

    /* 中间信息块 */
    .info-block {
        flex-grow: 1; /* 占据所有可用的剩余空间 */
        margin: 0 24px;
    }
    .title-link {
        text-decoration: none;
    }
    .title {
        font-size: 20px;
        font-weight: 500;
        color: #303133;
        margin: 0 0 16px 0;
        display: inline-block;
    }
    .title:hover {
        color: #409eff;
    }
    .year {
        color: #606266;
        font-size: 18px;
        margin-left: 8px;
    }
    .info-line {
        display: flex;
        font-size: 14px;
        color: #606266;
        margin-top: 8px;
        line-height: 1.6;
    }
    .label {
        width: 60px; /* 固定标签宽度，实现对齐 */
        flex-shrink: 0;
    }
    .value {
        color: #303133;
    }
    .actors {
        /* 演员过多时，限制显示行数 */
        display: -webkit-box;
        -webkit-box-orient: vertical;
        -webkit-line-clamp: 2;
        overflow: hidden;
    }

    /* 右侧评分块 */
    .rating-block {
        margin-left: auto; /* 关键：将评分块推到最右侧 */
        text-align: right;
        flex-shrink: 0;
        width: 120px;
        display: flex;
        flex-direction: column;
        align-items: center;
    }
    .rating-label {
        font-size: 14px;
        color: #606266;
    }
    .rating-score {
        font-size: 28px;
        font-weight: bold;
        color: #ff9900;
        margin-top: 8px;
        line-height: 1;
    }

    .no-rating {
        font-size: 14px;
        color: #909399;
    }

.suggestion-item {
  display: flex;
  /* justify-content: space-between; */
  width: 100%;
}
.type-tag {
  font-size: 12px;
  color: #909399;
}
</style>