import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { UserRedirection } from '@/utils/redirection'
import LoginView from '@/views/LoginView.vue'
import ForgotPasswordView from '@/views/ForgotPasswordView.vue'
import ResetPasswordView from '@/views/ResetPasswordView.vue'
import MobileVerificationView from '@/views/signup/MobileVerificationView.vue'
import UserDetailsView from '@/views/signup/UserDetailsView.vue'
import SignupKYCView from '@/views/signup/SignupKYCView.vue'
import BannerDemo from '@/views/BannerDemo.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/login'
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView,
      meta: { requiresGuest: true }
    },
    // Banner demo route
    {
      path: '/banner-demo',
      name: 'banner-demo',
      component: BannerDemo
    },
    // New signup flow routes
    {
      path: '/signup',
      redirect: '/signup/mobile'
    },
    {
      path: '/signup/mobile',
      name: 'signup-mobile',
      component: MobileVerificationView,
      meta: { requiresGuest: true }
    },
    {
      path: '/signup/details',
      name: 'signup-details',
      component: UserDetailsView,
      meta: { requiresGuest: true, requiresMobileSession: true }
    },
    {
      path: '/signup/kyc',
      name: 'signup-kyc',
      component: SignupKYCView,
      meta: { requiresAuth: true }
    },
    {
      path: '/forgot-password',
      name: 'forgot-password',
      component: ForgotPasswordView,
      meta: { requiresGuest: true }
    },
    {
      path: '/reset-password',
      name: 'reset-password',
      component: ResetPasswordView,
      meta: { requiresGuest: true }
    }
  ]
})

// Navigation guards
let isRedirecting = false

router.beforeEach(async (to, from, next) => {
  // Prevent multiple rapid redirects
  if (isRedirecting) {
    next(false)
    return
  }

  try {
    const authStore = useAuthStore()
    
    // Check if user is authenticated
    if (!authStore.isAuthenticated) {
      await authStore.checkAuth()
    }
    
    // Route requires authentication
    if (to.meta.requiresAuth && !authStore.isAuthenticated) {
      isRedirecting = true
      next('/login')
      setTimeout(() => { isRedirecting = false }, 100)
      return
    }
    
    // Route requires guest (not authenticated)
    if (to.meta.requiresGuest && authStore.isAuthenticated) {
      // Check if user has completed onboarding
      if (authStore.user?.onboardingStatus === 'kyc_completed') {
        // Redirect to main app (external URL)
        isRedirecting = true
        UserRedirection.redirectToMainApp()
        return
      } else if (authStore.user?.onboardingStatus === 'details_completed') {
        // Redirect to KYC if not completed
        isRedirecting = true
        next('/signup/kyc')
        setTimeout(() => { isRedirecting = false }, 100)
        return
      } else {
        // Redirect to details step
        isRedirecting = true
        next('/signup/details')
        setTimeout(() => { isRedirecting = false }, 100)
        return
      }
    }
    
    // Special case: If user is authenticated and trying to access KYC page during signup
    if (to.meta.requiresAuth && authStore.isAuthenticated && to.path === '/signup/kyc') {
      // Check if user should be on KYC page based on onboarding status
      if (authStore.user?.onboardingStatus === 'kyc_completed') {
        // User has completed KYC, redirect to main app
        isRedirecting = true
        UserRedirection.redirectToMainApp()
        return
      } else if (authStore.user?.onboardingStatus === 'mobile_verified') {
        // User has only completed mobile verification, redirect to details step
        isRedirecting = true
        next('/signup/details')
        setTimeout(() => { isRedirecting = false }, 100)
        return
      }
      // If user has 'details_completed' status, allow access to KYC page
      next()
      return
    }
    
    // Route requires mobile session (for signup details)
    if (to.meta.requiresMobileSession && !authStore.isAuthenticated) {
      // Check if user has valid mobile session
      const { SessionManager } = await import('../utils/redirection')
      if (!SessionManager.isSessionValid()) {
        isRedirecting = true
        next('/signup/mobile')
        setTimeout(() => { isRedirecting = false }, 100)
        return
      }
    }
    
    // If user is authenticated and trying to access a route that requires mobile session,
    // redirect based on their onboarding status
    if (to.meta.requiresMobileSession && authStore.isAuthenticated) {
      if (authStore.user?.onboardingStatus === 'kyc_completed') {
        // User has completed KYC, redirect to main app
        isRedirecting = true
        UserRedirection.redirectToMainApp()
        return
      } else if (authStore.user?.onboardingStatus === 'details_completed') {
        // User has completed details, redirect to KYC
        isRedirecting = true
        next('/signup/kyc')
        setTimeout(() => { isRedirecting = false }, 100)
        return
      } else {
        // User has only mobile verification, allow access to details
        next()
        return
      }
    }
    
    next()
  } catch (error) {
    console.error('Router guard error:', error)
    // If there's an error in the router guard, redirect to login as a fallback
    isRedirecting = true
    next('/login')
    setTimeout(() => { isRedirecting = false }, 100)
  }
})

export default router 