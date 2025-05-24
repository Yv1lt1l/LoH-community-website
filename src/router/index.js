import { createRouter, createWebHistory } from 'vue-router'  // Vue 3 imports
import Home from '../components/views/home/home.vue'  // Correct path based on your structure
import Characters from '../components/views/characters/characters.vue'

const routes = [
    {
        path: '/',
        name: 'Home',
        component: Home
    },
    {
        path: '/characters',
        name: 'Characters',
        component: Characters
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

export default router