import { createMemoryHistory, createRouter } from 'vue-router'

import SignIn from './SignIn.vue'
import ForgotPassword from './ForgotPassword.vue'
import SignUp from './SignUp.vue'
import Dashboard from './Dashboard.vue'

const routes = [
    { path: '/', component: SignUp },
    { path: '/sign-in', component: SignIn },
    { path: '/sign-up', component: SignUp },
    { path: '/forgot-password', component: ForgotPassword },
    { path: '/dashboard', component: Dashboard },
]

const router = createRouter({
    history: createMemoryHistory(),
    routes,
})

export default router