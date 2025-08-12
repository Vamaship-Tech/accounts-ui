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
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()
  
  // Check if user is authenticated
  if (!authStore.isAuthenticated) {
    await authStore.checkAuth()
  }
  
  // Route requires authentication
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next('/login')
    return
  }
  
  // Route requires guest (not authenticated)
  if (to.meta.requiresGuest && authStore.isAuthenticated) {
    // Check if user has completed onboarding
    if (authStore.user?.onboardingStatus === 'kyc_completed') {
      // Redirect to main app (external URL)
      UserRedirection.redirectToMainApp()
      return
    } else if (authStore.user?.onboardingStatus === 'details_completed') {
      // Redirect to KYC if not completed
      next('/signup/kyc')
      return
    } else {
      // Redirect to details step
      next('/signup/details')
      return
    }
  }
  
  // Route requires mobile session (for signup details)
  if (to.meta.requiresMobileSession && !authStore.isAuthenticated) {
    // Check if user has valid mobile session
    const { SessionManager } = await import('../utils/redirection')
    if (!SessionManager.isSessionValid()) {
      next('/signup/mobile')
      return
    }
  }
  
  next()
})

export default router 