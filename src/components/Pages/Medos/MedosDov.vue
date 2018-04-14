<template>
  <v-app>
    <app-header :subsystem="subSystem.primaryColor" subtitle="Доврачебный кабинет">
    </app-header>
    <v-content>
      <v-container fluid fill-height>
        <v-layout
            justify-center
            align-center
        >
          <v-flex xs12>
            <h2 class="text-xs-center">Поиск пациентов</h2>
            <v-container grid-list-md>
              <v-layout row wrap>
                <v-flex xs12 md4>
                  <v-text-field @keyup.enter="getPatients" :color="subSystem.secondaryColor" label="Фамилия"
                                v-model="patientQuery.lastName" box>
                  </v-text-field>
                </v-flex>
                <v-flex xs12 md4>
                  <v-text-field @keyup.enter="getPatients" :color="subSystem.secondaryColor" label="Имя"
                                v-model="patientQuery.firstName" box>
                  </v-text-field>
                </v-flex>
                <v-flex xs12 md4>
                  <v-text-field @keyup.enter="getPatients" :color="subSystem.secondaryColor" label="Отчество"
                                v-model="patientQuery.middleName" box>
                  </v-text-field>
                </v-flex>
                <v-flex xs12 md12>
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
                    <td>{{ props.item.dateBirth }}</td>
                    <td>{{ (props.item.sex) ? 'Муж' : 'Жен' }}</td>
                    <td width="211px">
                      <v-tooltip top :color="subSystem.secondaryColor">
                        <v-btn
                            slot="activator"
                            @click.native="openEditHarmsDialog(props.item)"
                            :color="subSystem.secondaryColor"
                            icon
                        >
                          <v-icon color="white">assignment_late</v-icon>
                        </v-btn>
                        <span>Указать вредности пациента</span>
                      </v-tooltip>
                      <v-tooltip top :color="subSystem.primaryColor">
                        <v-btn
                            slot="activator"
                            @click.native="openEditParametersDialog(props.item)"
                            :color="subSystem.primaryColor"
                            icon
                        >
                          <v-icon color="white">assignment</v-icon>
                        </v-btn>
                        <span>Ввести параметры пациента</span>
                      </v-tooltip>
                      <v-tooltip top color="green darken-2">
                        <v-btn
                            slot="activator"
                            @click.native="openAppointmentsDialog(props.item)"
                            color="green darken-2"
                            icon
                        >
                          <v-icon color="white">assignment_turned_in</v-icon>
                        </v-btn>
                        <span>Распечатать бегунок</span>
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
    <app-footer :subsystem="subSystem.primaryColor" :currentUser="currentUser.fio">
    </app-footer>

    <v-snackbar :timeout="snackBar.timeout"
                right="right"
                :color="snackBar.color"
                v-model="snackBar.show">
      {{ snackBar.message }}
    </v-snackbar>

    <!-- Диалог редактирования вредностей -->
    <v-dialog v-model="editHarmsDialog.show" persistent max-width="800px">
      <v-card>
        <v-card-title>
          <span class="headline">Добавить вредности для пациента <br/><span
              class="green--text text--darken-2">{{ currentEditPatient.fio }}</span>
          </span>
          <v-spacer>
          </v-spacer>
          <v-layout row wrap>
            <!-- Добавить вредность -->
            <v-flex sm12 md12>
              <v-btn @click.native="openAddHarmDialog" :color="subSystem.secondaryColor" dark large block>
                Добавить вредность
              </v-btn>
            </v-flex>
            <!-- / Добавить вредность -->
          </v-layout>
        </v-card-title>
        <v-card-text>
          <v-container grid-list-md>
            <v-data-table
                hide-headers
                v-if="currentPatientHarms.length > 0"
                :items="currentPatientHarms"
                hide-actions
                class="elevation-10 mt-4"
            >
              <template slot="items" slot-scope="props">
                <tr>
                  <td>{{ props.item.harmName }}</td>
                  <td width="50px">
                    <v-tooltip top color="red darken-2">
                      <v-btn
                          slot="activator"
                          @click.native="openRemoveDialog(props.item)"
                          color="red darken-2"
                          icon
                      >
                        <v-icon color="white">delete</v-icon>
                      </v-btn>
                      <span>Удалить вредность</span>
                    </v-tooltip>
                  </td>
                </tr>
              </template>
            </v-data-table>
          </v-container>
        </v-card-text>
        <v-card-actions>
          <v-spacer>
          </v-spacer>
          <v-btn :color="subSystem.primaryColor" flat @click.native="noEditHarmsDialog">Закрыть</v-btn>
          <v-btn :color="subSystem.primaryColor" class="white--text" @click.native="yesEditHarmsDialog">Сохранить
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <!-- / Диалог редактирования вредностей -->

    <!-- Диалог добавления конкретной вредности -->
    <v-dialog v-model="addNewHarmDialog.show" persistent max-width="600px">
      <v-card>
        <v-card-title v-if="currentAddHarm">
          <span class="headline">Добавить новую вредность</span>
        </v-card-title>
        <v-card-text>
          <v-container grid-list-md>
            <v-select
                :items="harmsForSelect"
                label="Вредность"
                autocomplete
                :color="subSystem.primaryColor"
                v-model="currentAddHarm"
            >
            </v-select>
          </v-container>
        </v-card-text>
        <v-card-actions>
          <v-spacer>
          </v-spacer>
          <v-btn :color="subSystem.primaryColor" flat @click.native="noAddHarmDialog">Нет</v-btn>
          <v-btn :color="subSystem.primaryColor" class="white--text" @click.native="yesAddHarmDialog">Да</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <!-- / Диалог добавления конкретной вредности -->

    <!-- Диалог удаления вредности -->
    <v-dialog v-model="removeDialog.show" persistent max-width="800px">
      <v-card>
        <v-card-title v-if="currentRemoveItem.harmName">
          <span class="headline">
            Вы точно хотите удалить вредность <br/>
            <span class="red--text text--darken-2">«{{ currentRemoveItem.harmName }}»</span>
          </span>
        </v-card-title>
        <v-card-actions>
          <v-spacer>
          </v-spacer>
          <v-btn color="red darken-2" flat @click.native="noRemoveDialog">Нет</v-btn>
          <v-btn color="red darken-2" class="white--text" @click.native="yesRemoveDialog">Да</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <!-- / Диалог удаления вредности -->

    <!-- Диалог редактирования параметров -->
    <v-dialog v-model="editParametersDialog.show" persistent max-width="700px">
      <v-card>
        <v-card-title>
          <span class="headline">Ввести параметры для пациента <br/><span
              class="green--text text--darken-2">{{ currentEditPatient.fio }}</span>
          </span>
        </v-card-title>
        <v-card-text>
          <v-container grid-list-md>
            <v-layout row wrap>
              <v-flex sm12 md3>
                <v-text-field
                    label="Рост"
                    :color="subSystem.primaryColor"
                    v-model="currentPatientParameters.height"
                >
                </v-text-field>
              </v-flex>
              <v-flex sm12 md3>
                <v-text-field
                    label="Вес"
                    :color="subSystem.primaryColor"
                    v-model="currentPatientParameters.weight"
                >
                </v-text-field>
              </v-flex>
              <v-flex sm12 md2>
                <v-text-field
                    v-if="currentPatientParameters.ad"
                    label="AD.SYS"
                    :color="subSystem.primaryColor"
                    v-model="currentPatientParameters.ad.sys"
                >
                </v-text-field>
              </v-flex>
              <v-flex sm12 md2>
                <v-text-field
                    v-if="currentPatientParameters.ad"
                    label="AD.DIA"
                    :color="subSystem.primaryColor"
                    v-model="currentPatientParameters.ad.dia"
                >
                </v-text-field>
              </v-flex>
              <v-flex sm12 md2>
                <v-text-field
                    label="Пульс"
                    :color="subSystem.primaryColor"
                    v-model="currentPatientParameters.pulse"
                >
                </v-text-field>
              </v-flex>
            </v-layout>
            <v-layout row wrap>
              <v-flex sm12 md3>
                <v-text-field
                    v-if="currentPatientParameters.dynamometry"
                    label="Динам-ия (лев)"
                    :color="subSystem.primaryColor"
                    v-model="currentPatientParameters.dynamometry.left"
                >
                </v-text-field>
              </v-flex>
              <v-flex sm12 md3>
                <v-text-field
                    v-if="currentPatientParameters.dynamometry"
                    label="Динам-ия (прав)"
                    :color="subSystem.primaryColor"
                    v-model="currentPatientParameters.dynamometry.right"
                >
                </v-text-field>
              </v-flex>
              <v-flex sm12 md3>
                <v-text-field
                    label="Сигареты"
                    :color="subSystem.primaryColor"
                    v-model="currentPatientParameters.cigarettes"
                >
                </v-text-field>
              </v-flex>
              <v-flex sm12 md3>
                <v-select
                    :items="alcoholTypes"
                    label="Алкоголь"
                    :color="subSystem.primaryColor"
                    v-model="currentPatientParameters.alcohol"
                >
                </v-select>
              </v-flex>
            </v-layout>
            <v-layout row wrap>
              <v-flex sm12 md3>
                <v-select
                    v-if="currentPatientParameters.skin"
                    label="Кожа"
                    :items="skinNorma"
                    :color="subSystem.primaryColor"
                    v-model="currentPatientParameters.skin.norma"
                >
                </v-select>
              </v-flex>
              <v-flex sm12 md9>
                <v-select
                    v-if="currentPatientParameters.skin"
                    label="Вид паталогии"
                    :items="skinPathologies"
                    :color="subSystem.primaryColor"
                    v-model="currentPatientParameters.skin.pathology"
                    :disabled="currentPatientParameters.skin.norma"
                >
                </v-select>
              </v-flex>
            </v-layout>
            <v-layout row wrap>
              <v-flex sm12 md12>
                <v-text-field
                    label="Анамнез"
                    :color="subSystem.primaryColor"
                    v-model="currentPatientParameters.comment"
                >
                </v-text-field>
              </v-flex>
            </v-layout>
          </v-container>
        </v-card-text>
        <v-card-actions>
          <v-spacer>
          </v-spacer>
          <v-btn :color="subSystem.primaryColor" flat @click.native="noEditParametersDialog">Закрыть</v-btn>
          <v-btn :color="subSystem.primaryColor" class="white--text" @click.native="yesEditParametersDialog">Сохранить
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <!-- / Диалог редактирования параметров -->

    <!-- Диалог бегунка с назначениями -->
    <v-dialog v-model="appointmentsDialog.show" persistent max-width="800px">
      <v-card>
        <v-card-title>
          <v-flex sm12 md7>
            <span class="headline">
            Назначения для<br/><span
                class="green--text text--darken-2">{{ currentEditPatient.fio }}</span>
          </span>
          </v-flex>
          <v-flex sm12 md5>
            <v-checkbox
                class="right"
                label="Показывать доп. назначения"
                v-model="showAddonAppointments"
            ></v-checkbox>
          </v-flex>
        </v-card-title>
        <v-card-text ref="print">
          <v-list two-line subheader>
            <!-- Показ докторов -->
            <v-subheader>Доктора <span v-if="showAddonAppointments">- (обязательные)</span></v-subheader>
            <v-list-tile
                v-for="doctor in appointmentsForHarms.doctors.mustDoctors"
                :key="doctor.doctorId"
            >
              <v-list-tile-content>
                <v-list-tile-title>{{ doctor.doctorName }}</v-list-tile-title>
                <v-list-tile-sub-title>Кабинет 110</v-list-tile-sub-title>
              </v-list-tile-content>
            </v-list-tile>
            <div v-if="showAddonAppointments">
              <v-divider></v-divider>
              <v-subheader>Доктора <span v-if="showAddonAppointments">- (дополнительные)</span></v-subheader>
              <v-list-tile
                  v-for="doctor in appointmentsForHarms.doctors.addonDoctors"
                  :key="doctor.doctorId"
              >
                <v-list-tile-content>
                  <v-list-tile-title>{{ doctor.doctorName }}</v-list-tile-title>
                  <v-list-tile-sub-title>Кабинет 110</v-list-tile-sub-title>
                </v-list-tile-content>
              </v-list-tile>
            </div>
            <v-divider>
            </v-divider>
            <!-- Показ обследований -->
            <v-subheader>Обследования <span v-if="showAddonAppointments">- (обязательные)</span></v-subheader>
            <v-list-tile
                v-for="exam in appointmentsForHarms.exams.mustExams"
                :key="exam.examId"
            >
              <v-list-tile-content>
                <v-list-tile-title>{{ exam.examName }}</v-list-tile-title>
                <v-list-tile-sub-title>Кабинет 110</v-list-tile-sub-title>
              </v-list-tile-content>
            </v-list-tile>
            <div v-if="showAddonAppointments">
              <v-divider></v-divider>
              <v-subheader>Обследования <span v-if="showAddonAppointments">- (дополнительные)</span></v-subheader>
              <v-list-tile
                  v-for="exam in appointmentsForHarms.exams.addonExams"
                  :key="exam.doctorId"
              >
                <v-list-tile-content>
                  <v-list-tile-title>{{ exam.examName }}</v-list-tile-title>
                  <v-list-tile-sub-title>Кабинет 110</v-list-tile-sub-title>
                </v-list-tile-content>
              </v-list-tile>
            </div>
          </v-list>
        </v-card-text>
        <v-card-actions>
          <v-spacer>
          </v-spacer>
          <v-btn :color="subSystem.secondaryColor" class="white--text" @click.native="printAppointmentsDialog">Печать
          </v-btn>
          <v-btn :color="subSystem.primaryColor" class="white--text" @click.native="noAppointmentsDialog">Закрыть
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <!-- / Диалог бегунка с назначениями -->

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
        //* Вредности для последующей работы.
        harms: [],
        //* Вредности для селекта
        harmsForSelect: [],
        //* Запрос на пациентам по ФИО, подгружается в начальном окне.
        patientQuery: {},
        //* Подгруженные пациенты после запроса по ФИО.
        patients: [],
        //* Пациент, которого редактируем.
        currentEditPatient: {},
        //* Медосмотр, который редактируем.
        currentMedos: {},
        //* Параметры редактируемого пациента.
        currentPatientParameters: {
          height: '',
          weight: '',
          pulse: '',
          ad: {
            sys: '',
            dia: ''
          },
          dynamometry: {
            left: '',
            right: ''
          },
          skin: {
            norma: true,
            pathology: ''
          },
          cigarettes: '',
          alcohol: '',
          comment: ''
        },
        //* Вредности пациента.
        currentPatientHarms: [],
        //* Вредность, которую добавляем.
        currentAddHarm: {},
        //* То, что будем удалять.
        currentRemoveItem: {},
        //* Диалоговое окно про вредности.
        editHarmsDialog: {
          show: false
        },
        //* Диалоговое окно добавления одной вредности.
        addNewHarmDialog: {
          show: false
        },
        //* Диалоговое окно для удаления.
        removeDialog: {
          show: false
        },
        //* Диалоговое окно про параметры.
        editParametersDialog: {
          show: false
        },
        //* Диалоговое окно с бегунком.
        appointmentsDialog: {
          show: false
        },
        appointmentsForHarms: {
          doctors: {
            mustDoctors: [],
            addonDoctors: []
          },
          exams: {
            mustExams: [],
            addonExams: []
          }
        },
        showAddonAppointments: false,
        //* Справочники.
        skinNorma: [
          {
            value: true,
            text: 'норма'
          },
          {
            value: false,
            text: 'патология'
          }
        ],
        skinPathologies: [
          'Бледность кожи или видимых слизистых',
          'Цианоз кожи или видимых слизистых',
          'Иктеричность склер или кожи',
          'Имеются сыпные элементы или гиперпигментация кожи',
          'Имеются отеки подкожнкой клетчатки',
          'Имеется гиперемия кожи или видимых слизистых'
        ],
        alcoholTypes: [
          '1 - нет',
          '2 - умеренно',
          '3 - злоупотребляет'
        ],
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
      //* Подгружаем все вредности из базы данных.
      this.getAllHarms()
    },
    methods: {
      //* Методы для диалогового окна вредностей.
      openEditHarmsDialog (item) {
        this.currentEditPatient = item
        this.currentMedos = item.activeMedos
        if (this.currentMedos.medosHarms.length > 0) {
          this.currentPatientHarms = this.currentMedos.medosHarms
        }
        this.editHarmsDialog.show = true
      },
      noEditHarmsDialog () {
        this.editHarmsDialog.show = false
      },
      yesEditHarmsDialog () {
        this.currentMedos.medosHarms = this.currentPatientHarms
        //* Добавляем вредности в базу данных.
        Axios.put(`${GKP7API}/api/v1/patient/${this.currentEditPatient._id}/harms/`, {
          medosHarms: this.currentMedos.medosHarms
        }, {
          headers: {'Authorization': Authentication.getAuthenticationHeader(this)}
        }).then(res => {
          if (res.data.success) {
            this.currentEditPatient = {}
            this.currentPatientHarms = {}
            this.currentMedos = {}
            this.editHarmsDialog.show = false
            this.snackBar.color = 'green darken-1 white--text'
            this.snackBar.timeout = 2000
          } else {
            this.snackBar.color = 'red darken-2 white--text'
            this.snackBar.timeout = 5000
          }
          this.snackBar.message = res.data.message
          this.snackBar.show = true
        }).catch(err => {
          this.errorHandler(err)
        })
      },
      //* Методы для диалогового окна добавления вредности.
      openAddHarmDialog () {
        this.addNewHarmDialog.show = true
      },
      noAddHarmDialog () {
        this.addNewHarmDialog.show = false
        this.currentAddHarm = {}
      },
      yesAddHarmDialog () {
        this.currentPatientHarms.push(this.currentAddHarm)
        this.addNewHarmDialog.show = false
        this.currentAddHarm = {}
      },
      //* Методы для диалогового окна удаления.
      openRemoveDialog (item) {
        this.currentRemoveItem = item
        this.removeDialog.show = true
      },
      noRemoveDialog () {
        this.removeDialog.show = false
        this.currentRemoveItem = {}
      },
      yesRemoveDialog () {
        if (this.currentRemoveItem.harmName) {
          this.currentPatientHarms.forEach((harm, i) => {
            if (harm === this.currentRemoveItem) {
              this.currentPatientHarms.splice(i, 1)
            }
          })
        } else {
          this.snackBar.show = true
          this.snackBar.color = 'red lighten-1'
          this.snackBar.message = 'Не знаю, что удалять.'
        }
        this.removeDialog.show = false
        this.currentRemoveItem = {}
      },
      //* Методы для диалогового окна параметров.
      openEditParametersDialog (item) {
        this.currentEditPatient = item
        this.currentMedos = item.activeMedos
        this.currentPatientParameters = this.currentMedos.medosParameters
        this.editParametersDialog.show = true
      },
      noEditParametersDialog () {
        this.editParametersDialog.show = false
      },
      yesEditParametersDialog () {
        this.editParametersDialog.show = false
        //* Добавляем вредности в базу данных.
        Axios.put(`${GKP7API}/api/v1/patient/${this.currentEditPatient._id}/parameters/`, {
          medosParameters: this.currentPatientParameters
        }, {
          headers: {'Authorization': Authentication.getAuthenticationHeader(this)}
        }).then(res => {
          if (res.data.success) {
            this.currentEditPatient = {}
            this.currentMedos = {}
            this.currentPatientParameters = {}
            this.editHarmsDialog.show = false
            this.snackBar.color = 'green darken-1 white--text'
            this.snackBar.timeout = 2000
          } else {
            this.snackBar.color = 'red darken-2 white--text'
            this.snackBar.timeout = 5000
          }
          this.snackBar.message = res.data.message
          this.snackBar.show = true
        }).catch(err => {
          this.errorHandler(err)
        })
      },
      // * Методы для диалогового окна бегунка.
      openAppointmentsDialog (item) {
        this.currentEditPatient = item
        this.currentMedos = item.activeMedos
        let tmpHarms = this.currentMedos.medosHarms
        let tmpParameters = this.currentMedos.medosParameters
        if (tmpHarms.length < 1) {
          this.snackBar.color = 'red darken-2 white--text'
          this.snackBar.timeout = 5000
          this.snackBar.message = 'Не введены вредности'
          this.snackBar.show = true
        } else if (
          tmpParameters.height === '' || tmpParameters.weight === '' || tmpParameters.pulse === '' ||
          tmpParameters.ad.sys === '' || tmpParameters.ad.dia === '' || tmpParameters.cigarettes === '' ||
          tmpParameters.alcohol === '' || tmpParameters.dynamometry.left === '' ||
          tmpParameters.dynamometry.right === ''
        ) {
          this.snackBar = {
            color: 'red darken-2 white--text',
            timeout: 5000,
            message: 'Не введены вредности',
            show: true
          }
        } else {
          //* Инифициализируем пустые массивы для неотфильтрованных назначений по вредностям.
          let allTheMustDoctors = []
          let allTheAddonDoctors = []
          let allTheMustExams = []
          let allTheAddonExams = []
          //* Просматриваем справочник вредностей и отбираем те, которые нам нужны.
          tmpHarms.map((tmpHarm) => {
            let tmpHarmDb = this.harms.find(harm => harm.harmId === tmpHarm.harmId)
            tmpHarmDb.doctors.map((doctor) => {
              doctor.mustDoctors.map((mustDoctor) => {
                allTheMustDoctors.push(mustDoctor)
              })
              doctor.addonDoctors.map((addonDoctor) => {
                allTheAddonDoctors.push(addonDoctor)
              })
            })
            tmpHarmDb.exams.map((exam) => {
              exam.mustExams.map((mustExam) => {
                allTheMustExams.push(mustExam)
              })
              exam.addonExams.map((addonDoctor) => {
                allTheAddonExams.push(addonDoctor)
              })
            })
          })
          //* Отбираем только уникальные назначения.
          let uniqueMustDoctors = allTheMustDoctors.filter(
            (doctor, index, self) => self.findIndex(d => d.doctorId === doctor.doctorId) === index
          )
          let uniqueAddonDoctors = allTheAddonDoctors.filter(
            (doctor, index, self) => self.findIndex(d => d.doctorId === doctor.doctorId) === index
          )
          let uniqueMustExams = allTheMustExams.filter(
            (exam, index, self) => self.findIndex(e => e.examId === exam.examId) === index
          )
          let uniqueAddonExams = allTheAddonExams.filter(
            (exam, index, self) => self.findIndex(e => e.examId === exam.examId) === index
          )
          //* Кладем назначения в стор.
          this.appointmentsForHarms.doctors.mustDoctors = uniqueMustDoctors
          this.appointmentsForHarms.doctors.addonDoctors = uniqueAddonDoctors
          this.appointmentsForHarms.exams.mustExams = uniqueMustExams
          this.appointmentsForHarms.exams.addonExams = uniqueAddonExams
          this.appointmentsDialog.show = true
        }
      },
      noAppointmentsDialog () {
        this.appointmentsDialog.show = false
      },
      printAppointmentsDialog () {
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
      //* Запрашиваем список пациентов по введенным ФИО.
      getPatients () {
        let tempQuery = {}
        tempQuery.lastName = (this.patientQuery.lastName === undefined) ? ' ' : this.patientQuery.lastName
        tempQuery.firstName = (this.patientQuery.firstName === undefined) ? ' ' : this.patientQuery.firstName
        tempQuery.middleName = (this.patientQuery.middleName === undefined) ? ' ' : this.patientQuery.middleName
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
      //* Подгружаем все вредности для последующей работы.
      getAllHarms () {
        Axios.get(`${GKP7API}/api/v1/harms`, {
          headers: {'Authorization': Authentication.getAuthenticationHeader(this)}
        }).then(({data}) => {
          if (data.success === true) {
            this.harms = data.harms
            this.snackBar.show = true
            this.snackBar.color = 'green darken-1 white--text'
            this.snackBar.message = 'Вредности загружены'
            this.snackBar.timeout = 1000
            this.harmsForSelect = this.harms.map(
              harm => ({
                value: {
                  harmId: harm.harmId,
                  harmName: harm.harmName,
                  doctors: harm.doctors,
                  exams: harm.exams
                },
                text: harm.harmName
              })
            )
          } else {
            this.snackBar.show = true
            this.snackBar.color = 'red darken-1 white--text'
            this.snackBar.message = 'Вредностей не найдено'
            this.snackBar.timeout = 5000
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
      //* Фильтруем массив только на уникальные элементы.
      uniqueArray (array) {
        let seen = {}
        return array.filter(function (item) {
          return seen.hasOwnProperty(item) ? false : (seen[item] = true)
        })
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
</style>
