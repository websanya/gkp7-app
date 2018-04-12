import Axios from 'axios'
import router from '@/router'

const GKP7API = `http://${window.location.hostname}:3001`

export default {
  user: {authenticated: false},

  authenticate (context, credentials, redirect) {
    Axios.post(`${GKP7API}/api/v1/auth`, credentials)
      .then(({data}) => {
        context.$cookie.set('token', data.token, '1D')
        context.$cookie.set('user_id', data.user._id, '1D')
        context.validLogin = true

        this.user.authenticated = true

        if (redirect) router.push(redirect)
      })
      .catch(({response: {data}}) => {
        context.snackbar = true
        context.message = data.message
      })
  },

  signup (context, credentials, redirect) {
    Axios.post(`${GKP7API}/api/v1/signup`, credentials)
      .then(({data}) => {
        context.validSignUp = true

        this.authenticate(context, credentials, redirect)
      })
      .catch(({response: {data}}) => {
        context.snackbar = true
        context.message = data.message
      })
  },

  signout (context, redirect) {
    context.$cookie.delete('token')
    context.$cookie.delete('user_id')
    this.user.authenticated = false

    if (redirect) router.push(redirect)
  },

  checkAuthentication () {
    const token = this.getCookie('token')
    this.user.authenticated = !!token
  },

  getAuthenticationHeader (context) {
    return `Bearer ${context.$cookie.get('token')}`
  },

  getCookie (name) {
    let matches = document.cookie.match(new RegExp(
      `(?:^|; )${name.replace(/([.$?*|{}()[\]\\+^])/g, '\\$1')}=([^;]*)`
    ))
    return matches ? decodeURIComponent(matches[1]) : undefined
  }
}
