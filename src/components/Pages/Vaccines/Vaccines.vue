<template>
  <v-app>
    <app-header :subsystem="subSystemPrimaryColor" subtitle="Прививки">
    </app-header>
    <v-content>
      <v-container fluid fill-height>
        <v-layout
            justify-center
            align-center
        >
          <v-flex xs12 md10>
            <h2 class="text-xs-center">Введите имя пациента</h2>
            <v-container grid-list-md>
              <v-layout row wrap>
                <v-flex xs12 md4>
                  <v-text-field @keyup.enter="getPatients" :color="subSystemSecondaryColor" label="Фамилия"
                                v-model="patientQuery.lastName" box>
                  </v-text-field>
                </v-flex>
                <v-flex xs12 md4>
                  <v-text-field @keyup.enter="getPatients" :color="subSystemSecondaryColor" label="Имя"
                                v-model="patientQuery.firstName" box>
                  </v-text-field>
                </v-flex>
                <v-flex xs12 md4>
                  <v-text-field @keyup.enter="getPatients" :color="subSystemSecondaryColor" label="Отчество"
                                v-model="patientQuery.middleName" box>
                  </v-text-field>
                </v-flex>
                <v-flex xs12>
                  <v-btn @click.native="getPatients" :color="subSystemSecondaryColor" dark large block>Найти</v-btn>
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
                    <td>{{ props.item.dateBirth | formatDate }}</td>
                    <td>{{ (props.item.sex) ? 'Муж' : 'Жен' }}</td>
                    <td width="211px">
                      <v-btn @click.native="addVaccineDialog(props.item)" :color="subSystemPrimaryColor" icon>
                        <v-icon color="white">note_add</v-icon>
                      </v-btn>
                      <v-btn @click.native="showVaccinesDialog(props.item)" :color="subSystemSecondaryColor" icon>
                        <v-icon color="white">local_drink</v-icon>
                      </v-btn>
                      <v-btn v-if="props.item.hasActiveMedos" @click.native="console.log('medos')"
                             color="amber darken-4" icon>
                        <v-icon color="white">account_box</v-icon>
                      </v-btn>
                    </td>
                  </tr>
                </template>
              </v-data-table>
            </v-container>
          </v-flex>
        </v-layout>
      </v-container>
    </v-content>
    <app-footer :subsystem="subSystemPrimaryColor">
    </app-footer>

    <v-snackbar :timeout="snackTimeout"
                right="right"
                :color="snackColor"
                v-model="showSnackbar">
      {{ snackMessage }}
      <v-btn flat icon @click.native="showSnackbar = false">
        <v-icon>clear</v-icon>
      </v-btn>
    </v-snackbar>

    <v-dialog v-model="showAddDialog" persistent max-width="800px">
      <v-card>
        <v-card-title>
          <span class="headline">{{ currentPatient.fio }}</span>
        </v-card-title>
        <v-card-text>
          <v-container grid-list-md>
            <v-layout row wrap>
              <v-flex sm12 md4>
                <v-select
                    :items="vaccineVocabulary.map(vaccine => vaccine.vaccineName)"
                    v-model="currentVaccine.vaccine.vaccineName"
                    label="Прививка"
                    @blur="updateVocabularyDrug"
                    autocomplete
                    :color="subSystemPrimaryColor"
                >
                </v-select>
              </v-flex>
              <v-flex sm12 md4>
                <v-select
                    :items="currentVocabulary.vocabularyDrugs"
                    v-model="currentVaccine.vaccine.drugName"
                    label="Препарат"
                    @blur="updateVocabularySeries"
                    autocomplete
                    :color="subSystemPrimaryColor"
                >
                </v-select>
              </v-flex>
              <v-flex sm12 md2>
                <v-select
                    :items="currentVocabulary.vocabularySeries"
                    v-model="currentVaccine.vaccine.drugSeries"
                    label="Серия"
                    @blur="updateDateExpiration"
                    autocomplete
                    :color="subSystemPrimaryColor"
                >
                </v-select>
              </v-flex>
              <v-flex sm12 md2>
                <v-text-field
                    v-model="currentVaccine.dateExpiration"
                    label="Срок"
                    :color="subSystemPrimaryColor"
                    disabled
                >
                </v-text-field>
              </v-flex>
            </v-layout>
            <v-layout row wrap>
              <v-flex xs12 sm6 md4>
                <v-select
                    :items="methodVocabulary"
                    v-model="currentVaccine.invasionMethod"
                    label="Метод введения"
                    autocomplete
                    :color="subSystemPrimaryColor"
                >
                </v-select>
              </v-flex>
              <v-flex xs12 sm6 md2>
                <v-text-field
                    v-model="currentVaccine.dose"
                    mask="#.##"
                    return-masked-value
                    label="Доза"
                    :color="subSystemPrimaryColor"
                >
                </v-text-field>
              </v-flex>
              <v-flex xs12 sm6 md3>
                <v-select
                    :items="vaccineTypeVocabulary"
                    v-model="currentVaccine.vaccineType"
                    label="Тип вакцинации"
                    autocomplete
                    :color="subSystemPrimaryColor"
                >
                </v-select>
              </v-flex>
              <v-flex xs12 sm6 md3>
                <v-select
                    :items="riskGroupVocabulary"
                    v-model="currentVaccine.riskGroup"
                    label="Группа риска"
                    autocomplete
                    :color="subSystemPrimaryColor"
                >
                </v-select>
              </v-flex>
            </v-layout>
            <v-layout row wrap>
              <v-flex xs12 sm6 md3>
                <v-text-field
                    v-model="currentVaccine.dateVaccination"
                    mask="##.##.####"
                    return-masked-value
                    label="Дата вакцинации"
                    :color="subSystemPrimaryColor"
                >
                </v-text-field>
              </v-flex>
              <v-flex xs12 sm6 md3>
                <v-text-field
                    v-model="currentVaccine.dateRevaccination"
                    mask="##.##.####"
                    return-masked-value
                    label="Дата ревакцинации"
                    :color="subSystemPrimaryColor"
                >
                </v-text-field>
              </v-flex>
              <v-flex xs12 sm6 md3>
                <v-select
                    :items="['1 - платно', '2 - бесплатно']"
                    v-model="currentVaccine.payment"
                    label="Оплата"
                    autocomplete
                    :color="subSystemPrimaryColor"
                >
                </v-select>
              </v-flex>
              <v-flex xs12 sm6 md3>
                <v-text-field
                    v-model="currentUser.fio"
                    label="Пользователь"
                    :color="subSystemPrimaryColor"
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
          <v-btn :color="subSystemSecondaryColor" flat @click.native="closeAddDialog">Закрыть</v-btn>
          <v-btn :color="subSystemPrimaryColor" class="white--text" @click.native="saveAddDialog">Сохранить</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="showListDialog" persistent max-width="800px">
      <v-btn color="primary" dark slot="activator" class="mb-2">New Item</v-btn>
      <v-card>
        <v-card-title>
          <span class="headline">{{ currentPatient.fio }}</span>
        </v-card-title>
        <v-card-text>
          <v-container grid-list-md>
            <v-data-table
                :headers="[
                  { text: 'Прививка', value: 'vaccine.vaccineName'},
                  { text: 'Дата вакцинации', value: 'dateVaccination' },
                  { text: 'Дата ревакцинации', value: 'dateRevaccination' }
                ]"
                :items="currentPatient.vaccines"
                rows-per-page-text="Строк на странице:"
                class="elevation-10 mt-4"
            >
              <template slot="items" slot-scope="props">
                <tr>
                  <!--<td>{{ props.item }}</td>-->
                  <td>{{ props.item.vaccine.vaccineName }}</td>
                  <td>{{ props.item.dateVaccination | formatDate }}</td>
                  <td>{{ props.item.dateRevaccination | formatDate }}</td>
                  <td width="156px">
                    <v-btn @click.native="console.log('lol')" :color="subSystemPrimaryColor" icon>
                      <v-icon color="white">edit</v-icon>
                    </v-btn>
                    <v-btn @click.native="console.log('lol')" color="red lighten-1" icon>
                      <v-icon color="white">clear</v-icon>
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
          <v-btn @click.native="closeVaccinesDialog" :color="subSystemPrimaryColor" flat>Закрыть</v-btn>
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
        subSystemPrimaryColor: 'green darken-4',
        subSystemSecondaryColor: 'brown darken-2',
        snackMessage: '',
        snackTimeout: 10000,
        snackColor: '',
        showSnackbar: false,
        showAddDialog: false,
        showListDialog: false,
        patientQuery: {},
        showDateVaccination: false,
        patients: [],
        currentUser: {},
        currentPatient: {},
        currentVaccine: {
          vaccine: {
            vaccineName: '',
            drugName: '',
            drugSeries: ''
          },
          vaccineType: '',
          dateVaccination: '',
          dateRevaccination: '',
          invasionMethod: '',
          dose: '',
          controlNumber: '',
          dateExpiration: '',
          lpuCode: '',
          riskGroup: '',
          payment: '',
          updatedBy: ''
        },
        currentVocabulary: {
          vocabularyVaccine: '',
          vocabularyDrugs: [],
          vocabularySeries: []
        },
        vaccineVocabulary: [
          {
            vaccineId: '1',
            vaccineName: 'Дифтерия',
            drugNames: [
              {
                drugName: '1-1',
                drugSeries: [
                  {
                    seriesName: '1-1-1',
                    seriesExpiration: '01.01.2019'
                  },
                  {
                    seriesName: '1-1-2',
                    seriesExpiration: '01.01.2019'
                  },
                  {
                    seriesName: '1-1-3',
                    seriesExpiration: '01.01.2019'
                  },
                  {
                    seriesName: '1-1-4',
                    seriesExpiration: '01.01.2019'
                  }
                ]
              },
              {
                drugName: '1-2',
                drugSeries: [
                  {
                    seriesName: '1-2-1',
                    seriesExpiration: '01.01.2019'
                  },
                  {
                    seriesName: '1-2-2',
                    seriesExpiration: '01.01.2019'
                  },
                  {
                    seriesName: '1-2-3',
                    seriesExpiration: '01.01.2019'
                  },
                  {
                    seriesName: '1-2-4',
                    seriesExpiration: '01.01.2019'
                  }
                ]
              },
              {
                drugName: '1-3',
                drugSeries: [
                  {
                    seriesName: '1-3-1',
                    seriesExpiration: '01.01.2019'
                  },
                  {
                    seriesName: '1-3-2',
                    seriesExpiration: '01.01.2019'
                  },
                  {
                    seriesName: '1-3-3',
                    seriesExpiration: '01.01.2019'
                  },
                  {
                    seriesName: '1-3-4',
                    seriesExpiration: '01.01.2019'
                  }
                ]
              }
            ]
          },
          {
            vaccineName: '2 - клещевой энцефалит',
            drugNames: [
              {
                drugName: '2-1',
                drugSeries: [
                  {
                    seriesName: '2-1-1',
                    seriesExpiration: '01.01.2019'
                  },
                  {
                    seriesName: '2-1-2',
                    seriesExpiration: '01.01.2019'
                  },
                  {
                    seriesName: '2-1-3',
                    seriesExpiration: '01.01.2019'
                  },
                  {
                    seriesName: '2-1-4',
                    seriesExpiration: '01.01.2019'
                  }
                ]
              },
              {
                drugName: '2-2',
                drugSeries: [
                  {
                    seriesName: '2-2-1',
                    seriesExpiration: '01.01.2019'
                  },
                  {
                    seriesName: '2-2-2',
                    seriesExpiration: '01.01.2019'
                  },
                  {
                    seriesName: '2-2-3',
                    seriesExpiration: '01.01.2019'
                  },
                  {
                    seriesName: '2-2-4',
                    seriesExpiration: '01.01.2019'
                  }
                ]
              },
              {
                drugName: '2-3',
                drugSeries: [
                  {
                    seriesName: '2-3-1',
                    seriesExpiration: '01.01.2019'
                  },
                  {
                    seriesName: '2-3-2',
                    seriesExpiration: '01.01.2019'
                  },
                  {
                    seriesName: '2-3-3',
                    seriesExpiration: '01.01.2019'
                  },
                  {
                    seriesName: '2-3-4',
                    seriesExpiration: '01.01.2019'
                  }
                ]
              }
            ]
          }
        ],
        vaccineTypeVocabulary: [
          '1 - V1', '2 - V2', '3 - V3', '4 - IR', '5 - RV'
        ],
        methodVocabulary: [
          '1 - подкожно',
          '2 - внутримышечно',
          '3 - интроназально',
          '4 - накожно'
        ],
        lpuVocabulary: [
          'ЛПУ 1',
          'ЛПУ 2',
          'ЛПУ 3',
          'ЛПУ 4',
          'ЛПУ 5',
          'ЛПУ 6',
          'ЛПУ 7',
          'ЛПУ 8'
        ],
        riskGroupVocabulary: [
          '1 - Рабочие ЧМК',
          '2 - УКХ',
          '3 - ОДУ',
          '4 - ЧП',
          '5 - Общепит'
        ]
      }
    },
    //* Подгружаем объект залогиненного пользователя для последующего использования.
    mounted () {
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
      //* Открыть диалог добавления прививки. Подхватываем пациента и обнуляем объект прививки.
      addVaccineDialog (item) {
        this.showAddDialog = true
        this.currentPatient = item
        this.currentVaccine = {
          vaccine: {
            vaccineName: '',
            drugName: '',
            drugSeries: ''
          },
          vaccineType: '',
          dateVaccination: '',
          dateRevaccination: '',
          invasionMethod: '',
          dose: '',
          controlNumber: '',
          dateExpiration: '',
          lpuCode: '',
          riskGroup: '',
          payment: '',
          updatedBy: ''
        }
      },
      //* При обновлении селектора прививки подставляем значения в селектор препаратов.
      updateVocabularyDrug () {
        if (this.currentVaccine.vaccine.vaccineName !== '') {
          this.currentVocabulary.vocabularyDrugs = this.vaccineVocabulary.filter(vaccine => vaccine.vaccineName === this.currentVaccine.vaccine.vaccineName)[0].drugNames.map(drugNames => drugNames.drugName)
        }
      },
      //* При обновлении селектора препарата подставляем значения в селектор серий.
      updateVocabularySeries () {
        if (this.currentVaccine.vaccine.drugName !== '') {
          this.currentVocabulary.vocabularySeries = this.vaccineVocabulary.filter(vaccine => vaccine.vaccineName === this.currentVaccine.vaccine.vaccineName)[0].drugNames.filter(drugNames => drugNames.drugName === this.currentVaccine.vaccine.drugName)[0].drugSeries.map(seriesNames => seriesNames.seriesName)
        }
      },
      //* При обновлении селектора серий подставляем значение в срок годности.
      updateDateExpiration () {
        if (this.currentVaccine.vaccine.drugSeries !== '') {
          this.currentVaccine.dateExpiration = this.vaccineVocabulary.filter(vaccine => vaccine.vaccineName === this.currentVaccine.vaccine.vaccineName)[0].drugNames.filter(drugNames => drugNames.drugName === this.currentVaccine.vaccine.drugName)[0].drugSeries.filter(seriesNames => seriesNames.seriesName === this.currentVaccine.vaccine.drugSeries)[0].seriesExpiration
        }
      },
      //* Закрыть диалог добавления прививки. Обнуление пациента и прививки.
      closeAddDialog () {
        this.showAddDialog = false
        this.currentPatient = {}
        this.currentVaccine = {
          vaccine: {
            vaccineName: '',
            drugName: '',
            drugSeries: ''
          },
          vaccineType: '',
          dateVaccination: '',
          dateRevaccination: '',
          invasionMethod: '',
          dose: '',
          controlNumber: '',
          dateExpiration: '',
          lpuCode: '',
          riskGroup: '',
          payment: '',
          updatedBy: ''
        }
      },
      //* Сохранить добавленную прививку в пациента и отправить на сервер.
      saveAddDialog () {
        this.currentVaccine.updatedBy = this.currentUser._id
        this.currentVaccine.dateVaccination = this.toDate(this.currentVaccine.dateVaccination)
        this.currentVaccine.dateRevaccination = this.toDate(this.currentVaccine.dateRevaccination)
        this.currentVaccine.dateExpiration = this.toDate(this.currentVaccine.dateExpiration)
        this.currentPatient.newVaccine = this.currentVaccine
        this.sendNewVaccine()
        this.showAddDialog = false
      },
      //* Отправляем новую прививку в БД.
      sendNewVaccine () {
        Axios.post(`${GKP7API}/api/v1/vaccine`, this.currentPatient, {
          headers: {'Authorization': Authentication.getAuthenticationHeader(this)}
        }).then(res => {
          if (res.data.success) {
            this.showSnackbar = false
            this.currentVaccine = {
              vaccine: {
                vaccineName: '',
                drugName: '',
                drugSeries: ''
              },
              vaccineType: '',
              dateVaccination: '',
              dateRevaccination: '',
              invasionMethod: '',
              dose: '',
              controlNumber: '',
              dateExpiration: '',
              lpuCode: '',
              riskGroup: '',
              payment: '',
              updatedBy: ''
            }
          } else {
            this.showSnackbar = true
            this.snackColor = 'red lighten-1'
            this.snackMessage = res.data.message
          }
        }).catch(err => {
          this.errorHandler(err)
        })
      },
      //* Диалог просмотра всех прививок.
      showVaccinesDialog (item) {
        this.currentPatient = item
        Axios.get(`${GKP7API}/api/v1/vaccines/${item._id}`, {
          headers: {'Authorization': Authentication.getAuthenticationHeader(this)}
        }).then(res => {
          if (res.data.success) {
            this.showListDialog = true
            this.currentPatient.vaccines = res.data.vaccines
          } else {
            this.showSnackbar = true
            this.snackColor = 'yellow accent-3 black--text'
            this.snackMessage = res.data.message
          }
        }).catch(err => {
          this.errorHandler(err)
        })
      },
      closeVaccinesDialog () {
        this.showListDialog = false
      },
      //* Обработчик ошибок, который добавляет сообщение в snackbar.
      errorHandler (err) {
        const status = err.response.status
        this.showSnackbar = true
        this.snackColor = 'red lighten-1'
        if (status === 401) {
          this.snackMessage = 'Вы не авторизованы.'
        }
        this.snackMessage = err.response.data.message
      },
      //* Переводим в ISODate.
      toDate (dateStr) {
        let parts = dateStr.split('.')
        return new Date(parts[2], parts[1] - 1, parts[0])
      }
    }
  }
</script>

<style lang="scss">
  .application .theme--light.input-group:not(.input-group--error).input-group--disabled .input-group__selections__comma,
  .application .theme--light.input-group:not(.input-group--error).input-group--disabled label,
  .theme--light .input-group:not(.input-group--error).input-group--disabled .input-group__selections__comma,
  .theme--light .input-group:not(.input-group--error).input-group--disabled label,
  .application .theme--light.input-group input:disabled,
  .application .theme--light.input-group textarea:disabled,
  .theme--light .input-group input:disabled,
  .theme--light .input-group textarea:disabled {
    color: rgba(#1b5e20, 0.7) !important;
  }
</style>
