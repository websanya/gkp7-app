import Vue from 'vue'
import Router from 'vue-router'
import * as Auth from '@/components/pages/Authentication'
// Pages
import Home from '@/components/pages/Home'
import Authentication from '@/components/pages/Authentication/Authentication'
import Vaccines from '@/components/pages/Vaccines/Vaccines'
import RGs from '@/components/pages/RGs/RGs'
import Lab from '@/components/pages/Lab/Lab'
import MedosReg from '@/components/pages/Medos/MedosReg'
import MedosDov from '@/components/pages/Medos/MedosDov'
import MedosCompanies from '@/components/pages/Medos/MedosCompanies'
import MedosHarms from '@/components/pages/Medos/MedosHarms'
// Global components
import Header from '@/components/header/Header'
import Footer from '@/components/footer/Footer'

// Register components
Vue.component('app-header', Header)
Vue.component('app-footer', Footer)

Vue.use(Router)

const router = new Router({
  routes: [
    {
      path: '/',
      name: 'Home',
      component: Home
    },
    {
      path: '/login',
      name: 'Auth2',
      component: Authentication
    },
    {
      path: '/medos/reg',
      name: 'MedosReg',
      component: MedosReg
    },
    {
      path: '/medos/dov',
      name: 'MedosDov',
      component: MedosDov
    },
    {
      path: '/medos/companies',
      name: 'MedosCompanies',
      component: MedosCompanies
    },
    {
      path: '/medos/harms',
      name: 'MedosHarms',
      component: MedosHarms
    },
    {
      path: '/vaccines',
      name: 'Vaccines',
      component: Vaccines
    },
    {
      path: '/rgs',
      name: 'RGs',
      component: RGs
    },
    {
      path: '/lab',
      name: 'Lab',
      component: Lab
    }
  ]
})

router.beforeEach((to, from, next) => {
  if (to.path !== '/login') {
    if (Auth.default.user.authenticated) {
      next()
    } else {
      router.push('/login')
    }
  } else {
    next()
  }
})

export default router
