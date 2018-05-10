<template>
  <div class="uwd-container">
    <app-header :subsystem="subSystem.primaryColor" :subtitle="`Рабочее место ${currentUserExam.name}`"
                :currentUser="currentUser">
    </app-header>
    <v-content>
      <v-container fluid fill-height>
        <v-layout
          justify-center
          align-center
        >
          <v-flex xs12>
            <h2 class="text-xs-center">Пациенты на мед. осмотре</h2>
            <v-container grid-list-md>
              <v-layout row wrap>
                <v-flex xs12 md4>
                  <v-text-field @keyup.enter="getMedosPatients" :color="subSystem.primaryColor" label="Фамилия"
                                v-model="patientQuery.lastName" box>
                  </v-text-field>
                </v-flex>
                <v-flex xs12 md4>
                  <v-text-field @keyup.enter="getMedosPatients" :color="subSystem.primaryColor" label="Имя"
                                v-model="patientQuery.firstName" box>
                  </v-text-field>
                </v-flex>
                <v-flex xs12 md4>
                  <v-text-field @keyup.enter="getMedosPatients" :color="subSystem.primaryColor" label="Отчество"
                                v-model="patientQuery.middleName" box>
                  </v-text-field>
                </v-flex>
                <v-flex xs12 md12>
                  <v-btn @click.native="getMedosPatients" :color="subSystem.primaryColor" dark large block>Найти</v-btn>
                </v-flex>
              </v-layout>
              <v-data-table
                :headers="[
                    {text:'ФИО', sortable: false},
                    {text:'Осмотр', sortable: false},
                    {text: 'Дата рождения', sortable: false},
                    {text: 'Пол', sortable: false},
                    {text: 'Действия', sortable: false}
                  ]"
                v-if="patients.length > 0"
                :items="patients"
                hide-actions
                class="elevation-10 mt-4"
              >
                <template slot="items" slot-scope="props">
                  <tr>
                    <td>{{ props.item.fio }}</td>
                    <td>{{ props.item.activeMedos.medosType.typeId }}</td>
                    <td>{{ props.item.dateBirth }}</td>
                    <td>{{ (props.item.sex) ? 'Муж' : 'Жен' }}</td>
                    <td width="211px">
                      <v-tooltip v-if="checkPatientEcg()" top color="red darken-4">
                        <v-btn
                          slot="activator"
                          @click.native="openExaminationDialog({patient: props.item, exam: 46})"
                          color="red darken-4"
                          icon
                        >
                          <v-icon color="white">assignment_turned_in</v-icon>
                        </v-btn>
                        <span>Добавить ЭКГ</span>
                      </v-tooltip>
                      <v-tooltip v-if="checkPatientSpirometry(props.item)" top color="light-blue darken-4">
                        <v-btn
                          slot="activator"
                          @click.native="openExaminationDialog({patient: props.item, exam: 1})"
                          color="light-blue darken-4"
                          icon
                        >
                          <v-icon color="white">assignment_turned_in</v-icon>
                        </v-btn>
                        <span>Добавить спирометрию</span>
                      </v-tooltip>
                      <v-tooltip v-if="checkPatientAudiometry(props.item)" top color="pink darken-4">
                        <v-btn
                          slot="activator"
                          @click.native="openExaminationDialog({patient: props.item, exam: 34})"
                          color="pink darken-4"
                          icon
                        >
                          <v-icon color="white">assignment_turned_in</v-icon>
                        </v-btn>
                        <span>Добавить аудиометрию</span>
                      </v-tooltip>
                    </td>
                  </tr>
                </template>
              </v-data-table>
            </v-container>
          </v-flex>
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

    <!-- Диалог на обследование -->
    <v-dialog v-model="examResultDialog.show" persistent max-width="700px">
      <v-card>
        <v-card-title>
          <span class="headline">Обследование для пациента<br/><span
            class="green--text text--darken-2">{{ currentEditPatient.fio }}</span>
          </span>
        </v-card-title>
        <v-card-text>
          <v-container grid-list-md>
            <v-layout v-if="examResultDialog.exam === 46 || examResultDialog.exam === 1" row wrap>
              <v-flex v-if="examResultDialog.exam === 46" sm12>
                <h2>ЭКГ</h2>
              </v-flex>
              <v-flex v-if="examResultDialog.exam === 46" sm12>
                <v-checkbox
                  label="Пациент прошел ЭКГ"
                  v-model="currentExamResult.examResult"
                ></v-checkbox>
              </v-flex>
              <v-flex v-if="examResultDialog.exam === 1" sm12>
                <h2>Спирометрия</h2>
              </v-flex>
              <v-flex v-if="examResultDialog.exam === 1" sm12>
                <v-checkbox
                  label="Пациент прошел спирометрию"
                  v-model="currentExamResult.examResult"
                ></v-checkbox>
              </v-flex>
            </v-layout>
            <v-layout v-if="examResultDialog.exam === 34 && currentExamResult.examResult" row wrap>
              <v-flex sm12>
                <h2>Аудиометрия</h2>
              </v-flex>
              <v-flex sm12 md1>
                <h3 style="margin: 22px 0 6px">AD</h3>
              </v-flex>
              <v-flex sm12 md1>
                <v-text-field
                  label="125"
                  :color="subSystem.primaryColor"
                  v-model="currentExamResult.examResult.ad.f125"
                >
                </v-text-field>
              </v-flex>
              <v-flex sm12 md1>
                <v-text-field
                  label="250"
                  :color="subSystem.primaryColor"
                  v-model="currentExamResult.examResult.ad.f250"
                >
                </v-text-field>
              </v-flex>
              <v-flex sm12 md1>
                <v-text-field
                  label="500"
                  :color="subSystem.primaryColor"
                  v-model="currentExamResult.examResult.ad.f500"
                >
                </v-text-field>
              </v-flex>
              <v-flex sm12 md2>
                <v-text-field
                  label="1000"
                  :color="subSystem.primaryColor"
                  v-model="currentExamResult.examResult.ad.f1000"
                >
                </v-text-field>
              </v-flex>
              <v-flex sm12 md2>
                <v-text-field
                  label="2000"
                  :color="subSystem.primaryColor"
                  v-model="currentExamResult.examResult.ad.f2000"
                >
                </v-text-field>
              </v-flex>
              <v-flex sm12 md2>
                <v-text-field
                  label="4000"
                  :color="subSystem.primaryColor"
                  v-model="currentExamResult.examResult.ad.f4000"
                >
                </v-text-field>
              </v-flex>
              <v-flex sm12 md2>
                <v-text-field
                  label="6000"
                  :color="subSystem.primaryColor"
                  v-model="currentExamResult.examResult.ad.f6000"
                >
                </v-text-field>
              </v-flex>
            </v-layout>
            <v-layout v-if="examResultDialog.exam === 34 && currentExamResult.examResult" row wrap>
              <v-flex sm12 md1>
                <h3 style="margin: 22px 0 6px">AS</h3>
              </v-flex>
              <v-flex sm12 md1>
                <v-text-field
                  label="125"
                  :color="subSystem.primaryColor"
                  v-model="currentExamResult.examResult.as.f125"
                >
                </v-text-field>
              </v-flex>
              <v-flex sm12 md1>
                <v-text-field
                  label="250"
                  :color="subSystem.primaryColor"
                  v-model="currentExamResult.examResult.as.f250"
                >
                </v-text-field>
              </v-flex>
              <v-flex sm12 md1>
                <v-text-field
                  label="500"
                  :color="subSystem.primaryColor"
                  v-model="currentExamResult.examResult.as.f500"
                >
                </v-text-field>
              </v-flex>
              <v-flex sm12 md2>
                <v-text-field
                  label="1000"
                  :color="subSystem.primaryColor"
                  v-model="currentExamResult.examResult.as.f1000"
                >
                </v-text-field>
              </v-flex>
              <v-flex sm12 md2>
                <v-text-field
                  label="2000"
                  :color="subSystem.primaryColor"
                  v-model="currentExamResult.examResult.as.f2000"
                >
                </v-text-field>
              </v-flex>
              <v-flex sm12 md2>
                <v-text-field
                  label="4000"
                  :color="subSystem.primaryColor"
                  v-model="currentExamResult.examResult.as.f4000"
                >
                </v-text-field>
              </v-flex>
              <v-flex sm12 md2>
                <v-text-field
                  label="6000"
                  :color="subSystem.primaryColor"
                  v-model="currentExamResult.examResult.as.f6000"
                >
                </v-text-field>
              </v-flex>
            </v-layout>
          </v-container>
        </v-card-text>
        <v-card-actions>
          <v-spacer>
          </v-spacer>
          <v-btn :color="subSystem.primaryColor" flat @click.native="noExaminationDialog()">Закрыть</v-btn>
          <v-btn :color="subSystem.primaryColor" class="white--text" @click.native="yesExaminationDialog()">Сохранить
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <!-- / Диалог на обследование -->

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
        currentUser: {
          username: '',
          password: '',
          fio: '',
          roles: {
            superuser: false,
            medos: {
              receptionist: false,
              premedical: false,
              functionalDiagnostics: false,
              doctor: false,
              admin: false
            },
            radiography: {
              assistant: false,
              admin: false
            },
            laboratory: {
              assistant: false,
              admin: false
            },
            vaccination: {
              assistant: false,
              admin: false
            }
          }
        },
        //* Запрос на пациентам по ФИО, подгружается в начальном окне.
        patientQuery: {},
        //* Подгруженные пациенты после запроса по ФИО.
        patients: [],
        //* Если обследование, то данные.
        currentUserExam: {
          id: '',
          name: ''
        },
        //* Пациент, которого редактируем.
        currentEditPatient: {
          activeMedos: {}
        },
        //* Обследование, которое редактируем.
        currentExamResult: {},
        //* Диалог приема врача.
        examResultDialog: {
          show: false,
          edit: false,
          exam: ''
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
          primaryColor: 'deep-purple darken-4',
          secondaryColor: 'deep-orange darken-4'
        }
      }
    },
    //* Подгружаем объект залогиненного пользователя для последующего использования.
    mounted () {
      //* Подгружаем пользователя, который осуществил вход.
      this.getCurrentUser()
    },
    methods: {
      //* Методы про диалог приема врача.
      openExaminationDialog (item) {
        this.currentEditPatient = item.patient
        this.examResultDialog.exam = item.exam
        this.examResultDialog.show = true
        //* Подготовим объект для аудиометрии.
        if (this.examResultDialog.exam === 34) {
          this.currentExamResult = {
            examId: 34,
            examResult: {
              ad: {
                f125: '10',
                f250: '10',
                f500: '10',
                f1000: '10',
                f2000: '10',
                f4000: '10',
                f6000: '10'
              },
              as: {
                f125: '10',
                f250: '10',
                f500: '10',
                f1000: '10',
                f2000: '10',
                f4000: '10',
                f6000: '10'
              }
            }
          }
        } else {
          this.currentExamResult = {
            examId: this.examResultDialog.exam,
            examResult: false
          }
        }
        //* Проверяем есть ли уже такое обследование, тогда редактируем.
        let hasExamResult = this.currentEditPatient.activeMedos.medosExamResults.some(
          result => result.examId === this.examResultDialog.exam
        )
        if (hasExamResult) {
          this.examResultDialog.edit = true
          this.currentExamResult = this.currentEditPatient.activeMedos.medosExamResults.find(
            result => result.examId === this.examResultDialog.exam
          )
        }
      },
      noExaminationDialog () {
        this.examResultDialog = {
          show: false,
          edit: false,
          exam: ''
        }
      },
      yesExaminationDialog () {
        let tmpExamResult = this.currentExamResult
        if (this.examResultDialog.edit) {
          Axios.put(`${GKP7API}/api/v1/patient/${this.currentEditPatient._id}/examResult/${tmpExamResult._id}`, {
            examResult: tmpExamResult
          }, {
            headers: {'Authorization': Authentication.getAuthenticationHeader(this)}
          }).then(res => {
            if (res.data.success) {
              this.snackBar.color = 'green darken-1 white--text'
              this.snackBar.timeout = 2000
              this.getMedosPatients()
              this.examResultDialog = {
                show: false,
                edit: false,
                exam: ''
              }
              this.currentEditPatient = {
                activeMedos: {}
              }
            } else {
              this.snackBar.color = 'red darken-2 white--text'
              this.snackBar.timeout = 5000
            }
          }).catch(err => {
            this.errorHandler(err)
          })
        } else {
          Axios.post(`${GKP7API}/api/v1/patient/${this.currentEditPatient._id}/examResult/`, {
            examResult: tmpExamResult
          }, {
            headers: {'Authorization': Authentication.getAuthenticationHeader(this)}
          }).then(res => {
            if (res.data.success) {
              this.snackBar.color = 'green darken-1 white--text'
              this.snackBar.timeout = 2000
              this.getMedosPatients()
              this.examResultDialog = {
                show: false,
                edit: false,
                exam: ''
              }
              this.currentEditPatient = {
                activeMedos: {}
              }
            } else {
              this.snackBar.color = 'red darken-2 white--text'
              this.snackBar.timeout = 5000
            }
          }).catch(err => {
            this.errorHandler(err)
          })
        }
      },
      //* Запрашиваем список пациентов по введенным ФИО.
      getMedosPatients () {
        let tempQuery = {}
        tempQuery.lastName = (this.patientQuery.lastName === undefined || this.patientQuery.lastName === '') ? ' ' : this.patientQuery.lastName
        tempQuery.firstName = (this.patientQuery.firstName === undefined || this.patientQuery.firstName === '') ? ' ' : this.patientQuery.firstName
        tempQuery.middleName = (this.patientQuery.middleName === undefined || this.patientQuery.middleName === '') ? ' ' : this.patientQuery.middleName
        Axios.get(`${GKP7API}/api/v1/patient/medos/${tempQuery.lastName}/${tempQuery.firstName}/${tempQuery.middleName}/`, {
          headers: {'Authorization': Authentication.getAuthenticationHeader(this)}
        }).then(res => {
          if (res.data.success) {
            this.snackBar.show = false
            this.patients = res.data.patients
            this.patients.forEach((item) => {
              item.dateBirth = this.dateFromIso(item.dateBirth)
            })
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
      //* Запрашиваем пользователя, который осуществил вход.
      getCurrentUser () {
        Axios.get(`${GKP7API}/api/v1/user`, {
          headers: {'Authorization': Authentication.getAuthenticationHeader(this)},
          params: {user_id: this.$cookie.get('user_id')}
        }).then(({data}) => {
          this.currentUser = data
          this.currentUserExam.id = this.currentUser.roles.medos.exam
          switch (this.currentUserExam.id) {
            case 1:
              this.currentUserExam.name = 'лаборанта ОФД'
              break
            case 34:
              this.currentUserExam.name = 'аудиометриста'
          }
          if (this.currentUser.roles.medos.admin || this.currentUser.roles.user) {
            this.currentUserExam.name = 'обследований проф. осмотра'
          }
        }).catch(err => {
          this.errorHandler(err)
        })
      },
      //* Проверить пациента на ЭКГ.
      checkPatientEcg () {
        let userCanDoEcg = (this.currentUserExam && this.currentUserExam.id === 1) ||
          (this.currentUser.roles.medos && this.currentUser.roles.medos.admin) ||
          this.currentUser.roles.superuser
        return userCanDoEcg
      },
      //* Проверить пациента на Спирометрию.
      checkPatientSpirometry (patient) {
        let mustExams = patient.activeMedos.medosExams.mustExams
        let userCanDoSpirometry = (this.currentUserExam && this.currentUserExam.id === 1) ||
          (this.currentUser.roles.medos && this.currentUser.roles.medos.admin) ||
          this.currentUser.roles.superuser
        return mustExams.some(exam => exam.examId === 1) && userCanDoSpirometry
      },
      //* Проверить пациента на Аудиометрию.
      checkPatientAudiometry (patient) {
        let mustExams = patient.activeMedos.medosExams.mustExams
        let userCanDoAudiometry = (this.currentUserExam && this.currentUserExam.id === 34) ||
          (this.currentUser.roles.medos && this.currentUser.roles.medos.admin) ||
          this.currentUser.roles.superuser
        return mustExams.some(exam => exam.examId === 34) && userCanDoAudiometry
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
      //* Вывод сообщения об ошибке.
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

<style lang="scss">
  .router-link-exact-active {
    background-color: #311b92;
    color: white;
    padding: 0 6px;
  }

  .container.grid-list-md {
    padding: 0;
    .layout .flex {
      padding: 0 4px;
    }
  }

  h4 {
    margin-bottom: 6px;
  }

  h3 {
    margin: 6px 0;
  }

  .btn {
    min-width: initial;
  }

  .btn--block {
    margin: 4px 0;
  }

  .input-group__details {
    min-height: 16px;
  }
</style>
