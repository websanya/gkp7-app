<template>
  <div class="uwd-container">
    <app-header :subsystem="subSystem.primaryColor" :subtitle="`Рабочее место ${currentUserDoctor.name}а`"
                :currentUser="currentUser">
    </app-header>
    <v-content>
      <v-container fluid fill-height>
        <v-layout
          justify-center
          align-center
        >
          <v-flex xs12>
            <h2 class="text-xs-center">Пациенты на мед. осмотре</h2>
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
                    {text:'Осмотр', sortable: false},
                    {text: 'Дата рождения', sortable: false},
                    {text: 'Пол', sortable: false},
                    {text: 'Действия', sortable: false}
                  ]"
                v-if="patients.length > 0"
                :items="patients"
                hide-actions
                class="elevation-10 mt-4"
              >
                <template slot="items" slot-scope="props">
                  <tr>
                    <td>{{ props.item.fio }}</td>
                    <td>{{ props.item.activeMedos.medosType.typeId }}</td>
                    <td>{{ props.item.dateBirth }}</td>
                    <td>{{ (props.item.sex) ? 'Муж' : 'Жен' }}</td>
                    <td>
                      <v-tooltip top :color="subSystem.primaryColor">
                        <v-btn
                          slot="activator"
                          @click.native="openExaminationDialog(props.item)"
                          :color="subSystem.primaryColor"
                          icon
                        >
                          <v-icon color="white">assignment_turned_in</v-icon>
                        </v-btn>
                        <span>Завести прием</span>
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

    <!-- Диалог приема врача -->
    <v-dialog v-if="currentEditPatient.activeMedos.medosDoctors" v-model="makeAppointmentDialog.show" persistent
              max-width="900px">
      <v-card>
        <v-card-title row wrap>
          <v-flex sm6>
            <span class="headline">Прием врача-{{ currentUserDoctor.name }}а для пациента<br/><span
              class="green--text text--darken-2">{{ currentEditPatient.fio }}</span>
            </span>
          </v-flex>
          <v-flex sm6>
            <v-container grid-list-md>
              <v-layout row wrap>
                <v-flex sm12 md4 pl-1 pr-1>
                  <v-btn @click.native="makeAppointmentDialog.showInfo = !makeAppointmentDialog.showInfo"
                         :color="subSystem.primaryColor"
                         dark block>
                    Инфо
                  </v-btn>
                </v-flex>
                <v-flex sm12 md4 pl-1 pr-1>
                  <v-btn @click.native="makeAppointmentDialog.showBlood = !makeAppointmentDialog.showBlood"
                         color="red darken-4"
                         dark block>
                    Кровь
                  </v-btn>
                </v-flex>
                <v-flex sm12 md4 pl-1 pr-1>
                  <v-btn @click.native="makeAppointmentDialog.showUrine = !makeAppointmentDialog.showUrine"
                         color="yellow darken-4"
                         dark block>
                    Моча
                  </v-btn>
                </v-flex>
              </v-layout>
              <!-- Специально для офтальмологов -->
              <v-layout row wrap v-if="this.currentUser.roles.medos.doctor === 4">
                <v-flex sm12 md2 v-if="ophthalmologistExams.ocularFundus">
                  <v-btn @click.native="openExamDialog('ocularFundus')"
                         color="blue-grey darken-4"
                         dark block>
                    Дно
                  </v-btn>
                </v-flex>
                <v-flex sm12 md3 v-if="ophthalmologistExams.fields">
                  <v-btn @click.native="openExamDialog('fields')"
                         color="blue-grey darken-4"
                         dark block>
                    Поля
                  </v-btn>
                </v-flex>
                <v-flex sm12 md2 v-if="ophthalmologistExams.intraocularPressure">
                  <v-btn @click.native="openExamDialog('intraocularPressure')"
                         color="blue-grey darken-4"
                         dark block>
                    ВГД
                  </v-btn>
                </v-flex>
                <v-flex sm12 md2 v-if="ophthalmologistExams.refractometry">
                  <v-btn @click.native="openExamDialog('refractometry')"
                         color="blue-grey darken-4"
                         dark block>
                    Реф
                  </v-btn>
                </v-flex>
                <v-flex sm12 md3 v-if="ophthalmologistExams.colorBlindness">
                  <v-btn @click.native="openExamDialog('colorBlindness')"
                         color="blue-grey darken-4"
                         dark block>
                    Цвет
                  </v-btn>
                </v-flex>
              </v-layout>
              <!-- / Специально для офтальмологов -->
              <!-- Специально для дерматовенерологов -->
              <v-layout row wrap v-if="this.currentUser.roles.medos.doctor === 3">
                <v-flex sm12 md6 v-if="this.sortedSmearResult.smearDate">
                  <v-btn @click.native="makeAppointmentDialog.showSmear = !makeAppointmentDialog.showSmear"
                         color="blue-grey darken-4"
                         dark block>
                    Мазок на Gn
                  </v-btn>
                </v-flex>
                <v-flex sm12 md6 v-if="this.sortedRwResult.rwDate">
                  <v-btn @click.native="makeAppointmentDialog.showRw = !makeAppointmentDialog.showRw"
                         color="blue-grey darken-4"
                         dark block>
                    Кровь на Rw
                  </v-btn>
                </v-flex>
              </v-layout>
              <!-- / Специально для дерматовенерологов -->
              <!-- Специально для терапевтов -->
              <v-layout row wrap
                        v-if="this.currentUser.roles.medos.doctor === 1 || this.currentUser.roles.medos.admin || this.currentUser.roles.superuser">
                <v-flex sm12 md4>
                  <v-btn @click.native="openConclusionsDialog()"
                         :color="(ifAllDoctorsComplete() && ifAllExamsComplete) ? 'green darken-2' : 'light-blue darken-4'"
                         dark block>
                    Годности
                  </v-btn>
                </v-flex>
              </v-layout>
              <!-- / Специально для терапевтов -->
            </v-container>
          </v-flex>
        </v-card-title>
        <v-card-text>
          <p v-if="currentEditPatient.activeMedos">
            <strong>Дата регистрации:</strong> {{ currentEditPatient.activeMedos.medosRegistrationDate | formatDate }}
          </p>
          <p
            v-if="currentEditPatient.activeMedos.medosJob && currentEditPatient.activeMedos.medosParameters && makeAppointmentDialog.showInfo">
            <strong>Цех:</strong> {{ currentEditPatient.activeMedos.medosJob.jobDivision.jobDivisionName }},
            <strong>табельный номер:</strong> {{ currentEditPatient.activeMedos.medosJob.jobPersonnelNumber }}<br/>
            <strong>Участок:</strong> {{ currentEditPatient.activeMedos.medosJob.jobDepartment.jobDepartmentName }},
            <strong>профессия:</strong> {{ currentEditPatient.activeMedos.medosJob.jobName }}<br/>
            <strong>Проффакторы:</strong>
            <span v-if="currentEditPatient.activeMedos.medosHarms"
                  v-for="harm in currentEditPatient.activeMedos.medosHarms" :key="harm.harmId">
              {{ harm.harmName }}; </span><br/>
            <span v-if="currentEditPatient.activeMedos.medosParameters">
              <strong>Анамнез:</strong> {{ currentEditPatient.activeMedos.medosParameters.comment }}<br/>
            </span>
            <span v-if="sortedRgResult">
              <strong>Флюорография:</strong> {{ sortedRgResult.rgDate | formatDate }}, {{
            sortedRgResult.rgLocation.rgLocationComment }}
            </span>
            <span v-if="!sortedRgResult">
              <strong>Флюорография: <span class="red--text">отсутствует</span></strong>
            </span>
          </p>
          <p v-if="makeAppointmentDialog.showInfo">
            <strong v-if="currentEditPatient.activeMedos.medosDoctors">Врачи:</strong>
            <span v-if="currentEditPatient.activeMedos.medosDoctors"
                  v-for="doctor in currentEditPatient.activeMedos.medosDoctors.mustDoctors" :key="doctor.doctorId">
              {{ doctor.doctorName }}; </span><br/>
            <strong v-if="currentEditPatient.activeMedos.medosExams">Обследования:</strong>
            <span v-if="currentEditPatient.activeMedos.medosExams"
                  v-for="exam in currentEditPatient.activeMedos.medosExams.mustExams" :key="exam.examId">
              {{ exam.examName }}; </span><br/>
          </p>
          <p v-if="sortedBloodResult.bloodResult && makeAppointmentDialog.showBlood">
            <strong>Клинический анализ крови:</strong> {{ sortedBloodResult.bloodDate | formatDate }}:<br/>
            Hb={{ sortedBloodResult.bloodResult.hemoglobin }}, L={{ sortedBloodResult.bloodResult.leucocytes }}, СОЭ={{
            sortedBloodResult.bloodResult.esr }}, Баз={{ sortedBloodResult.bloodResult.basophils }}, Миел={{
            sortedBloodResult.bloodResult.myelocytes }}, Юные={{ sortedBloodResult.bloodResult.young }}, Пал={{
            sortedBloodResult.bloodResult.sticks }}, Сегменты={{ sortedBloodResult.bloodResult.segments }}, Лимф={{
            sortedBloodResult.bloodResult.lymphocytes }}, Моно={{ sortedBloodResult.bloodResult.monocytes }}, Норм={{
            sortedBloodResult.bloodResult.normoblasts }}, ТЗН={{ sortedBloodResult.bloodResult.tng }}</p>
          <p v-if="sortedBloodResult.bloodResult && makeAppointmentDialog.showBlood">
            <strong>Биохимический анализ крови:</strong> {{ sortedBloodResult.bloodDate | formatDate }}:<br/>
            Сахар={{ sortedBloodResult.bloodResult.sugar }}, Холистерин={{ sortedBloodResult.bloodResult.cholesterol }},
            Протромбин={{ sortedBloodResult.bloodResult.prothrombin }}, МНО={{ sortedBloodResult.bloodResult.inr }}
          </p>
          <p v-if="sortedUrineResult.urineGeneral && makeAppointmentDialog.showUrine">
            <strong>Клинический анализ мочи:</strong> {{ sortedUrineResult.urineDate | formatDate }}:<br/>
            Цвет={{ sortedUrineResult.urineGeneral.color.colorName }}, Реакция={{
            sortedUrineResult.urineGeneral.reaction.reactionName }}, Плотность={{ sortedUrineResult.urineGeneral.density
            }}, Прозрачность={{ (sortedUrineResult.urineGeneral.transparency) ? 'прозрачная' : 'мутная' }}, Белок={{
            sortedUrineResult.urineGeneral.protein }}, Глюкоза={{ sortedUrineResult.urineGeneral.glucose.glucoseName }},
            Ацетон={{ sortedUrineResult.urineGeneral.acetone.acetoneName }}, Желч. пигмент={{
            (sortedUrineResult.urineGeneral.bile) ? 'есть' : 'нет' }}<br/>
            Эпителий: плоский={{ sortedUrineResult.urineElements.flatEpithelium }}, моч.путей={{
            sortedUrineResult.urineElements.tractEpithelium }}, почечный={{
            sortedUrineResult.urineElements.renalEpithelium }}. Лейкоциты={{ sortedUrineResult.urineElements.leucocytes
            }}, Эритроциты={{ sortedUrineResult.urineElements.erythrocytes}}<br/>
            Цилиндры: гиалин={{ sortedUrineResult.urineElements.cylinders.hyaline }}, зернист={{
            sortedUrineResult.urineElements.cylinders.granular}}, воск={{ sortedUrineResult.urineElements.cylinders.waxy
            }}, эпител={{ sortedUrineResult.urineElements.cylinders.epithelial }}. Соли={{
            sortedUrineResult.urineElements.salts.saltsName }}, слизь={{ (sortedUrineResult.urineElements.slime) ?
            'есть' : 'нет' }}
          </p>
          <p v-if="sortedSmearResult.smearResult && makeAppointmentDialog.showSmear">
            <strong>Мазок на Gn:</strong> {{ sortedSmearResult.smearDate | formatDate }}:<br/>
            Гонококк={{ (sortedSmearResult.smearResult.smearGonococcus) ? 'Обнаружены' : 'Не обнаружены' }},
            Лейкоциты={{ smearLeucocytes.find(item => item.value === sortedSmearResult.smearResult.smearLeucocytes).text }},
            Диплококки={{ (sortedSmearResult.smearResult.smearDiplococcus) ? 'Обнаружены' : 'Не обнаружены' }},
            Эпителий={{ (sortedSmearResult.smearResult.smearEpithelium) ? 'Обнаружены' : 'Не обнаружены' }},<br/>
            Трихомонады={{ (sortedSmearResult.smearResult.smearTrichomonas) ? 'Обнаружены' : 'Не обнаружены' }},
            Дрожжеподобные грибы={{ (sortedSmearResult.smearResult.smearFungus) ? 'Обнаружены' : 'Не обнаружены' }},
            Ключевые клетки={{ (sortedSmearResult.smearResult.smearKeyCells) ? 'Обнаружены' : 'Не обнаружены' }}
          </p>
          <p v-if="sortedRwResult.rwResult && makeAppointmentDialog.showRw">
            <strong>Кровь на RW:</strong> {{ sortedRwResult.rwDate | formatDate }}:<br/>
            Результат={{ rwTypes.find(item => item.value === sortedRwResult.rwResult).text }}
          </p>
          <v-container grid-list-md>
            <v-layout row wrap v-if="currentUserDoctor.id === 4">
              <v-flex sm3>
                <h4>Без коррекции:</h4>
              </v-flex>
              <v-flex sm6>
                <h4>Коррекция:</h4>
              </v-flex>
              <v-flex sm3>
                <h4>С коррекцией:</h4>
              </v-flex>
            </v-layout>
            <v-layout row wrap v-if="currentUserDoctor.id === 4">
              <v-flex sm12 md3>
                <v-text-field
                  label="Без кор. OD"
                  :color="subSystem.primaryColor"
                  v-model="currentOphthalmologistResult.noCorrection.od"
                >
                </v-text-field>
              </v-flex>
              <v-flex sm12 md2>
                <v-text-field
                  label="OD SPH"
                  :color="subSystem.primaryColor"
                  v-model="currentOphthalmologistResult.correction.od.sph"
                >
                </v-text-field>
              </v-flex>
              <v-flex sm12 md2>
                <v-text-field
                  label="OD CYL"
                  :color="subSystem.primaryColor"
                  v-model="currentOphthalmologistResult.correction.od.cyl"
                >
                </v-text-field>
              </v-flex>
              <v-flex sm12 md2>
                <v-text-field
                  label="OD AX"
                  :color="subSystem.primaryColor"
                  v-model="currentOphthalmologistResult.correction.od.ax"
                >
                </v-text-field>
              </v-flex>
              <v-flex sm12 md3>
                <v-text-field
                  label="С кор. OD"
                  :color="subSystem.primaryColor"
                  v-model="currentOphthalmologistResult.withCorrection.od"
                >
                </v-text-field>
              </v-flex>
            </v-layout>
            <v-layout row wrap v-if="currentUserDoctor.id === 4">
              <v-flex sm12 md3>
                <v-text-field
                  label="Без кор. OS"
                  :color="subSystem.primaryColor"
                  v-model="currentOphthalmologistResult.noCorrection.os"
                >
                </v-text-field>
              </v-flex>
              <v-flex sm12 md2>
                <v-text-field
                  label="OS SPH"
                  :color="subSystem.primaryColor"
                  v-model="currentOphthalmologistResult.correction.os.sph"
                >
                </v-text-field>
              </v-flex>
              <v-flex sm12 md2>
                <v-text-field
                  label="OS CYL"
                  :color="subSystem.primaryColor"
                  v-model="currentOphthalmologistResult.correction.os.cyl"
                >
                </v-text-field>
              </v-flex>
              <v-flex sm12 md2>
                <v-text-field
                  label="OS AX"
                  :color="subSystem.primaryColor"
                  v-model="currentOphthalmologistResult.correction.os.ax"
                >
                </v-text-field>
              </v-flex>
              <v-flex sm12 md3>
                <v-text-field
                  label="С кор. OS"
                  :color="subSystem.primaryColor"
                  v-model="currentOphthalmologistResult.withCorrection.os"
                >
                </v-text-field>
              </v-flex>
            </v-layout>
            <v-layout row wrap>
              <v-flex sm12>
                <h3>Осмотр:</h3>
              </v-flex>
            </v-layout>
            <v-layout row wrap>
              <v-flex sm12>
                <v-text-field
                  multi-line
                  rows="3"
                  auto-grow
                  label="Объект. статус"
                  :color="subSystem.primaryColor"
                  v-model="currentDoctorResult.doctorStatus"
                >
                </v-text-field>
              </v-flex>
            </v-layout>
            <v-layout row wrap>
              <v-flex sm12 md2>
                <v-text-field
                  auto-grow
                  label="Жалобы"
                  :color="subSystem.primaryColor"
                  v-model="currentDoctorResult.doctorComplaints"
                >
                </v-text-field>
              </v-flex>
              <v-flex sm12 md4>
                <v-text-field
                  label="Диагноз"
                  :color="subSystem.primaryColor"
                  v-model="currentDoctorResult.doctorDiagnosis.diagnosis"
                >
                </v-text-field>
              </v-flex>
              <v-flex sm12 md2>
                <v-select
                  :items="doctorDetectabilities"
                  label="Выявляен"
                  :color="subSystem.primaryColor"
                  v-model="currentDoctorResult.doctorDiagnosis.detectability"
                >
                </v-select>
              </v-flex>
              <v-flex sm12 md4>
                <v-text-field
                  label="Комментарий"
                  :color="subSystem.primaryColor"
                  v-model="currentDoctorResult.doctorDiagnosis.diagnosisComment"
                >
                </v-text-field>
              </v-flex>
            </v-layout>
            <v-layout row wrap>
              <v-flex sm12>
                <v-select
                  auto-grow
                  multiple
                  :items="doctorConclusions"
                  label="Годность"
                  :color="subSystem.primaryColor"
                  v-model="currentDoctorResult.doctorConclusion"
                >
                </v-select>
              </v-flex>
            </v-layout>
          </v-container>
        </v-card-text>
        <v-card-actions>
          <v-spacer>
          </v-spacer>
          <v-btn :color="subSystem.primaryColor" flat class="white--text" @click.native="noExaminationDialog">Закрыть
          </v-btn>
          <v-btn
            v-if="this.currentUser.roles.medos.doctor !== 1 && !this.currentUser.roles.medos.admin && !this.currentUser.roles.superuser"
            :color="subSystem.primaryColor" class="white--text" @click.native="yesExaminationDialog">Сохранить
          </v-btn>
          <v-btn
            v-if="this.currentUser.roles.medos.doctor === 1 || this.currentUser.roles.medos.admin || this.currentUser.roles.superuser"
            :color="subSystem.primaryColor" class="white--text" @click.native="yesExaminationDialog"
            :disabled="!(ifAllDoctorsComplete() && ifAllExamsComplete())"
          >Сохранить прием
          </v-btn>
          <v-btn
            v-if="this.currentUser.roles.medos.doctor === 1 || this.currentUser.roles.medos.admin || this.currentUser.roles.superuser"
            :color="subSystem.secondaryColor" class="white--text" @click.native="openArchiveMedosDialog"
            :disabled="!(ifAllDoctorsComplete() && ifAllExamsComplete() && currentEditPatient.activeMedos.medosDoctorResults.some(result => result.doctorId === 1))"
          >Закрыть медосмотр
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <!-- / Диалог приема врача -->

    <!-- Диалог на глазное дно -->
    <v-dialog v-model="examsDialog.ocularFundus" persistent max-width="500px">
      <v-card>
        <v-card-title>
          <span class="headline">Обследование на глазное дно</span>
        </v-card-title>
        <v-card-text>
          <v-container grid-list-md>
            <v-layout row wrap>
              <v-flex sm12>
                <v-text-field
                  auto-grow
                  multi-line
                  rows="3"
                  label="Результат"
                  :color="subSystem.primaryColor"
                  v-model="currentExamResult.examResult"
                ></v-text-field>
              </v-flex>
            </v-layout>
          </v-container>
        </v-card-text>
        <v-card-actions>
          <v-spacer>
          </v-spacer>
          <v-btn :color="subSystem.primaryColor" flat @click.native="noExamDialog('ocularFundus')">Закрыть</v-btn>
          <v-btn :color="subSystem.primaryColor" class="white--text" @click.native="yesExamDialog('ocularFundus')">
            Сохранить
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <!-- / Диалог на глазное дно -->

    <!-- Диалог на поля зрения -->
    <v-dialog v-if="currentExamResult.examResult" v-model="examsDialog.fields" persistent max-width="500px">
      <v-card>
        <v-card-title>
          <span class="headline">Обследование полей зрения</span>
        </v-card-title>
        <v-card-text>
          <v-container grid-list-md>
            <v-layout row wrap>
              <v-flex sm12 md6>
                <v-select
                  :items="fieldResults"
                  label="Результат OD"
                  :color="subSystem.primaryColor"
                  v-model="currentExamResult.examResult.od"
                ></v-select>
              </v-flex>
              <v-flex sm12 md6>
                <v-select
                  :items="fieldResults"
                  label="Результат OS"
                  :color="subSystem.primaryColor"
                  v-model="currentExamResult.examResult.os"
                ></v-select>
              </v-flex>
            </v-layout>
          </v-container>
        </v-card-text>
        <v-card-actions>
          <v-spacer>
          </v-spacer>
          <v-btn :color="subSystem.primaryColor" flat @click.native="noExamDialog('fields')">Закрыть</v-btn>
          <v-btn :color="subSystem.primaryColor" class="white--text" @click.native="yesExamDialog('fields')">
            Сохранить
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <!-- / Диалог на поля зрения -->

    <!-- Диалог на ВГД -->
    <v-dialog v-if="currentExamResult.examResult" v-model="examsDialog.intraocularPressure" persistent
              max-width="500px">
      <v-card>
        <v-card-title>
          <span class="headline">Внутриглазное давление</span>
        </v-card-title>
        <v-card-text>
          <v-container grid-list-md>
            <v-layout row wrap>
              <v-flex sm12 md6>
                <v-text-field
                  label="OD, мм рт ст"
                  :color="subSystem.primaryColor"
                  v-model="currentExamResult.examResult.od"
                ></v-text-field>
              </v-flex>
              <v-flex sm12 md6>
                <v-text-field
                  label="OS, мм рт ст"
                  :color="subSystem.primaryColor"
                  v-model="currentExamResult.examResult.os"
                ></v-text-field>
              </v-flex>
            </v-layout>
          </v-container>
        </v-card-text>
        <v-card-actions>
          <v-spacer>
          </v-spacer>
          <v-btn :color="subSystem.primaryColor" flat @click.native="noExamDialog('intraocularPressure')">Закрыть
          </v-btn>
          <v-btn :color="subSystem.primaryColor" class="white--text"
                 @click.native="yesExamDialog('intraocularPressure')">
            Сохранить
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <!-- / Диалог на ВГД -->

    <!-- Диалог на рефрактометрию -->
    <v-dialog v-if="currentExamResult.examResult" v-model="examsDialog.refractometry" persistent max-width="500px">
      <v-card>
        <v-card-title>
          <span class="headline">Авторефрактометрия</span>
        </v-card-title>
        <v-card-text>
          <v-container grid-list-md>
            <v-layout row wrap v-if="currentExamResult.examResult.od">
              <v-flex sm12 md4>
                <v-text-field
                  label="OD SPH"
                  :color="subSystem.primaryColor"
                  v-model="currentExamResult.examResult.od.sph"
                >
                </v-text-field>
              </v-flex>
              <v-flex sm12 md4>
                <v-text-field
                  label="OD CYL"
                  :color="subSystem.primaryColor"
                  v-model="currentExamResult.examResult.od.cyl"
                >
                </v-text-field>
              </v-flex>
              <v-flex sm12 md4>
                <v-text-field
                  label="OD AX"
                  :color="subSystem.primaryColor"
                  v-model="currentExamResult.examResult.od.ax"
                >
                </v-text-field>
              </v-flex>
            </v-layout>
            <v-layout row wrap v-if="currentExamResult.examResult.os">
              <v-flex sm12 md4>
                <v-text-field
                  label="OS SPH"
                  :color="subSystem.primaryColor"
                  v-model="currentExamResult.examResult.os.sph"
                >
                </v-text-field>
              </v-flex>
              <v-flex sm12 md4>
                <v-text-field
                  label="OS CYL"
                  :color="subSystem.primaryColor"
                  v-model="currentExamResult.examResult.os.cyl"
                >
                </v-text-field>
              </v-flex>
              <v-flex sm12 md4>
                <v-text-field
                  label="OS AX"
                  :color="subSystem.primaryColor"
                  v-model="currentExamResult.examResult.os.ax"
                >
                </v-text-field>
              </v-flex>
            </v-layout>
          </v-container>
        </v-card-text>
        <v-card-actions>
          <v-spacer>
          </v-spacer>
          <v-btn :color="subSystem.primaryColor" flat @click.native="noExamDialog('refractometry')">Закрыть
          </v-btn>
          <v-btn :color="subSystem.primaryColor" class="white--text"
                 @click.native="yesExamDialog('refractometry')">
            Сохранить
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <!-- / Диалог на рефрактометрию -->

    <!-- Диалог на цветоощущение -->
    <v-dialog v-model="examsDialog.colorBlindness" persistent max-width="500px">
      <v-card>
        <v-card-title>
          <span class="headline">Цветоощущение</span>
        </v-card-title>
        <v-card-text>
          <v-container grid-list-md>
            <v-layout row wrap>
              <v-flex sm12>
                <v-select
                  :items="colorBlindnessResults"
                  label="Цветощущение"
                  :color="subSystem.primaryColor"
                  v-model="currentExamResult.examResult"
                ></v-select>
              </v-flex>
            </v-layout>
          </v-container>
        </v-card-text>
        <v-card-actions>
          <v-spacer>
          </v-spacer>
          <v-btn :color="subSystem.primaryColor" flat @click.native="noExamDialog('colorBlindness')">Закрыть</v-btn>
          <v-btn :color="subSystem.primaryColor" class="white--text" @click.native="yesExamDialog('colorBlindness')">
            Сохранить
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <!-- / Диалог на цветоощущение -->

    <!-- Диалог годностей и результатов -->
    <v-dialog v-model="conclusionsDialog.show" persistent max-width="900px">
      <v-card style="background: #eaeaea">
        <v-card-title>
          <span class="headline">Результаты пациента<br/><span
            class="green--text text--darken-2">{{ currentEditPatient.fio }}</span>
          </span>
        </v-card-title>
        <v-card-text>
          <v-container grid-list-md v-if="this.currentEditPatient.activeMedos.medosDoctors">
            <h2 style="margin-bottom: 10px" :class="(ifAllDoctorsComplete()) ? 'green--text' : 'red--text'">Доктора</h2>
            <v-expansion-panel focusable>
              <v-expansion-panel-content
                v-for="doctor in currentEditPatient.activeMedos.medosDoctors.mustDoctors"
                :key="doctor.doctorId"
                v-if="doctor.doctorId !== 1"
              >
                <div slot="header"
                     v-if="ifDoctorHasResult(doctor.doctorId)">
                  <strong>{{ getDoctorName(doctor.doctorId) }}</strong> — {{
                  getDoctorResult(doctor.doctorId).doctorConclusion.toString() }}
                </div>
                <div slot="header"
                     v-if="!ifDoctorHasResult(doctor.doctorId)">
                  <strong>{{ getDoctorName(doctor.doctorId) }}</strong> — <strong class="red--text">Нет
                  заключения</strong>
                </div>
                <v-card v-if="ifDoctorHasResult(doctor.doctorId)">
                  <v-card-text style="padding: 10px 24px">
                    <p>
                      <strong>Жалобы:</strong> {{ getDoctorResult(doctor.doctorId).doctorComplaints }}
                    </p>
                    <p>
                      <strong>Объективный статус:</strong> {{ getDoctorResult(doctor.doctorId).doctorStatus }}
                    </p>
                    <p v-if="getDoctorResult(doctor.doctorId).doctorDiagnosis">
                      <strong>Диагноз:</strong> {{ getDoctorResult(doctor.doctorId).doctorDiagnosis.diagnosis }}
                      <strong v-if="getDoctorResult(doctor.doctorId).doctorDiagnosis.detectability !== undefined">
                        ({{ (getDoctorResult(doctor.doctorId).doctorDiagnosis.detectability === true) ? '+' : '-'
                        }})
                      </strong>
                      <em v-if="getDoctorResult(doctor.doctorId).doctorDiagnosis.diagnosisComment !== ''">— {{
                        getDoctorResult(doctor.doctorId).doctorDiagnosis.diagnosisComment }}</em>
                    </p>
                    <p v-if="getDoctorResult(doctor.doctorId).doctorSpecial"></p>
                    <p>
                      <strong>Годность:</strong> {{ getDoctorResult(doctor.doctorId).doctorConclusion.toString() }}
                    </p>
                  </v-card-text>
                </v-card>
              </v-expansion-panel-content>
            </v-expansion-panel>
          </v-container>
          <br>
          <v-container grid-list-md v-if="this.currentEditPatient.activeMedos.medosExams && ifAnyExamNeeded()">
            <h2 style="margin: 10px 0" :class="(ifAllExamsComplete()) ? 'green--text' : 'red--text'">Обследования</h2>
            <v-expansion-panel focusable>
              <v-expansion-panel-content
                v-for="exam in currentEditPatient.activeMedos.medosExams.mustExams"
                :key="exam.examId"
                v-if="examsForConclusions.includes(exam.examId)"
              >
                <div slot="header"
                     v-if="ifExamHasResult(exam.examId)">
                  <strong>{{ exam.examName }}</strong>
                </div>
                <div slot="header"
                     v-if="!ifExamHasResult(exam.examId)">
                  <strong>{{ exam.examName }}</strong> — <strong class="red--text">Нет
                  заключения</strong>
                </div>
                <v-card v-if="ifExamHasResult(exam.examId)">
                  <v-card-text style="padding: 10px 24px">
                    <span v-if="exam.examId === 19">
                      {{ getExamResult(exam.examId).examResult }}
                    </span>
                    <p v-if="exam.examId === 20">
                      <strong>OD:</strong> {{ fieldResults.find(result => result.value ===
                      getExamResult(exam.examId).examResult.od).text }}<br>
                      <strong>OS:</strong> {{ fieldResults.find(result => result.value ===
                      getExamResult(exam.examId).examResult.os).text }}
                    </p>
                    <span v-if="exam.examId === 21">
                      <strong>OD:</strong> {{ getExamResult(exam.examId).examResult.od }} мм рт.ст.<br>
                      <strong>OS:</strong> {{ getExamResult(exam.examId).examResult.os }} мм рт.ст.
                    </span>
                    <span v-if="exam.examId === 32">
                      <strong>OD:</strong> SPH: {{ getExamResult(exam.examId).examResult.od.sph }} CYL: {{ getExamResult(exam.examId).examResult.od.cyl }} AX: {{ getExamResult(exam.examId).examResult.od.ax }}<br>
                      <strong>OS:</strong> SPH: {{ getExamResult(exam.examId).examResult.os.sph }} CYL: {{ getExamResult(exam.examId).examResult.os.cyl }} AX: {{ getExamResult(exam.examId).examResult.os.ax }}
                    </span>
                    <span v-if="exam.examId === 34">
                      <strong>AD:</strong> <em>125:</em> {{ getExamResult(exam.examId).examResult.ad.f125 }} <em>250:</em> {{ getExamResult(exam.examId).examResult.ad.f250 }} <em>500:</em> {{ getExamResult(exam.examId).examResult.ad.f500 }} <em>1000:</em> {{ getExamResult(exam.examId).examResult.ad.f1000 }} <em>2000:</em> {{ getExamResult(exam.examId).examResult.ad.f2000 }} <em>4000:</em> {{ getExamResult(exam.examId).examResult.ad.f4000 }} <em>6000:</em> {{ getExamResult(exam.examId).examResult.ad.f6000 }}<br>
                      <strong>AS:</strong> <em>125:</em> {{ getExamResult(exam.examId).examResult.as.f125 }} <em>250:</em> {{ getExamResult(exam.examId).examResult.as.f250 }} <em>500:</em> {{ getExamResult(exam.examId).examResult.as.f500 }} <em>1000:</em> {{ getExamResult(exam.examId).examResult.as.f1000 }} <em>2000:</em> {{ getExamResult(exam.examId).examResult.as.f2000 }} <em>4000:</em> {{ getExamResult(exam.examId).examResult.as.f4000 }} <em>6000:</em> {{ getExamResult(exam.examId).examResult.as.f6000 }}
                    </span>
                  </v-card-text>
                </v-card>
              </v-expansion-panel-content>
            </v-expansion-panel>
          </v-container>
        </v-card-text>
        <v-card-actions>
          <v-spacer>
          </v-spacer>
          <v-btn :color="subSystem.primaryColor" flat @click.native="noConclusionsDialog()">Закрыть</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <!-- / Диалог годностей и результатов -->

    <!-- Диалог закрытия мед. осмотра -->
    <v-dialog v-model="archiveMedosDialog.show" persistent max-width="800px">
      <v-card>
        <v-card-title>
          <span class="headline">
            Вы точно хотите архивировать мед. осмотр<br/>
            от <span class="green--text">{{ currentEditPatient.activeMedos.medosRegistrationDate | formatDate }}</span>?
          </span>
        </v-card-title>
        <v-card-actions>
          <v-spacer>
          </v-spacer>
          <v-btn :color="subSystem.deleteColor" flat @click.native="noArchiveMedosDialog">Нет</v-btn>
          <v-btn :color="subSystem.primaryColor" class="white--text" @click.native="yesArchiveMedosDialog">Да</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <!-- / Диалог закрытия мед. осмотра -->

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
        //* Если доктор, то данные.
        currentUserDoctor: {
          id: '',
          name: ''
        },
        //* Пациент, которого редактируем.
        currentEditPatient: {
          activeMedos: {},
          bloodResults: [],
          urineClinicalResults: []
        },
        //* Показания доктора, которые будем вносить.
        currentDoctorResult: {
          doctorDiagnosis: {}
        },
        //* Обследование, которое будем вносить (в основном для офтальмолога).
        currentExamResult: {},
        //* Показания специфические для офтальмолога.
        currentOphthalmologistResult: {
          noCorrection: {
            od: '',
            os: ''
          },
          correction: {
            od: {
              sph: '',
              cyl: '',
              ax: ''
            },
            os: {
              sph: '',
              cyl: '',
              ax: ''
            }
          },
          withCorrection: {
            od: '',
            os: ''
          }
        },
        //* Самый последний анализ крови.
        sortedBloodResult: {},
        //* Самый последний анализ мочи.
        sortedUrineResult: {},
        //* Самый последний мазок.
        sortedSmearResult: {},
        //* Самый последний анализ RW.
        sortedRwResult: {},
        //* Самая последняя флюорография.
        sortedRgResult: {},
        //* Диалог приема врача.
        makeAppointmentDialog: {
          show: false,
          showBlood: false,
          showUrine: false,
          showInfo: false,
          showSmear: false,
          showRw: false,
          edit: false
        },
        //* Диалоги обследований (открываются кнопками у офтальмолога).
        examsDialog: {
          ocularFundus: false,
          intraocularPressure: false,
          refractometry: false,
          fields: false,
          colorBlindness: false
        },
        //* Диалог годностей узких специалистов (открывается у терапевта).
        conclusionsDialog: {
          show: false
        },
        //* Диалог архивации мед. осмотра.
        archiveMedosDialog: {
          show: false
        },
        //* Обследования офтальмолога.
        ophthalmologistExams: {
          ocularFundus: false,
          intraocularPressure: false,
          refractometry: false,
          fields: false,
          colorBlindness: false
        },
        //* Массив обследований, которые выводят в годности.
        examsForConclusions: [1, 19, 20, 21, 32, 34, 38, 46],
        //* Справочник годностей.
        doctorConclusions: [
          'Годен',
          'в очках',
          'без высоты',
          'не более 50% ПЭВМ',
          'без физич. перегрузок',
          'без ГЗА',
          'без права найма',
          'без ДЭУ',
          'с подъемом тяжестей не более 7кг',
          'без световой среды',
          'Не годен'
        ],
        //* Справочник выявляемостей.
        doctorDetectabilities: [
          {
            value: true,
            text: 'Первичный'
          },
          {
            value: false,
            text: 'Повторный'
          }
        ],
        //* Справочник полей зрения.
        fieldResults: [
          {
            value: 1,
            text: 'Норма'
          },
          {
            value: 2,
            text: 'Сужено'
          },
          {
            value: 3,
            text: 'Скотома'
          },
          {
            value: 4,
            text: 'Гемианопсия'
          }
        ],
        //* Справочник цветоощущений.
        colorBlindnessResults: [
          {
            value: 1,
            text: 'Норма'
          },
          {
            value: 2,
            text: 'Дихромазия'
          },
          {
            value: 3,
            text: 'Трихромазия'
          }
        ],
        //* Справочник мазков.
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
          primaryColor: 'purple darken-3',
          secondaryColor: 'orange darken-3',
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
      //* Методы про диалог приема врача.
      openExaminationDialog (item) {
        this.currentEditPatient = item
        //* Проверяем открывать ли вообще диалог, вдруг отсутствуют посещения доврачебного или анализы.
        if (!this.currentEditPatient.activeMedos.medosDoctors) {
          this.snackBar = {
            color: 'red darken-2 white--text',
            timeout: 5000,
            message: 'Пациент не был в доврачебном кабинете.',
            show: true
          }
        } else if (this.currentEditPatient.bloodResults.length === 0) {
          this.snackBar = {
            color: 'red darken-2 white--text',
            timeout: 5000,
            message: 'У пациента отсутствуют анализы крови.',
            show: true
          }
        } else if (this.currentEditPatient.urineClinicalResults.length === 0) {
          this.snackBar = {
            color: 'red darken-2 white--text',
            timeout: 5000,
            message: 'У пациента отсутствуют анализы мочи.',
            show: true
          }
        } else {
          //* Выбираем последние анализы и последнюю флюорографию.
          let sortedBlood = this.currentEditPatient.bloodResults.sort((a, b) => {
            return new Date(b.bloodDate) - new Date(a.bloodDate)
          })
          this.sortedBloodResult = sortedBlood[0]
          let sortedUrine = this.currentEditPatient.urineClinicalResults.sort((a, b) => {
            return new Date(b.urineDate) - new Date(a.urineDate)
          })
          this.sortedUrineResult = sortedUrine[0]
          if (this.currentEditPatient.smearResults.length > 0) {
            let sortedSmear = this.currentEditPatient.smearResults.sort((a, b) => {
              return new Date(b.smearDate) - new Date(a.smearDate)
            })
            this.sortedSmearResult = sortedSmear[0]
          }
          if (this.currentEditPatient.rwResults.length > 0) {
            let sortedRw = this.currentEditPatient.rwResults.sort((a, b) => {
              return new Date(b.rwDate) - new Date(a.rwDate)
            })
            this.sortedRwResult = sortedRw[0]
          }
          let sortedRg = this.currentEditPatient.rgResults.sort((a, b) => {
            return new Date(b.rgDate) - new Date(a.rgDate)
          })
          this.sortedRgResult = sortedRg[0]
          //* Проверяем нужен ли осмотр такого доктора.
          let mustDoctors = this.currentEditPatient.activeMedos.medosDoctors.mustDoctors
          let thisDoctor = mustDoctors.some(doctor => doctor.doctorId === this.currentUserDoctor.id)
          if (thisDoctor || this.currentUser.roles.medos.admin || this.currentUser.roles.superuser) {
            //* Проверяем есть ли уже осмотр такого доктора, тогда редактируем.
            let hasDoctorResult = this.currentEditPatient.activeMedos.medosDoctorResults.some(
              result => result.doctorId === this.currentUserDoctor.id
            )
            if (hasDoctorResult) {
              this.makeAppointmentDialog = {
                show: true,
                showBlood: false,
                showUrine: false,
                showSmear: false,
                showRw: false,
                showInfo: true,
                edit: true
              }
              this.currentDoctorResult = this.currentEditPatient.activeMedos.medosDoctorResults.find(
                result => result.doctorId === this.currentUserDoctor.id
              )
              //* Если пустой диагноз, то сделать.
              if (!this.currentDoctorResult.doctorDiagnosis) {
                this.currentDoctorResult.doctorDiagnosis = {
                  diagnosis: '',
                  detectability: null,
                  diagnosisComment: ''
                }
              }
              //* Если офтальмолог.
              if (this.currentDoctorResult.doctorSpecial && this.currentUserDoctor.id === 4) {
                this.currentOphthalmologistResult = this.currentDoctorResult.doctorSpecial
              }
            } else {
              this.makeAppointmentDialog = {
                show: true,
                showBlood: false,
                showUrine: false,
                showSmear: false,
                showRw: false,
                showInfo: true,
                edit: false
              }
            }
          } else {
            this.snackBar = {
              color: 'red darken-2 white--text',
              timeout: 5000,
              message: 'Этому пациенту не требуется осмотр',
              show: true
            }
          }
          if (this.currentUserDoctor.id === 4) {
            //* Выбираем есть ли офтальмологические обследования.
            let mustExams = this.currentEditPatient.activeMedos.medosExams.mustExams
            this.ophthalmologistExams.ocularFundus = mustExams.some(exam => exam.examId === 19)
            this.ophthalmologistExams.fields = mustExams.some(exam => exam.examId === 20)
            this.ophthalmologistExams.intraocularPressure = mustExams.some(exam => exam.examId === 21)
            this.ophthalmologistExams.refractometry = mustExams.some(exam => exam.examId === 32)
            this.ophthalmologistExams.colorBlindness = mustExams.some(exam => exam.examId === 38)
          }
        }
      },
      noExaminationDialog () {
        this.makeAppointmentDialog = {
          show: false,
          showBlood: false,
          showUrine: false,
          showSmear: false,
          showRw: false,
          showInfo: false,
          edit: false
        }
        this.currentEditPatient = {
          activeMedos: {},
          bloodResults: [],
          urineClinicalResults: []
        }
      },
      yesExaminationDialog () {
        let tmpDoctorResult = this.currentDoctorResult
        //* Дописываем прием офтальмолога
        if (this.currentUserDoctor.id === 4) {
          tmpDoctorResult.doctorSpecial = this.currentOphthalmologistResult
        }
        if (this.makeAppointmentDialog.edit) {
          if (this.currentUserDoctor.id !== 0) {
            Axios.put(`${GKP7API}/api/v1/patient/${this.currentEditPatient._id}/doctorResult/${tmpDoctorResult._id}/`, {
              doctorResult: tmpDoctorResult
            }, {
              headers: {'Authorization': Authentication.getAuthenticationHeader(this)}
            }).then(res => {
              if (res.data.success) {
                this.snackBar.color = 'green darken-1 white--text'
                this.snackBar.timeout = 2000
                //* Закрыть окно, если не вводились обследования.
                if (this.currentEditPatient.activeMedos.medosExamResults.length === 0) {
                  this.makeAppointmentDialog = {
                    show: false,
                    showBlood: false,
                    showUrine: false,
                    showSmear: false,
                    showRw: false,
                    showInfo: false,
                    edit: false
                  }
                  this.currentEditPatient = {
                    activeMedos: {},
                    bloodResults: [],
                    urineClinicalResults: []
                  }
                }
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
            this.snackBar = {
              color: 'red darken-2 white--text',
              timeout: 5000,
              message: 'Вы не врач',
              show: true
            }
          }
        } else {
          tmpDoctorResult.doctorId = this.currentUserDoctor.id
          if (this.currentUserDoctor.id !== 0) {
            Axios.post(`${GKP7API}/api/v1/patient/${this.currentEditPatient._id}/doctorResult/`, {
              doctorResult: tmpDoctorResult
            }, {
              headers: {'Authorization': Authentication.getAuthenticationHeader(this)}
            }).then(res => {
              if (res.data.success) {
                this.snackBar.color = 'green darken-1 white--text'
                this.snackBar.timeout = 2000
                //* Закрыть окно, если не вводились обследования.
                if (this.currentEditPatient.activeMedos.medosExamResults.length === 0) {
                  this.makeAppointmentDialog = {
                    show: false,
                    showBlood: false,
                    showUrine: false,
                    showSmear: false,
                    showRw: false,
                    showInfo: false,
                    edit: false
                  }
                  this.currentEditPatient = {
                    activeMedos: {},
                    bloodResults: [],
                    urineClinicalResults: []
                  }
                }
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
            this.snackBar = {
              color: 'red darken-2 white--text',
              timeout: 5000,
              message: 'Вы не врач',
              show: true
            }
          }
        }
        let tmpExamResults = this.currentEditPatient.activeMedos.medosExamResults
        tmpExamResults.forEach((item) => {
          if (item._id === undefined) {
            Axios.post(`${GKP7API}/api/v1/patient/${this.currentEditPatient._id}/examResult/`, {
              examResult: item
            }, {
              headers: {'Authorization': Authentication.getAuthenticationHeader(this)}
            }).then(res => {
              if (res.data.success) {
                this.snackBar.color = 'green darken-1 white--text'
                this.snackBar.timeout = 2000
                this.getMedosPatients()
                this.makeAppointmentDialog = {
                  show: false,
                  showBlood: false,
                  showUrine: false,
                  showSmear: false,
                  showRw: false,
                  showInfo: false,
                  edit: false
                }
                this.currentEditPatient = {
                  activeMedos: {},
                  bloodResults: [],
                  urineClinicalResults: []
                }
              } else {
                this.snackBar.color = 'red darken-2 white--text'
                this.snackBar.timeout = 5000
              }
            }).catch(err => {
              this.errorHandler(err)
            })
          } else {
            Axios.put(`${GKP7API}/api/v1/patient/${this.currentEditPatient._id}/examResult/${item._id}`, {
              examResult: item
            }, {
              headers: {'Authorization': Authentication.getAuthenticationHeader(this)}
            }).then(res => {
              if (res.data.success) {
                this.snackBar.color = 'green darken-1 white--text'
                this.snackBar.timeout = 2000
                this.getMedosPatients()
                this.makeAppointmentDialog = {
                  show: false,
                  showBlood: false,
                  showUrine: false,
                  showSmear: false,
                  showRw: false,
                  showInfo: false,
                  edit: false
                }
                this.currentEditPatient = {
                  activeMedos: {},
                  bloodResults: [],
                  urineClinicalResults: []
                }
              } else {
                this.snackBar.color = 'red darken-2 white--text'
                this.snackBar.timeout = 5000
              }
            }).catch(err => {
              this.errorHandler(err)
            })
          }
        })
      },
      //* Закрыть мед. осмотр.
      openArchiveMedosDialog () {
        this.archiveMedosDialog.show = true
      },
      noArchiveMedosDialog () {
        this.archiveMedosDialog.show = false
      },
      yesArchiveMedosDialog () {
        let tempMedos = this.currentEditPatient.activeMedos
        Axios.post(`${GKP7API}/api/v1/patient/${this.currentEditPatient._id}/medosFinal/`, {
          medosResult: tempMedos
        }, {
          headers: {'Authorization': Authentication.getAuthenticationHeader(this)}
        }).then(res => {
          if (res.data.success) {
            this.snackBar.color = 'green darken-1 white--text'
            this.snackBar.timeout = 2000
            //* Закрыть окна.
            this.archiveMedosDialog.show = false
            this.makeAppointmentDialog = {
              show: false,
              showBlood: false,
              showUrine: false,
              showSmear: false,
              showRw: false,
              showInfo: false,
              edit: false
            }
            this.currentEditPatient = {
              activeMedos: {},
              bloodResults: [],
              urineClinicalResults: []
            }
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
      //* Методы про диалог осбледования.
      openExamDialog (item) {
        let activeExamResults = this.currentEditPatient.activeMedos.medosExamResults
        switch (item) {
          case 'ocularFundus':
            if (activeExamResults.some(result => result.examId === 19)) {
              this.currentExamResult = activeExamResults.find(result => result.examId === 19)
            } else {
              this.currentExamResult = {
                examId: 19,
                examResult: 'ДЗН бледно-розовый, границы четкие, эскавация физиологическая, ход и калибр сосудов не изменен. Очаговой патологии нет.'
              }
            }
            break
          case 'fields':
            if (activeExamResults.some(result => result.examId === 20)) {
              this.currentExamResult = activeExamResults.find(result => result.examId === 20)
            } else {
              this.currentExamResult = {
                examId: 20,
                examResult: {
                  od: 1,
                  os: 1
                }
              }
            }
            break
          case 'intraocularPressure':
            if (activeExamResults.some(result => result.examId === 21)) {
              this.currentExamResult = activeExamResults.find(result => result.examId === 21)
            } else {
              this.currentExamResult = {
                examId: 21,
                examResult: {
                  od: '',
                  os: ''
                }
              }
            }
            break
          case 'refractometry':
            if (activeExamResults.some(result => result.examId === 32)) {
              this.currentExamResult = activeExamResults.find(result => result.examId === 32)
            } else {
              this.currentExamResult = {
                examId: 32,
                examResult: {
                  od: {},
                  os: {}
                }
              }
            }
            break
          case 'colorBlindness':
            if (activeExamResults.some(result => result.examId === 38)) {
              this.currentExamResult = activeExamResults.find(result => result.examId === 38)
            } else {
              this.currentExamResult = {
                examId: 38,
                examResult: 1
              }
            }
            break
        }
        this.examsDialog[item] = true
      },
      noExamDialog (item) {
        this.examsDialog[item] = false
        this.currentExamResult = {}
      },
      yesExamDialog (item) {
        let activeExamResults = this.currentEditPatient.activeMedos.medosExamResults
        switch (item) {
          case 'ocularFundus':
            if (activeExamResults.some(result => result.examId === 19)) {
              this.currentExamResult = {}
            } else {
              activeExamResults.push(this.currentExamResult)
            }
            break
          case 'fields':
            if (activeExamResults.some(result => result.examId === 20)) {
              this.currentExamResult = {}
            } else {
              activeExamResults.push(this.currentExamResult)
            }
            break
          case 'intraocularPressure':
            if (activeExamResults.some(result => result.examId === 21)) {
              this.currentExamResult = {}
            } else {
              activeExamResults.push(this.currentExamResult)
            }
            break
          case 'refractometry':
            if (activeExamResults.some(result => result.examId === 32)) {
              this.currentExamResult = {}
            } else {
              activeExamResults.push(this.currentExamResult)
            }
            break
          case 'colorBlindness':
            if (activeExamResults.some(result => result.examId === 38)) {
              this.currentExamResult = {}
            } else {
              activeExamResults.push(this.currentExamResult)
            }
            break
        }
        this.examsDialog[item] = false
      },
      //* Методы про диалог годностей других специалистов.
      openConclusionsDialog () {
        this.conclusionsDialog.show = true
      },
      noConclusionsDialog () {
        this.conclusionsDialog.show = false
      },
      //* Запрашиваем список пациентов по введенным ФИО.
      getMedosPatients () {
        let tempQuery = {}
        tempQuery.lastName = (this.patientQuery.lastName === undefined || this.patientQuery.lastName === '') ? ' ' : this.patientQuery.lastName
        tempQuery.firstName = (this.patientQuery.firstName === undefined || this.patientQuery.firstName === '') ? ' ' : this.patientQuery.firstName
        tempQuery.middleName = (this.patientQuery.middleName === undefined || this.patientQuery.middleName === '') ? ' ' : this.patientQuery.middleName
        Axios.get(`${GKP7API}/api/v1/patient/medos/${tempQuery.lastName}/${tempQuery.firstName}/${tempQuery.middleName}/`, {
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
          this.currentDoctorResult.doctorComplaints = 'Нет'
          if (this.currentUser.roles.medos.admin || this.currentUser.roles.superuser) {
            this.currentUserDoctor.id = 1
          } else {
            this.currentUserDoctor.id = this.currentUser.roles.medos.doctor
          }
          switch (this.currentUser.roles.medos.doctor) {
            case 1:
              this.currentUserDoctor.name = 'терапевт'
              this.currentDoctorResult.doctorStatus = 'Кожные покровы и видимые слизистые обычной окраски. Язык чистый. Дыхание везикулярное, хрипов нет. Тоны сердца ясные, ритм правильный, Живот мягкий, безболезненный. Отеков нет.'
              break
            case 2:
              this.currentUserDoctor.name = 'оториноларинголог'
              this.currentDoctorResult.doctorStatus = 'Слизистая носа розовая, носовые ходы свободные. Миндалины не увеличены, слизистая глотки розовая, чистая, Слизистая гортани розовая, голосовые связки серые, подвижные, голос чистый. Уши : слуховой проход свободный, барабанная перепонка не изменена. Шепотная речь 6м справа, 6м слева. Вестибулярных нарушений нет.'
              break
            case 3:
              this.currentUserDoctor.name = 'дерматовенеролог'
              this.currentDoctorResult.doctorStatus = 'Внешний осмотр: кожные покровы  чистые, обычной окраски. Лимфоузлы не увеличены во всех группах. Наружные половые органы: видимые слизистые бледно розовой окраски. Перианальная область без специфических высыпаний.'
              break
            case 4:
              this.currentUserDoctor.name = 'офтальмолог'
              this.currentDoctorResult.doctorStatus = 'Положение век и рост ресниц правильное. Движение глаз в полном объеме. Коньюнктива розовая, Роговица, прозрачная. Передняя камера средней глубины. Радужка структурная, пигментная кайма сохранена. Зрачок не изменен. Хрусталик и стекловидное тело прозрачны.'
              break
            case 5:
              this.currentUserDoctor.name = 'хирург'
              this.currentDoctorResult.doctorStatus = 'Шея, голова, грудная клетка без патологии. Физиологические изгибы и подвижность сохранены. Лимфоузлы без патологии. Живот мягкий, безболезненный. Остов таза симметричный, наружные половые органы без патологии. Ректальное пальцевое исследование: сфинктер в тонусе, патологии в просвете нет. Верхние конечности без патологии, нижние конечности без патологии , пульсация периферических сосудов сохранена.'
              break
            case 6:
              this.currentUserDoctor.name = 'невролог'
              this.currentDoctorResult.doctorStatus = 'Наружный осмотр: норма. Высшая нервная деятельность: норма. Черепно-мозговая иннервация: норма. Сухожильные рефлексы: живые. Чувствительность кожи: норма. Мануальное исследование: патологии нет. Поза Ромберга: устойчивость. Пальце-носовая проба: четкое попадание. Походка: не изменена.'
              break
            case 7:
              this.currentUserDoctor.name = 'стоматолог'
              this.currentDoctorResult.doctorStatus = 'Лицо симметрично, кожные покровы не изменены. Движения в височно-нижнечелюстном суставе в полном объеме. Слизистая полости рта влажная, гладкая, чистая. Области выхода протоков слюнных желез не изменены. Край десен имеет бледно-розовую окраску и плотно прилегает к шейкам зубов. Зубной ряд полный. Съемных зубных протезов нет.'
              break
            case 12:
              this.currentUserDoctor.name = 'гинеколог'
              this.currentDoctorResult.doctorStatus = 'Наружные половые органы развиты правильно. Влагалище, своды без патологии. Шейка матки без патологии. Тело матки не увеличено, правильной формы, положение физиологическое. Цервикальный канал закрыт, придатки не пальпируются. Выделения скудные, без цвета и неприятного запаха. Пальцевое исследование прямой кишки – патологии в малом тазу нет. Исследование молочных желез: симметричные, окраска, соски, консистенция обычные.'
              break
            default:
              this.currentUserDoctor.name = 'терапевт'
              this.currentDoctorResult.doctorStatus = 'Кожные покровы и видимые слизистые обычной окраски. Язык чистый. Дыхание везикулярное, хрипов нет. Тоны сердца ясные, ритм правильный, Живот мягкий, безболезненный. Отеков нет.'
              break
          }
        }).catch(err => {
          this.errorHandler(err)
        })
      },
      //* Название доктора по id.
      getDoctorName (doctorId) {
        switch (doctorId) {
          case 1:
            return 'Терапевт'
          case 2:
            return 'Оториноалринголог'
          case 3:
            return 'Дерматовенеролог'
          case 4:
            return 'Офтальмолог'
          case 5:
            return 'Хирург'
          case 6:
            return 'Невролог'
          case 7:
            return 'Стоматолог'
          case 12:
            return 'Гинеколог'
        }
      },
      //* Есть ли результат такого доктора.
      ifDoctorHasResult (doctorId) {
        return this.currentEditPatient.activeMedos.medosDoctorResults.some(result => result.doctorId === doctorId)
      },
      //* Результат такого доктора.
      getDoctorResult (doctorId) {
        return this.currentEditPatient.activeMedos.medosDoctorResults.find(result => result.doctorId === doctorId)
      },
      //* Название обследования по id.
      getExamName (examId) {
        switch (examId) {
          case 1:
            return 'Спирометрия'
          case 19:
            return 'Глазное дно'
          case 20:
            return 'Поля зрения'
          case 21:
            return 'Глазное давление'
          case 32:
            return 'Рефрактометрия'
          case 34:
            return 'Аудиометрия'
          case 38:
            return 'Цветоощущение'
          case 46:
            return 'ЭКГ'
        }
      },
      //* Есть ли результат такого обследования.
      ifExamHasResult (examId) {
        return this.currentEditPatient.activeMedos.medosExamResults.some(result => result.examId === examId)
      },
      //* Результат такого обследования.
      getExamResult (examId) {
        return this.currentEditPatient.activeMedos.medosExamResults.find(result => result.examId === examId)
      },
      //* Проверить есть ли хоть одно обследование, которое требует описания.
      ifAnyExamNeeded () {
        let examsForConclusions = this.examsForConclusions
        let mustExams = this.currentEditPatient.activeMedos.medosExams.mustExams
        return mustExams.some(exam => examsForConclusions.includes(exam.examId))
      },
      //* Проверить все ли обследования пройдены.
      ifAllExamsComplete () {
        let examsForConclusions = this.examsForConclusions
        let mustExams = this.currentEditPatient.activeMedos.medosExams.mustExams
        let finalExamsToCheck = mustExams.filter(exam => examsForConclusions.includes(exam.examId))
        let examResults = this.currentEditPatient.activeMedos.medosExamResults
        return finalExamsToCheck.every(exam => examResults.some(result => result.examId === exam.examId))
      },
      //* Проверить все ли врачи пройдены.
      ifAllDoctorsComplete () {
        let mustDoctors = this.currentEditPatient.activeMedos.medosDoctors.mustDoctors
        let finalDoctorsToCheck = mustDoctors.filter(doctor => doctor.doctorId !== 1)
        let doctorResults = this.currentEditPatient.activeMedos.medosDoctorResults
        return finalDoctorsToCheck.every(doctor => doctorResults.some(result => result.doctorId === doctor.doctorId))
      },
      //* Проверка на необходимость мазка.
      ifPatientNeedsSmear (patient) {
        if (patient.smearResults && patient.smearResults.length > 0) {
          let mustExams = patient.activeMedos.medosExams.mustExams
          return mustExams.some(exam => exam.examId === 43)
        } else {
          return false
        }
      },
      //* Проверка на необходимость RW.
      ifPatientNeedsRw (patient) {
        if (patient.rwResults && patient.rwResults.length > 0) {
          let mustExams = patient.activeMedos.medosExams.mustExams
          return mustExams.some(exam => exam.examId === 42)
        } else {
          return false
        }
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
        if (err.response) {
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
  }
</script>

<style lang="scss">
  .router-link-exact-active {
    background-color: #6a1b9a;
    color: white;
    padding: 0 6px;
  }

  .theme--light .input-group input:disabled::placeholder,
  .theme--light .input-group input:disabled {
    color: rgba(245, 127, 23, 0.7) !important;
  }

  .container.grid-list-md {
    padding: 0;
    .layout .flex {
      padding: 0 4px;
    }
  }

  h4 {
    margin-bottom: 6px;
  }

  h3 {
    margin: 6px 0;
  }

  .btn {
    min-width: initial;
  }

  .btn--block {
    margin: 4px 0;
  }

  .input-group__details {
    min-height: 16px;
  }
</style>
