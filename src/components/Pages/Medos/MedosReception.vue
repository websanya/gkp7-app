<template>
  <div class=uwd-container>
    <app-header :subsystem="subSystem.primaryColor" subtitle="Регистратура профосмотра" :currentUser="currentUser">
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
                  <v-text-field @keyup.enter="getPatients" :color="subSystem.primaryColor" label="Фамилия"
                                v-model="patientQuery.lastName" box>
                  </v-text-field>
                </v-flex>
                <v-flex xs12 md4>
                  <v-text-field @keyup.enter="getPatients" :color="subSystem.primaryColor" label="Имя"
                                v-model="patientQuery.firstName" box>
                  </v-text-field>
                </v-flex>
                <v-flex xs12 md4>
                  <v-text-field @keyup.enter="getPatients" :color="subSystem.primaryColor" label="Отчество"
                                v-model="patientQuery.middleName" box>
                  </v-text-field>
                </v-flex>
                <v-flex xs12 md6>
                  <v-btn @click.native="openEditPatientDialog({edit: false})" :color="subSystem.primaryColor" flat dark
                         large block>
                    Добавить пациента
                  </v-btn>
                </v-flex>
                <v-flex xs12 md6>
                  <v-btn @click.native="getPatients" :color="subSystem.primaryColor" dark large block>Найти</v-btn>
                </v-flex>
              </v-layout>
              <v-data-table
                :headers="[
                  {text:'Медосмотр', sortable: false},
                  {text:'ФИО', sortable: false},
                  {text:'Дата рождения', sortable: false},
                  {text:'Пол', sortable: false},
                  {text:'Действия', sortable: false}
                ]"
                v-if="patients.length > 0"
                :items="patients"
                hide-actions
                class="elevation-10 mt-4"
              >
                <template slot="items" slot-scope="props">
                  <tr>
                    <td width="72px">
                      <v-tooltip top :color="subSystem.deleteColor">
                        <v-btn
                          slot="activator"
                          @click.native="openRemoveDialog({remove: 'medos', patient: props.item})"
                          v-if="(props.item.hasActiveMedos)"
                          :color="subSystem.deleteColor"
                          icon
                        >
                          <v-icon color="white">assignment_ind</v-icon>
                        </v-btn>
                        <span>Снять с медосмотра</span>
                      </v-tooltip>
                    </td>
                    <td>{{ props.item.fio }}</td>
                    <td>{{ props.item.dateBirth }}</td>
                    <td>{{ (props.item.sex) ? 'Муж' : 'Жен' }}</td>
                    <td width="211px">
                      <v-tooltip top :color="subSystem.secondaryColor">
                        <v-btn
                          slot="activator"
                          @click.native="openRegisterMedicalExamination(props.item)"
                          :color="subSystem.secondaryColor"
                          icon
                        >
                          <v-icon color="white">assignment_ind</v-icon>
                        </v-btn>
                        <span>Зарегистрировать на проф. осмотр</span>
                      </v-tooltip>
                      <v-tooltip top :color="subSystem.primaryColor">
                        <v-btn
                          slot="activator"
                          @click.native="openEditPatientDialog({edit: true, patient: props.item})"
                          :color="subSystem.primaryColor"
                          icon
                        >
                          <v-icon color="white">edit</v-icon>
                        </v-btn>
                        <span>Редактировать данные пациента</span>
                      </v-tooltip>
                      <v-tooltip top :color="subSystem.deleteColor">
                        <v-btn
                          slot="activator"
                          @click.native="openRemoveDialog({remove: 'patient', patient: props.item})"
                          :color="subSystem.deleteColor"
                          icon
                        >
                          <v-icon color="white">delete</v-icon>
                        </v-btn>
                        <span>Удалить пациента</span>
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

    <!-- Диалог добавления/редактирования пациента -->
    <v-dialog v-model="editPatientDialog.show" persistent max-width="800px">
      <v-card>
        <v-card-title v-if="!editPatientDialog.edit">
          <span class="headline">
            Добавить нового пациента
          </span>
        </v-card-title>
        <v-card-title v-if="editPatientDialog.edit">
          <span class="headline">
            Редактировать <span class="green--text text--darken-2">{{ currentEditPatient.fio }}</span>
          </span>
        </v-card-title>
        <v-card-text>
          <v-container grid-list-md>
            <v-layout row wrap>
              <v-flex sm12 md6>
                <v-text-field
                  label="ФИО"
                  :color="subSystem.primaryColor"
                  v-model="currentEditPatient.fio"
                >
                </v-text-field>
              </v-flex>
              <v-flex sm12 md3>
                <v-text-field
                  mask="#### ######"
                  return-masked-value
                  label="Паспорт"
                  :color="subSystem.primaryColor"
                  placeholder="xxxx xxxxxx"
                  v-model="currentEditPatient.passport"
                >
                </v-text-field>
              </v-flex>
              <v-flex sm12 md3>
                <v-text-field
                  mask="+7 (###) ###-##-##"
                  return-masked-value
                  label="Телефон"
                  :color="subSystem.primaryColor"
                  placeholder="+7 (xxx) xxx-xx-xx"
                  v-model="currentEditPatient.phone"
                >
                </v-text-field>
              </v-flex>
            </v-layout>
            <v-layout row wrap>
              <v-flex sm12>
                <v-text-field
                  label="Адрес"
                  :color="subSystem.primaryColor"
                  v-model="currentEditPatient.address"
                >
                </v-text-field>
              </v-flex>
            </v-layout>
            <v-layout row wrap>
              <v-flex sm12 md3>
                <v-text-field
                  mask="##.##.####"
                  return-masked-value
                  label="Дата рождения"
                  placeholder="xx.xx.xxxx"
                  :color="subSystem.primaryColor"
                  v-model="currentEditPatient.dateBirth"
                >
                </v-text-field>
              </v-flex>
              <v-flex sm12 md2>
                <v-select
                  :items="[{'text':'Муж','value':true},{'text':'Жен','value':false}]"
                  label="Пол"
                  autocomplete
                  :color="subSystem.primaryColor"
                  placeholder="Муж/Жен"
                  v-model="currentEditPatient.sex"
                >
                </v-select>
              </v-flex>
              <v-flex sm12 md6 v-if="currentEditPatient.activeJob && currentEditPatient.activeJob.jobName">
                <v-text-field
                  label="Место работы"
                  :color="subSystem.primaryColor"
                  v-model="currentEditPatient.activeJob.jobName"
                  disabled
                >
                </v-text-field>
              </v-flex>
              <v-flex sm12 md1 v-if="currentEditPatient.activeJob && currentEditPatient.activeJob.jobName">
                <v-btn
                  @click.native="openRemoveDialog({remove: 'job'})" :color="subSystem.deleteColor" icon
                >
                  <v-icon color="white">delete</v-icon>
                </v-btn>
              </v-flex>
              <v-flex sm12 md7 v-if="!(currentEditPatient.activeJob && currentEditPatient.activeJob.jobName)">
                <v-text-field
                  label="Место работы"
                  placeholder="Нажмите кнопку «Работа»"
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
          <v-btn :color="subSystem.primaryColor" flat @click.native="noEditPatientDialog">Закрыть</v-btn>
          <v-tooltip top v-if="currentEditPatient.activeJob">
            <v-btn
              slot="activator"
              :color="subSystem.secondaryColor"
              class="white--text"
              @click.native="openEditJobDialog({edit: true})">Работа
            </v-btn>
            <span>Редактировать работу</span>
          </v-tooltip>
          <v-tooltip top v-if="! currentEditPatient.activeJob">
            <v-btn
              slot="activator"
              :color="subSystem.secondaryColor"
              class="white--text"
              @click.native="openEditJobDialog({edit: false})">Работа
            </v-btn>
            <span>Добавить работу</span>
          </v-tooltip>
          <v-btn :color="subSystem.primaryColor" class="white--text" @click.native="yesEditPatientDialog">Сохранить
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <!-- / Диалог добавления/редактирования пациента -->

    <!-- Диалог добавления/редактирования работы -->
    <v-dialog v-model="editJobDialog.show" persistent max-width="700px">
      <v-card>
        <v-card-title>
          <span class="headline">
            {{(editJobDialog.edit) ? 'Редактировать' : 'Добавить' }} место работы для пациента <br/>
            <span class="green--text text--darken-2">{{ currentEditPatient.fio }}</span>
          </span>
        </v-card-title>
        <v-card-text>
          <v-container grid-list-md v-if="currentEditPatient.activeJob">
            <v-layout row wrap>
              <v-flex sm12 md6>
                <v-select
                  :items="companiesForSelect"
                  label="Предприятие"
                  :color="subSystem.primaryColor"
                  v-model="currentEditPatient.activeJob.jobCompany"
                  @blur="updateCompanyDivisions"
                  no-data-text="Предприятие не найдено"
                  autocomplete
                >
                </v-select>
              </v-flex>
              <v-flex sm12 md6>
                <v-select
                  :items="currentCompanyDivisions"
                  label="Цех"
                  :color="subSystem.primaryColor"
                  v-model="currentEditPatient.activeJob.jobDivision"
                  no-data-text="Цех не найден"
                  autocomplete
                >
                </v-select>
              </v-flex>
            </v-layout>
            <v-layout row wrap>
              <v-flex sm12 md8>
                <v-text-field
                  label="Должность"
                  :color="subSystem.primaryColor"
                  v-model="currentEditPatient.activeJob.jobName"
                >
                </v-text-field>
              </v-flex>
              <v-flex sm12 md4>
                <v-text-field
                  label="Табельный"
                  :color="subSystem.primaryColor"
                  v-model="currentEditPatient.activeJob.jobPersonnelNumber"
                >
                </v-text-field>
              </v-flex>
            </v-layout>
          </v-container>
        </v-card-text>
        <v-card-actions>
          <v-spacer>
          </v-spacer>
          <v-btn :color="subSystem.primaryColor" flat @click.native="noEditJobDialog">Закрыть</v-btn>
          <v-btn :color="subSystem.primaryColor" class="white--text" @click.native="yesEditJobDialog">Сохранить
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <!-- / Диалог редактирования работы -->

    <!-- Диалог поставноки на медосмотр -->
    <v-dialog v-model="editMedosDialog.show" persistent max-width="500px">
      <v-card>
        <v-card-title>
          <span class="headline">Зарегистрировать <span
            class="green--text text--darken-2">{{ currentEditPatient.fio }}</span> на мед. осмотр?</span>
        </v-card-title>
        <v-card-text>
          <v-container grid-list-md>
            <v-layout row wrap>
              <v-flex sm12 md12 v-if="currentEditPatient.activeMedos">
                <v-select
                  :items="medosTypes"
                  label="Тип мед. осмотра"
                  autocomplete
                  :color="subSystem.primaryColor"
                  v-model="currentEditPatient.activeMedos.medosType"
                >
                </v-select>
              </v-flex>
            </v-layout>
          </v-container>
        </v-card-text>
        <v-card-actions>
          <v-spacer>
          </v-spacer>
          <v-btn :color="subSystem.primaryColor" flat @click.native="noRegisterMedicalExamination">Закрыть</v-btn>
          <v-btn :color="subSystem.primaryColor" class="white--text" @click.native="yesRegisterMedicalExamination">
            Зарегистрировать
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <!-- / Диалог поставноки на проф. осмотр -->

    <!-- Диалог удаления пациента/работы/медосмотра -->
    <v-dialog v-model="removeDialog.show" persistent max-width="500px">
      <v-card>
        <v-card-title v-if="removeDialog.remove === 'job'">
          <span class="headline">
            Вы точно хотите удалить место работы<br>
            «<span :class="subSystem.deleteText">{{ currentEditPatient.activeJob.jobName }}</span>»?
          </span>
        </v-card-title>
        <v-card-title v-if="removeDialog.remove === 'patient'">
          <span class="headline">
            Вы точно хотите удалить пациента<br>
            «<span :class="subSystem.deleteText">{{ currentEditPatient.fio }}</span>»?
          </span>
        </v-card-title>
        <v-card-title v-if="removeDialog.remove === 'medos'">
          <span class="headline">
            Вы точно хотите снять с медосмотра пациента<br>
            «<span :class="subSystem.deleteText">{{ currentEditPatient.fio }}</span>»?
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
    <!-- / Диалог удаления пациента/работы -->
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
        //* Все предприятия, которые есть в системе на момент открытия.
        companies: [],
        //* Только предприятия селекта.
        companiesForSelect: [],
        //* Только цеха в выбранном предприятии.
        currentCompanyDivisions: [],
        //* Пациент, которого мы редактируем.
        currentEditPatient: {
          fio: '',
          dateBirth: '',
          sex: '',
          passport: '',
          phone: '',
          address: '',
          activeJob: {
            jobCompany: '',
            jobDivision: '',
            jobName: '',
            jobPersonnelNumber: ''
          },
          hasActiveMedos: false,
          activeMedos: {
            medosType: '',
            medosJob: {
              jobCompany: '',
              jobDivision: '',
              jobName: '',
              jobPersonnelNumber: ''
            }
          }
        },
        //* Диалоговое окно добавления/редактирования пациента.
        editPatientDialog: {
          show: false,
          edit: false
        },
        //* Диалоговое окно добавления/редактирования места работы.
        editJobDialog: {
          show: false,
          edit: false
        },
        //* Диалоговое окно поставноки на проф. осмотр.
        editMedosDialog: {
          show: false
        },
        //* Диалоговое окно удаления пациента.
        removeDialog: {
          show: false,
          remove: ''
        },
        //* Все типы мед. осмотра.
        medosTypes: [
          {
            value: 1,
            text: '1 - поступление на работу'
          },
          {
            value: 2,
            text: '2 - периодический проф. осмотр'
          },
          {
            value: 3,
            text: '3 - перевод из цеха в цех'
          },
          {
            value: 5,
            text: '5 - по санитарной книжке'
          },
          {
            value: 6,
            text: '6 - водительская мед. комиссия'
          },
          {
            value: 7,
            text: '7 - поступление в учебное заведение'
          },
          {
            value: 8,
            text: '8 - осмотр на ношение оружия'
          }
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
          primaryColor: 'light-blue darken-4',
          secondaryColor: 'yellow darken-4',
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
      //* Подгружаем все предприятия из базы данных.
      this.getAllCompanies()
    },
    methods: {
      //* Методы для диалога добавления/редактирования пациента.
      openEditPatientDialog (obj) {
        if (obj.edit) {
          this.currentEditPatient = obj.patient
          this.editPatientDialog.edit = true
        }
        this.editPatientDialog.show = true
      },
      noEditPatientDialog () {
        this.currentEditPatient = {}
        this.editPatientDialog = {
          show: false,
          edit: false
        }
      },
      yesEditPatientDialog () {
        let tempPatient = this.currentEditPatient
        tempPatient.updatedBy = this.currentUser._id
        if (this.editPatientDialog.edit) {
          //* Редактируем пациента в базе данных.
          Axios.put(`${GKP7API}/api/v1/patient/${this.currentEditPatient._id}/`, {
            editPatient: tempPatient
          }, {
            headers: {'Authorization': Authentication.getAuthenticationHeader(this)}
          }).then(({data}) => {
            if (data.success) {
              this.editPatientDialog.show = false
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
        } else {
          //* Добавляем пациента в базу данных.
          Axios.post(`${GKP7API}/api/v1/patient/`, {
            editPatient: tempPatient
          }, {
            headers: {'Authorization': Authentication.getAuthenticationHeader(this)}
          }).then(({data}) => {
            if (data.success) {
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
        }
        this.currentEditPatient = {}
        this.editPatientDialog = {
          show: false,
          edit: false
        }
      },
      //* Методы для диалога добавления/редактирования места работы.
      openEditJobDialog (obj) {
        if (obj.edit) {
          this.updateCompanyDivisions()
        } else {
          this.currentEditPatient.activeJob = {
            jobCompany: '',
            jobDivision: '',
            jobName: '',
            jobPersonnelNumber: ''
          }
        }
        this.editJobDialog.show = true
      },
      noEditJobDialog () {
        this.editJobDialog.show = false
      },
      yesEditJobDialog () {
        this.currentEditPatient.activeJob.updatedBy = this.currentUser._id
        this.editJobDialog.show = false
      },
      //* Методы для диалога удаления.
      openRemoveDialog (obj) {
        switch (obj.remove) {
          case 'patient':
          case 'medos':
            this.currentEditPatient = obj.patient
            break
        }
        this.removeDialog = {
          show: true,
          remove: obj.remove
        }
      },
      noRemoveDialog () {
        this.removeDialog = {
          show: false,
          remove: ''
        }
      },
      yesRemoveDialog () {
        switch (this.removeDialog.remove) {
          case 'patient':
            this.patients.forEach((patient, i) => {
              if (patient === this.currentEditPatient) {
                //* Удаляем пациента из базы данных.
                Axios.delete(`${GKP7API}/api/v1/patient/${this.currentEditPatient._id}/`, {
                  headers: {'Authorization': Authentication.getAuthenticationHeader(this)}
                }).then(({data}) => {
                  if (data.success) {
                    //* Удаляем пациента из списка на фронтенде.
                    this.patients.splice(i, 1)
                    this.snackBar.color = this.subSystem.snackBarGreen
                    this.snackBar.timeout = 1000
                  } else {
                    this.snackBar.color = this.subSystem.snackBarRed
                    this.snackBar.timeout = 5000
                  }
                  this.snackBar.show = true
                  this.snackBar.message = data.message
                }).catch(err => {
                  this.errorHandler(err)
                })
              }
            })
            break
          case 'medos':
            this.patients.forEach((patient, i) => {
              if (patient === this.currentEditPatient) {
                //* Удаляем пациента из базы данных.
                Axios.delete(`${GKP7API}/api/v1/patient/${this.currentEditPatient._id}/medos/`, {
                  headers: {'Authorization': Authentication.getAuthenticationHeader(this)}
                }).then(({data}) => {
                  if (data.success) {
                    //* Удаляем медосмотр на фронтенде.
                    data.patient.dateBirth = this.dateFromIso(data.patient.dateBirth)
                    this.$set(this.patients, i, data.patient)
                    this.currentEditPatient = {}
                    this.snackBar.color = this.subSystem.snackBarGreen
                    this.snackBar.timeout = 1000
                  } else {
                    this.snackBar.color = this.subSystem.snackBarRed
                    this.snackBar.timeout = 5000
                  }
                  this.snackBar.show = true
                  this.snackBar.message = data.message
                }).catch(err => {
                  this.errorHandler(err)
                })
              }
            })
            break
          case 'job':
            delete this.currentEditPatient.activeJob
            break
          default:
            this.snackBar.show = true
            this.snackBar.color = this.subSystem.snackBarRed
            this.snackBar.message = 'Не знаю, что удалять.'
            break
        }
        this.removeDialog = {
          show: false,
          remove: ''
        }
      },
      //* Методы для диалога постановки на мед. осмотр.
      openRegisterMedicalExamination (item) {
        if (item.activeJob === undefined) {
          this.snackBar.show = true
          this.snackBar.color = this.subSystem.snackBarRed
          this.snackBar.message = 'У пациента не указано место работы'
          this.snackBar.timeout = 5000
        } else {
          this.currentEditPatient = item
          if (!this.currentEditPatient.activeMedos) {
            this.currentEditPatient.activeMedos = {
              medosType: '',
              medosJob: this.currentEditPatient.activeJob
            }
          }
          this.editMedosDialog.show = true
        }
      },
      noRegisterMedicalExamination () {
        this.currentEditPatient = {}
        this.editMedosDialog.show = false
      },
      yesRegisterMedicalExamination () {
        this.currentEditPatient.activeMedos.updatedBy = this.currentUser._id
        //* Регистрируем медосмотр для выбранного пациента.
        Axios.post(`${GKP7API}/api/v1/patient/${this.currentEditPatient._id}/medos/`, {
          activeMedos: this.currentEditPatient.activeMedos
        }, {
          headers: {'Authorization': Authentication.getAuthenticationHeader(this)}
        }).then(({data}) => {
          if (data.success) {
            this.patients.forEach((patient, i) => {
              if (patient === this.currentEditPatient) {
                //* Добавляем значок медосмотра на фронтенд.
                data.patient.dateBirth = this.dateFromIso(data.patient.dateBirth)
                this.$set(this.patients, i, data.patient)
                this.currentEditPatient = {}
                this.editMedosDialog.show = false
              }
            })
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
      //* Работа с обновлением селектов в предприятиях.
      updateCompanyDivisions () {
        if (this.currentEditPatient.activeJob.jobCompany !== undefined) {
          let certainCompany = this.companies.find(
            company => company.companyId === this.currentEditPatient.activeJob.jobCompany
          )
          if (certainCompany !== undefined) {
            this.currentCompanyDivisions = certainCompany.companyDivisions.map(
              division => ({
                value: division.divisionId,
                text: division.divisionId + ' - ' + division.divisionName
              })
            )
          }
        }
        this.currentCompanyDivisions.sort(function (a, b) {
          if (a.value < b.value) return -1
          if (a.value > b.value) return 1
          return 0
        })
      },
      //* Запрашиваем список пациентов по введенным ФИО.
      getPatients () {
        let tempQuery = {}
        tempQuery.lastName = (this.patientQuery.lastName === undefined || this.patientQuery.lastName === '') ? ' ' : this.patientQuery.lastName
        tempQuery.firstName = (this.patientQuery.firstName === undefined || this.patientQuery.firstName === '') ? ' ' : this.patientQuery.firstName
        tempQuery.middleName = (this.patientQuery.middleName === undefined || this.patientQuery.middleName === '') ? ' ' : this.patientQuery.middleName
        Axios.get(`${GKP7API}/api/v1/patient/${tempQuery.lastName}/${tempQuery.firstName}/${tempQuery.middleName}/`, {
          headers: {'Authorization': Authentication.getAuthenticationHeader(this)}
        }).then(({data}) => {
          if (data.success) {
            this.snackBar.show = false
            this.patients = data.patients
            this.patients.forEach((item) => {
              item.dateBirth = this.dateFromIso(item.dateBirth)
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
      //* Подгружаем все компании для последующей работы.
      getAllCompanies () {
        Axios.get(`${GKP7API}/api/v1/companies`, {
          headers: {'Authorization': Authentication.getAuthenticationHeader(this)}
        }).then(({data}) => {
          if (data.success === true) {
            this.companies = data.companies
            this.snackBar.show = true
            this.snackBar.color = this.subSystem.snackBarGreen
            this.snackBar.message = 'Компании загружены'
            this.snackBar.timeout = 1000
            //* Выберем только для предприятия для селекта.
            this.companiesForSelect = this.companies.map(
              company => ({
                value: company.companyId,
                text: company.companyId + ' - ' + company.companyName
              })
            )
          } else {
            this.snackBar.show = true
            this.snackBar.color = this.subSystem.snackBarRed
            this.snackBar.message = 'Компаний не найдено'
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

<style lang="scss">
  .router-link-exact-active {
    background-color: #01579b;
    color: white;
    padding: 0 6px;
  }

  .theme--light .input-group input:disabled::placeholder,
  .theme--light .input-group input:disabled {
    color: rgba(245, 127, 23, 0.7) !important;
  }
</style>
