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
            <h2 class="text-xs-center">Редактор вредностей</h2>
            <v-container grid-list-md>

              <v-layout row wrap>
                <!-- Поле для поиска -->
                <v-flex sm12 md8>
                  <v-text-field
                      append-icon="search"
                      label="Поиск"
                      hide-details
                      v-model="companiesListSearch"
                  >
                  </v-text-field>
                </v-flex>
                <!-- / Поле для поиска -->

                <!-- Добавить предприятие -->
                <v-flex sm12 md4>
                  <v-btn @click.native="openAddDialog('company')" :color="subSystem.secondaryColor" dark large block>
                    Добавить
                    предприятие
                  </v-btn>
                </v-flex>
                <!-- / Добавить предприятие -->
              </v-layout>

              <!-- Сама таблица -->
              <v-data-table
                  v-if="companies.length > 0"
                  :headers="[
                    {text: 'Код', value: 'companyId'},
                    {text: 'Название предприятия', value: 'companyName'},
                    {text: 'Тариф', value: 'companyRate'},
                    {text: 'Действия'}
                  ]"
                  :items="companies"
                  :search="companiesListSearch"
                  no-data-text="Информации не найдено"
                  no-results-text="По запросу ничего не найдено"
                  :rows-per-page-items="[7,15,{'text':'Все','value':-1}]"
                  rows-per-page-text="Строк на странице:"
                  class="elevation-10"
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
                    <td width="90px">{{ props.item.companyId }}</td>
                    <td>{{ props.item.companyName }}</td>
                    <td width="90px">{{ props.item.companyRate }}</td>
                    <td width="211px">
                      <v-btn @click.native="openDivisionsListDialog(props.item)" :color="subSystem.primaryColor"
                             icon>
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
          secondaryColor: 'orange darken-3'
        }
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
    },
    methods: {
      //* Обработчик ошибок.
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
