<script setup>

</script>

<template>
    <div class="common-layout">
    <el-container>
      <el-header><el-icon><HomeFilled /></el-icon>管理员页面</el-header>

      <el-container>

        <el-aside width="200px" class="common-aside">

            <el-menu :default-openeds="['1', '2']" router>

             
                <el-menu-item index="/admin/home">
                    <el-icon><Promotion /></el-icon>首页
                </el-menu-item>
         

                <el-sub-menu index="1">
                    <template #title>
                        <el-icon><Setting /></el-icon>电影管理
                    </template>

                    <el-menu-item index="/admin/movieManage"><el-icon><VideoCameraFilled /></el-icon>电影信息管理</el-menu-item>
                    <el-menu-item index="/admin/directorManage"><el-icon><UserFilled /></el-icon>导演信息管理</el-menu-item>
                    <el-menu-item index="/admin/actorManage"><el-icon><UserFilled /></el-icon>演员信息管理</el-menu-item>
                    <el-menu-item index="/admin/reviewManage"><el-icon><ChatDotRound /></el-icon>电影评论管理</el-menu-item>

                </el-sub-menu>

                <el-sub-menu index="2">
                    <template #title>
                        <el-icon><Setting /></el-icon>用户管理
                    </template>
              
                    <el-menu-item index="/admin/userManage"><el-icon><UserFilled /></el-icon>用户信息管理</el-menu-item>
          
                </el-sub-menu>

            </el-menu>
        </el-aside>
        <el-main>
            <router-view></router-view>
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<style scoped>

/* 1. 最外层布局：让整个页面撑满屏幕 */
.common-layout {
  height: 100vh;
  display: flex;
  flex-direction: column;
}

/* 2. el-container（最外层）也是 flex 布局，保证内部 header + container 占满高度 */
.common-layout > .el-container {
  flex: 1;
  display: flex;
  flex-direction: column;
}

/* 3. 顶部 Header 样式 */
.el-header {
  background-color: #409EFF; /* Element Plus 默认主色 */
  color: #ffffff;
  font-size: 20px;
  font-weight: 500;
  display: flex;
  align-items: center;
  padding: 0 24px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}

/* Header 中的图标让它与文字垂直居中并留点右间距 */
.el-header .el-icon {
  margin-right: 8px;
  font-size: 24px;
  display: flex;
  align-items: center;
  color: #ffffff;
}

/* 4. 中间的 container 需要撑满剩余高度，左右侧栏与主体并排 */
.common-layout > .el-container > .el-container {
  flex: 1;
  display: flex;
  overflow: hidden; /* 保证侧边栏与主体不会溢出父容器 */
}

/* 5. 侧边栏 Aside 样式 */
.common-aside {
  background-color: #ffffff; /* 深色背景 */
  color: #ffffff;
  padding-top: 16px;
  box-shadow: 2px 0 6px rgba(0, 0, 0, 0.1);
  /* 保证侧边栏固定宽度同时撑满高度 */
  height: 100%;
}

/* 6. el-menu 在深色侧边栏上的样式 */
.common-aside .el-menu {
  background-color: transparent;
  border-right: none;
}

/* 菜单标题（一级菜单）字体颜色 */
.common-aside .el-menu-item,
.common-aside .el-sub-menu > .el-submenu__title {
  color: #1a1a1a; /* 浅灰色文字 */
  font-size: 16px;
  padding-left: 24px !important; /* 让图标与文字更靠里一点 */
}

/* 菜单图标和文字垂直居中 */
.common-aside .el-menu-item .el-icon,
.common-aside .el-sub-menu .el-icon {
  font-size: 18px;
  vertical-align: middle;
}

/* 鼠标悬停时的背景色 */
.common-aside .el-menu-item:hover,
.common-aside .el-sub-menu__title:hover {
  background-color: #405669 !important;
  color: #ffffff !important;
}

/* 选中/激活的菜单项颜色 */
.common-aside .el-menu-item.is-active,
.common-aside .el-menu-item.is-active:hover,
.common-aside .el-sub-menu.is-active > .el-submenu__title,
.common-aside .el-sub-menu.is-active > .el-submenu__title:hover {
  background-color: #1f2d3d !important;
  color: #ffffff !important;
}

/* 7. 子菜单项（el-sub-menu 下的 item）缩进更多 */
.common-aside .el-sub-menu .el-menu-item {
  padding-left: 40px !important;
  font-size: 15px;
}

/* 8. 主区域 Main 样式 */
.el-main {
  background-color: #f2f6fc; 
  padding: 24px;
  overflow-y: auto;
}

/* 9. 如果你的 router-view 中会有卡片、表格、表单等组件，可以在这里给出统一的内容宽度限制 */
/* .el-main > * {
  max-width: 1200px;
  margin: 0 auto; 
} */

/* 10. 自定义滚动条（仅规范一下颜色，可根据自己项目需求删改） */
.el-main::-webkit-scrollbar {
  width: 8px;
}
.el-main::-webkit-scrollbar-thumb {
  background-color: rgba(0, 0, 0, 0.1);
  border-radius: 4px;
}
.el-main::-webkit-scrollbar-track {
  background-color: transparent;
}

/* 11. 防止内容溢出侧边栏范围 */
.common-aside .el-menu {
  height: calc(100vh - 64px); /* 侧边栏高度 = 屏幕高度 - header 高度 */
  overflow-y: auto;           /* 如果菜单项过多，滚动显示 */
}
.common-aside .el-menu::-webkit-scrollbar {
  width: 6px;
}
.common-aside .el-menu::-webkit-scrollbar-thumb {
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: 3px;
}
.common-aside .el-menu::-webkit-scrollbar-track {
  background-color: transparent;
}

</style>