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
              <v-flex xs12>
                <v-btn
                  block
                  :color="subSystem.secondaryColor"
                  class="white--text"
                  @click.native="openDayListDialog"
                >Список за день
                </v-btn>
              </v-flex>
            </v-layout>
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

    <!-- Диалог списка прошедших за день -->
    <v-dialog v-model="dayListDialog.show" persistent lazy max-width="1000px">
      <v-card>
        <v-card-title>
          <span class="headline">
            Список прошедших медосмотр за {{ dayListDialog.date }}
          </span>
        </v-card-title>
        <v-card-text>
          <v-container grid-list-md>
            <v-layout row wrap>
              <v-flex sm12 md3>
                <v-text-field
                  mask="##.##.####"
                  return-masked-value
                  label="День прохождения"
                  :color="subSystem.primaryColor"
                  v-model="dayListDialog.date"
                >
                </v-text-field>
              </v-flex>
              <v-flex sm12 ref="print">
                <v-data-table
                  v-if="reportPatients.length > 0"
                  :headers="[
                  { text: 'ФИО', sortable: false },
                  { text: 'Дата рождения', sortable: false },
                  { text: 'Пол', sortable: false },
                  { text: 'Тип осмотра', sortable: false },
                  { text: 'Цех', sortable: false },
                  { text: 'Табельный', sortable: false },
                  { text: 'Заключение', sortable: false }
                ]"
                  :items="reportPatients"
                  hide-actions
                  class="elevation-5 mt-4"
                >
                  <template slot="items" slot-scope="props">
                    <tr>
                      <td>{{ props.item.fio }}</td>
                      <td>{{ props.item.dateBirth | formatDate }}</td>
                      <td>{{ (props.item.sex) ? 'Муж' : 'Жен' }}</td>
                      <td v-if="props.item.medosArchive">{{ props.item.medosArchive.find(medos =>
                        dateFromIso(medos.medosRegistrationDate) === dayListDialog.date).medosType }}
                      </td>
                      <td v-if="props.item.medosArchive">{{ props.item.medosArchive.find(medos =>
                        dateFromIso(medos.medosRegistrationDate) === dayListDialog.date).medosJob.jobDivision }}
                      </td>
                      <td v-if="props.item.medosArchive">{{ props.item.medosArchive.find(medos =>
                        dateFromIso(medos.medosRegistrationDate) === dayListDialog.date).medosJob.jobPersonnelNumber }}
                      </td>
                      <td v-if="props.item.medosArchive">{{ props.item.medosArchive.find(medos =>
                        dateFromIso(medos.medosRegistrationDate) === dayListDialog.date).medosDoctorResults.find(result => result.doctorId === 1).doctorConclusion.toString() }}
                      </td>
                    </tr>
                  </template>
                </v-data-table>
              </v-flex>
            </v-layout>
          </v-container>
        </v-card-text>
        <v-card-actions>
          <v-spacer>
          </v-spacer>
          <v-btn :color="subSystem.primaryColor" flat @click.native="noDayListDialog">Закрыть</v-btn>
          <v-btn :color="subSystem.secondaryColor" class="white--text" @click.native="printDayListDialog">Печать</v-btn>
          <v-btn :color="subSystem.primaryColor" class="white--text" @click.native="yesDayListDialog">Посмотреть</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <!-- / Диалог удаления вредности -->

  </div>
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
        //* Массив, в который падают подгруженные пациенты.
        reportPatients: [],
        //* Все, что связано с snackBar, который всплывает во время ошибок.
        dayListDialog: {
          show: false,
          date: ''
        },
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
      //* Методы, связанные с окном прошедших за день.
      openDayListDialog () {
        this.dayListDialog.show = true
      },
      noDayListDialog () {
        this.dayListDialog.show = false
      },
      printDayListDialog () {
        let content = this.$refs.print.innerHTML
        let myWindow = window.open('', 'Print', 'height=600,width=800')

        myWindow.document.write('<html><head><title>Print</title>')
        myWindow.document.write('</head><body >')
        myWindow.document.write(content)
        myWindow.document.write('</body></html>')

        myWindow.document.close()
        myWindow.focus()
        myWindow.print()
        myWindow.close()
        return true
      },
      yesDayListDialog () {
        Axios.post(`${GKP7API}/api/v1/report/day/`, {
          reportDate: this.dayListDialog.date
        }, {
          headers: {'Authorization': Authentication.getAuthenticationHeader(this)},
          params: {user_id: this.$cookie.get('user_id')}
        }).then(({data}) => {
          if (data.success) {
            this.reportPatients = data.patients
            this.snackBar.color = 'green darken-1 white--text'
            this.snackBar.timeout = 2000
          } else {
            this.snackBar.color = 'red darken-2 white--text'
            this.snackBar.timeout = 5000
          }
          this.snackBar.message = data.message
          this.snackBar.show = true
        }).catch(err => {
          this.errorHandler(err)
        })
      },
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
      //* Перевод даты из ISO формата.
      dateFromIso (inputDate) {
        const date = new Date(inputDate)
        let year = date.getFullYear()
        let month = date.getMonth() + 1
        let dt = date.getDate()

        if (dt < 10) {
          dt = '0' + dt
        }
        if (month < 10) {
          month = '0' + month
        }

        return dt + '.' + month + '.' + year
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

<style lang="scss">
  .router-link-exact-active {
    background-color: #004d40;
    color: white;
    padding: 0 6px;
  }
</style>
