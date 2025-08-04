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
    
    // Protect verify-kyc route
    if (to.path === '/verify-kyc') {
        console.log('=== VERIFY-KYC ROUTE PROTECTION ===')
        console.log('Full URL:', window.location.href)
        console.log('Query parameters:', to.query)
        
        // Check for authentication parameters in URL (from ecom3-ui)
        const urlApiKey = to.query.api_key;
        const urlUserInfo = to.query.user_info;
        const source = to.query.source;
        
        console.log('URL API Key found:', urlApiKey ? 'Yes' : 'No');
        console.log('URL User Info found:', urlUserInfo ? 'Yes' : 'No');
        console.log('Source:', source);
        
        // Check localStorage
        const storedApiKey = localStorage.getItem('api_key');
        const storedUserInfo = localStorage.getItem('user_info');
        console.log('Stored API Key found:', storedApiKey ? 'Yes' : 'No');
        console.log('Stored User Info found:', storedUserInfo ? 'Yes' : 'No');
        
        // If coming from ecom3-ui with authentication data, set it in localStorage
        if (source === 'ecom3-ui' && urlApiKey && urlUserInfo) {
            console.log('Setting authentication data from ecom3-ui');
            try {
                localStorage.setItem('api_key', urlApiKey as string);
                localStorage.setItem('user_info', urlUserInfo as string);
                console.log('Authentication data set successfully');
            } catch (error) {
                console.error('Error setting authentication data:', error);
            }
        }
        
        // Check if user is authenticated (either from localStorage or URL)
        const apiKey = localStorage.getItem('api_key') || urlApiKey;
        const userInfo = localStorage.getItem('user_info') || urlUserInfo;
        
        console.log('Final API Key found:', apiKey ? 'Yes' : 'No');
        console.log('Final User Info found:', userInfo ? 'Yes' : 'No');
        
        // STRICT AUTHENTICATION CHECK: Must have both API key and user info
        if (!apiKey || apiKey === 'undefined' || apiKey === 'null' || apiKey === '') {
            console.log('❌ No valid API key found, redirecting to sign-in');
            console.log('API Key value:', apiKey);
            next('/sign-in');
            return;
        }
        
        if (!userInfo) {
            console.log('❌ No user info found, redirecting to sign-in');
            next('/sign-in');
            return;
        }
        
        try {
            const parsedUserInfo = typeof userInfo === 'string' ? JSON.parse(userInfo) : userInfo;
            if (!parsedUserInfo || !parsedUserInfo.id) {
                console.log('❌ Invalid user info, redirecting to sign-in');
                console.log('Parsed user info:', parsedUserInfo);
                next('/sign-in');
                return;
            }
        } catch (error) {
            console.log('❌ Error parsing user info, redirecting to sign-in');
            console.log('Error:', error);
            next('/sign-in');
            return;
        }
        
        // ADDITIONAL CHECK: If not coming from ecom3-ui, must have valid localStorage data
        if (source !== 'ecom3-ui') {
            const storedApiKey = localStorage.getItem('api_key');
            const storedUserInfo = localStorage.getItem('user_info');
            
            if (!storedApiKey || !storedUserInfo) {
                console.log('❌ Not from ecom3-ui and no stored auth data, redirecting to sign-in');
                next('/sign-in');
                return;
            }
        }
        
        console.log('✅ Authentication check passed, allowing access to verify-kyc');
    }
    
    next();
})

export default router