<template>
  <div>
    <app-header subsystem="indigo" subtitle="Домашняя">
    </app-header>
    <v-content>
      <v-container fluid fill-height>
        <v-layout
            justify-center
            align-center
        >
          <v-flex xs12 sm8>
            <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit. A aliquid aperiam aspernatur at distinctio, eos et, in, ipsam magni maiores nisi placeat provident qui ratione repudiandae rerum saepe similique soluta.</p>
            <p>A assumenda delectus harum laborum nesciunt optio quae, quas quasi quod voluptates. Deleniti eum odio
            reiciendis? Accusantium consequuntur debitis, deleniti, deserunt est incidunt inventore ipsa, laboriosam
            magnam minima sunt voluptatem!</p>
            <v-btn @click.native="getAllUsers">Найти пользователей</v-btn>
            <v-data-table
                v-if="showUsers"
                :headers="[{text:'_id'},{text:'username'},{text:'FIO'}]"
                :items="users"
                hide-actions
                class="elevation-10 mt-4"
            >
              <template slot="headers" slot-scope="props">
                <tr>
                  <th
                      v-for="header in props.headers"
                      :key="header._id"
                  >
                    {{ header.text }}
                  </th>
                </tr>
              </template>
              <template slot="items" slot-scope="props">
                <tr>
                  <td>{{ props.item._id }}</td>
                  <td class="text-xs-right">{{ props.item.username }}</td>
                  <td class="text-xs-right">{{ props.item.FIO }}</td>
                </tr>
              </template>
            </v-data-table>
          </v-flex>
        </v-layout>
      </v-container>
    </v-content>
    <app-footer subsystem="indigo">
    </app-footer>

    <v-snackbar :timeout="snackTimeout"
                right="right"
                :color="snackColor"
                v-model="showSnackbar">
      {{ snackMessage }}
    </v-snackbar>
  </div>
</template>

<script>
  import Axios from 'axios'
  import Authentication from '@/components/pages/Authentication'

  const GKP7API = `http://${window.location.hostname}:3001`

  export default {
    data () {
      return {
        message: 'Привет! Это мое первое сообщение.',
        snackMessage: '',
        snackTimeout: 10000,
        snackColor: '',
        showSnackbar: false,
        showUsers: false,
        drawer: false,
        users: []
      }
    },
    mounted () {
      console.log('mounted')
    },
    methods: {
      getAllUsers () {
        Axios.get(`${GKP7API}/api/v1/users`, {
          headers: {'Authorization': Authentication.getAuthenticationHeader(this)},
          params: {user_id: this.$cookie.get('user_id')}
        }).then(({data}) => {
          this.users = data
          this.showUsers = true
        }).catch(err => {
          this.errorHandler(err)
        })
      },
      errorHandler (err) {
        const status = err.response.status
        this.showSnackbar = true
        this.snackColor = 'red lighten-1'
        if (status === 401) {
          this.snackMessage = 'Вы не авторизованы.'
        }
        this.snackMessage = err.response.data.message
      }
    }
  }
</script>
