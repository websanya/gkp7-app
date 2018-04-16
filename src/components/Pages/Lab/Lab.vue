<template>
  <div>
    <app-header :subsystem="subSystem.primaryColor" subtitle="Лаборатория">
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
                    <td width="156px">
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

    <!-- Диалог списка анализов -->
    <v-dialog v-model="listAnalyzesDialog.show" persistent lazy max-width="800px">
      <v-card v-if="listAnalyzesDialog.analyzeType === 'bloodClinical'">
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
          <v-container grid-list-md v-if="currentEditPatient.bloodClinicalResults.length > 0">
            <v-data-table
                :headers="[
                  { text: 'Дата анализа', value: 'bloodDate' },
                  { text: 'Гемоглобин', value: 'bloodResult.hemoglobin' },
                  { text: 'Лейкоциты', value: 'bloodResult.leucocytes' },
                  { text: 'СОЭ', value: 'bloodResult.esr' },
                  { text: 'Действия', value: '' }
                ]"
                :items="currentEditPatient.bloodClinicalResults"
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
          <v-btn :color="subSystem.primaryColor" flat @click.native="noBloodResultsListDialog">Закрыть</v-btn>
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
          <v-btn :color="subSystem.secondaryColor" flat @click.native="noUrineResultsListDialog">Закрыть</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <!-- / Диалог списка анализов -->

    <!-- Диалог добавления анализа -->
    <v-dialog v-model="addAnalyzeDialog.show" persistent lazy max-width="800px">
      <v-card v-if="listAnalyzesDialog.analyzeType === 'bloodClinical'">
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
                    v-if="!addAnalyzeDialog.edit"
                    label="Дата анализа"
                    :color="subSystem.primaryColor"
                    v-model="currentBloodClinicalResult.bloodDate"
                    mask="##.##.####"
                    return-masked-value
                >
                </v-text-field>
                <v-text-field
                    v-if="addAnalyzeDialog.edit"
                    label="Дата анализа"
                    :color="subSystem.primaryColor"
                    :value="dateFromIso(currentBloodClinicalResult.bloodDate)"
                    readonly
                    disabled
                >
                </v-text-field>
              </v-flex>
              <v-flex sm12 md2>
                <v-text-field
                    label="Номер"
                    :color="subSystem.primaryColor"
                    v-model="currentBloodClinicalResult.bloodNumber"
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
                    v-model="currentBloodClinicalResult.bloodResult.hemoglobin"
                >
                </v-text-field>
              </v-flex>
              <v-flex sm12 md4>
                <v-text-field
                    label="Лейкоциты"
                    :color="subSystem.primaryColor"
                    v-model="currentBloodClinicalResult.bloodResult.leucocytes"
                >
                </v-text-field>
              </v-flex>
              <v-flex sm12 md4>
                <v-text-field
                    label="СОЭ"
                    :color="subSystem.primaryColor"
                    v-model="currentBloodClinicalResult.bloodResult.esr"
                >
                </v-text-field>
              </v-flex>
            </v-layout>
            <v-layout row wrap>
              <v-flex sm12 md2>
                <v-text-field
                    label="Базофилы"
                    :color="subSystem.primaryColor"
                    v-model="currentBloodClinicalResult.bloodResult.basophils"
                >
                </v-text-field>
              </v-flex>
              <v-flex sm12 md2>
                <v-text-field
                    label="Эозинофилы"
                    :color="subSystem.primaryColor"
                    v-model="currentBloodClinicalResult.bloodResult.eosinophils"
                >
                </v-text-field>
              </v-flex>
              <v-flex sm12 md2>
                <v-text-field
                    label="Бласты"
                    :color="subSystem.primaryColor"
                    v-model="currentBloodClinicalResult.bloodResult.blasts"
                >
                </v-text-field>
              </v-flex>
              <v-flex sm12 md2>
                <v-text-field
                    label="Миелоциты"
                    :color="subSystem.primaryColor"
                    v-model="currentBloodClinicalResult.bloodResult.myelocytes"
                >
                </v-text-field>
              </v-flex>
              <v-flex sm12 md2>
                <v-text-field
                    label="Юные"
                    :color="subSystem.primaryColor"
                    v-model="currentBloodClinicalResult.bloodResult.young"
                >
                </v-text-field>
              </v-flex>
              <v-flex sm12 md2>
                <v-text-field
                    label="Палочки"
                    :color="subSystem.primaryColor"
                    v-model="currentBloodClinicalResult.bloodResult.sticks"
                >
                </v-text-field>
              </v-flex>
            </v-layout>
            <v-layout row wrap>
              <v-flex sm12 md2>
                <v-text-field
                    label="Сегменты"
                    :color="subSystem.primaryColor"
                    v-model="currentBloodClinicalResult.bloodResult.segments"
                >
                </v-text-field>
              </v-flex>
              <v-flex sm12 md2>
                <v-text-field
                    label="Лимфоциты"
                    :color="subSystem.primaryColor"
                    v-model="currentBloodClinicalResult.bloodResult.lymphocytes"
                >
                </v-text-field>
              </v-flex>
              <v-flex sm12 md2>
                <v-text-field
                    label="Моноциты"
                    :color="subSystem.primaryColor"
                    v-model="currentBloodClinicalResult.bloodResult.monocytes"
                >
                </v-text-field>
              </v-flex>
              <v-flex sm12 md2>
                <v-text-field
                    label="Нормобласты"
                    :color="subSystem.primaryColor"
                    v-model="currentBloodClinicalResult.bloodResult.normoblasts"
                >
                </v-text-field>
              </v-flex>
              <v-flex sm12 md4>
                <v-text-field
                    label="Токсич. зерн. нейтроф."
                    :color="subSystem.primaryColor"
                    v-model="currentBloodClinicalResult.bloodResult.sticks"
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
                    v-if="!addAnalyzeDialog.edit"
                    label="Дата анализа"
                    :color="subSystem.primaryColor"
                    v-model="currentUrineClinicalResult.urineDate"
                    mask="##.##.####"
                    return-masked-value
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
    </v-dialog>
    <!-- / Диалог добавления анализа -->

    <!-- Диалог удаления анализа -->
    <v-dialog v-model="removeDialog.show" persistent max-width="800px">
      <v-card>
        <v-card-title v-if="listAnalyzesDialog.analyzeType === 'bloodClinical'">
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
          bloodClinicalResults: [],
          urineClinicalResults: []
        },
        //* Редактируемый клинический анализ крови.
        currentBloodClinicalResult: {
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
        removeDialog: {
          show: false
        },
        //* Справочники.
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
              saltType: 0,
              saltName: 'нет'
            },
            text: '0 - нет'
          },
          {
            value: {
              saltType: 1,
              saltName: 'ураты'
            },
            text: '1 - ураты'
          },
          {
            value: {
              saltType: 2,
              saltName: 'фосфаты'
            },
            text: '2 - фосфаты'
          },
          {
            value: {
              saltType: 3,
              saltName: 'оксолаты'
            },
            text: '3 - оксолаты'
          },
          {
            value: {
              saltType: 4,
              saltName: 'мочевой кислоты'
            },
            text: '4 - мочевой кислоты'
          },
          {
            value: {
              saltType: 5,
              saltName: 'трипельфосфаты'
            },
            text: '5 - трипельфосфаты'
          },
          {
            value: {
              saltType: 6,
              saltName: 'холестерин'
            },
            text: '6 - холестерин'
          },
          {
            value: {
              saltType: 7,
              saltName: 'билирубин'
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
        //* Все, что связано с snackbar, который всплывает во время ошибок.
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
      //* Методы про диалог списка анализов крови.
      openBloodResultsListDialog (item) {
        this.currentEditPatient = item
        this.listAnalyzesDialog = {
          show: true,
          analyzeType: 'bloodClinical'
        }
      },
      noBloodResultsListDialog () {
        this.currentEditPatient = {
          bloodClinicalResults: [],
          urineClinicalResults: []
        }
        this.listAnalyzesDialog = {
          show: false,
          analyzeType: ''
        }
      },
      //* Методы про диалог списка анализов мочи.
      openUrineResultsListDialog (item) {
        this.currentEditPatient = item
        this.listAnalyzesDialog = {
          show: true,
          analyzeType: 'urineClinical'
        }
      },
      noUrineResultsListDialog () {
        this.currentEditPatient = {
          bloodClinicalResults: [],
          urineClinicalResults: []
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
            case 'bloodClinical':
              this.currentBloodClinicalResult = obj.item
              break
            case 'urineClinical':
              this.currentUrineClinicalResult = obj.item
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
          case 'bloodClinical':
            this.currentBloodClinicalResult = {
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
          case 'bloodClinical':
            tmpAnalyzeResult = this.currentBloodClinicalResult
            break
          case 'urineClinical':
            tmpAnalyzeResult = this.currentUrineClinicalResult
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
                  case 'bloodClinical':
                    tmpResultAnalyze = res.data.patient.bloodClinicalResults.find((item) => {
                      return this.dateFromIso(item.bloodDate) === this.currentBloodClinicalResult.bloodDate
                    })
                    this.currentEditPatient.bloodClinicalResults.push(tmpResultAnalyze)
                    this.currentBloodClinicalResult = {
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
                  case 'bloodClinical':
                    tmpResultAnalyze = res.data.patient.bloodClinicalResults.find((item) => {
                      return this.dateFromIso(item.bloodDate) === this.currentBloodClinicalResult.bloodDate
                    })
                    this.currentEditPatient.bloodClinicalResults.push(tmpResultAnalyze)
                    this.currentBloodClinicalResult = {
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
            if (tmpType === 'bloodClinical') {
              this.currentEditPatient.bloodClinicalResults = this.currentEditPatient.bloodClinicalResults.filter(
                result => result._id !== this.currentRemoveItem._id
              )
            } else if (tmpType === 'urineClinical') {
              this.currentEditPatient.urineClinicalResults = this.currentEditPatient.urineClinicalResults.filter(
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
