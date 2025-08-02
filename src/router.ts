import { createWebHistory, createRouter } from 'vue-router'

import SignIn from './SignIn.vue'
import ForgotPassword from './ForgotPassword.vue'
import ResetPassword from './ResetPassword.vue'
import SignUp from './SignUp.vue'
import Dashboard from './Dashboard.vue'
import VerifyKyc from './VerifyKyc.vue'

const routes = [
    { path: '/', component: SignUp },
    { path: '/sign-in', component: SignIn },
    { path: '/sign-up', component: SignUp },
    { path: '/forgot-password', component: ForgotPassword },
    { path: '/reset-password', component: ResetPassword },
    { path: '/dashboard', component: Dashboard },
    { path: '/verify-kyc', component: VerifyKyc },
]

const router = createRouter({
    history: createWebHistory(),
    routes,
})

// Add debugging
router.beforeEach((to, from, next) => {
    console.log('Router navigation:', { from: from.path, to: to.path })
    next()
})

export default router