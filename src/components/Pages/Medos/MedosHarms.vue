<template>
  <div></div>
</template>

<script>
  // import Axios from 'axios'
  // import Authentication from '@/components/pages/Authentication'

  // const GKP7API = `http://${window.location.hostname}:3001`

  export default {
    data () {
      return {
        //* Пользователь, который осуществил вход в систему, подгружается в mounted.
        currentUser: {},
        //* Все, что связано с snackbar, который всплывает во время ошибок.
        snackBar: {
          show: false,
          message: '',
          timeout: 5000,
          color: ''
        },
        //* Цвета для данной подсистемы.
        subSystem: {
          primaryColor: 'light-blue darken-2',
          secondaryColor: 'orange darken-3'
        }
      }
    },
    //* Подгружаем всякое перед инициализацией компонента.
    mounted () {},
    methods: {
      //* Обработчик ошибок.
      errorHandler (err) {
        const status = err.response.status
        this.snackBar.show = true
        this.snackBar.color = 'red lighten-1'
        if (status === 401) {
          this.snackBar.message = 'Вы не авторизованы.'
        }
        this.snackBar.message = err.response.data.message
      }
    }
  }
</script>

<style>
  .router-link-exact-active {
    background-color: #01579b;
    color: white;
    padding: 0 6px;
  }
</style>
