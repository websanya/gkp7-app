<template>
  <v-app>

    <!-- Верхняя рамка приложения + боковое меню -->
    <app-header :subsystem="subSystem.primaryColor" subtitle="Редактор предприятий">
    </app-header>
    <!-- / Верхняя рамка приложения + боковое меню -->

    <!-- Контент (заголовок + таблица) -->
    <v-content>
      <v-container fluid fill-height>
        <v-layout
            justify-center
            align-center
        >
          <v-flex xs12 md10>
            <h2 class="text-xs-center">Редактор предприятий</h2>
            <v-container grid-list-md>

              <!-- Поле для поиска -->
              <v-text-field
                  append-icon="search"
                  label="Поиск"
                  hide-details
                  v-model="companiesListSearch"
              >
              </v-text-field>
              <!-- / Поле для поиска -->

              <!-- Сама таблица -->
              <v-data-table
                  v-if="companies.length > 0"
                  :headers="[
                    {text: 'Код', value: 'companyId'},
                    {text: 'Название', value: 'companyName'},
                    {text: 'Тариф', value: 'companyRate'},
                    {text: 'Действия'}
                  ]"
                  :items="companies"
                  :search="companiesListSearch"
                  no-data-text="Информации не найдено"
                  no-results-text="По запросу ничего не найдено"
                  :rows-per-page-items="[7,15,{'text':'Все','value':-1}]"
                  rows-per-page-text="Строк на странице:"
                  class="elevation-10 mt-4"
              >
                <template slot="headers" slot-scope="props">
                  <tr>
                    <th
                        v-for="header in props.headers"
                        :key="header._id"
                    >
                      {{ header.text }}
                    </th>
                  </tr>
                </template>
                <template slot="items" slot-scope="props">
                  <tr>
                    <td>{{ props.item.companyId }}</td>
                    <td>{{ props.item.companyName }}</td>
                    <td>{{ props.item.companyRate }}</td>
                    <td width="211px">
                      <v-btn @click.native="openDivisionsListDialog(props.item)" :color="subSystem.primaryColor"
                             icon>
                        <v-icon color="white">list</v-icon>
                      </v-btn>
                      <v-btn @click.native="openAddDivisionDialog()" :color="subSystem.primaryColor" icon>
                        <v-icon color="white">edit</v-icon>
                      </v-btn>
                      <v-btn @click.native="openRemoveDialog(props.item)" color="red darken-2" icon>
                        <v-icon color="white">delete</v-icon>
                      </v-btn>
                    </td>
                  </tr>
                </template>
                <template slot="pageText" slot-scope="{ pageStart, pageStop }">
                  с {{ pageStart }} по {{ pageStop }}
                </template>
              </v-data-table>
              <!-- / Сама таблица -->

            </v-container>
          </v-flex>
        </v-layout>
      </v-container>
    </v-content>
    <!-- / Контент (заголовок + таблица) -->

    <!-- Нижняя рамка приложения -->
    <app-footer :subsystem="subSystem.primaryColor" :currentUser="currentUser.fio">
    </app-footer>
    <!-- / Нижняя рамка приложения -->

    <!-- Снэкбар для ошибок -->
    <v-snackbar :timeout="snackBar.timeout"
                right="right"
                :color="snackBar.color"
                v-model="snackBar.show">
      {{ snackBar.message }}
    </v-snackbar>
    <!-- / Снэкбар для ошибок -->

    <!-- Диалог списка цехов в предприятии -->
    <v-dialog v-model="divisionsListDialog.show" persistent max-width="800px">
      <v-card>
        <v-card-title>
          <span class="headline">
            {{currentCompanyItem.companyId}} — {{ currentCompanyItem.companyName }}
          </span>
          <v-spacer>
          </v-spacer>
          <v-text-field
              append-icon="search"
              label="Поиск"
              hide-details
              v-model="divisionsListSearch"
          >
          </v-text-field>
        </v-card-title>
        <v-card-text>
          <v-container grid-list-md>
            <v-data-table
                v-if="currentCompanyItem.companyId"
                :headers="[
                    {text: 'Код', value: 'divisionId'},
                    {text: 'Название', value: 'divisionFullName'},
                    {text: 'Название', value: 'divisionName'},
                    {text: 'Действия'}
                  ]"
                :items="currentCompanyItem.companyDivisions"
                :search="divisionsListSearch"
                no-data-text="Информации не найдено"
                no-results-text="По запросу ничего не найдено"
                :rows-per-page-items="[6,12,{'text':'Все','value':-1}]"
                rows-per-page-text="Строк на странице:"
            >
              <template slot="headers" slot-scope="props">
                <tr>
                  <th
                      v-for="header in props.headers"
                      :key="header._id"
                  >
                    {{ header.text }}
                  </th>
                </tr>
              </template>
              <template slot="items" slot-scope="props">
                <tr>
                  <td>{{ props.item.divisionId }}</td>
                  <td>{{ props.item.divisionFullName }}</td>
                  <td>{{ props.item.divisionName }}</td>
                  <td width="211px">
                    <v-btn @click.native="openDepartmentsListDialog(props.item)" :color="subSystem.primaryColor" icon>
                      <v-icon color="white">list</v-icon>
                    </v-btn>
                    <v-btn @click.native="openEditDialog(props.item)" :color="subSystem.primaryColor" icon>
                      <v-icon color="white">edit</v-icon>
                    </v-btn>
                    <v-btn @click.native="openRemoveDialog(props.item)" color="red darken-2" icon>
                      <v-icon color="white">delete</v-icon>
                    </v-btn>
                  </td>
                </tr>
              </template>
              <template slot="pageText" slot-scope="{ pageStart, pageStop }">
                с {{ pageStart }} по {{ pageStop }}
              </template>
            </v-data-table>
          </v-container>
        </v-card-text>
        <v-card-actions>
          <v-spacer>
          </v-spacer>
          <v-btn :color="subSystem.primaryColor" flat @click.native="closeDivisionsListDialog">Закрыть</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <!-- / Диалог списка цехов в предприятии -->

    <!-- Диалог списка участков в предприятии -->
    <v-dialog v-model="departmentsListDialog.show" persistent max-width="800px">
      <v-card>
        <v-card-title>
          <span class="headline">
            {{currentDivisionItem.divisionId}} — {{ currentDivisionItem.divisionName }}
          </span>
          <v-spacer>
          </v-spacer>
          <v-text-field
              append-icon="search"
              label="Поиск"
              hide-details
              v-model="departmentsListSearch"
          >
          </v-text-field>
        </v-card-title>
        <v-card-text>
          <v-container grid-list-md>
            <v-data-table
                v-if="currentDivisionItem.divisionId"
                :headers="[
                    {text: 'Код', value: 'departmentId'},
                    {text: 'Название', value: 'departmentName'},
                    {text: 'Действия'}
                  ]"
                :items="currentDivisionItem.divisionDepartments"
                :search="departmentsListSearch"
                no-data-text="Информации не найдено"
                no-results-text="По запросу ничего не найдено"
                :rows-per-page-items="[6,12,{'text':'Все','value':-1}]"
                rows-per-page-text="Строк на странице:"
            >
              <template slot="headers" slot-scope="props">
                <tr>
                  <th
                      v-for="header in props.headers"
                      :key="header._id"
                  >
                    {{ header.text }}
                  </th>
                </tr>
              </template>
              <template slot="items" slot-scope="props">
                <tr>
                  <td>{{ props.item.departmentId }}</td>
                  <td>{{ props.item.departmentName }}</td>
                  <td width="211px">
                    <v-btn @click.native="openEditDialog(props.item)" :color="subSystem.primaryColor" icon>
                      <v-icon color="white">edit</v-icon>
                    </v-btn>
                    <v-btn @click.native="openRemoveDialog(props.item)" color="red darken-2" icon>
                      <v-icon color="white">delete</v-icon>
                    </v-btn>
                  </td>
                </tr>
              </template>
              <template slot="pageText" slot-scope="{ pageStart, pageStop }">
                с {{ pageStart }} по {{ pageStop }}
              </template>
            </v-data-table>
          </v-container>
        </v-card-text>
        <v-card-actions>
          <v-spacer>
          </v-spacer>
          <v-btn :color="subSystem.primaryColor" flat @click.native="closeDepartmentsListDialog">Закрыть</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <!-- / Диалог списка цехов в предприятии -->

    <!-- Диалог редактирования предприятия/цеха/участка -->
    <!-- / Диалог редактирования предприятия/цеха/участка -->

    <!-- Диалог удаления предприятия/цеха/участка -->
    <v-dialog v-model="removeDialog.show" persistent max-width="800px">
      <v-card>
        <v-card-title v-if="currentRemoveItem.companyName">
          <span class="headline">
            Вы точно хотите удалить <span class="red--text text--darken-2">«{{ currentRemoveItem.companyName }}»</span>
          </span>
        </v-card-title>
        <v-card-title v-if="currentRemoveItem.divisionName">
          <span class="headline">
            Вы точно хотите удалить <span class="red--text text--darken-2">«{{ currentRemoveItem.divisionName }}»</span>
          </span>
        </v-card-title>
        <v-card-title v-if="currentRemoveItem.departmentName">
          <span class="headline">
            Вы точно хотите удалить <span
              class="red--text text--darken-2">«{{ currentRemoveItem.departmentName }}»</span>
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
    <!-- / Диалог удаления предприятия/цеха/участка -->

    <v-dialog v-model="addCompanyDialog.show" persistent max-width="800px">
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
          <v-btn :color="subSystem.primaryColor" class="white--text" @click.native="saveAddPatientDialog">Сохранить
          </v-btn>
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
        //* Все предприятия, которые есть в системе на момент открытия.
        companies: [],
        //* Та компания, чей список открыт.
        currentCompanyItem: {},
        //* Тот цех, чей список открыт.
        currentDivisionItem: {},
        //* То, что будем удалять.
        currentRemoveItem: {},
        //* Предприятие, которое мы добавляем.
        newCompany: {},
        //* Цех, который мы добавляем.
        newDivision: {},
        //* Участок, который мы добавляем.
        newDepartment: {},
        //* Диалог списка цехов.
        divisionsListDialog: {
          show: false
        },
        //* Диалог списка участков.
        departmentsListDialog: {
          show: false
        },
        //* Диалог удаления предприятия/цеха/участка.
        removeDialog: {
          show: false
        },
        //* Все, что связано с диалогом добавления предприятия.
        addCompanyDialog: {
          show: false
        },
        //* Все, что связано с диалогом добавления цеха.
        addDivisionDialog: {
          show: false
        },
        //* Все, что связано с диалогом добавления участка.
        addDepartmentDialog: {
          show: false
        },
        //* Все, что связано с snackbar, который всплывает во время ошибок.
        snackBar: {
          show: false,
          message: '',
          timeout: 5000,
          color: ''
        },
        //* Цвета для данной подсистемы.
        subSystem: {
          primaryColor: 'light-blue darken-2',
          secondaryColor: 'brown darken-4'
        },
        //* Поисковое поле для списка прдеприятий.
        companiesListSearch: '',
        //* Поисковое поле для списка цехов.
        divisionsListSearch: '',
        //* Поисковое поле для списка участков.
        departmentsListSearch: ''
      }
    },
    //* Подгружаем всякое перед инициализацией компонента.
    mounted () {
      //* Подгружаем объект залогиненного пользователя для последующего использования.
      Axios.get(`${GKP7API}/api/v1/user`, {
        headers: {'Authorization': Authentication.getAuthenticationHeader(this)},
        params: {user_id: this.$cookie.get('user_id')}
      }).then(({data}) => {
        this.currentUser = data
      }).catch(err => {
        this.errorHandler(err)
      })
      //* Подгружаем все компании для последующей работы.
      Axios.get(`${GKP7API}/api/v1/companies`, {
        headers: {'Authorization': Authentication.getAuthenticationHeader(this)}
      }).then(({data}) => {
        if (data.success === true) {
          this.companies = data.companies
          this.snackBar.show = true
          this.snackBar.color = 'green darken-1 white--text'
          this.snackBar.message = 'Компании загружены'
          this.snackBar.timeout = 1000
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
    methods: {
      //* Открыть диалог списка цехов..
      openDivisionsListDialog (item) {
        this.currentCompanyItem = item
        this.divisionsListDialog.show = true
      },
      //* Закрыть диалог списка.
      closeDivisionsListDialog () {
        this.currentCompanyItem = {}
        this.divisionsListDialog.show = false
      },
      //* Открыть диалог списка участков..
      openDepartmentsListDialog (item) {
        this.currentDivisionItem = item
        this.departmentsListDialog.show = true
      },
      //* Закрыть диалог списка.
      closeDepartmentsListDialog () {
        this.currentDivisionItem = {}
        this.departmentsListDialog.show = false
      },
      //* Открыть диалог редактирования предприятия/цеха/участка.
      openEditDialog (item) {
        console.log('1')
      },
      //* Нет, не редактировать предприятие/цех/участок.
      noEditDialog (item) {
        console.log('1')
      },
      //* Да, редактировать предприятие/цех/участок.
      yesEditDialog (item) {
        console.log('1')
      },
      //* Открыть диалог удаления предприятия/цеха/участка.
      openRemoveDialog (item) {
        this.currentRemoveItem = item
        this.removeDialog.show = true
      },
      //* Нет, я не уверен, что хочу удалить.
      noRemoveDialog () {
        this.removeDialog.show = false
        this.currentRemoveItem = {}
      },
      //* Да, я уверен, что хочу удалить.
      yesRemoveDialog () {
        if (this.currentRemoveItem.companyId) {
          this.companies.forEach((company, i) => {
            if (company === this.currentRemoveItem) {
              //* Удаляем предприятие из базы данных.
              Axios.delete(`${GKP7API}/api/v1/company/${this.currentRemoveItem.companyId}`, {
                headers: {'Authorization': Authentication.getAuthenticationHeader(this)}
              }).then(res => {
                if (res.data.success) {
                  //* Удаляем предприятие из списка на фронтенде.
                  this.companies.splice(i, 1)
                  this.snackBar.show = true
                  this.snackBar.color = 'green darken-1 white--text'
                  this.snackBar.timeout = 1000
                  this.snackBar.message = res.data.message
                } else {
                  this.snackBar.show = true
                  this.snackBar.color = 'red darken-2 white--text'
                  this.snackBar.timeout = 5000
                  this.snackBar.message = res.data.message
                }
              }).catch(err => {
                this.errorHandler(err)
              })
            }
          })
        } else if (this.currentRemoveItem.divisionId) {
          this.companies.forEach((company, i) => {
            company.companyDivisions.forEach((division, j) => {
              if (division === this.currentRemoveItem) {
                //* Удаляем цех из базы данных.
                Axios.delete(`${GKP7API}/api/v1/company/${this.currentCompanyItem.companyId}/${this.currentRemoveItem.divisionId}`, {
                  headers: {'Authorization': Authentication.getAuthenticationHeader(this)}
                }).then(res => {
                  if (res.data.success) {
                    //* Удаляем цех из списка на фронтенде.
                    this.companies[i].companyDivisions.splice(j, 1)
                    this.snackBar.show = true
                    this.snackBar.color = 'green darken-1 white--text'
                    this.snackBar.timeout = 1000
                    this.snackBar.message = res.data.message
                  } else {
                    this.snackBar.show = true
                    this.snackBar.color = 'red darken-2 white--text'
                    this.snackBar.timeout = 5000
                    this.snackBar.message = res.data.message
                  }
                }).catch(err => {
                  this.errorHandler(err)
                })
              }
            })
          })
        } else if (this.currentRemoveItem.departmentId) {
          this.companies.forEach((company, i) => {
            company.companyDivisions.forEach((division, j) => {
              division.divisionDepartments.forEach((department, k) => {
                if (department === this.currentRemoveItem) {
                  //* Удаляем участок из базы данных.
                  Axios.delete(`${GKP7API}/api/v1/company/${this.currentCompanyItem.companyId}/${this.currentDivisionItem.divisionId}/${this.currentRemoveItem.departmentId}`, {
                    headers: {'Authorization': Authentication.getAuthenticationHeader(this)}
                  }).then(res => {
                    if (res.data.success) {
                      //* Удаляем участок из списка на фронтенде.
                      this.companies[i].companyDivisions[j].divisionDepartments.splice(k, 1)
                      this.snackBar.show = true
                      this.snackBar.color = 'green darken-1 white--text'
                      this.snackBar.timeout = 1000
                      this.snackBar.message = res.data.message
                    } else {
                      this.snackBar.show = true
                      this.snackBar.color = 'red darken-2 white--text'
                      this.snackBar.timeout = 5000
                      this.snackBar.message = res.data.message
                    }
                  }).catch(err => {
                    this.errorHandler(err)
                  })
                }
              })
            })
          })
        } else {
          this.snackBar.show = true
          this.snackBar.color = 'red lighten-1'
          this.snackBar.message = 'Не знаю, что удалять.'
        }
        this.removeDialog.show = false
        this.currentRemoveItem = {}
      },
      //* Методы работы с диалогом добавления предприятия.
      openAddCompanyDialog () {
        this.addCompanyDialog.show = true
      },
      saveAddCompanyDialog () {
        console.log('save add company dialog')
        this.addCompanyDialog.show = false
      },
      closeAddCompanyDialog () {
        this.addCompanyDialog.show = false
      },
      //* Методы работы с добавлением цеха.
      openAddDivisionDialog () {
        this.addCompanyDialog.show = true
      },
      saveAddDivisionDialog () {
        console.log('save add division dialog')
        this.addCompanyDialog.show = false
      },
      closeAddDivisionDialog () {
        this.addCompanyDialog.show = false
      },
      //* Методы работы с добавлением участка.
      openAddDepartmentDialog () {
        this.addCompanyDialog.show = true
      },
      saveAddDepartmentDialog () {
        console.log('save add department dialog')
        this.addCompanyDialog.show = false
      },
      closeAddDepartmentDialog () {
        this.addCompanyDialog.show = false
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
