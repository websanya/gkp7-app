<template>
  <v-app>
    <app-header :subsystem="subSystemPrimaryColor" subtitle="Снимки">
    </app-header>
    <v-content>
      <v-container fluid fill-height>
        <v-layout
            justify-center
            align-center
        >
          <v-flex xs12 md10>
            <h2 class="text-xs-center">Введите имя пациента</h2>
            <v-container grid-list-md>
              <v-layout row wrap>
                <v-flex xs12 md4>
                  <v-text-field box :color="subSystemSecondaryColor" label="Фамилия" v-model="patientQuery.last_name">
                  </v-text-field>
                </v-flex>
                <v-flex xs12 md4>
                  <v-text-field box :color="subSystemSecondaryColor" label="Имя" v-model="patientQuery.first_name">
                  </v-text-field>
                </v-flex>
                <v-flex xs12 md4>
                  <v-text-field box :color="subSystemSecondaryColor" label="Отчество" v-model="patientQuery.middle_name">
                  </v-text-field>
                </v-flex>
                <v-flex xs12><v-btn large block :color="subSystemSecondaryColor" light>Найти</v-btn></v-flex>
              </v-layout>
            </v-container>
            <p>{{ patientQuery.first_name }} {{ patientQuery.last_name }} {{ patientQuery.middle_name }}</p>
          </v-flex>
        </v-layout>
      </v-container>
    </v-content>
    <app-footer :subsystem="subSystemPrimaryColor">
    </app-footer>

    <v-snackbar :timeout="snackTimeout"
                right="right"
                :color="snackColor"
                v-model="showSnackbar">
      {{ snackMessage }}
    </v-snackbar>
  </v-app>
</template>

<script>
  import Axios from 'axios'
  import Authentication from '@/components/pages/Authentication'

  const GKP7API = `http://${window.location.hostname}:3001`

  export default {
    data () {
      return {
        subSystemPrimaryColor: 'blue darken-4',
        subSystemSecondaryColor: 'yellow accent-4',
        snackMessage: '',
        snackTimeout: 10000,
        snackColor: '',
        showSnackbar: false,
        patientQuery: {
          first_name: '',
          last_name: '',
          middle_name: ''
        }
      }
    },
    methods: {
      getAllUsers () {
        Axios.get(`${GKP7API}/api/v1/user`, {
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
