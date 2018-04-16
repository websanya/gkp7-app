<template>
  <div>
    <app-header :subsystem="subSystem.primaryColor" subtitle="Регистратура профосмотра">
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
                <v-flex xs12 md6>
                  <v-btn @click.native="openAddPatientDialog" :color="subSystem.primaryColor" flat dark large block>
                    Добавить
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
                    <td width="72px">
                      <v-icon
                          v-if="(props.item.hasActiveMedos)"
                          :color="subSystem.secondaryColor">
                        assignment_ind
                      </v-icon>
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
                            @click.native="openEditPatientDialog(props.item)"
                            :color="subSystem.primaryColor"
                            icon
                        >
                          <v-icon color="white">edit</v-icon>
                        </v-btn>
                        <span>Редактировать данные пациента</span>
                      </v-tooltip>
                      <v-tooltip top color="red darken-2">
                        <v-btn
                            slot="activator"
                            @click.native="openRemoveDialog(props.item)"
                            color="red darken-2"
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
    <app-footer :subsystem="subSystem.primaryColor" :currentUser="currentUser.fio">
    </app-footer>

    <v-snackbar :timeout="snackBar.timeout"
                right="right"
                :color="snackBar.color"
                v-model="snackBar.show">
      {{ snackBar.message }}
    </v-snackbar>

    <!-- Диалог добавления пациента -->
    <v-dialog v-model="addPatientDialog.show" persistent max-width="600px">
      <v-card>
        <v-card-title>
          <span class="headline">Добавить нового пациента</span>
        </v-card-title>
        <v-card-text>
          <v-container grid-list-md>
            <v-layout row wrap>
              <v-flex sm12 md6>
                <v-text-field
                    label="ФИО"
                    :color="subSystem.primaryColor"
                    v-model="currentAddPatient.fio"
                >
                </v-text-field>
              </v-flex>
              <v-flex sm12 md3>
                <v-text-field
                    label="Паспорт"
                    :color="subSystem.primaryColor"
                    v-model="currentAddPatient.passport"
                >
                </v-text-field>
              </v-flex>
              <v-flex sm12 md3>
                <v-text-field
                    label="Телефон"
                    :color="subSystem.primaryColor"
                    v-model="currentAddPatient.phone"
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
                    :color="subSystem.primaryColor"
                    v-model="currentAddPatient.dateBirth"
                >
                </v-text-field>
              </v-flex>
              <v-flex sm12 md2>
                <v-select
                    :items="[{'text':'Муж','value':true},{'text':'Жен','value':false}]"
                    label="Пол"
                    autocomplete
                    :color="subSystem.primaryColor"
                    v-model="currentAddPatient.sex"
                >
                </v-select>
              </v-flex>
              <v-flex sm12 md7 v-if="currentAddPatient.activeJob">
                <v-text-field
                    label="Место работы"
                    placeholder="Нажмите кнопку «Работа»"
                    :color="subSystem.primaryColor"
                    v-model="currentAddPatient.activeJob.jobName"
                    disabled
                >
                </v-text-field>
              </v-flex>
              <v-flex sm12 md7 v-if="! currentAddPatient.activeJob">
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
          <v-btn :color="subSystem.primaryColor" flat @click.native="closeAddPatientDialog">Закрыть</v-btn>
          <v-btn :color="subSystem.secondaryColor" class="white--text" @click.native="openAddJobDialog">Работа</v-btn>
          <v-btn :color="subSystem.primaryColor" class="white--text" @click.native="saveAddPatientDialog">Сохранить
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <!-- / Диалог добавления пациента -->

    <!-- Диалог добавления работы -->
    <v-dialog v-model="addJobDialog.show" persistent max-width="800px">
      <v-card>
        <v-card-title>
          <span class="headline">Добавить место работы для пациента <br/><span
              class="green--text text--darken-2">{{ currentAddPatient.fio }}</span>
          </span>
        </v-card-title>
        <v-card-text>
          <v-container grid-list-md>
            <v-layout row wrap>
              <v-flex sm12 md6>
                <v-select
                    :items="companiesForSelect"
                    label="Предприятие"
                    :color="subSystem.primaryColor"
                    v-model="currentAddJob.jobCompany"
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
                    v-model="currentAddJob.jobDivision"
                    @blur="updateDivisionDepartments"
                    no-data-text="Цех не найден"
                    autocomplete
                >
                </v-select>
              </v-flex>
              <v-flex sm12 md6>
                <v-select
                    :items="currentDivisionDepartments"
                    label="Участок"
                    :color="subSystem.primaryColor"
                    v-model="currentAddJob.jobDepartment"
                    no-data-text="Участок не найден"
                    autocomplete
                >
                </v-select>
              </v-flex>
              <v-flex sm12 md4>
                <v-text-field
                    label="Должность"
                    :color="subSystem.primaryColor"
                    v-model="currentAddJob.jobName"
                >
                </v-text-field>
              </v-flex>
              <v-flex sm12 md2>
                <v-text-field
                    label="Табельный"
                    :color="subSystem.primaryColor"
                    v-model="currentAddJob.jobPersonnelNumber"
                >
                </v-text-field>
              </v-flex>
            </v-layout>
          </v-container>
        </v-card-text>
        <v-card-actions>
          <v-spacer>
          </v-spacer>
          <v-btn :color="subSystem.primaryColor" flat @click.native="closeAddJobDialog">Закрыть</v-btn>
          <v-btn :color="subSystem.primaryColor" class="white--text" @click.native="saveAddJobDialog">Добавить
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <!-- / Диалог добавления работы -->

    <!-- Диалог редактирования пациента -->
    <v-dialog v-model="editPatientDialog.show" persistent max-width="600px">
      <v-card>
        <v-card-title>
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
                    label="Паспорт"
                    :color="subSystem.primaryColor"
                    v-model="currentEditPatient.passport"
                >
                </v-text-field>
              </v-flex>
              <v-flex sm12 md3>
                <v-text-field
                    label="Телефон"
                    :color="subSystem.primaryColor"
                    v-model="currentEditPatient.phone"
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
                    v-model="currentEditPatient.sex"
                >
                </v-select>
              </v-flex>
              <v-flex sm12 md6 v-if="currentEditPatient.activeJob">
                <v-text-field
                    label="Место работы"
                    placeholder="Нажмите кнопку «Работа»"
                    :color="subSystem.primaryColor"
                    v-model="currentEditPatient.activeJob.jobName"
                    disabled
                >
                </v-text-field>
              </v-flex>
              <v-flex sm12 md1 v-if="currentEditPatient.activeJob">
                <v-btn @click.native="openRemoveDialog(currentEditPatient.activeJob)" color="red darken-2" icon>
                  <v-icon color="white">delete</v-icon>
                </v-btn>
              </v-flex>
              <v-flex sm12 md7 v-if="! currentEditPatient.activeJob">
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
                @click.native="openEditJobDialog">Работа
            </v-btn>
            <span>Добавить работу</span>
          </v-tooltip>
          <v-tooltip top v-if="! currentEditPatient.activeJob">
            <v-btn
                slot="activator"
                :color="subSystem.secondaryColor"
                class="white--text"
                @click.native="openAddJobDialog">Работа
            </v-btn>
            <span>Редактировать работу</span>
          </v-tooltip>
          <v-btn :color="subSystem.primaryColor" class="white--text" @click.native="yesEditPatientDialog">Сохранить
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <!-- / Диалог редактирования пациента -->

    <!-- Диалог редактирования работы -->
    <v-dialog v-model="editJobDialog.show" persistent max-width="700px">
      <v-card>
        <v-card-title>
          <span class="headline">Редактировать место работы для пациента <br/><span
              class="green--text text--darken-2">{{ currentEditPatient.fio }}</span>
          </span>
        </v-card-title>
        <v-card-text>
          <v-container grid-list-md>
            <v-layout row wrap>
              <v-flex sm12 md6>
                <v-select
                    :items="companiesForSelect"
                    label="Предприятие"
                    :color="subSystem.primaryColor"
                    v-model="currentEditJob.jobCompany"
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
                    v-model="currentEditJob.jobDivision"
                    @blur="updateDivisionDepartments"
                    no-data-text="Цех не найден"
                    autocomplete
                >
                </v-select>
              </v-flex>
            </v-layout>
            <v-layout row wrap>
              <v-flex sm12 md6>
                <v-select
                    :items="currentDivisionDepartments"
                    label="Участок"
                    :color="subSystem.primaryColor"
                    v-model="currentEditJob.jobDepartment"
                    no-data-text="Участок не найден"
                    autocomplete
                >
                </v-select>
              </v-flex>
              <v-flex sm12 md4>
                <v-text-field
                    label="Должность"
                    :color="subSystem.primaryColor"
                    v-model="currentEditJob.jobName"
                >
                </v-text-field>
              </v-flex>
              <v-flex sm12 md2>
                <v-text-field
                    label="Табельный"
                    :color="subSystem.primaryColor"
                    v-model="currentEditJob.jobPersonnelNumber"
                >
                </v-text-field>
              </v-flex>
            </v-layout>
          </v-container>
        </v-card-text>
        <v-card-actions>
          <v-spacer>
          </v-spacer>
          <v-btn :color="subSystem.primaryColor" flat @click.native="closeEditJobDialog">Закрыть</v-btn>
          <v-btn :color="subSystem.primaryColor" class="white--text" @click.native="saveEditJobDialog">Сохранить
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <!-- / Диалог редактирования работы -->

    <!-- Диалог удаления пациента/работы -->
    <v-dialog v-model="removeDialog.show" persistent max-width="800px">
      <v-card>
        <v-card-title v-if="currentRemoveItem.jobName">
          <span class="headline">
            Вы точно хотите удалить место работы <span class="red--text text--darken-2">«{{ currentRemoveItem.jobName }}»</span>
          </span>
        </v-card-title>
        <v-card-title v-if="currentRemoveItem.fio">
          <span class="headline">
            Вы точно хотите удалить <span class="red--text text--darken-2">«{{ currentRemoveItem.fio }}»</span>
          </span>
        </v-card-title>
        <v-card-actions>
          <v-spacer>
          </v-spacer>
          <v-btn :color="subSystem.secondaryColor" flat @click.native="noRemoveDialog">Нет</v-btn>
          <v-btn color="red darken-2" class="white--text" @click.native="yesRemoveDialog">Да</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <!-- / Диалог удаления пациента/работы -->

    <!-- Диалог поставноки на проф. осмотр -->
    <v-dialog v-model="addMedosDialog.show" persistent max-width="500px">
      <v-card>
        <v-card-title>
          <span class="headline">Зарегистрировать <span
              class="green--text text--darken-2">{{ currentEditPatient.fio }}</span> на мед. осмотр?</span>
        </v-card-title>
        <v-card-text>
          <v-container grid-list-md>
            <v-layout row wrap>
              <v-flex sm12 md12>
                <v-select
                    :items="medosTypes"
                    label="Тип мед. осмотра"
                    autocomplete
                    :color="subSystem.primaryColor"
                    v-model="currentMedos.medosType"
                >
                </v-select>
              </v-flex>
            </v-layout>
          </v-container>
        </v-card-text>
        <v-card-actions>
          <v-spacer>
          </v-spacer>
          <v-btn :color="subSystem.primaryColor" flat @click.native="closeRegisterMedicalExamination">Закрыть</v-btn>
          <v-btn :color="subSystem.primaryColor" class="white--text" @click.native="saveRegisterMedicalExamination">
            Зарегистрировать
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <!-- / Диалог поставноки на проф. осмотр -->
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
        //* Все предприятия, которые есть в системе на момент открытия.
        companies: [],
        //* Все типы мед. осмотра.
        medosTypes: [
          {
            value: {
              typeId: 1,
              typeName: 'поступление на работу'
            },
            text: '1 - поступление на работу'
          },
          {
            value: {
              typeId: 2,
              typeName: 'периодический проф. осмотр'
            },
            text: '2 - периодический проф. осмотр'
          },
          {
            value: {
              typeId: 3,
              typeName: 'перевод из цеха в цех'
            },
            text: '3 - перевод из цеха в цех'
          },
          {
            value: {
              typeId: 5,
              typeName: 'по санитарной книжке'
            },
            text: '5 - по санитарной книжке'
          },
          {
            value: {
              typeId: 6,
              typeName: 'водительская мед. комиссия'
            },
            text: '6 - водительская мед. комиссия'
          },
          {
            value: {
              typeId: 7,
              typeName: 'поступление в учебное заведение'
            },
            text: '7 - поступление в учебное заведение'
          },
          {
            value: {
              typeId: 8,
              typeName: 'осмотр на ношение оружия'
            },
            text: '8 - осмотр на ношение оружия'
          }
        ],
        //* Для селекта.
        companiesForSelect: [],
        //* Пациент, которого мы редактируем.
        currentEditPatient: {},
        //* Пациент, которого мы добавляем.
        currentAddPatient: {},
        //* Место работы, которое добавляем
        currentAddJob: {},
        //* Место работы, которое будем редактировать.
        currentEditJob: {},
        //* То, что будем удалять.
        currentRemoveItem: {},
        //* Медоссмотр, который мы добавляем.
        currentMedos: {},
        //* Запрос на пациентам по ФИО, подгружается в начальном окне.
        patientQuery: {},
        //* Подгруженные пациенты после запроса по ФИО.
        patients: [],
        //* Все, что связано с диалогом добавления пациента.
        addPatientDialog: {
          show: false
        },
        //* Все, что связано с диалогом добавления места работы.
        addJobDialog: {
          show: false
        },
        //* Все, что связано с диалогом редактирования места работы.
        editJobDialog: {
          show: false
        },
        //* Массив для цехов в выбранном предприятии.
        currentCompanyDivisions: [],
        //* Массив для участков в выбранном цеху.
        currentDivisionDepartments: [],
        //* Все, что связано с диалогом редактирования пациента.
        editPatientDialog: {
          show: false
        },
        //* Все, что связано с диалогом удаления пациента.
        removeDialog: {
          show: false
        },
        //* Все, что связано с диалогом поставноки на проф. осмотр.
        addMedosDialog: {
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
      //* Подгружаем пользователя, который осуществил вход.
      this.getCurrentUser()
      //* Подгружаем все предприятия из базы данных.
      this.getAllCompanies()
    },
    methods: {
      //* Методы для диалога добавления пациента.
      openAddPatientDialog () {
        this.addPatientDialog.show = true
      },
      closeAddPatientDialog () {
        this.addPatientDialog.show = false
      },
      saveAddPatientDialog () {
        let tempPatient = {
          'fio': this.currentAddPatient.fio,
          'dateBirth': this.currentAddPatient.dateBirth,
          'sex': this.currentAddPatient.sex,
          'passport': this.currentAddPatient.passport,
          'phone': this.currentAddPatient.phone,
          'updatedBy': this.currentUser._id
        }
        if (this.currentAddPatient.activeJob) {
          tempPatient.activeJob = this.currentAddPatient.activeJob
        }
        //* Добавляем пациента в базу данных.
        Axios.post(`${GKP7API}/api/v1/patient/`, tempPatient, {
          headers: {'Authorization': Authentication.getAuthenticationHeader(this)}
        }).then(res => {
          if (res.data.success) {
            this.currentAddPatient = {}
            this.currentAddJob = {}
            this.addPatientDialog.show = false
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
      //* Методы для диалога добавления места работы к пациенту.
      openAddJobDialog () {
        this.addJobDialog.show = true
      },
      closeAddJobDialog () {
        this.addJobDialog.show = false
      },
      saveAddJobDialog () {
        this.addJobDialog.show = false
        let tempJob = this.currentAddJob
        tempJob.updatedBy = this.currentUser._id
        this.currentAddPatient.activeJob = tempJob
      },
      //* Методы для диалога редактирования пациента.
      openEditPatientDialog (item) {
        this.currentEditPatient = item
        this.editPatientDialog.show = true
      },
      noEditPatientDialog () {
        this.currentEditPatient = {}
        this.editPatientDialog.show = false
      },
      yesEditPatientDialog () {
        let tempPatient = {
          'fio': this.currentEditPatient.fio,
          'dateBirth': this.currentEditPatient.dateBirth,
          'sex': this.currentEditPatient.sex,
          'passport': this.currentEditPatient.passport,
          'phone': this.currentEditPatient.phone,
          'activeJob': this.currentEditPatient.activeJob,
          'updatedBy': this.currentUser._id
        }
        //* Добавляем пациента в базу данных.
        Axios.put(`${GKP7API}/api/v1/patient/${this.currentEditPatient._id}/`, tempPatient, {
          headers: {'Authorization': Authentication.getAuthenticationHeader(this)}
        }).then(res => {
          if (res.data.success) {
            this.currentEditPatient = {}
            this.editPatientDialog.show = false
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
      //* Методы для диалога редактирования места работы к пациенту.
      openEditJobDialog () {
        this.currentEditJob.jobCompany = {}
        this.currentEditJob.jobCompany.jobCompanyId = this.currentEditPatient.activeJob.jobCompany.jobCompanyId
        this.currentEditJob.jobCompany.jobCompanyName = this.currentEditPatient.activeJob.jobCompany.jobCompanyName
        this.editJobDialog.show = true
        this.updateCompanyDivisions()
        this.updateDivisionDepartments()
      },
      closeEditJobDialog () {
        this.editJobDialog.show = false
      },
      saveEditJobDialog () {
        this.editJobDialog.show = false
        let tempJob = this.currentEditJob
        tempJob.updatedBy = this.currentUser._id
        this.currentEditPatient.activeJob = tempJob
      },
      //* Методы для диалога удаления.
      openRemoveDialog (item) {
        this.currentRemoveItem = item
        this.removeDialog.show = true
      },
      noRemoveDialog () {
        this.removeDialog.show = false
        this.currentRemoveItem = {}
      },
      yesRemoveDialog () {
        if (this.currentRemoveItem.fio && this.currentRemoveItem._id) {
          this.patients.forEach((patient, i) => {
            if (patient === this.currentRemoveItem) {
              //* Удаляем пациента из базы данных.
              Axios.delete(`${GKP7API}/api/v1/patient/${this.currentRemoveItem._id}/`, {
                headers: {'Authorization': Authentication.getAuthenticationHeader(this)}
              }).then(res => {
                if (res.data.success) {
                  //* Удаляем пациента из списка на фронтенде.
                  this.patients.splice(i, 1)
                  this.snackBar.color = 'green darken-1 white--text'
                  this.snackBar.timeout = 1000
                } else {
                  this.snackBar.color = 'red darken-2 white--text'
                  this.snackBar.timeout = 5000
                }
                this.snackBar.show = true
                this.snackBar.message = res.data.message
              }).catch(err => {
                this.errorHandler(err)
              })
            }
          })
        } else if (this.currentRemoveItem.jobName) {
          this.currentEditPatient.activeJob = {}
        } else {
          this.snackBar.show = true
          this.snackBar.color = 'red lighten-1'
          this.snackBar.message = 'Не знаю, что удалять.'
        }
        this.removeDialog.show = false
        this.currentRemoveItem = {}
      },
      //* Методы для диалога постановки на мед. осмотр.
      openRegisterMedicalExamination (item) {
        console.log(item)
        if (item.activeJob === undefined) {
          this.snackBar.show = true
          this.snackBar.color = 'red darken-1 white--text'
          this.snackBar.message = 'У пациента не указано место работы'
          this.snackBar.timeout = 5000
        } else if (item.hasActiveMedos === true) {
          this.snackBar.show = true
          this.snackBar.color = 'red darken-1 white--text'
          this.snackBar.message = 'Пациент уже зарегистрирован на мед. осмотр'
          this.snackBar.timeout = 5000
        } else {
          this.currentEditPatient = item
          this.addMedosDialog.show = true
        }
      },
      closeRegisterMedicalExamination () {
        this.currentEditPatient = {}
        this.addMedosDialog.show = false
      },
      saveRegisterMedicalExamination () {
        this.currentMedos.medosJob = this.currentEditPatient.activeJob
        let tempObj = {
          'updatedBy': this.currentUser._id,
          'currentMedos': this.currentMedos
        }
        //* Добавляем пациента в базу данных.
        Axios.post(`${GKP7API}/api/v1/patient/${this.currentEditPatient._id}/active-medos/`, tempObj, {
          headers: {'Authorization': Authentication.getAuthenticationHeader(this)}
        }).then(res => {
          if (res.data.success) {
            this.currentEditPatient = {}
            this.currentMedos = {}
            this.addMedosDialog.show = false
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
      //* Работа с обновлением селектов в предприятиях.
      updateCompanyDivisions () {
        if (this.currentAddJob.jobCompany !== undefined) {
          let certainCompany = this.companies.find(
            company => company.companyId === this.currentAddJob.jobCompany.jobCompanyId
          )
          if (certainCompany !== undefined) {
            this.currentCompanyDivisions = certainCompany.companyDivisions.map(
              division => ({
                value: {
                  jobDivisionId: division.divisionId,
                  jobDivisionName: division.divisionName
                },
                text: division.divisionId + ' - ' + division.divisionName
              })
            )
          }
        } else if (this.currentEditJob.jobCompany !== undefined) {
          let certainCompany = this.companies.find(
            company => company.companyId === this.currentEditJob.jobCompany.jobCompanyId
          )
          if (certainCompany !== undefined) {
            this.currentCompanyDivisions = certainCompany.companyDivisions.map(
              division => ({
                value: {
                  jobDivisionId: division.divisionId,
                  jobDivisionName: division.divisionName
                },
                text: division.divisionId + ' - ' + division.divisionName
              })
            )
          }
        }
      },
      //* Работа с обновлением селектов в цехах.
      updateDivisionDepartments () {
        if (this.currentAddJob.jobDivision !== undefined) {
          let certainCompany = this.companies.find(
            company => company.companyId === this.currentAddJob.jobCompany.jobCompanyId
          )
          let certainDivision = certainCompany.companyDivisions.find(
            division => division.divisionId === this.currentAddJob.jobDivision.jobDivisionId
          )
          if (certainDivision !== undefined) {
            this.currentDivisionDepartments = certainDivision.divisionDepartments.map(
              department => ({
                value: {
                  jobDepartmentId: department.departmentId,
                  jobDepartmentName: department.departmentName
                },
                text: department.departmentId + ' - ' + department.departmentName
              })
            )
          }
        } else if (this.currentEditJob.jobDivision !== undefined) {
          let certainCompany = this.companies.find(
            company => company.companyId === this.currentEditJob.jobCompany.jobCompanyId
          )
          let certainDivision = certainCompany.companyDivisions.find(
            division => division.divisionId === this.currentEditJob.jobDivision.jobDivisionId
          )
          if (certainDivision !== undefined) {
            this.currentDivisionDepartments = certainDivision.divisionDepartments.map(
              department => ({
                value: {
                  jobDepartmentId: department.departmentId,
                  jobDepartmentName: department.departmentName
                },
                text: department.departmentId + ' - ' + department.departmentName
              })
            )
          }
        }
      },
      //* Запрашиваем список пациентов по введенным ФИО.
      getPatients () {
        let tempQuery = {}
        tempQuery.lastName = (this.patientQuery.lastName === undefined) ? ' ' : this.patientQuery.lastName
        tempQuery.firstName = (this.patientQuery.firstName === undefined) ? ' ' : this.patientQuery.firstName
        tempQuery.middleName = (this.patientQuery.middleName === undefined) ? ' ' : this.patientQuery.middleName
        Axios.get(`${GKP7API}/api/v1/patient/${tempQuery.lastName}/${tempQuery.firstName}/${tempQuery.middleName}/`, {
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
      //* Подгружаем все компании для последующей работы.
      getAllCompanies () {
        Axios.get(`${GKP7API}/api/v1/companies`, {
          headers: {'Authorization': Authentication.getAuthenticationHeader(this)}
        }).then(({data}) => {
          if (data.success === true) {
            this.companies = data.companies
            this.snackBar.show = true
            this.snackBar.color = 'green darken-1 white--text'
            this.snackBar.message = 'Компании загружены'
            this.snackBar.timeout = 1000
            //* Обновим для селекта.
            this.companiesForSelect = this.companies.map(
              company => ({
                value: {
                  jobCompanyId: company.companyId,
                  jobCompanyName: company.companyName
                },
                text: company.companyId + ' - ' + company.companyName
              })
            )
          } else {
            this.snackBar.show = true
            this.snackBar.color = 'red darken-1 white--text'
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
    background-color: #01579b;
    color: white;
    padding: 0 6px;
  }

  .theme--light .input-group input:disabled::placeholder,
  .theme--light .input-group input:disabled {
    color: rgba(245, 127, 23, 0.7) !important;
  }
</style>
