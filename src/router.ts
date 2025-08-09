import { createWebHistory, createRouter } from 'vue-router'
import { clearAllAuthenticationData, isAuthenticationValid, setAuthenticationData } from './utils/auth'

import SignIn from './pages/SignIn.vue'
import ForgotPassword from './pages/ForgotPassword.vue'
import ResetPassword from './pages/ResetPassword.vue'
import SignUp from './pages/SignUpRefactored.vue'
import Dashboard from './pages/Dashboard.vue'
import VerifyKyc from './pages/VerifyKyc.vue'
import Redirection from './pages/Redirection.vue'

const routes = [
    { path: '/', component: SignUp },
    { path: '/sign-in', component: SignIn },
    { path: '/sign-up', component: SignUp },
    { path: '/forgot-password', component: ForgotPassword },
    { path: '/reset-password', component: ResetPassword },
    { path: '/dashboard', component: Dashboard },
    { path: '/kyc', component: VerifyKyc },
    { path: '/redirection', component: Redirection },
]

const router = createRouter({
    history: createWebHistory(),
    routes,
})

// Add debugging
router.beforeEach((to, from, next) => {
    console.log('Router navigation:', { from: from.path, to: to.path })
    console.log('Route query params:', to.query)
    
    // Complete authentication cleanup function
    const clearAllAuthData = () => {
        console.log('🧹 Performing complete authentication cleanup');
        clearAllAuthenticationData();
    };
    
    // CRITICAL: If user is coming from ecom3-ui, ALWAYS clear all auth data
    // This handles both logout scenario and prevents any cached auth data
    if (to.query.from === 'ecom3-ui') {
        console.log('🚨 DETECTED USER FROM ECOM3-UI - FORCE CLEARING ALL AUTH DATA');
        console.log('Current localStorage api_key:', localStorage.getItem('api_key'));
        console.log('Current sessionStorage api_key:', sessionStorage.getItem('api_key'));
        
        clearAllAuthData();
        
        console.log('After clearing - localStorage api_key:', localStorage.getItem('api_key'));
        console.log('After clearing - sessionStorage api_key:', sessionStorage.getItem('api_key'));
        
        // If going to /kyc without proper auth tokens, redirect to signin
        if (to.path === '/kyc' && !to.query.token && !to.query.api_key && !to.query.user_info) {
            console.log('🔄 No auth tokens provided for /kyc, redirecting to signin');
            next('/sign-in?from=ecom3-ui&redirect=kyc');
            return;
        }
    }
    
    // Global authentication cleanup: Clear invalid stored data
    const storedApiKey = localStorage.getItem('api_key');
    const storedUserInfo = localStorage.getItem('user_info');
    
    if (storedApiKey && (storedApiKey === 'undefined' || storedApiKey === 'null' || storedApiKey.trim() === '')) {
        console.log('🧹 Clearing invalid api_key from localStorage');
        clearAllAuthData();
    }
    
    if (storedUserInfo && (storedUserInfo === 'undefined' || storedUserInfo === 'null' || storedUserInfo.trim() === '')) {
        console.log('🧹 Clearing invalid user_info from localStorage');
        clearAllAuthData();
    }
    
    // Protect /kyc route - ULTRA STRICT AUTHENTICATION REQUIRED
    if (to.path === '/kyc') {
        console.log('🔐 ULTRA STRICT: Protecting /kyc route - comprehensive authentication check...')
        
        const urlToken = to.query.token as string;
        const urlApiKey = to.query.api_key as string;
        const urlUserInfo = to.query.user_info as string;
        const source = to.query.source as string;
        
        console.log('URL Parameters:', {
            token: urlToken ? 'Present' : 'Missing',
            api_key: urlApiKey ? 'Present' : 'Missing', 
            user_info: urlUserInfo ? 'Present' : 'Missing',
            source: source || 'None'
        });

        // Get stored authentication data
        const storedApiKey = localStorage.getItem('api_key');
        const storedUserInfo = localStorage.getItem('user_info');
        
        console.log('Stored Authentication:', {
            api_key: storedApiKey ? `Present (${storedApiKey.substring(0, 10)}...)` : 'Missing',
            user_info: storedUserInfo ? 'Present' : 'Missing'
        });

        // BLOCK ACCESS IF COMING FROM ECOM3-UI WITHOUT PROPER AUTH TOKENS
        if (source === 'ecom3-ui' && (!urlToken && !urlApiKey)) {
            console.log('🚫 BLOCKED: Coming from ecom3-ui without auth tokens - likely logout scenario');
            clearAllAuthData();
            next('/sign-in?from=ecom3-ui&redirect=kyc');
            return;
        }

        // COMPREHENSIVE AUTHENTICATION CHECK
        let isAuthenticated = false;
        let finalApiKey = null;
        let finalUserInfo = null;

        // Check 1: URL parameters (from ecom3-ui redirect with auth)
        if ((urlToken || urlApiKey) && urlUserInfo && source === 'ecom3-ui') {
            console.log('✅ Authentication via URL parameters from ecom3-ui');
            finalApiKey = urlToken || urlApiKey;
            finalUserInfo = urlUserInfo;
            isAuthenticated = true;
            
            // Store the authentication data with timestamp
            setAuthenticationData(finalApiKey, finalUserInfo);
        }
        // Check 2: Valid stored authentication data (VERY STRICT)
        else if (storedApiKey && storedUserInfo) {
            console.log('🔍 Checking stored authentication data...')
            console.log('Stored API key length:', storedApiKey ? storedApiKey.length : 0)
            console.log('Stored user info present:', !!storedUserInfo)
            
            // Use comprehensive authentication validation
            const isValidAuth = isAuthenticationValid();
            
            if (isValidAuth) {
                console.log('✅ Authentication via COMPREHENSIVE validation')
                finalApiKey = storedApiKey;
                finalUserInfo = storedUserInfo;
                isAuthenticated = true;
            } else {
                console.log('❌ COMPREHENSIVE validation FAILED - clearing all data');
                clearAllAuthData();
            }
        }
        // Check 3: Recent login scenario (user just logged in and was redirected here)
        else {
            console.log('🔍 No URL params or stored data - checking for recent login...')
            
            // Check if user just completed login (within last 10 seconds)
            const authTimestamp = localStorage.getItem('auth_timestamp')
            const now = new Date().getTime()
            
            if (authTimestamp) {
                const timeDiff = now - parseInt(authTimestamp)
                console.log('Auth timestamp found, time difference:', timeDiff, 'ms')
                
                if (timeDiff < 10000) { // Within 10 seconds
                    console.log('✅ Recent login detected - allowing KYC access')
                    
                    // Try to get fresh auth data
                    const freshApiKey = localStorage.getItem('api_key')
                    const freshUserInfo = localStorage.getItem('user_info')
                    
                    if (freshApiKey && freshUserInfo && 
                        freshApiKey !== 'undefined' && freshUserInfo !== 'undefined' &&
                        freshApiKey.length > 20) {
                        console.log('✅ Fresh authentication data found after recent login')
                        finalApiKey = freshApiKey
                        finalUserInfo = freshUserInfo
                        isAuthenticated = true
                    }
                }
            }
        }

        // FINAL AUTHENTICATION DECISION - BLOCK IF NOT AUTHENTICATED
        if (!isAuthenticated) {
            console.log('❌ ULTRA STRICT AUTHENTICATION FAILED - BLOCKING ACCESS TO /kyc');
            
            // Clear all potentially invalid data
            clearAllAuthData();
            
            // Always redirect to signin when access is blocked
            console.log('🔄 FORCED REDIRECT to sign-in');
            next('/sign-in');
            return;
        }

        console.log('✅ ULTRA STRICT AUTHENTICATION SUCCESSFUL - Allowing access to /kyc');
        console.log('Final API Key length:', finalApiKey?.length || 0);
        console.log('Final User Info present:', !!finalUserInfo);
        
        // Clean up URL by removing sensitive parameters after successful authentication
        if (to.query.token || to.query.api_key || to.query.user_info) {
            console.log('🧹 Cleaning up URL - removing sensitive authentication parameters');
            
            // Create clean URL without sensitive parameters
            const cleanQuery = { ...to.query };
            delete cleanQuery.token;
            delete cleanQuery.api_key;
            delete cleanQuery.user_info;
            // Keep source parameter if present (for analytics/tracking)
            
            // Replace current URL with clean version
            next({
                path: '/kyc',
                query: cleanQuery,
                replace: true // This replaces the current history entry instead of adding a new one
            });
            return;
        }
        
        next();
        return;
    }
    
    next();
})

export default router