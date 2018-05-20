<template>
  <div class=uwd-container>
    <app-header :subsystem="subSystem.primaryColor" subtitle="Доврачебный кабинет" :currentUser="currentUser">
    </app-header>
    <v-content>
      <v-container fluid fill-height>
        <v-layout
          justify-center
          align-center
        >
          <v-flex xs12>
            <h2 class="text-xs-center">Поиск пациентов на медосмотре</h2>
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
                  {text:'Дата рождения', sortable: false},
                  {text:'Пол', sortable: false},
                  {text:'Тип осмотра', sortable: false},
                  {text:'Действия', sortable: false}
                ]"
                v-if=" patients.length> 0"
                :items="patients"
                hide-actions
                class="elevation-10 mt-4"
              >
                <template slot="items" slot-scope="props">
                  <tr>
                    <td>{{ props.item.fio }}</td>
                    <td>{{ props.item.dateBirth }}</td>
                    <td>{{ (props.item.sex) ? 'Муж' : 'Жен' }}</td>
                    <td>{{ props.item.activeMedos.medosType }}</td>
                    <td width="211px">
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
    <app-footer :subsystem="subSystem.primaryColor" :currentUser="currentUser">
    </app-footer>

    <v-snackbar :timeout="snackBar.timeout"
                right="right"
                :color="snackBar.color"
                v-model="snackBar.show">
      {{ snackBar.message }}
    </v-snackbar>

    <!-- Диалог редактирования параметров -->
    <v-dialog v-model="editParametersDialog.show" persistent lazy max-width="700px">
      <v-card>
        <v-card-title>
          <span class="headline">Редактировать параметры для пациента <br/><span
            class="green--text text--darken-2">{{ currentEditPatient.fio }}</span>
          </span>
        </v-card-title>
        <v-card-text v-if="currentEditPatient.activeMedos">
          <v-container grid-list-md v-if="currentEditPatient.activeMedos.medosParameters">
            <v-layout row wrap>
              <v-flex sm12 md3>
                <v-text-field
                  label="Рост"
                  :color="subSystem.primaryColor"
                  v-model="currentEditPatient.activeMedos.medosParameters.height"
                >
                </v-text-field>
              </v-flex>
              <v-flex sm12 md3>
                <v-text-field
                  label="Вес"
                  :color="subSystem.primaryColor"
                  v-model="currentEditPatient.activeMedos.medosParameters.weight"
                >
                </v-text-field>
              </v-flex>
              <v-flex sm12 md2>
                <v-text-field
                  v-if="currentEditPatient.activeMedos.medosParameters.ad"
                  label="AD.SYS"
                  :color="subSystem.primaryColor"
                  v-model="currentEditPatient.activeMedos.medosParameters.ad.sys"
                >
                </v-text-field>
              </v-flex>
              <v-flex sm12 md2>
                <v-text-field
                  v-if="currentEditPatient.activeMedos.medosParameters.ad"
                  label="AD.DIA"
                  :color="subSystem.primaryColor"
                  v-model="currentEditPatient.activeMedos.medosParameters.ad.dia"
                >
                </v-text-field>
              </v-flex>
              <v-flex sm12 md2>
                <v-text-field
                  label="Пульс"
                  :color="subSystem.primaryColor"
                  v-model="currentEditPatient.activeMedos.medosParameters.pulse"
                >
                </v-text-field>
              </v-flex>
            </v-layout>
            <v-layout row wrap>
              <v-flex sm12 md3>
                <v-text-field
                  v-if="currentEditPatient.activeMedos.medosParameters.dynamometry"
                  label="Динам-ия (лев)"
                  :color="subSystem.primaryColor"
                  v-model="currentEditPatient.activeMedos.medosParameters.dynamometry.left"
                >
                </v-text-field>
              </v-flex>
              <v-flex sm12 md3>
                <v-text-field
                  v-if="currentEditPatient.activeMedos.medosParameters.dynamometry"
                  label="Динам-ия (прав)"
                  :color="subSystem.primaryColor"
                  v-model="currentEditPatient.activeMedos.medosParameters.dynamometry.right"
                >
                </v-text-field>
              </v-flex>
              <v-flex sm12 md3>
                <v-text-field
                  label="Сигареты"
                  :color="subSystem.primaryColor"
                  v-model="currentEditPatient.activeMedos.medosParameters.cigarettes"
                >
                </v-text-field>
              </v-flex>
              <v-flex sm12 md3>
                <v-select
                  :items="alcoholTypes"
                  label="Алкоголь"
                  :color="subSystem.primaryColor"
                  v-model="currentEditPatient.activeMedos.medosParameters.alcohol"
                >
                </v-select>
              </v-flex>
            </v-layout>
            <v-layout row wrap>
              <v-flex sm12 md3>
                <v-select
                  v-if="currentEditPatient.activeMedos.medosParameters.skin"
                  label="Кожа"
                  :items="skinNorma"
                  :color="subSystem.primaryColor"
                  v-model="currentEditPatient.activeMedos.medosParameters.skin.norma"
                >
                </v-select>
              </v-flex>
              <v-flex sm12 md9>
                <v-select
                  v-if="currentEditPatient.activeMedos.medosParameters.skin"
                  label="Вид паталогии"
                  :items="skinPathologies"
                  :color="subSystem.primaryColor"
                  v-model="currentEditPatient.activeMedos.medosParameters.skin.pathology"
                  :disabled="currentEditPatient.activeMedos.medosParameters.skin.norma"
                >
                </v-select>
              </v-flex>
            </v-layout>
            <v-layout row wrap>
              <v-flex sm12 md12>
                <v-text-field
                  label="Анамнез"
                  :color="subSystem.primaryColor"
                  v-model="currentEditPatient.activeMedos.medosParameters.comment"
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

    <!-- Диалог редактирования вредностей -->
    <v-dialog v-model="editHarmsDialog.show" persistent lazy max-width="800px">
      <v-card>
        <v-card-title>
          <span class="headline">Редактировать вредности для пациента <br/><span
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
          <v-container grid-list-md v-if="currentEditPatient.activeMedos">
            <v-data-table
              hide-headers
              v-if="currentEditPatient.activeMedos.medosHarms.length > 0"
              :items="currentEditPatient.activeMedos.medosHarms"
              hide-actions
              class="elevation-10 mt-4"
            >
              <template slot="items" slot-scope="props">
                <tr>
                  <td>{{ props.item.harmName }}</td>
                  <td width="50px">
                    <v-tooltip top :color="subSystem.deleteColor">
                      <v-btn
                        slot="activator"
                        @click.native="openRemoveDialog(props.item)"
                        :color="subSystem.deleteColor"
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
    <v-dialog v-model="addNewHarmDialog.show" persistent lazy max-width="800px">
      <v-card>
        <v-card-title v-if="currentEditHarm">
          <span class="headline">Добавить новую вредность</span>
        </v-card-title>
        <v-card-text>
          <v-container grid-list-md>
            <v-select
              dense
              auto-grow
              :items="harmsForSelect"
              label="Вредность"
              autocomplete
              :color="subSystem.primaryColor"
              v-model="currentEditHarm"
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
    <v-dialog v-model="removeDialog.show" persistent lazy max-width="800px">
      <v-card>
        <v-card-title v-if="currentRemoveItem.harmName">
          <span class="headline">
            Вы точно хотите удалить вредность <br/>
            <span :class="subSystem.deleteText">«{{ currentRemoveItem.harmName }}»</span>
          </span>
        </v-card-title>
        <v-card-actions>
          <v-spacer>
          </v-spacer>
          <v-btn :color="subSystem.deleteColor" flat @click.native="noRemoveDialog">Нет</v-btn>
          <v-btn :color="subSystem.deleteColor" class="white--text" @click.native="yesRemoveDialog">Да</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <!-- / Диалог удаления вредности -->

    <!-- Диалог бегунка с назначениями -->
    <v-dialog v-model="appointmentsDialog.show" persistent lazy max-width="800px">
      <v-card>
        <v-card-title
          v-if="currentEditPatient.activeMedos && currentEditPatient.activeMedos.medosDoctors && currentEditPatient.activeMedos.medosExams">
          <v-flex sm12 md7>
            <span class="headline">
            Назначения для<br/><span
              class="green--text text--darken-2">{{ currentEditPatient.fio }}</span>
          </span>
          </v-flex>
          <v-flex sm12 md5
                  v-if="currentEditPatient.activeMedos.medosDoctors.addonDoctors.length > 0 || currentEditPatient.activeMedos.medosExams.addonExams.length > 0">
            <v-checkbox
              class="right"
              label="Показывать доп. назначения"
              v-model="showAddonAppointments"
            ></v-checkbox>
          </v-flex>
        </v-card-title>
        <v-card-text ref="print"
                     v-if="currentEditPatient.activeMedos && currentEditPatient.activeMedos.medosDoctors && currentEditPatient.activeMedos.medosExams">
          <div class="print-blood">
            <h4>Гематологический анализ крови — 108 кабинет</h4>
            <h5>{{ currentEditPatient.fio }} (Цех: {{ currentEditPatient.activeJob.jobDivision }}, Таб: {{
              currentEditPatient.activeJob.jobPersonnelNumber }})</h5>
            <br>
            <p>
              Нв_______ Цр_______ Эр_______ Тр_______ L_______<br>
              Б_______ Эо_______ П_______ С_______ Лф_______ М_______ СОЭ_______<br>
              Сахар_______ Холестерин_______<br>
            </p>
          </div>
          <br>
          <hr>
          <br>
          <br>
          <div class="print-302">
            <div class="print-302-header">
              <h4>{{ currentEditPatient.fio }}</h4>
              <h5>Согласно пр. №302</h5>
            </div>
            <br>
            <!-- Показ докторов -->
            <h4 style="margin: 0">Специалисты <span v-if="showAddonAppointments">- (обязательные)</span></h4>
            <hr class="print-302-subheading">
            <p>
              <span>101 кабинет — Прививка</span><br>
              <span>108 кабинет — Анализ крови</span><br>
              <span>211 кабинет — Анализ мочи</span><br>
              <span
                v-for="doctor in currentEditPatient.activeMedos.medosDoctors.mustDoctors"
                :key="doctor.doctorId">
              {{(doctor.doctorRoom) ? `${doctor.doctorRoom} — ` : '' }}{{ doctor.doctorName }}
              <br>
            </span>
              <span>202 кабинет — ЭКГ</span><br>
              <span>Центр здоровья — Нарколог</span><br>
              <span>Центр здоровья — Психиатр</span><br>
            </p>
            <div v-if="showAddonAppointments">
              <h4>Врачи <span v-if="showAddonAppointments">- (дополнительные)</span></h4>
              <hr class="print-302-subheading">
              <p>
              <span
                v-for="doctor in currentEditPatient.activeMedos.medosDoctors.addonDoctors"
                :key="doctor.doctorId">
              {{(doctor.doctorRoom) ? `${doctor.doctorRoom} — ` : '' }}{{ doctor.doctorName }}
              <br>
            </span>
              </p>
            </div>
            <!-- Показ обследований -->
            <h4>Обследования <span v-if="showAddonAppointments">- (обязательные)</span></h4>
            <hr class="print-302-subheading">
            <p>
            <span
              v-for="exam in currentEditPatient.activeMedos.medosExams.mustExams"
              :key="exam.examId">
              {{ exam.examName }}{{ (exam.examNote) ? ` — ${exam.examNote}` : '' }};
            </span>
            </p>
            <div v-if="showAddonAppointments">
              <h4>Обследования <span v-if="showAddonAppointments">- (дополнительные)</span></h4>
              <hr class="print-302-subheading">
              <p>
              <span
                v-for="exam in currentEditPatient.activeMedos.medosExams.addonExams"
                :key="exam.examId">
              {{ exam.examName }}{{ (exam.examNote) ? ` — ${exam.examNote}` : '' }};
            </span>
              </p>
            </div>
          </div>
          <br>
          <hr>
          <br>
          <br>
          <div class="print-urine">
            <h4>Общий анализ мочи — 211 кабинет</h4>
            <h5>{{ currentEditPatient.fio }} (Цех: {{ currentEditPatient.activeJob.jobDivision }}, Таб: {{
              currentEditPatient.activeJob.jobPersonnelNumber }})</h5>
          </div>
          <br>
          <br>
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
        //* Вредности для последующей работы.
        harms: [],
        //* Вредности для селекта
        harmsForSelect: [],
        //* Пациент, которого редактируем.
        currentEditPatient: {
          activeMedos: {
            medosParameters: {
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
            medosHarms: []
          }
        },
        //* Вредность, которую добавляем.
        currentEditHarm: {},
        //* То, что будем удалять.
        currentRemoveItem: {},
        //* Диалоговое окно добавления параметров.
        editParametersDialog: {
          show: false
        },
        //* Диалоговое окно списка вредностей.
        editHarmsDialog: {
          show: false
        },
        //* Диалоговое окно добавления одной вредности.
        addNewHarmDialog: {
          show: false
        },
        //* Диалоговое окно удаления вредности.
        removeDialog: {
          show: false
        },
        //* Диалоговое окно печати бегунка.
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
        //* Все, что связано с snackBar, который всплывает во время ошибок.
        snackBar: {
          show: false,
          message: '',
          timeout: 10000,
          color: ''
        },
        //* Цвета для данной подсистемы.
        subSystem: {
          primaryColor: 'purple darken-3',
          secondaryColor: 'orange darken-3',
          deleteColor: 'red',
          deleteText: 'red--text',
          snackBarRed: 'red darken-2 white--text',
          snackBarYellow: 'yellow accent-3 black--text',
          snackBarGreen: 'green darken-1 white--text'
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
      //* Методы для диалогового окна параметров.
      openEditParametersDialog (item) {
        this.currentEditPatient = item
        if (!(this.currentEditPatient.activeMedos && this.currentEditPatient.activeMedos.medosParameters)) {
          this.currentEditPatient.activeMedos.medosParameters = {
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
          }
        }
        this.editParametersDialog.show = true
      },
      noEditParametersDialog () {
        this.editParametersDialog.show = false
      },
      yesEditParametersDialog () {
        //* Добавляем вредности в базу данных.
        Axios.put(`${GKP7API}/api/v1/patient/${this.currentEditPatient._id}/parameters/`, {
          medosParameters: this.currentEditPatient.activeMedos.medosParameters
        }, {
          headers: {'Authorization': Authentication.getAuthenticationHeader(this)}
        }).then(({data}) => {
          if (data.success) {
            this.editParametersDialog.show = false
            this.snackBar.color = this.subSystem.snackBarGreen
            this.snackBar.timeout = 2000
          } else {
            this.snackBar.color = this.subSystem.snackBarRed
            this.snackBar.timeout = 5000
          }
          this.snackBar.message = data.message
          this.snackBar.show = true
        }).catch(err => {
          this.errorHandler(err)
        })
      },
      //* Методы для диалогового окна вредностей.
      openEditHarmsDialog (item) {
        this.currentEditPatient = item
        this.editHarmsDialog.show = true
      },
      noEditHarmsDialog () {
        this.editHarmsDialog.show = false
      },
      yesEditHarmsDialog () {
        //* Все вредности в массив.
        let tmpHarms = this.currentEditPatient.activeMedos.medosHarms
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
        if (this.currentEditPatient.sex === false) {
          allTheMustDoctors.push({
            doctorId: 12,
            doctorName: 'Гинеколог',
            doctorRoom: '113 кабинет'
          })
        }
        let patientBirthDate = this.dateToIso(this.currentEditPatient.dateBirth)
        let patientAge = this.calculateAge(patientBirthDate)
        if (patientAge >= 42) {
          allTheMustExams.push({
            examId: 46,
            examName: 'Маммография',
            examRoom: '416 кабинет'
          })
        }
        //* Добавляем всем осмотр терапевта.
        allTheMustDoctors.push({
          doctorId: 1,
          doctorName: 'Цеховый терапевт',
          doctorRoom: '104/105 кабинет'
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
        //* Добавляем вредности, врачей и осмотры в базу данных.
        Axios.put(`${GKP7API}/api/v1/patient/${this.currentEditPatient._id}/harms/`, {
          medosHarms: this.currentEditPatient.activeMedos.medosHarms,
          medosDoctors: {
            mustDoctors: uniqueMustDoctors,
            addonDoctors: uniqueAddonDoctors
          },
          medosExams: {
            mustExams: uniqueMustExams,
            addonExams: uniqueAddonExams
          }
        }, {
          headers: {'Authorization': Authentication.getAuthenticationHeader(this)}
        }).then(({data}) => {
          if (data.success) {
            this.patients.find(patient => patient._id === this.currentEditPatient._id).medosHarms = this.currentEditPatient.activeMedos.medosHarms
            this.patients.find(patient => patient._id === this.currentEditPatient._id).medosDoctors = {
              mustDoctors: uniqueMustDoctors,
              addonDoctors: uniqueAddonDoctors
            }
            this.patients.find(patient => patient._id === this.currentEditPatient._id).medosExams = {
              mustExams: uniqueMustExams,
              addonExams: uniqueAddonExams
            }
            this.currentEditPatient.activeMedos.medosDoctos = {
              mustDoctors: uniqueMustDoctors,
              addonDoctors: uniqueAddonDoctors
            }
            this.currentEditPatient.activeMedos.medosExams = {
              mustExams: uniqueMustExams,
              addonExams: uniqueAddonExams
            }
            this.editHarmsDialog.show = false
            this.snackBar.color = this.subSystem.snackBarGreen
            this.snackBar.timeout = 2000
          } else {
            this.snackBar.color = this.subSystem.snackBarRed
            this.snackBar.timeout = 5000
          }
          this.snackBar.message = data.message
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
        this.currentEditHarm = {}
      },
      yesAddHarmDialog () {
        this.currentEditPatient.activeMedos.medosHarms.push(this.currentEditHarm)
        this.addNewHarmDialog.show = false
        this.currentEditHarm = {}
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
          this.currentEditPatient.activeMedos.medosHarms.forEach((harm, i) => {
            if (harm === this.currentRemoveItem) {
              this.currentEditPatient.activeMedos.medosHarms.splice(i, 1)
            }
          })
        } else {
          this.snackBar.show = true
          this.snackBar.color = this.subSystem.snackBarRed
          this.snackBar.message = 'Не знаю, что удалять.'
        }
        this.removeDialog.show = false
        this.currentRemoveItem = {}
      },
      // * Методы для диалогового окна бегунка.
      openAppointmentsDialog (item) {
        this.currentEditPatient = item
        let tmpHarms = this.currentEditPatient.activeMedos.medosHarms
        let tmpParameters = this.currentEditPatient.activeMedos.medosParameters
        if (tmpHarms.length < 1) {
          this.snackBar = {
            color: this.subSystem.snackBarRed,
            timeout: 5000,
            message: 'Не введены вредности.',
            show: true
          }
        } else if (!tmpParameters) {
          this.snackBar = {
            color: this.subSystem.snackBarRed,
            timeout: 5000,
            message: 'Не введены параметры.',
            show: true
          }
        } else {
          //* Нужно в самом диалоге сменить откуда берется.
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
      //* Запрашиваем список пациентов на медосмотре по введенным ФИО.
      getMedosPatients () {
        let tempQuery = {}
        tempQuery.lastName = (this.patientQuery.lastName === undefined || this.patientQuery.lastName === '') ? ' ' : this.patientQuery.lastName
        tempQuery.firstName = (this.patientQuery.firstName === undefined || this.patientQuery.firstName === '') ? ' ' : this.patientQuery.firstName
        tempQuery.middleName = (this.patientQuery.middleName === undefined || this.patientQuery.middleName === '') ? ' ' : this.patientQuery.middleName
        Axios.get(`${GKP7API}/api/v1/patient/medos/${tempQuery.lastName}/${tempQuery.firstName}/${tempQuery.middleName}/`, {
          headers: {'Authorization': Authentication.getAuthenticationHeader(this)}
        }).then(({data}) => {
          if (data.success) {
            this.snackBar.show = false
            this.patients = data.patients
            this.patients.forEach((patient) => {
              patient.dateBirth = this.dateFromIso(patient.dateBirth)
            })
          } else {
            this.patients = []
            this.snackBar.show = true
            this.snackBar.color = this.subSystem.snackBarYellow
            this.snackBar.message = data.message
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
            this.snackBar.color = this.subSystem.snackBarGreen
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
            this.snackBar.color = this.subSystem.snackBarRed
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
      //* Перевод даты в ISO формат.
      dateToIso (input) {
        //* Переводим дату из формата dd.mm.yyyy в yyyy-mm-dd.
        const inputDate = input
        const pattern = /(\d{2})\.(\d{2})\.(\d{4})/
        return new Date(inputDate.replace(pattern, '$3-$2-$1'))
      },
      //* Сколько лет человеку.
      calculateAge (birthday) { // birthday is a date
        let ageDifMs = Date.now() - birthday.getTime()
        let ageDate = new Date(ageDifMs) // miliseconds from epoch
        return Math.abs(ageDate.getUTCFullYear() - 1970)
      },
      //* Вывод сообщения об ошибке.
      errorHandler (err) {
        const status = err.response.status
        this.snackBar.show = true
        this.snackBar.color = this.subSystem.snackBarRed
        if (status === 401) {
          this.snackBar.message = 'Вы не авторизованы.'
        }
        this.snackBar.message = err.response.data.message
      }
    }
  }
</script>

<style lang="scss" ref="print">
  .router-link-exact-active {
    background-color: #6a1b9a;
    color: white;
    padding: 0 6px;
  }

  .theme--light .input-group input:disabled::placeholder,
  .theme--light .input-group input:disabled {
    color: rgba(245, 127, 23, 0.7) !important;
  }

  .print-blood,
  .print-urine {
    text-align: center
  }

  .print-302 {
    max-width: 300px;
    margin: auto;
    &-header {
      text-align: center;
    }
    &-subheading {
      margin-bottom: 0.5rem;
    }
  }
</style>
