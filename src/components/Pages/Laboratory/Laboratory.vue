<template>
  <div class=uwd-container>
    <app-header :subsystem="subSystem.primaryColor" subtitle="Лаборатория" :currentUser="currentUser">
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
                    <td width="72px">
                      <v-tooltip right color="light-blue darken-4">
                        <v-icon
                          slot="activator"
                          v-if="(props.item.hasActiveMedos)"
                          color="light-blue darken-4">
                          assignment_ind
                        </v-icon>
                        <span>Пациент проходит мед. осмотр</span>
                      </v-tooltip>
                    </td>
                    <td>{{ props.item.fio }}</td>
                    <td>{{ props.item.dateBirth }}</td>
                    <td>{{ (props.item.sex) ? 'Муж' : 'Жен' }}</td>
                    <td width="266px">
                      <v-tooltip top :color="subSystem.primaryColor">
                        <v-btn
                          slot="activator"
                          @click.native="openBloodResultsListDialog(props.item)"
                          :color="subSystem.primaryColor"
                          icon
                        >
                          <v-icon color="white">colorize</v-icon>
                        </v-btn>
                        <span>Список анализов крови</span>
                      </v-tooltip>
                      <v-tooltip top :color="subSystem.secondaryColor">
                        <v-btn
                          slot="activator"
                          @click.native="openUrineResultsListDialog(props.item)"
                          :color="subSystem.secondaryColor"
                          icon
                        >
                          <v-icon color="white">colorize</v-icon>
                        </v-btn>
                        <span>Список анализов мочи</span>
                      </v-tooltip>
                      <v-tooltip v-if="ifPatientNeedsSmear(props.item)" top color="purple darken-3">
                        <v-btn
                          slot="activator"
                          @click.native="openSmearResultsListDialog(props.item)"
                          color="purple darken-3"
                          icon
                        >
                          <v-icon color="white">colorize</v-icon>
                        </v-btn>
                        <span>Список мазков</span>
                      </v-tooltip>
                      <v-tooltip v-if="ifPatientNeedsRw(props.item)" top color="blue-grey darken-4">
                        <v-btn
                          slot="activator"
                          @click.native="openRwResultsListDialog(props.item)"
                          color="blue-grey darken-4"
                          icon
                        >
                          <v-icon color="white">colorize</v-icon>
                        </v-btn>
                        <span>Список анализов RW</span>
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

    <!-- Диалог списка анализов -->
    <v-dialog v-model="listAnalyzesDialog.show" persistent lazy max-width="800px">
      <v-card v-if="listAnalyzesDialog.analyzeType === 'blood'">
        <v-card-title>
          <span class="headline">Анализы крови пациента <br/><span
            class="green--text text--darken-2">{{ currentEditPatient.fio }}</span>
          </span>
          <v-spacer>
          </v-spacer>
          <v-layout row wrap>
            <!-- Добавить анализ -->
            <v-flex sm12 md12>
              <v-btn @click.native="openResultDialog({edit: false})" :color="subSystem.primaryColor"
                     dark large block>
                Добавить анализ крови
              </v-btn>
            </v-flex>
            <!-- / Добавить анализ -->
          </v-layout>
        </v-card-title>
        <v-card-text>
          <v-container grid-list-md v-if="currentEditPatient.bloodResults.length > 0">
            <v-data-table
              :headers="[
                  { text: 'Дата анализа', value: 'bloodDate' },
                  { text: 'Гемоглобин', value: 'bloodResult.hemoglobin' },
                  { text: 'Лейкоциты', value: 'bloodResult.leucocytes' },
                  { text: 'СОЭ', value: 'bloodResult.esr' },
                  { text: 'Действия', value: '' }
                ]"
              :items="currentEditPatient.bloodResults"
              hide-actions
              class="elevation-5 mt-4"
            >
              <template slot="items" slot-scope="props">
                <tr>
                  <td>{{ props.item.bloodDate | formatDate }}</td>
                  <td>{{ props.item.bloodResult.hemoglobin }}</td>
                  <td>{{ props.item.bloodResult.leucocytes }}</td>
                  <td>{{ props.item.bloodResult.esr }}</td>
                  <td width="172px">
                    <v-tooltip top :color="subSystem.primaryColor">
                      <v-btn
                        slot="activator"
                        @click.native="openResultDialog({edit: true, item:props.item})"
                        :color="subSystem.primaryColor"
                        icon
                      >
                        <v-icon color="white">colorize</v-icon>
                      </v-btn>
                      <span>Информация об анализе</span>
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
                      <span>Удалить анализ</span>
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
          <v-btn :color="subSystem.primaryColor" flat @click.native="noResultsListDialog">Закрыть</v-btn>
        </v-card-actions>
      </v-card>
      <v-card v-if="listAnalyzesDialog.analyzeType === 'urineClinical'">
        <v-card-title>
          <span class="headline">Анализы мочи пациента <br/><span
            class="green--text text--darken-2">{{ currentEditPatient.fio }}</span>
          </span>
          <v-spacer>
          </v-spacer>
          <v-layout row wrap>
            <!-- Добавить анализ -->
            <v-flex sm12 md12>
              <v-btn @click.native="openResultDialog({edit: false})"
                     :color="subSystem.secondaryColor"
                     dark large block>
                Добавить анализ мочи
              </v-btn>
            </v-flex>
            <!-- / Добавить анализ -->
          </v-layout>
        </v-card-title>
        <v-card-text>
          <v-container grid-list-md v-if="currentEditPatient.urineClinicalResults.length > 0">
            <v-data-table
              :headers="[
                  { text: 'Дата анализа', value: 'urineDate' },
                  { text: 'Цвет', value: 'urineGeneral.color.colorName' },
                  { text: 'Реакция', value: 'urineGeneral.reaction.reactionName' },
                  { text: 'Плотность', value: 'urineGeneral.density' },
                  { text: 'Действия', value: '' }
                ]"
              :items="currentEditPatient.urineClinicalResults"
              hide-actions
              class="elevation-5 mt-4"
            >
              <template slot="items" slot-scope="props">
                <tr>
                  <td>{{ props.item.urineDate | formatDate }}</td>
                  <td>{{ props.item.urineGeneral.color.colorName }}</td>
                  <td>{{ props.item.urineGeneral.reaction.reactionName }}</td>
                  <td>{{ props.item.urineGeneral.density }}</td>
                  <td width="172px">
                    <v-tooltip top :color="subSystem.secondaryColor">
                      <v-btn
                        slot="activator"
                        @click.native="openResultDialog({edit: true, item:props.item})"
                        :color="subSystem.secondaryColor"
                        icon
                      >
                        <v-icon color="white">colorize</v-icon>
                      </v-btn>
                      <span>Информация об анализе</span>
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
                      <span>Удалить анализ</span>
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
          <v-btn :color="subSystem.secondaryColor" flat @click.native="noResultsListDialog">Закрыть</v-btn>
        </v-card-actions>
      </v-card>
      <v-card v-if="listAnalyzesDialog.analyzeType === 'smear'">
        <v-card-title>
          <span class="headline">Мазки пациента <br/><span
            class="green--text text--darken-2">{{ currentEditPatient.fio }}</span>
          </span>
          <v-spacer>
          </v-spacer>
          <v-layout row wrap>
            <!-- Добавить анализ -->
            <v-flex sm12 md12>
              <v-btn @click.native="openResultDialog({edit: false})" color="purple darken-3"
                     dark large block>
                Добавить мазок
              </v-btn>
            </v-flex>
            <!-- / Добавить анализ -->
          </v-layout>
        </v-card-title>
        <v-card-text>
          <v-container grid-list-md v-if="currentEditPatient.smearResults.length > 0">
            <v-data-table
              :headers="[
                  { text: 'Дата анализа', value: 'smearDate' },
                  { text: 'Гонококки', value: 'smearResult.smearGonococcus' },
                  { text: 'Лейкоциты', value: 'smearResult.smearLeucocytes' },
                  { text: 'Действия', value: '' }
                ]"
              :items="currentEditPatient.smearResults"
              hide-actions
              class="elevation-5 mt-4"
            >
              <template slot="items" slot-scope="props">
                <tr>
                  <td>{{ props.item.smearDate | formatDate }}</td>
                  <td>{{ (props.item.smearResult.smearGonococcus) ? 'Обнаружены' : 'Не обнаружены' }}</td>
                  <td>{{ smearLeucocytes.find(item => item.value === props.item.smearResult.smearLeucocytes).text }}
                  </td>
                  <td width="172px">
                    <v-tooltip top color="purple darken-3">
                      <v-btn
                        slot="activator"
                        @click.native="openResultDialog({edit: true, item:props.item})"
                        color="purple darken-3"
                        icon
                      >
                        <v-icon color="white">colorize</v-icon>
                      </v-btn>
                      <span>Информация об анализе</span>
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
                      <span>Удалить анализ</span>
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
          <v-btn color="purple darken-3" flat @click.native="noResultsListDialog">Закрыть</v-btn>
        </v-card-actions>
      </v-card>
      <v-card v-if="listAnalyzesDialog.analyzeType === 'rw'">
        <v-card-title>
          <span class="headline">Анализы на RW пациента <br/><span
            class="green--text text--darken-2">{{ currentEditPatient.fio }}</span>
          </span>
          <v-spacer>
          </v-spacer>
          <v-layout row wrap>
            <!-- Добавить анализ -->
            <v-flex sm12 md12>
              <v-btn @click.native="openResultDialog({edit: false})" color="blue-grey darken-4"
                     dark large block>
                Добавить анализ
              </v-btn>
            </v-flex>
            <!-- / Добавить анализ -->
          </v-layout>
        </v-card-title>
        <v-card-text>
          <v-container grid-list-md v-if="currentEditPatient.rwResults.length > 0">
            <v-data-table
              :headers="[
                  { text: 'Дата анализа', value: 'rwDate' },
                  { text: 'RW', value: 'rwResult' },
                  { text: 'Действия', value: '' }
                ]"
              :items="currentEditPatient.rwResults"
              hide-actions
              class="elevation-5 mt-4"
            >
              <template slot="items" slot-scope="props">
                <tr>
                  <td>{{ props.item.rwDate | formatDate }}</td>
                  <td>{{ rwTypes.find(item => item.value === props.item.rwResult).text }}</td>
                  <td width="172px">
                    <v-tooltip top color="blue-grey darken-4">
                      <v-btn
                        slot="activator"
                        @click.native="openResultDialog({edit: true, item:props.item})"
                        color="blue-grey darken-4"
                        icon
                      >
                        <v-icon color="white">colorize</v-icon>
                      </v-btn>
                      <span>Информация об анализе</span>
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
                      <span>Удалить анализ</span>
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
          <v-btn color="purple darken-3" flat @click.native="noResultsListDialog">Закрыть</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <!-- / Диалог списка анализов -->

    <!-- Диалог добавления анализа -->
    <v-dialog v-model="addAnalyzeDialog.show" persistent lazy max-width="800px">
      <v-card v-if="listAnalyzesDialog.analyzeType === 'blood'">
        <v-card-title>
          <v-flex sm12>
            <span class="headline">
            Добавление анализа крови для<br/><span
              class="green--text text--darken-2">{{ currentEditPatient.fio }}</span>?
          </span>
          </v-flex>
        </v-card-title>
        <v-card-text>
          <v-container grid-list-md>
            <v-layout row wrap>
              <v-flex sm12 md2>
                <v-text-field
                  mask="##.##.####"
                  return-masked-value
                  v-if="!addAnalyzeDialog.edit"
                  label="Дата анализа"
                  :color="subSystem.primaryColor"
                  v-model="currentBloodResult.bloodDate"
                >
                </v-text-field>
                <v-text-field
                  v-if="addAnalyzeDialog.edit"
                  label="Дата анализа"
                  :color="subSystem.primaryColor"
                  :value="dateFromIso(currentBloodResult.bloodDate)"
                  readonly
                  disabled
                >
                </v-text-field>
              </v-flex>
              <v-flex sm12 md2>
                <v-text-field
                  label="Номер"
                  :color="subSystem.primaryColor"
                  v-model="currentBloodResult.bloodNumber"
                >
                </v-text-field>
              </v-flex>
              <v-flex sm12 md8>
                <v-spacer></v-spacer>
              </v-flex>
            </v-layout>
            <v-layout row wrap>
              <v-flex sm12>
                <h3>Общий клинический анализ крови</h3>
              </v-flex>
            </v-layout>
            <v-layout row wrap>
              <v-flex sm12 md4>
                <v-text-field
                  label="Гемоглобин"
                  :color="subSystem.primaryColor"
                  v-model="currentBloodResult.bloodResult.hemoglobin"
                >
                </v-text-field>
              </v-flex>
              <v-flex sm12 md4>
                <v-text-field
                  label="Лейкоциты"
                  :color="subSystem.primaryColor"
                  v-model="currentBloodResult.bloodResult.leucocytes"
                >
                </v-text-field>
              </v-flex>
              <v-flex sm12 md4>
                <v-text-field
                  label="СОЭ"
                  :color="subSystem.primaryColor"
                  v-model="currentBloodResult.bloodResult.esr"
                >
                </v-text-field>
              </v-flex>
            </v-layout>
            <v-layout row wrap>
              <v-flex sm12 md2>
                <v-text-field
                  label="Базофилы"
                  :color="subSystem.primaryColor"
                  v-model="currentBloodResult.bloodResult.basophils"
                >
                </v-text-field>
              </v-flex>
              <v-flex sm12 md2>
                <v-text-field
                  label="Эозинофилы"
                  :color="subSystem.primaryColor"
                  v-model="currentBloodResult.bloodResult.eosinophils"
                >
                </v-text-field>
              </v-flex>
              <v-flex sm12 md2>
                <v-text-field
                  label="Бласты"
                  :color="subSystem.primaryColor"
                  v-model="currentBloodResult.bloodResult.blasts"
                >
                </v-text-field>
              </v-flex>
              <v-flex sm12 md2>
                <v-text-field
                  label="Миелоциты"
                  :color="subSystem.primaryColor"
                  v-model="currentBloodResult.bloodResult.myelocytes"
                >
                </v-text-field>
              </v-flex>
              <v-flex sm12 md2>
                <v-text-field
                  label="Юные"
                  :color="subSystem.primaryColor"
                  v-model="currentBloodResult.bloodResult.young"
                >
                </v-text-field>
              </v-flex>
              <v-flex sm12 md2>
                <v-text-field
                  label="Палочки"
                  :color="subSystem.primaryColor"
                  v-model="currentBloodResult.bloodResult.sticks"
                >
                </v-text-field>
              </v-flex>
            </v-layout>
            <v-layout row wrap>
              <v-flex sm12 md2>
                <v-text-field
                  label="Сегменты"
                  :color="subSystem.primaryColor"
                  v-model="currentBloodResult.bloodResult.segments"
                >
                </v-text-field>
              </v-flex>
              <v-flex sm12 md2>
                <v-text-field
                  label="Лимфоциты"
                  :color="subSystem.primaryColor"
                  v-model="currentBloodResult.bloodResult.lymphocytes"
                >
                </v-text-field>
              </v-flex>
              <v-flex sm12 md2>
                <v-text-field
                  label="Моноциты"
                  :color="subSystem.primaryColor"
                  v-model="currentBloodResult.bloodResult.monocytes"
                >
                </v-text-field>
              </v-flex>
              <v-flex sm12 md2>
                <v-text-field
                  label="Нормобласты"
                  :color="subSystem.primaryColor"
                  v-model="currentBloodResult.bloodResult.normoblasts"
                >
                </v-text-field>
              </v-flex>
              <v-flex sm12 md4>
                <v-text-field
                  label="Токсич. зерн. нейтроф."
                  :color="subSystem.primaryColor"
                  v-model="currentBloodResult.bloodResult.tng"
                >
                </v-text-field>
              </v-flex>
            </v-layout>
            <v-layout row wrap>
              <v-flex sm12>
                <h3>Биохимический анализ крови</h3>
              </v-flex>
            </v-layout>
            <v-layout row wrap>
              <v-flex sm12 md2>
                <v-text-field
                  label="Сахар"
                  :color="subSystem.primaryColor"
                  v-model="currentBloodResult.bloodResult.sugar"
                >
                </v-text-field>
              </v-flex>
              <v-flex sm12 md2>
                <v-text-field
                  label="Холистерин"
                  :color="subSystem.primaryColor"
                  v-model="currentBloodResult.bloodResult.cholesterol"
                >
                </v-text-field>
              </v-flex>
              <v-flex sm12 md2>
                <v-text-field
                  label="Протромбин"
                  :color="subSystem.primaryColor"
                  v-model="currentBloodResult.bloodResult.prothrombin"
                >
                </v-text-field>
              </v-flex>
              <v-flex sm12 md2>
                <v-text-field
                  label="МНО"
                  :color="subSystem.primaryColor"
                  v-model="currentBloodResult.bloodResult.inr"
                >
                </v-text-field>
              </v-flex>
            </v-layout>
          </v-container>
        </v-card-text>
        <v-card-actions>
          <v-spacer>
          </v-spacer>
          <v-btn :color="subSystem.primaryColor" flat class="white--text" @click.native="noResultDialog">Закрыть
          </v-btn>
          <v-btn
            v-if="!addAnalyzeDialog.edit"
            :color="subSystem.primaryColor"
            class="white--text"
            @click.native="yesResultDialog">
            Добавить
          </v-btn>
          <v-btn
            v-if="addAnalyzeDialog.edit"
            :color="subSystem.primaryColor"
            class="white--text"
            @click.native="yesResultDialog">
            Изменить
          </v-btn>
        </v-card-actions>
      </v-card>
      <v-card v-if="listAnalyzesDialog.analyzeType === 'urineClinical'">
        <v-card-title>
          <v-flex sm12>
            <span class="headline">
            Добавление анализа мочи для<br/><span
              class="green--text text--darken-2">{{ currentEditPatient.fio }}</span>?
          </span>
          </v-flex>
        </v-card-title>
        <v-card-text>
          <v-container grid-list-md>
            <v-layout row wrap>
              <v-flex sm12 md2>
                <v-text-field
                  mask="##.##.####"
                  return-masked-value
                  v-if="!addAnalyzeDialog.edit"
                  label="Дата анализа"
                  :color="subSystem.primaryColor"
                  v-model="currentUrineClinicalResult.urineDate"
                >
                </v-text-field>
                <v-text-field
                  v-if="addAnalyzeDialog.edit"
                  label="Дата анализа"
                  :color="subSystem.primaryColor"
                  :value="dateFromIso(currentUrineClinicalResult.urineDate)"
                  readonly
                  disabled
                >
                </v-text-field>
              </v-flex>
              <v-flex sm12 md2>
                <v-text-field
                  label="Номер"
                  :color="subSystem.secondaryColor"
                  v-model="currentUrineClinicalResult.urineNumber"
                >
                </v-text-field>
              </v-flex>
              <v-flex sm12 md8>
                <v-spacer></v-spacer>
              </v-flex>
            </v-layout>
            <v-layout row wrap>
              <v-flex sm12>
                <h2>Общий анализ мочи</h2>
              </v-flex>
            </v-layout>
            <v-layout row wrap>
              <v-flex sm12 md3>
                <v-select
                  :items="urineColors"
                  label="Цвет"
                  :color="subSystem.secondaryColor"
                  v-model="currentUrineClinicalResult.urineGeneral.color"
                  autocomplete
                >
                </v-select>
              </v-flex>
              <v-flex sm12 md3>
                <v-select
                  :items="urineReactions"
                  label="Реакция"
                  :color="subSystem.secondaryColor"
                  v-model="currentUrineClinicalResult.urineGeneral.reaction"
                  autocomplete
                >
                </v-select>
              </v-flex>
              <v-flex sm12 md3>
                <v-text-field
                  label="Плотность"
                  :color="subSystem.secondaryColor"
                  v-model="currentUrineClinicalResult.urineGeneral.density"
                >
                </v-text-field>
              </v-flex>
              <v-flex sm12 md3>
                <v-select
                  :items="urineTransparency"
                  label="Прозрачность"
                  :color="subSystem.secondaryColor"
                  v-model="currentUrineClinicalResult.urineGeneral.transparency"
                  autocomplete
                >
                </v-select>
              </v-flex>
            </v-layout>
            <v-layout row wrap>
              <v-flex sm12 md3>
                <v-text-field
                  label="Белок"
                  :color="subSystem.secondaryColor"
                  v-model="currentUrineClinicalResult.urineGeneral.protein"
                >
                </v-text-field>
              </v-flex>
              <v-flex sm12 md3>
                <v-select
                  :items="urineGlucose"
                  label="Глюкоза"
                  :color="subSystem.secondaryColor"
                  v-model="currentUrineClinicalResult.urineGeneral.glucose"
                  autocomplete
                >
                </v-select>
              </v-flex>
              <v-flex sm12 md3>
                <v-select
                  :items="urineAcetone"
                  label="Ацетон"
                  :color="subSystem.secondaryColor"
                  v-model="currentUrineClinicalResult.urineGeneral.acetone"
                  autocomplete
                >
                </v-select>
              </v-flex>
              <v-flex sm12 md3>
                <v-select
                  :items="urineBile"
                  label="Желч. пигмент"
                  :color="subSystem.secondaryColor"
                  v-model="currentUrineClinicalResult.urineGeneral.bile"
                  autocomplete
                >
                </v-select>
              </v-flex>
            </v-layout>
            <v-layout row wrap>
              <v-flex sm12>
                <h3>Эпителий:</h3>
              </v-flex>
            </v-layout>
            <v-layout row wrap>
              <v-flex sm12 md3>
                <v-text-field
                  label="Плоский"
                  :color="subSystem.secondaryColor"
                  v-model="currentUrineClinicalResult.urineElements.flatEpithelium"
                >
                </v-text-field>
              </v-flex>
              <v-flex sm12 md6>
                <v-text-field
                  label="Мочевыводящих путей"
                  :color="subSystem.secondaryColor"
                  v-model="currentUrineClinicalResult.urineElements.tractEpithelium"
                >
                </v-text-field>
              </v-flex>
              <v-flex sm12 md3>
                <v-text-field
                  label="Почечный"
                  :color="subSystem.secondaryColor"
                  v-model="currentUrineClinicalResult.urineElements.renalEpithelium"
                >
                </v-text-field>
              </v-flex>
            </v-layout>
            <v-layout row wrap>
              <v-flex sm12 md6>
                <v-text-field
                  label="Лейкоциты"
                  :color="subSystem.secondaryColor"
                  v-model="currentUrineClinicalResult.urineElements.leucocytes"
                >
                </v-text-field>
              </v-flex>
              <v-flex sm12 md6>
                <v-text-field
                  label="Эритроциты"
                  :color="subSystem.secondaryColor"
                  v-model="currentUrineClinicalResult.urineElements.erythrocytes"
                >
                </v-text-field>
              </v-flex>
            </v-layout>
            <v-layout row wrap>
              <v-flex sm12>
                <h3>Цилиндры:</h3>
              </v-flex>
            </v-layout>
            <v-layout row wrap>
              <v-flex sm12 md3>
                <v-text-field
                  label="Гиалиновые"
                  :color="subSystem.secondaryColor"
                  v-model="currentUrineClinicalResult.urineElements.cylinders.hyaline"
                >
                </v-text-field>
              </v-flex>
              <v-flex sm12 md3>
                <v-text-field
                  label="Зернистые"
                  :color="subSystem.secondaryColor"
                  v-model="currentUrineClinicalResult.urineElements.cylinders.granular"
                >
                </v-text-field>
              </v-flex>
              <v-flex sm12 md3>
                <v-text-field
                  label="Восковидные"
                  :color="subSystem.secondaryColor"
                  v-model="currentUrineClinicalResult.urineElements.cylinders.waxy"
                >
                </v-text-field>
              </v-flex>
              <v-flex sm12 md3>
                <v-text-field
                  label="Эпителиальные"
                  :color="subSystem.secondaryColor"
                  v-model="currentUrineClinicalResult.urineElements.cylinders.epithelial"
                >
                </v-text-field>
              </v-flex>
            </v-layout>
            <v-layout row wrap>
              <v-flex sm12 md6>
                <v-select
                  :items="urineSalts"
                  label="Соли"
                  :color="subSystem.secondaryColor"
                  v-model="currentUrineClinicalResult.urineElements.salts"
                  autocomplete
                >
                </v-select>
              </v-flex>
              <v-flex sm12 md6>
                <v-select
                  :items="urineSlime"
                  label="Слизь"
                  :color="subSystem.secondaryColor"
                  v-model="currentUrineClinicalResult.urineElements.slime"
                  autocomplete
                >
                </v-select>
              </v-flex>
            </v-layout>
          </v-container>
        </v-card-text>
        <v-card-actions>
          <v-spacer>
          </v-spacer>
          <v-btn :color="subSystem.secondaryColor" flat class="white--text" @click.native="noResultDialog">Закрыть
          </v-btn>
          <v-btn
            v-if="!addAnalyzeDialog.edit"
            :color="subSystem.secondaryColor"
            class="white--text"
            @click.native="yesResultDialog">
            Добавить
          </v-btn>
          <v-btn
            v-if="addAnalyzeDialog.edit"
            :color="subSystem.secondaryColor"
            class="white--text"
            @click.native="yesResultDialog">
            Изменить
          </v-btn>
        </v-card-actions>
      </v-card>
      <v-card v-if="listAnalyzesDialog.analyzeType === 'smear'">
        <v-card-title>
          <v-flex sm12>
            <span class="headline">
            Добавление мазка для<br/><span
              class="green--text text--darken-2">{{ currentEditPatient.fio }}</span>?
          </span>
          </v-flex>
        </v-card-title>
        <v-card-text>
          <v-container grid-list-md>
            <v-layout row wrap>
              <v-flex sm12 md2>
                <v-text-field
                  v-if="!addAnalyzeDialog.edit"
                  label="Дата анализа"
                  color="purple darken-3"
                  v-model="currentSmearResult.smearDate"
                  mask="##.##.####"
                  return-masked-value
                >
                </v-text-field>
                <v-text-field
                  v-if="addAnalyzeDialog.edit"
                  label="Дата анализа"
                  color="purple darken-3"
                  :value="dateFromIso(currentSmearResult.smearDate)"
                  readonly
                  disabled
                >
                </v-text-field>
              </v-flex>
              <v-flex sm12 md2>
                <v-text-field
                  label="Номер"
                  color="purple darken-3"
                  v-model="currentSmearResult.smearNumber"
                >
                </v-text-field>
              </v-flex>
              <v-flex sm12 md8>
                <v-spacer></v-spacer>
              </v-flex>
            </v-layout>
            <v-layout row wrap>
              <v-flex sm12>
                <h3>Мазок на гонококк</h3>
              </v-flex>
            </v-layout>
            <v-layout row wrap>
              <v-flex sm12 md3>
                <v-select
                  :items="smearBoolean"
                  label="Гонококки"
                  color="purple darken-3"
                  v-model="currentSmearResult.smearResult.smearGonococcus"
                  autocomplete
                >
                </v-select>
              </v-flex>
              <v-flex sm12 md3>
                <v-select
                  :items="smearLeucocytes"
                  label="Лейкоциты"
                  color="purple darken-3"
                  v-model="currentSmearResult.smearResult.smearLeucocytes"
                  autocomplete
                >
                </v-select>
              </v-flex>
              <v-flex sm12 md3>
                <v-select
                  :items="smearBoolean"
                  label="Диплококки"
                  color="purple darken-3"
                  v-model="currentSmearResult.smearResult.smearDiplococcus"
                  autocomplete
                >
                </v-select>
              </v-flex>
              <v-flex sm12 md3>
                <v-select
                  :items="smearBoolean"
                  label="Клетки эпителия"
                  color="purple darken-3"
                  v-model="currentSmearResult.smearResult.smearEpithelium"
                  autocomplete
                >
                </v-select>
              </v-flex>
            </v-layout>
            <v-layout row wrap>
              <v-flex sm12 md3>
                <v-select
                  :items="smearBoolean"
                  label="Трихомонады"
                  color="purple darken-3"
                  v-model="currentSmearResult.smearResult.smearTrichomonas"
                  autocomplete
                >
                </v-select>
              </v-flex>
              <v-flex sm12 md5>
                <v-select
                  :items="smearBoolean"
                  label="Дрожжеподобные грибы"
                  color="purple darken-3"
                  v-model="currentSmearResult.smearResult.smearFungus"
                  autocomplete
                >
                </v-select>
              </v-flex>
              <v-flex sm12 md4>
                <v-select
                  :items="smearBoolean"
                  label="'Ключевые' клетки"
                  color="purple darken-3"
                  v-model="currentSmearResult.smearResult.smearKeyCells"
                  autocomplete
                >
                </v-select>
              </v-flex>
            </v-layout>
          </v-container>
        </v-card-text>
        <v-card-actions>
          <v-spacer>
          </v-spacer>
          <v-btn color="purple darken-3" flat class="white--text" @click.native="noResultDialog">Закрыть
          </v-btn>
          <v-btn
            v-if="!addAnalyzeDialog.edit"
            color="purple darken-3"
            class="white--text"
            @click.native="yesResultDialog">
            Добавить
          </v-btn>
          <v-btn
            v-if="addAnalyzeDialog.edit"
            color="purple darken-3"
            class="white--text"
            @click.native="yesResultDialog">
            Изменить
          </v-btn>
        </v-card-actions>
      </v-card>
      <v-card v-if="listAnalyzesDialog.analyzeType === 'rw'">
        <v-card-title>
          <v-flex sm12>
            <span class="headline">
            Добавление RW для<br/><span
              class="green--text text--darken-2">{{ currentEditPatient.fio }}</span>?
          </span>
          </v-flex>
        </v-card-title>
        <v-card-text>
          <v-container grid-list-md>
            <v-layout row wrap>
              <v-flex sm12 md2>
                <v-text-field
                  v-if="!addAnalyzeDialog.edit"
                  label="Дата анализа"
                  color="blue-grey darken-4"
                  v-model="currentRwResult.rwDate"
                  mask="##.##.####"
                  return-masked-value
                >
                </v-text-field>
                <v-text-field
                  v-if="addAnalyzeDialog.edit"
                  label="Дата анализа"
                  color="blue-grey darken-4"
                  :value="dateFromIso(currentRwResult.rwDate)"
                  readonly
                  disabled
                >
                </v-text-field>
              </v-flex>
              <v-flex sm12 md2>
                <v-text-field
                  label="Номер"
                  color="blue-grey darken-4"
                  v-model="currentRwResult.rwNumber"
                >
                </v-text-field>
              </v-flex>
              <v-flex sm12 md8>
                <v-spacer></v-spacer>
              </v-flex>
            </v-layout>
            <v-layout row wrap>
              <v-flex sm12>
                <h3>Анализ крови на RW</h3>
              </v-flex>
            </v-layout>
            <v-layout row wrap>
              <v-flex sm12>
                <v-select
                  :items="rwTypes"
                  label="RW результат"
                  color="blue-grey darken-4"
                  v-model="currentRwResult.rwResult"
                  autocomplete
                >
                </v-select>
              </v-flex>
            </v-layout>
          </v-container>
        </v-card-text>
        <v-card-actions>
          <v-spacer>
          </v-spacer>
          <v-btn color="blue-grey darken-4" flat class="white--text" @click.native="noResultDialog">Закрыть
          </v-btn>
          <v-btn
            v-if="!addAnalyzeDialog.edit"
            color="blue-grey darken-4"
            class="white--text"
            @click.native="yesResultDialog">
            Добавить
          </v-btn>
          <v-btn
            v-if="addAnalyzeDialog.edit"
            color="blue-grey darken-4"
            class="white--text"
            @click.native="yesResultDialog">
            Изменить
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <!-- / Диалог добавления анализа -->

    <!-- Диалог удаления анализа -->
    <v-dialog v-model="removeDialog.show" persistent lazy max-width="800px">
      <v-card>
        <v-card-title v-if="listAnalyzesDialog.analyzeType === 'blood'">
          <span class="headline">
            Удалить анализ крови от {{ currentRemoveItem.bloodDate | formatDate }} для<br/>
            <span class="red--text text--darken-2">«{{ currentEditPatient.fio }}»</span>?
          </span>
        </v-card-title>
        <v-card-title v-if="listAnalyzesDialog.analyzeType === 'urineClinical'">
          <span class="headline">
            Удалить анализ мочи от {{ currentRemoveItem.urineDate | formatDate }} для<br/>
            <span class="red--text text--darken-2">«{{ currentEditPatient.fio }}»</span>?
          </span>
        </v-card-title>
        <v-card-title v-if="listAnalyzesDialog.analyzeType === 'smear'">
          <span class="headline">
            Удалить мазок от {{ currentRemoveItem.smearDate | formatDate }} для<br/>
            <span class="red--text text--darken-2">«{{ currentEditPatient.fio }}»</span>?
          </span>
        </v-card-title>
        <v-card-title v-if="listAnalyzesDialog.analyzeType === 'rw'">
          <span class="headline">
            Удалить RW от {{ currentRemoveItem.rwDate | formatDate }} для<br/>
            <span class="red--text text--darken-2">«{{ currentEditPatient.fio }}»</span>?
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
    <!-- / Диалог удаления анализа -->
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
        //* Редактируемый пациент.
        currentEditPatient: {
          bloodResults: [],
          urineClinicalResults: [],
          smearResults: [],
          rwResults: []
        },
        //* Редактируемый клинический анализ крови.
        currentBloodResult: {
          bloodDate: '',
          bloodNumber: '',
          bloodResult: {
            hemoglobin: '',
            leucocytes: '',
            esr: '',
            basophils: '',
            eosinophils: '',
            blasts: '',
            myelocytes: '',
            young: '',
            sticks: '',
            segments: '',
            lymphocytes: '',
            monocytes: '',
            normoblasts: '',
            tng: ''
          }
        },
        //* Редактируемый клинический анализ мочи.
        currentUrineClinicalResult: {
          urineDate: '',
          urineNumber: '',
          urineGeneral: {
            color: {
              colorType: '',
              colorName: ''
            },
            reaction: {
              reactionType: '',
              reactionName: ''
            },
            density: '',
            transparency: '',
            protein: '',
            glucose: {
              glucoseType: '',
              glucoseName: ''
            },
            acetone: {
              acetoneType: '',
              acetoneName: ''
            },
            bile: false
          },
          urineElements: {
            flatEpithelium: '',
            tractEpithelium: '',
            renalEpithelium: '',
            leucocytes: '',
            erythrocytes: '',
            cylinders: {
              hyaline: '',
              granular: '',
              waxy: '',
              epithelial: ''
            },
            salts: {
              saltsId: '',
              saltsName: ''
            },
            slime: false
          }
        },
        //* Редактируемый мазок.
        currentSmearResult: {
          smearDate: '',
          smearNumber: '',
          smearResult: {
            smearGonococcus: false,
            smearLeucocytes: 0,
            smearDiplococcus: false,
            smearEpithelium: false,
            smearFlora: '',
            smearSlime: '',
            smearTrichomonas: false,
            smearFungus: false,
            smearKeyCells: false
          }
        },
        //* Редактируемый RW анализ.
        currentRwResult: {
          rwDate: '',
          rwNumber: '',
          rwResult: 1
        },
        //* Удаляемый элемент.
        currentRemoveItem: {},
        //* Диалог списка анализов.
        listAnalyzesDialog: {
          show: false,
          analyzeType: ''
        },
        //* Диалог добавления анализа.
        addAnalyzeDialog: {
          show: false,
          edit: false
        },
        //* Диалог удаления анализа.
        removeDialog: {
          show: false
        },
        //* Справочники мочи.
        urineColors: [
          {
            value: {
              colorType: 1,
              colorName: 'желтый'
            },
            text: '1 - желтый'
          },
          {
            value: {
              colorType: 2,
              colorName: 'светло-желтый'
            },
            text: '2 - светло-желтый'
          },
          {
            value: {
              colorType: 3,
              colorName: 'соломенно-желтый'
            },
            text: '3 - соломенно-желтый'
          },
          {
            value: {
              colorType: 4,
              colorName: 'бесцветный'
            },
            text: '4 - бесцветный'
          }
        ],
        urineReactions: [
          {
            value: {
              reactionType: 1,
              reactionName: 'кислая'
            },
            text: '1 - кислая'
          },
          {
            value: {
              reactionType: 2,
              reactionName: 'щелочная'
            },
            text: '2 - щелочная'
          },
          {
            value: {
              reactionType: 3,
              reactionName: 'слабокислая'
            },
            text: '3 - слабокислая'
          },
          {
            value: {
              reactionType: 4,
              reactionName: 'нейтральная'
            },
            text: '4 - нейтральная'
          }
        ],
        urineTransparency: [
          {
            value: true,
            text: '1 - прозрачая'
          },
          {
            value: false,
            text: '2 - мутная'
          }
        ],
        urineGlucose: [
          {
            value: {
              glucoseType: 1,
              glucoseName: '0'
            },
            text: '1 - 0'
          },
          {
            value: {
              glucoseType: 2,
              glucoseName: '5,6'
            },
            text: '2 - 5,6'
          },
          {
            value: {
              glucoseType: 3,
              glucoseName: '28'
            },
            text: '3 - 28'
          },
          {
            value: {
              glucoseType: 4,
              glucoseName: '56'
            },
            text: '4 - 56'
          },
          {
            value: {
              glucoseType: 5,
              glucoseName: '>=111'
            },
            text: '5 - >=111'
          }
        ],
        urineAcetone: [
          {
            value: {
              acetoneType: 1,
              acetoneName: '0'
            },
            text: '1 - 0'
          },
          {
            value: {
              acetoneType: 2,
              acetoneName: '+-'
            },
            text: '2 - +-'
          },
          {
            value: {
              acetoneType: 3,
              acetoneName: '+'
            },
            text: '3 - +'
          },
          {
            value: {
              acetoneType: 4,
              acetoneName: '++'
            },
            text: '4 - ++'
          },
          {
            value: {
              acetoneType: 5,
              acetoneName: '+++'
            },
            text: '5 - +++'
          }
        ],
        urineBile: [
          {
            value: true,
            text: '1 - есть'
          },
          {
            value: false,
            text: '0 - нет'
          }
        ],
        urineSalts: [
          {
            value: {
              saltsId: 0,
              saltsName: 'нет'
            },
            text: '0 - нет'
          },
          {
            value: {
              saltsId: 1,
              saltsName: 'ураты'
            },
            text: '1 - ураты'
          },
          {
            value: {
              saltsId: 2,
              saltsName: 'фосфаты'
            },
            text: '2 - фосфаты'
          },
          {
            value: {
              saltsId: 3,
              saltsName: 'оксолаты'
            },
            text: '3 - оксолаты'
          },
          {
            value: {
              saltsId: 4,
              saltsName: 'мочевой кислоты'
            },
            text: '4 - мочевой кислоты'
          },
          {
            value: {
              saltsId: 5,
              saltsName: 'трипельфосфаты'
            },
            text: '5 - трипельфосфаты'
          },
          {
            value: {
              saltsId: 6,
              saltsName: 'холестерин'
            },
            text: '6 - холестерин'
          },
          {
            value: {
              saltsId: 7,
              saltsName: 'билирубин'
            },
            text: '7 - билирубин'
          }
        ],
        urineSlime: [
          {
            value: true,
            text: '1 - есть'
          },
          {
            value: false,
            text: '0 - нет'
          }
        ],
        //* Справочники мазков.
        smearBoolean: [
          {
            value: false,
            text: '1 - Не обнаружены'
          },
          {
            value: true,
            text: '2 - Обнаружены'
          }
        ],
        smearLeucocytes: [
          {
            value: 1,
            text: '1 - Единичные'
          },
          {
            value: 2,
            text: '2 - до 25'
          },
          {
            value: 3,
            text: '3 - до 50'
          },
          {
            value: 4,
            text: '4 - до 100'
          },
          {
            value: 5,
            text: '5 - выше 100'
          }
        ],
        //* Справочник кодов на RW.
        rwTypes: [
          {
            value: 1,
            text: '1 - Отрицительный'
          },
          {
            value: 2,
            text: '2 - Положительный X'
          },
          {
            value: 3,
            text: '3 - Положительный XX'
          },
          {
            value: 4,
            text: '4 - Положительный XXX'
          },
          {
            value: 5,
            text: '5 - Положительный XXXX'
          },
          {
            value: 6,
            text: '6 - Гемолиз'
          },
          {
            value: 7,
            text: '7 - Хилезная'
          },
          {
            value: 8,
            text: '8 - Брак'
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
          primaryColor: 'red darken-4',
          secondaryColor: 'yellow darken-4',
          deleteColor: 'red'
        }
      }
    },
    //* Подгружаем объект залогиненного пользователя для последующего использования.
    mounted () {
      //* Подгружаем пользователя, который осуществил вход.
      this.getCurrentUser()
    },
    methods: {
      //* Метод про диалог списка анализов крови.
      openBloodResultsListDialog (item) {
        this.currentEditPatient = item
        this.listAnalyzesDialog = {
          show: true,
          analyzeType: 'blood'
        }
      },
      //* Метод про диалог списка анализов мочи.
      openUrineResultsListDialog (item) {
        this.currentEditPatient = item
        this.listAnalyzesDialog = {
          show: true,
          analyzeType: 'urineClinical'
        }
      },
      //* Метод про диалог списка мазков.
      openSmearResultsListDialog (item) {
        this.currentEditPatient = item
        this.listAnalyzesDialog = {
          show: true,
          analyzeType: 'smear'
        }
      },
      //* Метод про диалог списка анализов RW.
      openRwResultsListDialog (item) {
        this.currentEditPatient = item
        this.listAnalyzesDialog = {
          show: true,
          analyzeType: 'rw'
        }
      },
      //* Метод про закрытие диалога списка анализов.
      noResultsListDialog () {
        this.currentEditPatient = {
          bloodResults: [],
          urineClinicalResults: [],
          smearResults: [],
          rwResults: []
        }
        this.listAnalyzesDialog = {
          show: false,
          analyzeType: ''
        }
      },
      //* Методы про диалог анализа.
      openResultDialog (obj) {
        let tmpAnalyzeType = this.listAnalyzesDialog.analyzeType
        if (obj.edit) {
          switch (tmpAnalyzeType) {
            case 'blood':
              this.currentBloodResult = obj.item
              break
            case 'urineClinical':
              this.currentUrineClinicalResult = obj.item
              break
            case 'smear':
              this.currentSmearResult = obj.item
              break
            case 'rw':
              this.currentRwResult = obj.item
              break
          }
        } else {
          switch (tmpAnalyzeType) {
            case 'blood':
              this.currentBloodResult.bloodDate = this.dateFromIso(Date.now())
              break
            case 'urineClinical':
              this.currentUrineClinicalResult.urineDate = this.dateFromIso(Date.now())
              break
            case 'smear':
              this.currentSmearResult.smearDate = this.dateFromIso(Date.now())
              break
            case 'rw':
              this.currentRwResult.rwDate = this.dateFromIso(Date.now())
              break
          }
        }
        this.addAnalyzeDialog = {
          show: true,
          edit: obj.edit
        }
      },
      noResultDialog () {
        let tmpAnalyzeType = this.listAnalyzesDialog.analyzeType
        switch (tmpAnalyzeType) {
          case 'blood':
            this.currentBloodResult = {
              bloodDate: '',
              bloodNumber: '',
              bloodResult: {
                hemoglobin: '',
                leucocytes: '',
                esr: '',
                basophils: '',
                eosinophils: '',
                blasts: '',
                myelocytes: '',
                young: '',
                sticks: '',
                segments: '',
                lymphocytes: '',
                monocytes: '',
                normoblasts: '',
                tng: ''
              }
            }
            break
          case 'urineClinical':
            this.currentUrineClinicalResult = {
              urineDate: '',
              urineNumber: '',
              urineGeneral: {
                color: {
                  colorType: '',
                  colorName: ''
                },
                reaction: {
                  reactionType: '',
                  reactionName: ''
                },
                density: '',
                transparency: '',
                protein: '',
                glucose: {
                  glucoseType: '',
                  glucoseName: ''
                },
                acetone: {
                  acetoneType: '',
                  acetoneName: ''
                },
                bile: false
              },
              urineElements: {
                flatEpithelium: '',
                tractEpithelium: '',
                renalEpithelium: '',
                leucocytes: '',
                erythrocytes: '',
                cylinders: {
                  hyaline: '',
                  granular: '',
                  waxy: '',
                  epithelial: ''
                },
                salts: {
                  saltsId: '',
                  saltsName: ''
                },
                slime: false
              }
            }
            break
          case 'smear':
            this.currentSmearResult = {
              smearDate: '',
              smearNumber: '',
              smearResult: {
                smearGonococcus: false,
                smearLeucocytes: 0,
                smearDiplococcus: false,
                smearEpithelium: false,
                smearFlora: '',
                smearSlime: '',
                smearTrichomonas: false,
                smearFungus: false,
                smearKeyCells: false
              }
            }
            break
          case 'rw':
            this.currentRwResult = {
              rwDate: '',
              rwNumber: '',
              rwResult: ''
            }
            break
        }
        this.addAnalyzeDialog = {
          show: false,
          analyzeType: ''
        }
      },
      yesResultDialog () {
        let tmpAnalyzeResult = {}
        let tmpAnalyzeType = this.listAnalyzesDialog.analyzeType
        switch (tmpAnalyzeType) {
          case 'blood':
            tmpAnalyzeResult = this.currentBloodResult
            break
          case 'urineClinical':
            tmpAnalyzeResult = this.currentUrineClinicalResult
            break
          case 'smear':
            tmpAnalyzeResult = this.currentSmearResult
            break
          case 'rw':
            tmpAnalyzeResult = this.currentRwResult
            break
        }
        let tmpEdit = this.addAnalyzeDialog.edit
        switch (tmpEdit) {
          case true:
            Axios.put(`${GKP7API}/api/v1/patient/${this.currentEditPatient._id}/analyze/${tmpAnalyzeResult._id}`, {
              analyzeType: tmpAnalyzeType,
              analyzeResult: tmpAnalyzeResult
            }, {
              headers: {'Authorization': Authentication.getAuthenticationHeader(this)}
            }).then(res => {
              if (res.data.success) {
                let tmpResultAnalyze = {}
                switch (tmpAnalyzeType) {
                  case 'blood':
                    tmpResultAnalyze = res.data.patient.bloodResults.find((item) => {
                      return this.dateFromIso(item.bloodDate) === this.currentBloodResult.bloodDate
                    })
                    this.currentEditPatient.bloodResults.push(tmpResultAnalyze)
                    this.currentBloodResult = {
                      bloodDate: '',
                      bloodNumber: '',
                      bloodResult: {
                        hemoglobin: '',
                        leucocytes: '',
                        esr: '',
                        basophils: '',
                        eosinophils: '',
                        blasts: '',
                        myelocytes: '',
                        young: '',
                        sticks: '',
                        segments: '',
                        lymphocytes: '',
                        monocytes: '',
                        normoblasts: '',
                        tng: ''
                      }
                    }
                    break
                  case 'urineClinical':
                    tmpResultAnalyze = res.data.patient.urineClinicalResults.find((item) => {
                      return this.dateFromIso(item.urineDate) === this.currentUrineClinicalResult.urineDate
                    })
                    this.currentEditPatient.urineClinicalResults.push(tmpResultAnalyze)
                    this.currentUrineClinicalResult = {
                      urineDate: '',
                      urineNumber: '',
                      urineGeneral: {
                        color: {
                          colorType: '',
                          colorName: ''
                        },
                        reaction: {
                          reactionType: '',
                          reactionName: ''
                        },
                        density: '',
                        transparency: '',
                        protein: '',
                        glucose: {
                          glucoseType: '',
                          glucoseName: ''
                        },
                        acetone: {
                          acetoneType: '',
                          acetoneName: ''
                        },
                        bile: false
                      },
                      urineElements: {
                        flatEpithelium: '',
                        tractEpithelium: '',
                        renalEpithelium: '',
                        leucocytes: '',
                        erythrocytes: '',
                        cylinders: {
                          hyaline: '',
                          granular: '',
                          waxy: '',
                          epithelial: ''
                        },
                        salts: {
                          saltsId: '',
                          saltsName: ''
                        },
                        slime: false
                      }
                    }
                    break
                  case 'smear':
                    tmpResultAnalyze = res.data.patient.smearResults.find((item) => {
                      return this.dateFromIso(item.smearDate) === this.currentSmearResult.smearDate
                    })
                    this.currentEditPatient.smearResults.push(tmpResultAnalyze)
                    this.currentSmearResult = {
                      smearDate: '',
                      smearNumber: '',
                      smearResult: {
                        smearGonococcus: false,
                        smearLeucocytes: 0,
                        smearDiplococcus: false,
                        smearEpithelium: false,
                        smearFlora: '',
                        smearSlime: '',
                        smearTrichomonas: false,
                        smearFungus: false,
                        smearKeyCells: false
                      }
                    }
                    break
                  case 'rw':
                    tmpResultAnalyze = res.data.patient.rwResults.find((item) => {
                      return this.dateFromIso(item.rwDate) === this.currentRwResult.rwDate
                    })
                    this.currentEditPatient.rwResults.push(tmpResultAnalyze)
                    this.currentRwResult = {
                      rwDate: '',
                      rwNumber: '',
                      rwResult: ''
                    }
                    break
                }
                this.addAnalyzeDialog = {
                  show: false,
                  analyzeType: ''
                }
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
            break
          case false:
            Axios.post(`${GKP7API}/api/v1/patient/${this.currentEditPatient._id}/analyze/`, {
              analyzeType: tmpAnalyzeType,
              analyzeResult: tmpAnalyzeResult
            }, {
              headers: {'Authorization': Authentication.getAuthenticationHeader(this)}
            }).then(res => {
              if (res.data.success) {
                let tmpResultAnalyze = {}
                switch (tmpAnalyzeType) {
                  case 'blood':
                    tmpResultAnalyze = res.data.patient.bloodResults.find((item) => {
                      return this.dateFromIso(item.bloodDate) === this.currentBloodResult.bloodDate
                    })
                    this.currentEditPatient.bloodResults.push(tmpResultAnalyze)
                    this.currentBloodResult = {
                      bloodDate: '',
                      bloodNumber: '',
                      bloodResult: {
                        hemoglobin: '',
                        leucocytes: '',
                        esr: '',
                        basophils: '',
                        eosinophils: '',
                        blasts: '',
                        myelocytes: '',
                        young: '',
                        sticks: '',
                        segments: '',
                        lymphocytes: '',
                        monocytes: '',
                        normoblasts: '',
                        tng: ''
                      }
                    }
                    break
                  case 'urineClinical':
                    tmpResultAnalyze = res.data.patient.urineClinicalResults.find((item) => {
                      return this.dateFromIso(item.urineDate) === this.currentUrineClinicalResult.urineDate
                    })
                    this.currentEditPatient.urineClinicalResults.push(tmpResultAnalyze)
                    this.currentUrineClinicalResult = {
                      urineDate: '',
                      urineNumber: '',
                      urineGeneral: {
                        color: {
                          colorType: '',
                          colorName: ''
                        },
                        reaction: {
                          reactionType: '',
                          reactionName: ''
                        },
                        density: '',
                        transparency: '',
                        protein: '',
                        glucose: {
                          glucoseType: '',
                          glucoseName: ''
                        },
                        acetone: {
                          acetoneType: '',
                          acetoneName: ''
                        },
                        bile: false
                      },
                      urineElements: {
                        flatEpithelium: '',
                        tractEpithelium: '',
                        renalEpithelium: '',
                        leucocytes: '',
                        erythrocytes: '',
                        cylinders: {
                          hyaline: '',
                          granular: '',
                          waxy: '',
                          epithelial: ''
                        },
                        salts: {
                          saltsId: '',
                          saltsName: ''
                        },
                        slime: false
                      }
                    }
                    break
                  case 'smear':
                    tmpResultAnalyze = res.data.patient.smearResults.find((item) => {
                      return this.dateFromIso(item.smearDate) === this.currentSmearResult.smearDate
                    })
                    this.currentEditPatient.smearResults.push(tmpResultAnalyze)
                    this.currentSmearResult = {
                      smearDate: '',
                      smearNumber: '',
                      smearResult: {
                        smearGonococcus: false,
                        smearLeucocytes: 0,
                        smearDiplococcus: false,
                        smearEpithelium: false,
                        smearFlora: '',
                        smearSlime: '',
                        smearTrichomonas: false,
                        smearFungus: false,
                        smearKeyCells: false
                      }
                    }
                    break
                  case 'rw':
                    tmpResultAnalyze = res.data.patient.rwResults.find((item) => {
                      return this.dateFromIso(item.rwDate) === this.currentRwResult.rwDate
                    })
                    this.currentEditPatient.rwResults.push(tmpResultAnalyze)
                    this.currentRwResult = {
                      rwDate: '',
                      rwNumber: '',
                      rwResult: ''
                    }
                    break
                }
                this.addAnalyzeDialog = {
                  show: false,
                  analyzeType: ''
                }
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
            break
        }
      },
      //* Методы про диалог удаления анализа.
      openRemoveDialog (item) {
        this.currentRemoveItem = item
        this.removeDialog = {
          show: true
        }
      },
      noRemoveDialog () {
        this.currentRemoveItem = {}
        this.removeDialog = {
          show: false
        }
      },
      yesRemoveDialog () {
        let tmpType = this.listAnalyzesDialog.analyzeType
        Axios.delete(`${GKP7API}/api/v1/patient/${this.currentEditPatient._id}/analyze/${this.currentRemoveItem._id}`, {
          headers: {'Authorization': Authentication.getAuthenticationHeader(this)},
          data: {
            analyzeType: tmpType
          }
        }).then(res => {
          if (res.data.success) {
            if (tmpType === 'blood') {
              this.currentEditPatient.bloodResults = this.currentEditPatient.bloodResults.filter(
                result => result._id !== this.currentRemoveItem._id
              )
            } else if (tmpType === 'urineClinical') {
              this.currentEditPatient.urineClinicalResults = this.currentEditPatient.urineClinicalResults.filter(
                result => result._id !== this.currentRemoveItem._id
              )
            } else if (tmpType === 'smear') {
              this.currentEditPatient.smearResults = this.currentEditPatient.smearResults.filter(
                result => result._id !== this.currentRemoveItem._id
              )
            } else if (tmpType === 'rw') {
              this.currentEditPatient.rwResults = this.currentEditPatient.rwResults.filter(
                result => result._id !== this.currentRemoveItem._id
              )
            }
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
      },
      //* Проверка на необходимость мазка.
      ifPatientNeedsSmear (patient) {
        if (patient.hasActiveMedos || (patient.smearResults && patient.smearResults.length > 0)) {
          let mustExams = patient.activeMedos.medosExams.mustExams
          return mustExams.some(exam => exam.examId === 43)
        } else {
          return false
        }
      },
      //* Проверка на необходимость RW.
      ifPatientNeedsRw (patient) {
        if (patient.hasActiveMedos || (patient.rwResults && patient.rwResults.length > 0)) {
          let mustExams = patient.activeMedos.medosExams.mustExams
          return mustExams.some(exam => exam.examId === 42)
        } else {
          return false
        }
      },
      //* Запрашиваем список пациентов на медосмотре по введенным ФИО.
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
    background-color: #b71c1c;
    color: white;
    padding: 0 6px;
  }
</style>
