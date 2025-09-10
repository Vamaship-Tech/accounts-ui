import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { UserRedirection } from '@/utils/redirection'
import LoginView from '@/views/LoginView.vue'
import ChooseEntityView from '@/views/ChooseEntityView.vue'
import ForgotPasswordView from '@/views/ForgotPasswordView.vue'
import ResetPasswordView from '@/views/ResetPasswordView.vue'
import MobileVerificationView from '@/views/signup/MobileVerificationView.vue'
import UserDetailsView from '@/views/signup/UserDetailsView.vue'
import SignupKYCView from '@/views/signup/SignupKYCView.vue'
import BannerDemo from '@/views/BannerDemo.vue'
import MaintenanceView from '@/views/MaintenanceView.vue'
import NotFoundView from '@/views/NotFoundView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/login'
    },
    {
      path: '/sign-up',
      redirect: (to) => ({ path: '/signup/mobile', query: to.query })
    },
    {
      path: '/maintenance',
      name: 'maintenance',
      component: MaintenanceView
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView,
      meta: { requiresGuest: true },
      alias: '/sign-in'
    },
    {
      path: '/choose-entity',
      name: 'choose-entity',
      component: ChooseEntityView,
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
      redirect: (to) => ({ path: '/signup/mobile', query: to.query })
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
      meta: { requiresMobileSession: true }
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
    },
    // 404 catch-all (must be last)
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: NotFoundView
    }
  ]
})

// Navigation guards

router.beforeEach(async (to, from, next) => {
  try {
    // Global maintenance guard: if enabled, redirect to maintenance (except when already there)
    const maintenanceEnabled = (import.meta.env.VITE_MAINTENANCE_MODE || '').toString().toLowerCase() === 'true'
    if (maintenanceEnabled && to.path !== '/maintenance') {
      next('/maintenance')
      return
    }
    
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
        next({ path: '/signup/details', query: { social: '1' } })
        return
      }
    }
    
    // Special case: If user is authenticated and trying to access KYC page during signup
    if (to.meta.requiresAuth && authStore.isAuthenticated && to.path === '/signup/kyc') {
      // Check if user should be on KYC page based on onboarding status
      if (authStore.user?.onboardingStatus === 'kyc_completed') {
        // User has completed KYC, redirect to main app
        UserRedirection.redirectToMainApp()
        return
      } else if (authStore.user?.onboardingStatus === 'mobile_verified') {
        // User has only completed mobile verification, redirect to details step
        next({ path: '/signup/details', query: { social: '1' } })
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
        next('/signup/mobile')
        return
      }
    }
    
    // If user is authenticated and trying to access a route that requires mobile session,
    // redirect based on their onboarding status
    if (to.meta.requiresMobileSession && authStore.isAuthenticated) {
      if (authStore.user?.onboardingStatus === 'kyc_completed') {
        // User has completed KYC, redirect to main app
        UserRedirection.redirectToMainApp()
        return
      } else if (authStore.user?.onboardingStatus === 'details_completed') {
        // User has completed details, redirect to KYC
        next('/signup/kyc')
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
    next('/login')
  }
})

export default router 