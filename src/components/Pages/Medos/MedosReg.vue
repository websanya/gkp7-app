<template>
  <v-app>
    <app-header :subsystem="subSystem.primaryColor" subtitle="Регистратура профосмотра">
    </app-header>
    <v-content>
      <v-container fluid fill-height>
        <v-layout
            justify-center
            align-center
        >
          <v-flex xs12 md10>
            <h2 class="text-xs-center">Поиск пациентов</h2>
            <v-container grid-list-md>
              <v-layout row wrap>
                <v-flex xs12 md4>
                  <v-text-field @keyup.enter="getPatients" :color="subSystem.secondaryColor" label="Фамилия"
                                v-model="patientQuery.last_name" box>
                  </v-text-field>
                </v-flex>
                <v-flex xs12 md4>
                  <v-text-field @keyup.enter="getPatients" :color="subSystem.secondaryColor" label="Имя"
                                v-model="patientQuery.first_name" box>
                  </v-text-field>
                </v-flex>
                <v-flex xs12 md4>
                  <v-text-field @keyup.enter="getPatients" :color="subSystem.secondaryColor" label="Отчество"
                                v-model="patientQuery.middle_name" box>
                  </v-text-field>
                </v-flex>
                <v-flex xs12 md6>
                  <v-btn @click.native="openAddPatientDialog" :color="subSystem.primaryColor" flat dark large block>Добавить
                    пациента
                  </v-btn>
                </v-flex>
                <v-flex xs12 md6>
                  <v-btn @click.native="getPatients" :color="subSystem.primaryColor" dark large block>Найти</v-btn>
                </v-flex>
              </v-layout>
              <v-data-table
                  hide-headers
                  v-if="patients.length > 0"
                  :items="patients"
                  hide-actions
                  class="elevation-10 mt-4"
              >
                <template slot="items" slot-scope="props">
                  <tr>
                    <td>{{ props.item.fio }}</td>
                    <td>{{ props.item.birthDate | formatDate }}</td>
                    <td>{{ (props.item.sex) ? 'Муж' : 'Жен' }}</td>
                    <td width="100px">
                      <v-btn @click.native="openEditPatientDialog(props.item)" :color="subSystem.primaryColor" icon>
                        <v-icon color="white">edit</v-icon>
                      </v-btn>
                    </td>
                  </tr>
                </template>
              </v-data-table>
            </v-container>
          </v-flex>
        </v-layout>
      </v-container>
    </v-content>
    <app-footer :subsystem="subSystem.primaryColor" :currentUser="currentUser.fio">
    </app-footer>

    <v-snackbar :timeout="snackBar.timeout"
                right="right"
                :color="snackBar.color"
                v-model="snackBar.show">
      {{ snackBar.message }}
    </v-snackbar>

    <v-dialog v-model="addPatientDialog.show" persistent max-width="800px">
      <v-card>
        <v-card-title>
          <span class="headline">Добавить нового пациента</span>
        </v-card-title>
        <v-card-text>
          <v-container grid-list-md>
            <v-layout row wrap>
              <v-flex sm12 md4>
                <v-select
                    label="Прививка"
                    autocomplete
                    :color="subSystem.primaryColor"
                >
                </v-select>
              </v-flex>
              <v-flex sm12 md4>
                <v-select
                    label="Препарат"
                    autocomplete
                    :color="subSystem.primaryColor"
                >
                </v-select>
              </v-flex>
              <v-flex sm12 md2>
                <v-select
                    label="Серия"
                    autocomplete
                    :color="subSystem.primaryColor"
                >
                </v-select>
              </v-flex>
              <v-flex sm12 md2>
                <v-text-field
                    label="Срок"
                    :color="subSystem.primaryColor"
                    disabled
                >
                </v-text-field>
              </v-flex>
            </v-layout>
          </v-container>
        </v-card-text>
        <v-card-actions>
          <v-spacer>
          </v-spacer>
          <v-btn :color="subSystem.secondaryColor" flat @click.native="closeAddPatientDialog">Закрыть</v-btn>
          <v-btn :color="subSystem.primaryColor" class="white--text" @click.native="saveAddPatientDialog">Сохранить</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-app>
</template>

<script>
  import Axios from 'axios'
  import Authentication from '@/components/pages/Authentication'

  const GKP7API = `http://${window.location.hostname}:3001`

  export default {
    data () {
      return {
        //* Пользователь, который осуществил вход в систему, подгружается в mounted.
        currentUser: {},
        //* Пациент, которого мы редактируем.
        currentPatient: {},
        //* Пациент, которого мы добавляем.
        newPatient: {},
        //* Запрос на пациентам по ФИО, подгружается в начальном окне.
        patientQuery: {
          first_name: '',
          last_name: '',
          middle_name: ''
        },
        patients: [],
        //* Все, что связано с диалогом добавления пользователя.
        addPatientDialog: {
          show: false
        },
        //* Все, что связано с диалогом редактирования пользователя.
        editPatientDialog: {
          show: false
        },
        //* Все, что связано с snackbar, который всплывает во время ошибок.
        snackBar: {
          show: false,
          message: '',
          timeout: 10000,
          color: ''
        },
        //* Цвета для данной подсистемы.
        subSystem: {
          primaryColor: 'light-blue darken-4',
          secondaryColor: 'yellow darken-4'
        }
      }
    },
    //* Подгружаем объект залогиненного пользователя для последующего использования.
    mounted () {
      Axios.get(`${GKP7API}/api/v1/user`, {
        headers: {'Authorization': Authentication.getAuthenticationHeader(this)},
        params: {user_id: this.$cookie.get('user_id')}
      }).then(({data}) => {
        this.currentUser = data
      }).catch(err => {
        this.errorHandler(err)
      })
    },
    methods: {
      //* Запрашиваем список пациентов по введенным ФИО.
      getPatients () {
        Axios.post(`${GKP7API}/api/v1/patient`, {
          'last_name': this.patientQuery.last_name,
          'first_name': this.patientQuery.first_name,
          'middle_name': this.patientQuery.middle_name
        }, {
          headers: {'Authorization': Authentication.getAuthenticationHeader(this)}
        }).then(res => {
          if (res.data.success) {
            this.snackBar.show = false
            this.patients = res.data.patients
          } else {
            this.patients = []
            this.snackBar.show = true
            this.snackBar.color = 'yellow accent-3 black--text'
            this.snackBar.message = res.data.message
          }
        }).catch(err => {
          this.errorHandler(err)
        })
      },
      openAddPatientDialog () {
        this.addPatientDialog.show = true
      },
      saveAddPatientDialog () {
        console.log('save add patient dialog')
        this.addPatientDialog.show = false
      },
      closeAddPatientDialog () {
        this.addPatientDialog.show = false
      },
      openEditPatientDialog () {
        console.log('open edit patient dialog')
      },
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
