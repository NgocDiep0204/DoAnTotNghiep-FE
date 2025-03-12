import { createRouter, createWebHistory } from 'vue-router'
import MainLayout from '../views/layouts/mainlayout.vue'
import Home from '../views/home.vue'
const routes = [
    {
        path: '/',
        name: 'mainlayout',
        component: MainLayout,
        children: [ 
            {
            path: '/home',
            name: 'home',
            component: Home
            },
        ]
    }
]
const router = createRouter({
    history: createWebHistory(),
    routes,
});
export default router;
