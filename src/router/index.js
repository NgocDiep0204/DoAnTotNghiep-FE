import { createRouter, createWebHistory } from 'vue-router'
import MainLayout from '../views/layouts/mainlayout.vue'
import Home from '../views/home.vue'
import Contact from '../views/contact.vue'
import Login from '../views/login.vue'
import Register from '../views/register.vue'
import Resetpassword from '../views/resetpassword.vue'
import Verifyotp from '../views/verifyotp.vue'
import Forgotpassword from '../views/forgotpassword.vue'
import Profile from '../views/profile.vue'
import blogs from '../views/blogs.vue'
import Doctorspage from '../views/doctorspage.vue'
import Bookdoctors from '../views/bookdoctors.vue'
import Service from '../views/service.vue'
import History from '../views/history.vue'
import Listservice from '../views/admin/servicemanager.vue'
import Appoimentmanager from '../views/admin/appoimentmanager.vue'
import Customermanager from '../views/admin/customermanager.vue'
import Dentistmanager from '../views/admin/dentistmanager.vue'
import Schedule from '../views/admin/schedule.vue'
import Doctorprofile from '../views/doctorprofile.vue'
import Servicedetail from '../views/servicedetail.vue'
import Fulldashboard from '../views/admin/report/fulldashboard.vue'
import Dentistappoiment from '../views/dentist/dentistappoiment.vue'
import t from '../views/test.vue'
const routes = [
    {
        path: '/',
        name: 'mainlayout',
        component: MainLayout,
        children: [ 
            {
            path: '/trang-chu',
            name: 'home',
            component: Home,
            },
            {
                path: '/lien-he',
                name: 'contact',
                component: Contact
            },
            {
                path: '/dang-nhap',
                name: 'login',
                component: Login
            },
            {
                path: '/dang-ky',
                name: 'register',
                component: Register
            },
            {
                path: '/reset-mat-khau',
                name: 'resetpassword',
                component: Resetpassword
            },
            {
                path: '/xac-nhan-otp',
                name: 'verifyotp',
                component: Verifyotp
            },
            {
                path: '/quen-mat-khau',
                name: 'forgotpassword',
                component: Forgotpassword
            },
            {
                path: '/ho-so-ca-nhan',
                name: 'profile',
                component: Profile
            },
            {
                path: '/bac-si',
                name: 'doctorspage',
                component: Doctorspage
            },
            {
                path: '/dat-lich-hen',
                name: 'bookdoctors',
                component: Bookdoctors,
                meta: { requiresAuth: true },
            },
            {
                path:'/dich-vu',
                name:'service',
                component: Service
            },
            {
                path:'/lich-su-kham',
                name:'history',
                component: History,
                meta: { requiresAuth: true },
            },
            {
                path:'/quan-ly-dich-vu',
                name:'listservice',
                component: Listservice,
            },
            {
                path:'/quan-ly-nhan-vien',
                name:'dentistmanager',
                component: Dentistmanager,
            },
            {
                path:'/quan-ly-khach-hang',
                name:'customermanager',
                component: Customermanager,
            },
            {
                path:'/quan-ly-lich-hen',
                name:'appoimentmanager',
                component: Appoimentmanager,
            },
            {
                path:'/bao-cao',
                name:'fulldashboard',
                component: Fulldashboard,
            },
            {
                path:'/sap-xep-lich-lam',
                name:'schedule',
                component: Schedule,

            },
            {
                path:'/blogs',
                name:'blogs',   
                component: blogs,
            },
            {
                path:'/chi-tiet-bac-si/:id',
                name:'doctorprofile',
                component: Doctorprofile,
            },
            {
                path:'/chi-tiet-dich-vu/:id',
                name:'servicedetail',
                component: Servicedetail,
            },
            {
                path:'/lich-hen-bac-si',
                name:'dentistappoiment',    
                component: Dentistappoiment,
            },
            {
                path: '/t',
                name: 't',
                component: t
            },

        ]
    }
]
const router = createRouter({
    history: createWebHistory(),
    routes,
});


// // Kiểm tra token trước khi vào route
// router.beforeEach((to, from, next) => {
//     const token = localStorage.getItem("token");
  
//     if (to.meta.requiresAuth && !token) {
//       next("/login"); // Nếu chưa đăng nhập, quay về trang login
//     } else if (to.meta.guest && token) {
//       next("/home"); // Nếu đã đăng nhập, chặn vào login, chuyển hướng dashboard
//     } else {
//       next(); // Cho phép đi tiếp
//     }
// }),
router.beforeEach((to, from, next) => {
    const token = localStorage.getItem('token');
    if (to.matched.some(record => record.meta.requiresAuth) && !token) {
      alert('Bạn cần đăng nhập để truy cập trang này!');
      next({ name: 'login' });
    } else {
      next();
    }
  })

export default router;
