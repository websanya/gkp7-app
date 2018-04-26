<template>
  <div class=uwd-container>
    <app-header :subsystem="subSystem.primaryColor" subtitle="Редактор пользователей" :currentUser="currentUser">
    </app-header>
    <v-content>
      <v-container fluid fill-height>
        <v-layout
            justify-center
            align-center
        >
          <v-container grid-list-md>
            <v-layout row wrap>
              <v-flex xs12 sm6>
                <v-btn
                    block
                    :color="subSystem.secondaryColor"
                    class="white--text"
                    @click.native="getAllUsers"
                >Найти пользователей
                </v-btn>
              </v-flex>
              <v-flex xs12 sm6>
                <v-btn
                    block
                    :color="subSystem.secondaryColor"
                    class="white--text"
                    @click.native="true"
                >Создать пользователя
                </v-btn>
              </v-flex>
            </v-layout>
            <v-data-table
                v-if="showUsers"
                :headers="[{text:'Имя пользователя', value: 'username'},{text:'ФИО', value: 'fio'},{text: 'Права', value:'roles'}]"
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
                  <td>{{ props.item.username }}</td>
                  <td>{{ props.item.fio }}</td>
                  <td width="200px">
                    <v-icon
                        v-if="props.item.roles.superuser"
                        color="purple darken-4"
                    >face
                    </v-icon>
                    <v-icon
                        v-if="props.item.roles.medos.admin"
                        color="green darken-4"
                    >local_hospital
                    </v-icon>
                    <v-icon
                        v-if="props.item.roles.radiography.admin"
                        color="green darken-4"
                    >local_movies
                    </v-icon>
                    <v-icon
                        v-if="props.item.roles.laboratory.admin"
                        color="green darken-4"
                    >colorize
                    </v-icon>
                    <v-icon
                        v-if="props.item.roles.vaccination.admin"
                        color="green darken-4"
                    >local_drink
                    </v-icon>
                  </td>
                </tr>
              </template>
            </v-data-table>
          </v-container>
        </v-layout>
      </v-container>
    </v-content>
    <app-footer :subsystem="subSystem.primaryColor" :currentUser="currentUser">
    </app-footer>

    <v-snackbar :timeout="snackBar.timeout"
                right="right"
                :color="snackBar.color"
                v-model="snackBar.show">
      {{ snackBar.message }}
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
        showUsers: false,
        drawer: false,
        users: [],
        //* Пользователь, который осуществил вход в систему, подгружается в mounted.
        currentUser: {},
        //* Все, что связано с snackbar, который всплывает во время ошибок.
        snackBar: {
          show: false,
          message: '',
          timeout: 10000,
          color: ''
        },
        //* Цвета для данной подсистемы.
        subSystem: {
          primaryColor: 'teal darken-4',
          secondaryColor: 'lime darken-4',
          doctorName: ''
        }
      }
    },
    mounted () {
      //* Подгружаем пользователя, который осуществил вход.
      this.getCurrentUser()
    },
    methods: {
      //* Запрашиваем пользователя, который осуществил вход.
      getCurrentUser () {
        Axios.get(`${GKP7API}/api/v1/user`, {
          headers: {'Authorization': Authentication.getAuthenticationHeader(this)},
          params: {user_id: this.$cookie.get('user_id')}
        }).then(({data}) => {
          this.currentUser = data
        }).catch(err => {
          this.errorHandler(err)
        })
      },
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
