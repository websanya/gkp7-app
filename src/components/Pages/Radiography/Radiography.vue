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
                            @click.native="openAddRgDialog(props.item)"
                            :color="subSystem.secondaryColor"
                            icon
                        >
                          <v-icon color="white">assignment_late</v-icon>
                        </v-btn>
                        <span>Зарегистрировать снимок</span>
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
                      <v-tooltip top :color="subSystem.secondaryColor">
                        <v-btn
                            slot="activator"
                            @click.native="openEditRgDialog(props.item)"
                            :color="subSystem.secondaryColor"
                            icon
                        >
                          <v-icon color="white">assignment_turned_in</v-icon>
                        </v-btn>
                        <span>Ввести описание</span>
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

    <!-- Диалог регистрации на снимок -->
    <v-dialog v-model="addRgDialog.show" persistent max-width="800px">
      <v-card>
        <v-card-title>
          <v-flex sm12 md7>
            <span class="headline">
            Зарегистрировать снимок для<br/><span
                class="green--text text--darken-2">{{ currentEditPatient.fio }}</span>?
          </span>
          </v-flex>
          <v-flex sm12 md5>
            <v-checkbox
                class="right"
                label="Снимок из другого ЛПУ"
                v-model="addRgDialog.anotherLpu"
            ></v-checkbox>
          </v-flex>
        </v-card-title>
        <v-card-text v-if="addRgDialog.anotherLpu">
          <v-container grid-list-md>
            <v-layout row wrap>
              <v-flex sm12 md3>
                <v-text-field
                    label="Название ЛПУ"
                    :color="subSystem.primaryColor"
                    v-model="currentRgResult.rgLocation.rgLocationComment"
                >
                </v-text-field>
              </v-flex>
              <v-flex sm12 md2>
                <v-text-field
                    label="Дата снимка"
                    :color="subSystem.primaryColor"
                    v-model="currentRgResult.rgDate"
                    mask="##.##.####"
                    return-masked-value
                >
                </v-text-field>
              </v-flex>
              <v-flex sm12 md3>
                <v-select
                    :items="rgResultTypes"
                    label="Норма"
                    :color="subSystem.primaryColor"
                    v-model="currentRgResult.rgResult.rgResultType"
                >
                </v-select>
              </v-flex>
              <v-flex sm12 md4>
                <v-text-field
                    :disabled="currentRgResult.rgResult.rgResultType"
                    label="Заключение"
                    :color="subSystem.primaryColor"
                    v-model="currentRgResult.rgResult.rgResultComment"
                >
                </v-text-field>
              </v-flex>
            </v-layout>
          </v-container>
        </v-card-text>
        <v-card-actions>
          <v-spacer>
          </v-spacer>
          <v-btn :color="subSystem.primaryColor" flat class="white--text" @click.native="noAddRgDialog">Закрыть</v-btn>
          <v-btn :color="subSystem.primaryColor" class="white--text" @click.native="yesAddRgDialog">
            Зарегистрировать
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <!-- / Диалог регистрации на снимок -->

    <!-- Диалог списка снимков -->
    <v-dialog v-model="listRgDialog.show" persistent max-width="800px">
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
              <v-btn @click.native="openAddRgDialog(currentEditPatient)" :color="subSystem.secondaryColor" dark large
                     block>
                Зарегистрировать снимок
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
                hide-headers
                :items="currentEditPatient.rgResults"
                hide-actions
                class="elevation-5 mt-4"
            >
              <template slot="items" slot-scope="props">
                <tr>
                  <td>{{ props.item.rgDate | formatDate }}</td>
                  <td>{{ props.item.rgLocation.rgLocationComment }}</td>
                  <td width="172px">
                    <v-tooltip top :color="subSystem.secondaryColor">
                      <v-btn
                          slot="activator"
                          @click.native="openRgViewDialog(props.item)"
                          :color="subSystem.secondaryColor"
                          icon
                      >
                        <v-icon color="white">assignment</v-icon>
                      </v-btn>
                      <span>Информация о снимке</span>
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
                      <span>Удалить снимок</span>
                    </v-tooltip>
                  </td>
                </tr>
              </template>
            </v-data-table>
            <br>
            <h2 v-if="currentEditPatient.hasActiveRgResult">Зарегистрированный снимок</h2>
            <v-data-table
                v-if="currentEditPatient.hasActiveRgResult"
                hide-headers
                :items="[currentEditPatient.activeRgResult]"
                hide-actions
                class="elevation-5 mt-4"
            >
              <template slot="items" slot-scope="props">
                <tr>
                  <td>{{ props.item.rgDate | formatDate }}</td>
                  <td>{{ props.item.rgLocation.rgLocationComment }}</td>
                  <td width="50px">
                    <v-tooltip top color="red darken-2">
                      <v-btn
                          slot="activator"
                          @click.native="openRemoveDialog('active')"
                          color="red darken-2"
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

    <!-- Диалог удаления вредности -->
    <v-dialog v-model="removeDialog.show" persistent max-width="800px">
      <v-card>
        <v-card-title>
          <span class="headline">
            Удалить <span v-if="removeDialog.activeRg">активный</span> снимок от {{ currentRemoveItem.rgDate | formatDate }} для<br/>
            <span class="red--text text--darken-2">«{{ currentEditPatient.fio }}»</span>?
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

    <!-- Диалог внесения заключения на снимок -->
    <v-dialog v-model="viewRgDialog.show" persistent lazy max-width="800px">
      <v-card>
        <v-card-title>
          <span class="headline">
            Описание снимка от {{ currentRgResult.rgDate | formatDate }} для<br/><span
              class="green--text text--darken-2">{{ currentEditPatient.fio }}</span>
          </span>
        </v-card-title>
        <v-card-text>
          <v-container grid-list-md>
            <v-layout row wrap>
              <v-flex sm12 md4>
                <v-text-field
                    readonly
                    label="Дата снимка"
                    :color="subSystem.primaryColor"
                    :value="dateFromIso(currentRgResult.rgDate)"
                >
                </v-text-field>
              </v-flex>
              <v-flex sm12 md8>
                <v-text-field
                    readonly
                    label="Название ЛПУ"
                    :color="subSystem.primaryColor"
                    v-model="currentRgResult.rgLocation.rgLocationComment"
                >
                </v-text-field>
              </v-flex>
              <v-flex sm12 md4>
                <v-select
                    readonly
                    :items="rgResultTypes"
                    label="Норма"
                    :color="subSystem.primaryColor"
                    v-model="currentRgResult.rgResult.rgResultType"
                >
                </v-select>
              </v-flex>
              <v-flex sm12 md8>
                <v-text-field
                    readonly
                    label="Заключение"
                    :color="subSystem.primaryColor"
                    v-model="currentRgResult.rgResult.rgResultComment"
                >
                </v-text-field>
              </v-flex>
            </v-layout>
          </v-container>
        </v-card-text>
        <v-card-actions>
          <v-spacer>
          </v-spacer>
          <v-btn :color="subSystem.primaryColor" class="white--text" @click.native="noRgViewDialog">Закрыть</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <!-- Диалог внесения заключения на снимок -->
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
        //* Запрос на пациентам по ФИО, подгружается в начальном окне.
        patientQuery: {},
        //* Подгруженные пациенты после запроса по ФИО.
        patients: [],
        //* Пациент, с которым проводим манипуляции.
        currentEditPatient: {
          rgResults: [],
          activeRgResult: {
            rgDate: '',
            rgType: {
              rgTypeId: '',
              rgTypeName: ''
            },
            rgLocation: {
              rgLocationType: '',
              rgLocationComment: ''
            }
          },
          hasActiveRgResult: false
        },
        //* Флюорография, с которой мы работаем.
        currentRgResult: {
          rgDate: '',
          rgType: {
            rgTypeId: '',
            rgTypeName: ''
          },
          rgLocation: {
            rgLocationType: '',
            rgLocationComment: ''
          },
          rgResult: {
            rgResultType: true,
            rgResultComment: ''
          }
        },
        //* Удаляемый снимок.
        currentRemoveItem: {},
        //* Все, что связано с диалогов регистрации на снимок.
        addRgDialog: {
          show: false,
          anotherLpu: false
        },
        editRgDialog: {
          show: false
        },
        listRgDialog: {
          show: false
        },
        removeDialog: {
          show: false,
          activeRg: false
        },
        viewRgDialog: {
          show: false
        },
        //* Справочники.
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
          secondaryColor: 'grey darken-1'
        }
      }
    },
    //* Подгружаем объект залогиненного пользователя для последующего использования.
    mounted () {
      //* Подгружаем пользователя, который осуществил вход.
      this.getCurrentUser()
    },
    methods: {
      //* Диалог регистрации на снимок.
      openAddRgDialog (item) {
        if (this.currentEditPatient.hasActiveRgResult) {
          this.snackBar.color = 'yellow accent-3 black--text'
          this.snackBar.timeout = 5000
          this.snackBar.message = 'У этого пациента уже зарегистрирован неописанный снимок'
          this.snackBar.show = true
        } else {
          this.currentEditPatient = item
          this.addRgDialog.show = true
        }
      },
      noAddRgDialog () {
        this.addRgDialog.show = false
      },
      yesAddRgDialog () {
        let tmpRgResult = {}
        if (this.addRgDialog.anotherLpu) {
          tmpRgResult = {
            rgDate: this.currentRgResult.rgDate,
            rgType: {
              rgTypeId: 1,
              rgTypeName: 'флюорография'
            },
            rgLocation: {
              rgLocationType: 2,
              rgLocationComment: this.currentRgResult.rgLocation.rgLocationComment
            },
            rgResult: {
              rgResultType: this.currentRgResult.rgResult.rgResultType,
              rgResultComment: this.currentRgResult.rgResult.rgResultComment
            }
          }
          //* Добавляем снимок из другого ЛПУ в базу данных.
          Axios.post(`${GKP7API}/api/v1/patient/${this.currentEditPatient._id}/rgFull/`, {
            rgResult: tmpRgResult
          }, {
            headers: {'Authorization': Authentication.getAuthenticationHeader(this)}
          }).then(res => {
            if (res.data.success) {
              this.currentEditPatient.rgResults.push(tmpRgResult)
              this.currentRgResult = {
                rgDate: '',
                rgType: {
                  rgTypeId: '',
                  rgTypeName: ''
                },
                rgLocation: {
                  rgLocationType: '',
                  rgLocationComment: ''
                },
                rgResult: {
                  rgResultType: true,
                  rgResultComment: ''
                }
              }
              this.addRgDialog.show = false
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
        } else {
          tmpRgResult = {
            rgDate: this.dateFromIso(Date.now()),
            rgType: {
              rgTypeId: 1,
              rgTypeName: 'флюорография'
            },
            rgLocation: {
              rgLocationType: 1,
              rgLocationComment: 'МБУЗ ГКБ №6, Поликлиника * 2'
            },
            rgResult: {
              rgResultType: true,
              rgResultComment: ''
            }
          }
          //* Добавляем регистрацию снимка.
          Axios.post(`${GKP7API}/api/v1/patient/${this.currentEditPatient._id}/rg/`, {
            activeRgResult: tmpRgResult
          }, {
            headers: {'Authorization': Authentication.getAuthenticationHeader(this)}
          }).then(res => {
            if (res.data.success) {
              this.currentEditPatient.activeRgResult = res.data.patient.activeRgResult
              this.currentEditPatient.hasActiveRgResult = true
              this.currentRgResult = {
                rgDate: '',
                rgType: {
                  rgTypeId: '',
                  rgTypeName: ''
                },
                rgLocation: {
                  rgLocationType: '',
                  rgLocationComment: ''
                },
                rgResult: {
                  rgResultType: true,
                  rgResultComment: ''
                }
              }
              this.addRgDialog.show = false
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
        }
      },
      //* Диалог редактирования описания снимка.
      openEditRgDialog (item) {
        this.currentEditPatient = item
        if (item.hasActiveRgResult) {
          this.currentRgResult = item.activeRgResult
          this.editRgDialog.show = true
        } else {
          this.snackBar.color = 'yellow accent-3 black--text'
          this.snackBar.timeout = 5000
          this.snackBar.message = 'У этого пациента нет зарегистрированных снимков'
          this.snackBar.show = true
        }
      },
      noEditRgDialog () {
        this.currentEditPatient = {
          rgResults: [],
          activeRgResult: {
            rgDate: '',
            rgType: {
              rgTypeId: '',
              rgTypeName: ''
            },
            rgLocation: {
              rgLocationType: '',
              rgLocationComment: ''
            }
          },
          hasActiveRgResult: false
        }
        this.currentRgResult = {
          rgDate: '',
          rgType: {
            rgTypeId: '',
            rgTypeName: ''
          },
          rgLocation: {
            rgLocationType: '',
            rgLocationComment: ''
          },
          rgResult: {
            rgResultType: true,
            rgResultComment: ''
          }
        }
        this.editRgDialog.show = false
      },
      yesEditRgDialog () {
        let tmpRgResult = this.currentRgResult
        if (this.currentRgResult.rgResultType === false && this.currentRgResult.rgResultComment === '') {
          this.snackBar.color = 'yellow accent-3 black--text'
          this.snackBar.timeout = 5000
          this.snackBar.message = 'Не указана паталогия'
          this.snackBar.show = true
        } else {
          //* Добавляем регистрацию снимка.
          Axios.put(`${GKP7API}/api/v1/patient/${this.currentEditPatient._id}/rg/`, {
            rgResult: tmpRgResult
          }, {
            headers: {'Authorization': Authentication.getAuthenticationHeader(this)}
          }).then(res => {
            if (res.data.success) {
              this.currentEditPatient.activeRgResult = {}
              this.currentEditPatient.hasActiveRgResult = false
              this.currentEditPatient.rgResults.push(tmpRgResult)
              this.currentRgResult = {
                rgDate: '',
                rgType: {
                  rgTypeId: '',
                  rgTypeName: ''
                },
                rgLocation: {
                  rgLocationType: '',
                  rgLocationComment: ''
                },
                rgResult: {
                  rgResultType: true,
                  rgResultComment: ''
                }
              }
              this.editRgDialog.show = false
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
        }
      },
      //* Диалог списка снимков.
      openRgListDialog (item) {
        this.currentEditPatient = item
        this.listRgDialog.show = true
      },
      noRgListDialog () {
        this.currentEditPatient = {
          rgResults: [],
          activeRgResult: {
            rgDate: '',
            rgType: {
              rgTypeId: '',
              rgTypeName: ''
            },
            rgLocation: {
              rgLocationType: '',
              rgLocationComment: ''
            }
          }
        }
        this.listRgDialog.show = false
      },
      //* Диалог удаления снимка.
      openRemoveDialog (item) {
        if (item === 'active') {
          this.removeDialog.activeRg = true
          this.currentRemoveItem = this.currentEditPatient.activeRgResult
        } else {
          this.currentRemoveItem = item
        }
        this.removeDialog.show = true
      },
      noRemoveDialog () {
        this.currentRemoveItem = {}
        this.removeDialog.show = false
        this.removeDialog.activeRg = false
      },
      yesRemoveDialog () {
        if (this.removeDialog.activeRg) {
          Axios.delete(`${GKP7API}/api/v1/patient/${this.currentEditPatient._id}/rg/active/`, {
            headers: {'Authorization': Authentication.getAuthenticationHeader(this)}
          }).then(res => {
            if (res.data.success) {
              this.currentEditPatient.activeRgResult = {
                rgDate: '',
                rgType: {
                  rgTypeId: '',
                  rgTypeName: ''
                },
                rgLocation: {
                  rgLocationType: '',
                  rgLocationComment: ''
                },
                rgResult: {
                  rgResultType: true,
                  rgResultComment: ''
                }
              }
              this.currentEditPatient.hasActiveRgResult = false
              this.currentRemoveItem = {}
              this.removeDialog.show = false
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
        } else {
          Axios.delete(`${GKP7API}/api/v1/patient/${this.currentEditPatient._id}/rg/${this.currentRemoveItem._id}`, {
            headers: {'Authorization': Authentication.getAuthenticationHeader(this)}
          }).then(res => {
            if (res.data.success) {
              this.currentEditPatient.rgResults = this.currentEditPatient.rgResults.filter(result => result._id !== this.currentRemoveItem._id)
              this.removeDialog.show = false
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
        }
      },
      //* Диалог просмотра снимка.
      openRgViewDialog (item) {
        this.currentRgResult = item
        this.viewRgDialog.show = true
      },
      noRgViewDialog () {
        this.viewRgDialog.show = false
        this.currentRgResult = {
          rgDate: '',
          rgType: {
            rgTypeId: '',
            rgTypeName: ''
          },
          rgLocation: {
            rgLocationType: '',
            rgLocationComment: ''
          },
          rgResult: {
            rgResultType: true,
            rgResultComment: ''
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
    background-color: #263238;
    color: white;
    padding: 0 6px;
  }
</style>
