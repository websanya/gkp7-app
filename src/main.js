import Vue from 'vue'
import App from './App'
import router from './router'
import VueCookie from 'vue-cookie'
import Vuetify from 'vuetify'
import Authentication from '@/components/pages/Authentication'
import '../node_modules/vuetify/dist/vuetify.min.css'
import moment from 'moment'

Vue.use(VueCookie)
Vue.use(Vuetify)

Vue.filter('formatDate', function (value) {
  if (value) {
    return moment(String(value)).format('DD.MM.YYYY')
  }
})

Vue.config.productionTip = false

Authentication.checkAuthentication()

/* eslint-disable */
new Vue({
  el: '#app',
  router,
  render: h => h(App)
})
