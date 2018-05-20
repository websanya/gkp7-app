<template>
  <div class=uwd-container>
    <app-header :subsystem="subSystem.primaryColor" subtitle="Снимки" :currentUser="currentUser">
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
                  <v-text-field @keyup.enter="getMedosPatients" :color="subSystem.secondaryColor" label="Фамилия"
                                v-model="patientQuery.lastName" box>
                  </v-text-field>
                </v-flex>
                <v-flex xs12 md4>
                  <v-text-field @keyup.enter="getMedosPatients" :color="subSystem.secondaryColor" label="Имя"
                                v-model="patientQuery.firstName" box>
                  </v-text-field>
                </v-flex>
                <v-flex xs12 md4>
                  <v-text-field @keyup.enter="getMedosPatients" :color="subSystem.secondaryColor" label="Отчество"
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
                    <td>{{ props.item.activeMedos.medosType }}</td>
                    <td width="156px">
                      <v-tooltip top :color="subSystem.primaryColor">
                        <v-btn
                          slot="activator"
                          @click.native="openEditRgDialog({edit: false, patient: props.item})"
                          :color="subSystem.primaryColor"
                          icon
                        >
                          <v-icon color="white">assignment_turned_in</v-icon>
                        </v-btn>
                        <span>Добавить описание</span>
                      </v-tooltip>
                      <v-tooltip top :color="subSystem.secondaryColor">
                        <v-btn
                          slot="activator"
                          @click.native="openRgListDialog(props.item)"
                          :color="subSystem.secondaryColor"
                          icon
                        >
                          <v-icon color="white">assignment</v-icon>
                        </v-btn>
                        <span>Посмотреть список снимков</span>
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

    <!-- Диалог добавления/редактирования снимка -->
    <v-dialog v-model="editRgDialog.show" persistent lazy max-width="800px">
      <v-card>
        <v-card-title>
          <span v-if="editRgDialog.edit" class="headline">
            Редактирование снимка для<br/><span
            class="green--text text--darken-2">{{ currentEditPatient.fio }}</span>
          </span>
          <span v-if="!editRgDialog.edit" class="headline">
            Добавление снимка для<br/><span
            class="green--text text--darken-2">{{ currentEditPatient.fio }}</span>
          </span>
        </v-card-title>
        <v-card-text>
          <v-container grid-list-md>
            <v-layout row wrap>
              <v-flex sm12 md2>
                <v-text-field
                  mask="##.##.####"
                  return-masked-value
                  v-if="!editRgDialog.edit"
                  label="Дата снимка"
                  :color="subSystem.primaryColor"
                  v-model="currentRgResult.rgDate"
                >
                </v-text-field>
                <v-text-field
                  v-if="editRgDialog.edit"
                  label="Дата снимка"
                  :color="subSystem.primaryColor"
                  :value="dateFromIso(currentRgResult.rgDate)"
                  readonly
                  disabled
                >
                </v-text-field>
              </v-flex>
              <v-flex sm12 md4>
                <v-select
                  :items="rgTypes"
                  label="Тип снимка"
                  :color="subSystem.primaryColor"
                  v-model="currentRgResult.rgType"
                >
                </v-select>
              </v-flex>
              <v-flex sm12 md6>
                <v-spacer></v-spacer>
              </v-flex>
            </v-layout>
            <v-layout row wrap>
              <v-flex sm12>
                <h3>Рентгенографический снимок</h3>
              </v-flex>
            </v-layout>
            <v-layout row wrap>
              <v-flex sm12 md5>
                <v-select
                  :items="rgLocations"
                  v-if="currentRgResult.rgLocation"
                  label="Тип ЛПУ"
                  :color="subSystem.primaryColor"
                  v-model="currentRgResult.rgLocation.rgLocationType"
                >
                </v-select>
              </v-flex>
              <v-flex sm12 md7>
                <v-text-field
                  v-if="currentRgResult.rgLocation"
                  label="Название др. ЛПУ"
                  :color="subSystem.primaryColor"
                  v-model="currentRgResult.rgLocation.rgLocationComment"
                  :disabled="currentRgResult.rgLocation.rgLocationType"
                >
                </v-text-field>
              </v-flex>
            </v-layout>
            <v-layout row wrap>
              <v-flex sm12 md3>
                <v-select
                  v-if="currentRgResult.rgResult"
                  :items="rgResultTypes"
                  label="Заключение"
                  :color="subSystem.primaryColor"
                  v-model="currentRgResult.rgResult.rgResultType"
                >
                </v-select>
              </v-flex>
              <v-flex sm12 md9>
                <v-text-field
                  v-if="currentRgResult.rgResult"
                  label="Описание"
                  :color="subSystem.primaryColor"
                  v-model="currentRgResult.rgResult.rgResultComment"
                  :disabled="currentRgResult.rgResult.rgResultType"
                >
                </v-text-field>
              </v-flex>
            </v-layout>
          </v-container>
        </v-card-text>
        <v-card-actions>
          <v-spacer>
          </v-spacer>
          <v-btn :color="subSystem.primaryColor" flat class="white--text" @click.native="noEditRgDialog">Закрыть</v-btn>
          <v-btn v-if="editRgDialog.edit" :color="subSystem.primaryColor" class="white--text"
                 @click.native="yesEditRgDialog">Сохранить
          </v-btn>
          <v-btn v-if="!editRgDialog.edit" :color="subSystem.primaryColor" class="white--text"
                 @click.native="yesEditRgDialog">Добавить
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <!-- / Диалог добавления/редактирования снимка -->

    <!-- Диалог списка снимков -->
    <v-dialog v-model="listRgDialog.show" persistent lazy max-width="800px">
      <v-card>
        <v-card-title>
          <span class="headline">Снимки пациента <br/><span
            class="green--text text--darken-2">{{ currentEditPatient.fio }}</span>
          </span>
          <v-spacer>
          </v-spacer>
          <v-layout row wrap>
            <!-- Добавить снимок -->
            <v-flex sm12 md12>
              <v-btn @click.native="openEditRgDialog({edit: false, patient: currentEditPatient})"
                     :color="subSystem.secondaryColor" dark large block
              >
                Добавить снимок
              </v-btn>
            </v-flex>
            <!-- / Добавить снимок -->
          </v-layout>
        </v-card-title>
        <v-card-text>
          <v-container grid-list-md>
            <h2 v-if="currentEditPatient.rgResults.length > 0">Список снимков</h2>
            <v-data-table
              v-if="currentEditPatient.rgResults.length > 0"
              :headers="[
                {text:'Дата снимка', sortable: false},
                {text:'Тип снимка', sortable: false},
                {text:'ЛПУ', sortable: false},
                {text:'Действия', sortable: false}
              ]"
              :items="currentEditPatient.rgResults"
              hide-actions
              class="elevation-5 mt-4"
            >
              <template slot="items" slot-scope="props">
                <tr>
                  <td>{{ props.item.rgDate | formatDate }}</td>
                  <td>{{ rgTypes.find(type => type.value === props.item.rgType).text }}</td>
                  <td>{{ (!props.item.rgLocation.rgLocationType) ? props.item.rgLocation.rgLocationComment : `МБУЗ ГКБ
                    №6, Поликлиника №2` }}
                  </td>
                  <td width="172px">
                    <v-tooltip top :color="subSystem.primaryColor">
                      <v-btn
                        slot="activator"
                        @click.native="openEditRgDialog({edit: true, patient: currentEditPatient, rg: props.item})"
                        :color="subSystem.primaryColor"
                        icon
                      >
                        <v-icon color="white">assignment</v-icon>
                      </v-btn>
                      <span>Редактировать снимок</span>
                    </v-tooltip>
                    <v-tooltip top :color="subSystem.deleteColor">
                      <v-btn
                        slot="activator"
                        @click.native="openRemoveDialog(props.item)"
                        :color="subSystem.deleteColor"
                        icon
                      >
                        <v-icon color="white">delete</v-icon>
                      </v-btn>
                      <span>Удалить снимок</span>
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
          <v-btn :color="subSystem.primaryColor" flat @click.native="noRgListDialog">Закрыть</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <!-- / Диалог списка снимков -->

    <!-- Диалог удаления снимка -->
    <v-dialog v-model="removeDialog.show" persistent lazy max-width="800px">
      <v-card>
        <v-card-title>
          <span class="headline">
            Удалить снимок от {{ currentRemoveItem.rgDate | formatDate }} для<br/>
            <span :class="subSystem.deleteText">«{{ currentEditPatient.fio }}»</span>?
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
    <!-- / Диалог удаления снимка -->

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
        //* Пациент, с которым проводим манипуляции.
        currentEditPatient: {
          rgResults: []
        },
        //* Снимок, с которым мы работаем.
        currentRgResult: {
          rgDate: '',
          rgType: '',
          rgLocation: {
            rgLocationType: true,
            rgLocationComment: ''
          },
          rgResult: {
            rgResultType: true,
            rgResultComment: ''
          }
        },
        //* Удаляемый снимок.
        currentRemoveItem: {},
        //* Методы для диалогового окна добавления/редактирования снимка.
        editRgDialog: {
          show: false,
          edit: false
        },
        listRgDialog: {
          show: false
        },
        removeDialog: {
          show: false
        },
        //* Справочники.
        rgTypes: [
          {
            value: 1,
            text: '1 — Флюорография'
          },
          {
            value: 2,
            text: '2 — Маммография'
          }
        ],
        rgLocations: [
          {
            value: true,
            text: 'МБУЗ ГКБ №6, Поликлиника №2'
          },
          {
            value: false,
            text: 'др. ЛПУ'
          }
        ],
        rgResultTypes: [
          {
            value: true,
            text: 'норма'
          },
          {
            value: false,
            text: 'патология'
          }
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
          primaryColor: 'blue-grey darken-4',
          secondaryColor: 'grey darken-1',
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
    },
    methods: {
      //* Диалог редактирования описания снимка.
      openEditRgDialog (obj) {
        if (obj.edit) {
          this.currentRgResult = obj.rg
        } else {
          this.currentEditPatient = obj.patient
          this.currentRgResult.rgDate = this.dateFromIso(Date.now())
        }
        this.editRgDialog = {
          edit: obj.edit,
          show: true
        }
      },
      noEditRgDialog () {
        this.currentRgResult = {
          rgDate: '',
          rgType: '',
          rgLocation: {
            rgLocationType: true,
            rgLocationComment: ''
          },
          rgResult: {
            rgResultType: true,
            rgResultComment: ''
          }
        }
        this.editRgDialog = {
          show: false
        }
      },
      yesEditRgDialog () {
        let tmpRgResult = this.currentRgResult
        if (this.editRgDialog.edit) {
          //* Редактируем снимок пациента.
          Axios.put(`${GKP7API}/api/v1/patient/${this.currentEditPatient._id}/rg/${tmpRgResult._id}`, {
            rgResult: tmpRgResult
          }, {
            headers: {'Authorization': Authentication.getAuthenticationHeader(this)}
          }).then(({data}) => {
            if (data.success) {
              this.currentRgResult = {
                rgDate: '',
                rgType: '',
                rgLocation: {
                  rgLocationType: true,
                  rgLocationComment: ''
                },
                rgResult: {
                  rgResultType: true,
                  rgResultComment: ''
                }
              }
              this.editRgDialog = {
                edit: false,
                show: false
              }
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
          //* Добавляем снимок пациенту.
          Axios.post(`${GKP7API}/api/v1/patient/${this.currentEditPatient._id}/rg/`, {
            rgResult: tmpRgResult
          }, {
            headers: {'Authorization': Authentication.getAuthenticationHeader(this)}
          }).then(({data}) => {
            if (data.success) {
              let tmpRgResult = data.patient.rgResults.find((item) => {
                return this.dateFromIso(item.rgDate) === this.currentRgResult.rgDate
              })
              this.currentEditPatient.rgResults.push(tmpRgResult)
              this.currentRgResult = {
                rgDate: '',
                rgType: '',
                rgLocation: {
                  rgLocationType: true,
                  rgLocationComment: ''
                },
                rgResult: {
                  rgResultType: true,
                  rgResultComment: ''
                }
              }
              this.editRgDialog = {
                edit: false,
                show: false
              }
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
      },
      //* Диалог списка снимков.
      openRgListDialog (item) {
        this.currentEditPatient = item
        this.listRgDialog.show = true
      },
      noRgListDialog () {
        this.currentEditPatient = {
          rgResults: []
        }
        this.listRgDialog.show = false
      },
      //* Диалог удаления снимка.
      openRemoveDialog (item) {
        this.currentRemoveItem = item
        this.removeDialog.show = true
      },
      noRemoveDialog () {
        this.currentRemoveItem = {}
        this.removeDialog.show = false
      },
      yesRemoveDialog () {
        Axios.delete(`${GKP7API}/api/v1/patient/${this.currentEditPatient._id}/rg/${this.currentRemoveItem._id}`, {
          headers: {'Authorization': Authentication.getAuthenticationHeader(this)}
        }).then(({data}) => {
          if (data.success) {
            this.currentEditPatient.rgResults = this.currentEditPatient.rgResults.filter(result => result._id !== this.currentRemoveItem._id)
            this.removeDialog.show = false
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
    background-color: #263238;
    color: white;
    padding: 0 6px;
  }
</style>
