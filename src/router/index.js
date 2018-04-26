import Vue from 'vue'
import Router from 'vue-router'
import * as Auth from '@/components/pages/Authentication'
// Pages
import Authentication from '@/components/pages/Authentication/Authentication'
import MedosReception from '@/components/pages/Medos/MedosReception'
import MedosPremedical from '@/components/pages/Medos/MedosPremedical'
import MedosDoctor from '@/components/pages/Medos/MedosDoctor'
import MedosExam from '@/components/pages/Medos/MedosExam'
import Radiography from '@/components/pages/Radiography/Radiography'
import Laboratory from '@/components/pages/Laboratory/Laboratory'
import Vaccination from '@/components/pages/Vaccination/Vaccination'
import Users from '@/components/pages/Admin/Users'
import Companies from '@/components/pages/Admin/Companies'
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
      path: '/login',
      name: 'Auth2',
      component: Authentication
    },
    {
      path: '/medos/reception',
      name: 'MedosReception',
      component: MedosReception
    },
    {
      path: '/medos/premedical',
      name: 'MedosPremedical',
      component: MedosPremedical
    },
    {
      path: '/medos/doctor',
      name: 'MedosDoctor',
      component: MedosDoctor
    },
    {
      path: '/medos/exam',
      name: 'MedosExam',
      component: MedosExam
    },
    {
      path: '/radiography',
      name: 'Radiography',
      component: Radiography
    },
    {
      path: '/laboratory',
      name: 'Laboratory',
      component: Laboratory
    },
    {
      path: '/vaccines',
      name: 'Vaccination',
      component: Vaccination
    },
    {
      path: '/admin/users',
      name: 'Users',
      component: Users
    },
    {
      path: '/admin/companies',
      name: 'Companies',
      component: Companies
    }
  ]
})

router.beforeEach((to, from, next) => {
  let authenticated = Auth.default.user.authenticated
  let roles = Auth.default.user.roles
  if (to.path !== '/login') {
    if (authenticated) {
      next()
    } else {
      router.push('/login')
    }
    if (from.path === '/login') {
      if (roles.superuser) {
        router.push('/admin/users')
      } else if (roles.medos && (roles.medos.doctor !== 0 || roles.medos.admin)) {
        router.push('/medos/doctor')
      } else if (roles.medos && roles.medos.exam !== 0) {
        router.push('/medos/exam')
      } else if (roles.medos && roles.medos.receptionist) {
        router.push('/medos/reception')
      } else if (roles.medos && roles.medos.premedical) {
        router.push('/medos/premedical')
      } else if (roles.radiography && (roles.medos.radiography.admin || roles.medos.radiography.assistant)) {
        router.push('/radiography')
      } else if (roles.laboratory && (roles.medos.laboratory.admin || roles.medos.laboratory.assistant)) {
        router.push('/laboratory')
      } else if (roles.vaccination && (roles.medos.vaccination.admin || roles.medos.vaccination.assistant)) {
        router.push('/vaccination')
      } else {
        next()
      }
    }
  } else {
    next()
  }
})

export default router
