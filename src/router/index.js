import { createRouter, createWebHistory } from 'vue-router';

import AdminVue from '@/views/admin/Admin.vue'
import MovieManageVue from '@/views/admin/MovieManage.vue'
import ReviewManageVue from '@/views/admin/ReviewManage.vue'
import UserManageVue from '@/views/admin/UserManage.vue'
import HomeVue from '@/views/home/Home.vue'
import LoginVue from '@/views/login/Login.vue'
import MovieVue from '@/views/movie/Movie.vue'
import RatingVue from '@/views/rating/Rating.vue'
import UserVue from '@/views/user/User.vue'
import DirectorVue from '@/views/admin/DirectorManage.vue'
import ActorVue from '@/views/admin/ActorManage.vue'
import UserInformationVue from '@/views/user/UserInformation.vue'
import ChangePasswordVue from '@/views/user/ChangePassword.vue'
import MyReviewsVue from '@/views/user/MyReviews.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [

      {path: '/',name: '',component: HomeVue},

      {path: '/home',name: 'home',component: HomeVue},
      {path: '/login',name: 'login',component: LoginVue},
      {path: '/movie',name: 'movie',component: MovieVue},
      {path: '/rating',name: 'rating',component: RatingVue },
      
      { 
        path: '/user', 
        name: 'user', 
        component: UserVue,
        redirect: '/user/userInfo',
        children: [
          { path: 'userInfo', name: 'userInfo', component: UserInformationVue },
          { path: 'changePwd', name: 'changePwd', component: ChangePasswordVue },
          { path: 'myReviews', name: 'myReviews', component: MyReviewsVue },
        ]
      },

      {
        path: '/admin',
        name: 'admin',
        component: AdminVue,
        redirect: '/admin/home',
        children: [
          { path: 'home',name: 'adminHome',component: HomeVue },
          { path: 'movieManage', name: 'movieManage', component: MovieManageVue },
          { path: 'reviewManage', name: 'reviewManage', component: ReviewManageVue },
          { path: 'userManage', name: 'userManage', component: UserManageVue },
          { path: 'directorManage', name: 'directorManage', component: DirectorVue },
          { path: 'actorManage', name: 'actorManage', component: ActorVue },
        ]
      },
    ]
  })
  
  export default router  