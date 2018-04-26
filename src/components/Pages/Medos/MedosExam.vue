<template>
  <div class=uwd-container>
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
                    <td>
                      <v-tooltip top :color="subSystem.primaryColor">
                        <v-btn
                            slot="activator"
                            @click.native="openExaminationDialog(props.item)"
                            :color="subSystem.primaryColor"
                            icon
                        >
                          <v-icon color="white">assignment_turned_in</v-icon>
                        </v-btn>
                        <span>Завести прием</span>
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
    <v-dialog v-model="examResultDialog.show" persistent max-width="500px">
      <v-card>
        <v-card-title>
          <span class="headline">Заголовок</span>
        </v-card-title>
        <v-card-text>
          <v-container grid-list-md>
            <v-layout row wrap>
              <v-flex sm12>
              </v-flex>
            </v-layout>
          </v-container>
        </v-card-text>
        <v-card-actions>
          <v-spacer>
          </v-spacer>
          <v-btn :color="subSystem.primaryColor" flat @click.native="noExamDialog()">Закрыть</v-btn>
          <v-btn :color="subSystem.primaryColor" class="white--text" @click.native="yesExamDialog()">Сохранить</v-btn>
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
        //* Если доктор, то данные.
        currentUserExam: {
          id: '',
          name: ''
        },
        //* Пациент, которого редактируем.
        currentEditPatient: {
          activeMedos: {},
          bloodResults: [],
          urineClinicalResults: []
        },
        //* Обследование, которое редактируем.
        currentExamResult: {},
        //* Диалог приема врача.
        examResultDialog: {
          show: false,
          edit: false
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
          primaryColor: 'purple darken-3',
          secondaryColor: 'orange darken-3'
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
      openExaminationDialog (item) {},
      noExaminationDialog () {},
      yesExaminationDialog () {},
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
          this.currentDoctorResult.doctorComplaints = 'Нет'
          this.currentUserDoctor.id = this.currentUser.roles.medos.doctor
          switch (this.currentUser.roles.medos.doctor) {
            case 1:
              this.currentUserDoctor.name = 'терапевт'
              this.currentDoctorResult.doctorStatus = 'Кожные покровы и видимые слизистые обычной окраски. Язык чистый. Дыхание везикулярное, хрипов нет. Тоны сердца ясные, ритм правильный, Живот мягкий, безболезненный. Отеков нет.'
              break
            case 2:
              this.currentUserDoctor.name = 'оториноларинголог'
              this.currentDoctorResult.doctorStatus = 'Слизистая носа розовая, носовые ходы свободные. Миндалины не увеличены, слизистая глотки розовая, чистая, Слизистая гортани розовая, голосовые связки серые, подвижные, голос чистый. Уши : слуховой проход свободный, барабанная перепонка не изменена. Шепотная речь 6м справа, 6м слева. Вестибулярных нарушений нет.'
              break
            case 3:
              this.currentUserDoctor.name = 'дерматовенеролог'
              this.currentDoctorResult.doctorStatus = 'Внешний осмотр: кожные покровы  чистые, обычной окраски. Лимфоузлы не увеличены во всех группах. Наружные половые органы: видимые слизистые бледно розовой окраски. Перианальная область без специфических высыпаний.'
              break
            case 4:
              this.currentUserDoctor.name = 'офтальмолог'
              this.currentDoctorResult.doctorStatus = 'Положение век и рост ресниц правильное. Движение глаз в полном объеме. Коньюнктива розовая, Роговица, прозрачная. Передняя камера средней глубины. Радужка структурная, пигментная кайма сохранена. Зрачок не изменен. Хрусталик и стекловидное тело прозрачны.'
              break
            case 5:
              this.currentUserDoctor.name = 'хирург'
              this.currentDoctorResult.doctorStatus = 'Шея, голова, грудная клетка без патологии. Физиологические изгибы и подвижность сохранены. Лимфоузлы без патологии. Живот мягкий, безболезненный. Остов таза симметричный, наружные половые органы без патологии. Ректальное пальцевое исследование: сфинктер в тонусе, патологии в просвете нет. Верхние конечности без патологии, нижние конечности без патологии , пульсация периферических сосудов сохранена.'
              break
            case 6:
              this.currentUserDoctor.name = 'невролог'
              this.currentDoctorResult.doctorStatus = 'Наружный осмотр: норма. Высшая нервная деятельность: норма. Черепно-мозговая иннервация: норма. Сухожильные рефлексы: живые. Чувствительность кожи: норма. Мануальное исследование: патологии нет. Поза Ромберга: устойчивость. Пальце-носовая проба: четкое попадание. Походка: не изменена.'
              break
            case 7:
              this.currentUserDoctor.name = 'стоматолог'
              this.currentDoctorResult.doctorStatus = 'Лицо симметрично, кожные покровы не изменены. Движения в височно-нижнечелюстном суставе в полном объеме. Слизистая полости рта влажная, гладкая, чистая. Области выхода протоков слюнных желез не изменены. Край десен имеет бледно-розовую окраску и плотно прилегает к шейкам зубов. Зубной ряд полный. Съемных зубных протезов нет.'
              break
            case 12:
              this.currentUserDoctor.name = 'гинеколог'
              this.currentDoctorResult.doctorStatus = 'Наружные половые органы развиты правильно. Влагалище, своды без патологии. Шейка матки без патологии. Тело матки не увеличено, правильной формы, положение физиологическое. Цервикальный канал закрыт, придатки не пальпируются. Выделения скудные, без цвета и неприятного запаха. Пальцевое исследование прямой кишки – патологии в малом тазу нет. Исследование молочных желез: симметричные, окраска, соски, консистенция обычные.'
              break
            default:
              this.currentUserDoctor.name = 'терапевт'
              this.currentDoctorResult.doctorStatus = 'Кожные покровы и видимые слизистые обычной окраски. Язык чистый. Дыхание везикулярное, хрипов нет. Тоны сердца ясные, ритм правильный, Живот мягкий, безболезненный. Отеков нет.'
              break
          }
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
    background-color: #6a1b9a;
    color: white;
    padding: 0 6px;
  }

  .theme--light .input-group input:disabled::placeholder,
  .theme--light .input-group input:disabled {
    color: rgba(245, 127, 23, 0.7) !important;
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
