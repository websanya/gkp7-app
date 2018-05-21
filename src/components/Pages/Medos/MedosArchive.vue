<template>
  <div class=uwd-container>
    <app-header :subsystem="subSystem.primaryColor" subtitle="Архив профосмотра" :currentUser="currentUser">
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
                  <v-text-field @keyup.enter="getArchivePatients" :color="subSystem.primaryColor" label="Фамилия"
                                v-model="patientQuery.lastName" box>
                  </v-text-field>
                </v-flex>
                <v-flex xs12 md4>
                  <v-text-field @keyup.enter="getArchivePatients" :color="subSystem.primaryColor" label="Имя"
                                v-model="patientQuery.firstName" box>
                  </v-text-field>
                </v-flex>
                <v-flex xs12 md4>
                  <v-text-field @keyup.enter="getArchivePatients" :color="subSystem.primaryColor" label="Отчество"
                                v-model="patientQuery.middleName" box>
                  </v-text-field>
                </v-flex>
                <v-flex xs12>
                  <v-btn @click.native="getArchivePatients" :color="subSystem.primaryColor" dark large block>Найти
                  </v-btn>
                </v-flex>
              </v-layout>
              <v-data-table
                :headers="[
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
                    <td>{{ props.item.fio }}</td>
                    <td>{{ props.item.dateBirth }}</td>
                    <td>{{ (props.item.sex) ? 'Муж' : 'Жен' }}</td>
                    <td>
                      <v-tooltip top :color="subSystem.secondaryColor">
                        <v-btn
                          slot="activator"
                          @click.native="openArchiveListDialog(props.item)"
                          :color="subSystem.secondaryColor"
                          icon
                        >
                          <v-icon color="white">assignment_ind</v-icon>
                        </v-btn>
                        <span>Посмотреть архив</span>
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

    <!-- Диалог списка архивных записей -->
    <v-dialog v-model="archiveListDialog.show" persistent max-width="800px">
      <v-card>
        <v-card-title>
          <span class="headline">
            Архивы пациента <br>
            <span class="green--text">{{ currentEditPatient.fio }}</span>
          </span>
        </v-card-title>
        <v-card-text v-if="currentEditPatient.medosArchive">
          <v-container grid-list-md v-if="currentEditPatient.medosArchive.length > 0">
            <v-data-table
              :headers="[
                { text: 'Дата медосмотра', sortable: false },
                { text: 'Тип медосмотра', sortable: false },
                { text: 'Действия', sortable: false }
              ]"
              :items="currentEditPatient.medosArchive"
              hide-actions
              class="elevation-5 mt-4"
            >
              <template slot="items" slot-scope="props">
                <tr>
                  <td>{{ props.item.medosRegistrationDate | formatDate }}</td>
                  <td>{{ medosTypes.find(item => item.value === props.item.medosType).text }}</td>
                  <td>
                    <v-tooltip top :color="subSystem.primaryColor">
                      <v-btn
                        slot="activator"
                        @click.native="openArchiveDialog(props.item)"
                        :color="subSystem.primaryColor"
                        icon
                      >
                        <v-icon color="white">assignment_ind</v-icon>
                      </v-btn>
                      <span>Архивная запись</span>
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
          <v-btn :color="subSystem.primaryColor" flat @click.native="noArchiveListDialog">Закрыть</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <!-- / Диалог списка архивных записей -->

    <!-- Диалог конкретной архивной записи -->
    <v-dialog v-model="archiveDialog.show" persistent max-width="800px">
      <v-card>
        <v-card-title>
          <span class="headline">
            Архивная запись пациента <br>
            <span class="green--text">{{ currentEditPatient.fio }}</span><br>
            от <strong>{{ currentArchive.medosRegistrationDate | formatDate }}</strong>
          </span>
        </v-card-title>
        <v-card-text v-if="currentArchive">
          <div class="print-only" ref="print_1">
            <h3 class="headline">
              Архивная запись пациента <br>
              <span class="green--text">{{ currentEditPatient.fio }}</span><br>
              от <strong>{{ currentArchive.medosRegistrationDate | formatDate }}</strong>
            </h3>
          </div>
          <div ref="print_2">
            <p>
              <strong>Дата регистрации:</strong> {{ currentArchive.medosRegistrationDate | formatDate }}
            </p>
            <p
              v-if="currentArchive.medosJob && currentArchive.medosParameters">
              <strong>Цех:</strong> {{ currentArchive.medosJob.jobDivision }},
              <strong>табельный номер:</strong> {{ currentArchive.medosJob.jobPersonnelNumber }}<br/>
              <strong>Профессия:</strong> {{ currentArchive.medosJob.jobName }}<br/>
              <strong>Проффакторы:</strong>
              <span v-if="currentArchive.medosHarms"
                    v-for="harm in currentArchive.medosHarms" :key="harm.harmId">
              {{ harm.harmName }}; </span><br/>
              <span v-if="currentArchive.medosParameters">
              <strong>Анамнез:</strong> {{ currentArchive.medosParameters.comment }}<br/>
            </span>
              <span v-if="currentRgResult">
              <strong>Флюорография:</strong> <u>{{ currentRgResult.rgDate | formatDate }}</u><br>
              {{ (currentRgResult.rgLocation.rgLocationType) ? 'ЛПУ=МБУЗ ГКБ №6, поликлиника 2' :
              `ЛПУ=${currentRgResult.rgLocation.rgLocationComment}` }}<br>
              {{ (currentRgResult.rgResult.rgResultType) ? 'Заключение=норма'
              : `Заключение=${currentRgResult.rgResult.rgResultComment}` }}
            </span>
              <span v-if="!currentRgResult">
              <strong>Флюорография: <span class="red--text">отсутствует</span></strong>
            </span>
            </p>
            <p v-if="currentArchive.medosDoctors">
              <strong>Врачи:</strong>
              <span v-if="currentArchive.medosDoctors"
                    v-for="doctor in currentArchive.medosDoctors.mustDoctors" :key="doctor.doctorId">
              {{ doctor.doctorName }}; </span><br/>
              <strong v-if="currentArchive.medosExams">Обследования:</strong>
              <span v-if="currentArchive.medosExams"
                    v-for="exam in currentArchive.medosExams.mustExams" :key="exam.examId">
              {{ exam.examName }}; </span><br/>
            </p>
            <div v-if="currentBloodResult">
              <p v-if="currentBloodResult.bloodResult">
                <strong>Клинический анализ крови:</strong> <u>{{ currentBloodResult.bloodDate | formatDate }}</u>:<br/>
                {{ (currentBloodResult.bloodResult.hemoglobin) ? `Hb=${currentBloodResult.bloodResult.hemoglobin},` : ''
                }}
                {{ (currentBloodResult.bloodResult.leucocytes) ? `L=${currentBloodResult.bloodResult.leucocytes},` : ''
                }}
                {{ (currentBloodResult.bloodResult.esr) ? `СОЭ=${currentBloodResult.bloodResult.esr},` : '' }}
                {{ (currentBloodResult.bloodResult.basophils) ? `Баз=${currentBloodResult.bloodResult.basophils},` : ''
                }}
                {{ (currentBloodResult.bloodResult.myelocytes) ? `Миел=${currentBloodResult.bloodResult.myelocytes},` :
                ''
                }}
                {{ (currentBloodResult.bloodResult.young) ? `Юные=${currentBloodResult.bloodResult.young},` : '' }}
                {{ (currentBloodResult.bloodResult.sticks) ? `Пал=${currentBloodResult.bloodResult.sticks},` : '' }}
                {{ (currentBloodResult.bloodResult.segments) ? `Сегменты=${currentBloodResult.bloodResult.segments},` :
                ''
                }}
                {{ (currentBloodResult.bloodResult.lymphocytes) ?
                `Лимф=${currentBloodResult.bloodResult.lymphocytes},` : '' }}
                {{ (currentBloodResult.bloodResult.monocytes) ? `Моно=${currentBloodResult.bloodResult.monocytes},` : ''
                }}
                {{ (currentBloodResult.bloodResult.normoblasts) ?
                `Норм=${currentBloodResult.bloodResult.normoblasts},` : '' }}
                {{ (currentBloodResult.bloodResult.tng) ? `ТЗН=${currentBloodResult.bloodResult.tng}` : '' }}
              </p>
              <p v-if="currentBloodResult.bloodResult">
                <strong>Биохимический анализ крови:</strong> <u>{{ currentBloodResult.bloodDate | formatDate
                }}</u>:<br/>
                {{ (currentBloodResult.bloodResult.sugar) ? `Сахар=${currentBloodResult.bloodResult.sugar},` : '' }}
                {{ (currentBloodResult.bloodResult.cholesterol) ?
                `Холистерин=${currentBloodResult.bloodResult.cholesterol}` : '' }}
              </p>
              <p v-if="!currentBloodResult.bloodResult">
                <strong>Анализ крови: <span class="red--text">отсутствует</span></strong>
              </p>
            </div>
            <div v-if="currentUrineResult">
              <p v-if="currentUrineResult.urineGeneral && currentUrineResult.urineElements">
              <span>
                <strong>Клинический анализ мочи:</strong> <u>{{ currentUrineResult.urineDate | formatDate }}</u>:<br/>
                {{ (currentUrineResult.urineGeneral.color) ?
                `Цвет=${urineColors.find(item => item.value === currentUrineResult.urineGeneral.color).text},` : '' }}
                {{ (currentUrineResult.urineGeneral.reaction) ?
                `Реакция=${urineReactions.find(item => item.value === currentUrineResult.urineGeneral.reaction).text},` :
                '' }}
                {{ (currentUrineResult.urineGeneral.density) ? `Плотность=${currentUrineResult.urineGeneral.density},` :
                '' }}
                <br>
                {{ (currentUrineResult.urineGeneral.transparency) ? 'Прозрачность=прозрачная,' : 'Прозрачность=мутная,' }}
                {{ (currentUrineResult.urineGeneral.protein) ? `Белок=${currentUrineResult.urineGeneral.protein},` : '' }}
                {{ (currentUrineResult.urineGeneral.glucose) ? `Глюкоза=${currentUrineResult.urineGeneral.glucose},` : '' }}
                {{ (currentUrineResult.urineGeneral.acetone) ?
                `Ацетон=${urineAcetone.find(item => item.value === currentUrineResult.urineGeneral.acetone).text},` : '' }}
                {{ (currentUrineResult.urineGeneral.bile) ? 'Желч. пигмент=есть' : 'Желч. пигмент=нет' }}
                <br/>
              </span>
                <span
                  v-if="currentUrineResult.urineElements && (currentUrineResult.urineElements.flatEpithelium ||
                currentUrineResult.urineElements.tractEpithelium || currentUrineResult.urineElements.renalEpithelium)"
                >
                <u>Эпителий:</u>
                {{(currentUrineResult.urineElements.flatEpithelium) ?
                `плоский=${currentUrineResult.urineElements.flatEpithelium},` : '' }}
                {{(currentUrineResult.urineElements.tractEpithelium) ?
                `моч.путей=${currentUrineResult.urineElements.tractEpithelium},` : '' }}
                {{(currentUrineResult.urineElements.renalEpithelium) ?
                `почечный=${currentUrineResult.urineElements.renalEpithelium}` : '' }}
                <br/>
              </span>
                <span
                  v-if="currentUrineResult.urineElements && (currentUrineResult.urineElements.leucocytes || currentUrineResult.urineElements.erythrocytes)">
                {{ (currentUrineResult.urineElements.leucocytes) ?
                `Лейкоциты=${currentUrineResult.urineElements.leucocytes},` : '' }}
                {{ (currentUrineResult.urineElements.erythrocytes) ?
                `Эритроциты=${currentUrineResult.urineElements.erythrocytes}` : '' }}
                <br/>
              </span>
                <span v-if="currentUrineResult.urineElements && currentUrineResult.urineElements.cylinders && (currentUrineResult.urineElements.cylinders.hyaline ||
                currentUrineResult.urineElements.cylinders.granular || currentUrineResult.urineElements.cylinders.waxy ||
                currentUrineResult.urineElements.cylinders.epithelial)"
                >
                <u>Цилиндры:</u>
                {{ (currentUrineResult.urineElements.cylinders.hyaline) ?
                `гиалин=${currentUrineResult.urineElements.cylinders.hyaline},` : '' }}
                {{ (currentUrineResult.urineElements.cylinders.granular) ?
                `зернист=${currentUrineResult.urineElements.cylinders.granular},` : '' }}
                {{ (currentUrineResult.urineElements.cylinders.waxy) ?
                `воск=${currentUrineResult.urineElements.cylinders.waxy},` : '' }}
                {{(currentUrineResult.urineElements.cylinders.epithelial) ?
                `эпител=${currentUrineResult.urineElements.cylinders.epithelial}` : '' }}
                <br>
              </span>
                {{ (currentUrineResult.urineElements.salts) ?
                `Соли=${urineSalts.find(item => item.value === currentUrineResult.urineElements.salts).text},` : '' }}
                {{ (currentUrineResult.urineElements.slime) ? 'слизь=есть' : 'слизь=нет' }}
              </p>
              <p v-if="!currentUrineResult.urineGeneral">
                <strong>Анализ мочи: <span class="red--text">отсутствует</span></strong>
              </p>
            </div>
            <p v-if="currentSmearResult && currentSmearResult.smearResult">
              <strong>Мазок на Gn:</strong> <u>{{ currentSmearResult.smearDate | formatDate }}</u>:<br/>
              {{ (currentSmearResult.smearResult.smearGonococcus) ? 'Гонококк=обнаружены,' : 'Гонококк=не обнаружены,'
              }}
              {{ (currentSmearResult.smearResult.smearLeucocytes) ?
              `Лейкоциты=${smearLeucocytes.find(item => item.value ===
              currentSmearResult.smearResult.smearLeucocytes).text},` : ''}}
              {{ (currentSmearResult.smearResult.smearDiplococcus) ? 'Диплококки=обнаружены,' :
              'Диплококки=не обнаружены,' }}
              {{ (currentSmearResult.smearResult.smearEpithelium) ? 'Эпителий=обнаружены,' :
              'Эпителий=не обнаружены,' }}<br/>
              {{ (currentSmearResult.smearResult.smearTrichomonas) ? 'Трихомонады=обнаружены,' :
              'Трихомонады=не обнаружены,' }}
              {{ (currentSmearResult.smearResult.smearFungus) ? 'Дрожжеподобные грибы=обнаружены,' :
              'Дрожжеподобные грибы=не обнаружены,' }}
              {{ (currentSmearResult.smearResult.smearKeyCells) ? 'Ключевые клетки=обнаружены' :
              'Ключевые клетки=не обнаружены' }}
            </p>
            <p v-if="currentRwResult && currentRwResult.rwResult">
              <strong>Кровь на RW:</strong> <u>{{ currentRwResult.rwDate | formatDate }}</u>:<br/>
              {{ (currentRwResult.rwResult) ?
              `Результат=${rwTypes.find(item => item.value === currentRwResult.rwResult).text}` : '' }}
            </p>
          </div>
          <!-- А теперь врачи + обследования -->
          <div class="print-only" ref="print_3" v-if="currentArchive.medosDoctors && currentArchive.medosExams">
            <h3 style="margin-bottom: 10px">Врачи</h3>
            <div
              v-for="doctor in currentArchive.medosDoctors.mustDoctors"
              :key="doctor.doctorId"
              v-if="doctor.doctorId !== 1"
            >
              <div v-if="getDoctorResult(doctor.doctorId)">
                <strong>{{ getDoctorName(doctor.doctorId) }}</strong> — {{
                getDoctorResult(doctor.doctorId).doctorConclusion.toString() }}
              </div>
              <v-card>
                <v-card-text style="padding: 10px 24px" v-if="getDoctorResult(doctor.doctorId)">
                  <p>
                    <strong>Жалобы:</strong> {{ getDoctorResult(doctor.doctorId).doctorComplaints }}
                  </p>
                  <p v-if="getDoctorResult(doctor.doctorId).doctorStatus">
                    <strong>Объективный статус:</strong> {{ getDoctorResult(doctor.doctorId).doctorStatus }}
                  </p>
                  <p v-if="getDoctorResult(doctor.doctorId).doctorDiagnosis">
                    <strong>Диагноз:</strong>
                    «{{ getDoctorResult(doctor.doctorId).doctorDiagnosis.diagnosis }} -
                    {{ mkbs.find(mkb => mkb.mkbCode === getDoctorResult(doctor.doctorId).doctorDiagnosis.diagnosis
                    ).mkbName }}»
                    <strong v-if="getDoctorResult(doctor.doctorId).doctorDiagnosis.detectability !== undefined">
                      ({{ (getDoctorResult(doctor.doctorId).doctorDiagnosis.detectability === true) ? '+' : '-'
                      }})
                    </strong>
                    <em v-if="getDoctorResult(doctor.doctorId).doctorDiagnosis.diagnosisComment !== ''">— {{
                      getDoctorResult(doctor.doctorId).doctorDiagnosis.diagnosisComment }}</em>
                  </p>
                  <p v-if="getDoctorResult(doctor.doctorId).doctorSpecial">
                    <strong>Зрение:</strong>
                    <br>
                    <span v-if="getDoctorResult(doctor.doctorId).doctorSpecial.noCorrection.od ||
                        getDoctorResult(doctor.doctorId).doctorSpecial.noCorrection.os"
                    >
                        <u>Без коррекции:</u>
                        <br>
                        {{ (getDoctorResult(doctor.doctorId).doctorSpecial.noCorrection.od) ?
                        `OD=${getDoctorResult(doctor.doctorId).doctorSpecial.noCorrection.od}` : '' }}
                        <br>
                        {{ (getDoctorResult(doctor.doctorId).doctorSpecial.noCorrection.os) ?
                        `OS=${getDoctorResult(doctor.doctorId).doctorSpecial.noCorrection.os}` : '' }}
                        <br>
                      </span>
                    <span v-if="!!(getDoctorResult(doctor.doctorId).doctorSpecial.correction.od.sph) ||
                        !!(getDoctorResult(doctor.doctorId).doctorSpecial.correction.od.cyl) ||
                        !!(getDoctorResult(doctor.doctorId).doctorSpecial.correction.od.ax) ||
                        !!(getDoctorResult(doctor.doctorId).doctorSpecial.correction.os.sph) ||
                        !!(getDoctorResult(doctor.doctorId).doctorSpecial.correction.os.cyl) ||
                        !!(getDoctorResult(doctor.doctorId).doctorSpecial.correction.os.ax)"
                    >
                        <u>Коррекция:</u>
                        <br>
                        <span v-if="getDoctorResult(doctor.doctorId).doctorSpecial.correction.od">
                          <strong>OD:</strong>
                          {{ (getDoctorResult(doctor.doctorId).doctorSpecial.correction.od.sph) ?
                          `SPH=${getDoctorResult(doctor.doctorId).doctorSpecial.correction.od.sph}` : '' }}
                          {{ (getDoctorResult(doctor.doctorId).doctorSpecial.correction.od.cyl) ?
                          `CY:=${getDoctorResult(doctor.doctorId).doctorSpecial.correction.od.cyl}` : '' }}
                          {{ (getDoctorResult(doctor.doctorId).doctorSpecial.correction.od.ax) ?
                          `AX=${getDoctorResult(doctor.doctorId).doctorSpecial.correction.od.ax}` : '' }}
                          <br>
                        </span>
                        <span v-if="getDoctorResult(doctor.doctorId).doctorSpecial.correction.os">
                          <strong>OS:</strong>
                          {{ (getDoctorResult(doctor.doctorId).doctorSpecial.correction.os.sph) ?
                          `SPH=${getDoctorResult(doctor.doctorId).doctorSpecial.correction.os.sph}` : '' }}
                          {{ (getDoctorResult(doctor.doctorId).doctorSpecial.correction.os.cyl) ?
                          `CY:=${getDoctorResult(doctor.doctorId).doctorSpecial.correction.os.cyl}` : '' }}
                          {{ (getDoctorResult(doctor.doctorId).doctorSpecial.correction.os.ax) ?
                          `AX=${getDoctorResult(doctor.doctorId).doctorSpecial.correction.os.ax}` : '' }}
                        </span>
                        <br>
                      </span>
                    <span v-if="!!(getDoctorResult(doctor.doctorId).doctorSpecial.withCorrection.od) ||
                        !!(getDoctorResult(doctor.doctorId).doctorSpecial.withCorrection.os)"
                    >
                        <u>С коррекцией:</u>
                        <br>
                        {{ (getDoctorResult(doctor.doctorId).doctorSpecial.withCorrection.od) ?
                        `OD=${getDoctorResult(doctor.doctorId).doctorSpecial.withCorrection.od}` : '' }}
                        <br>
                        {{ (getDoctorResult(doctor.doctorId).doctorSpecial.withCorrection.os) ?
                        `OS=${getDoctorResult(doctor.doctorId).doctorSpecial.withCorrection.os}` : '' }}
                      </span>
                  </p>
                  <p>
                    <strong>Годность:</strong> {{ getDoctorResult(doctor.doctorId).doctorConclusion.toString() }}
                  </p>
                </v-card-text>
              </v-card>
            </div>
            <h3 style="margin: 10px 0">Обследования</h3>
            <div
              v-for="exam in currentArchive.medosExams.mustExams"
              :key="exam.examId"
              v-if="examsForConclusions.includes(exam.examId)"
            >
              <div>
                <strong>{{ exam.examName }}</strong>
              </div>
              <v-card>
                <v-card-text style="padding: 10px 24px" v-if="getExamResult(exam.examId)">
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
                  <span v-if="exam.examId === 1 || exam.examId === 47">
                      Пациент прошел.
                    </span>
                </v-card-text>
              </v-card>
            </div>
          </div>
          <v-container grid-list-md v-if="currentArchive.medosDoctors && currentArchive.medosDoctors.mustDoctors.length > 1">
            <h2 style="margin-bottom: 10px">Врачи</h2>
            <v-expansion-panel focusable>
              <v-expansion-panel-content
                v-for="doctor in currentArchive.medosDoctors.mustDoctors"
                :key="doctor.doctorId"
                v-if="doctor.doctorId !== 1"
              >
                <div slot="header" v-if="getDoctorResult(doctor.doctorId)">
                  <strong>{{ getDoctorName(doctor.doctorId) }}</strong> — {{
                  getDoctorResult(doctor.doctorId).doctorConclusion.toString() }}
                </div>
                <v-card>
                  <v-card-text style="padding: 10px 24px" v-if="getDoctorResult(doctor.doctorId)">
                    <p>
                      <strong>Жалобы:</strong> {{ getDoctorResult(doctor.doctorId).doctorComplaints }}
                    </p>
                    <p v-if="getDoctorResult(doctor.doctorId).doctorStatus">
                      <strong>Объективный статус:</strong> {{ getDoctorResult(doctor.doctorId).doctorStatus }}
                    </p>
                    <p v-if="getDoctorResult(doctor.doctorId).doctorDiagnosis">
                      <strong>Диагноз:</strong>
                      «{{ getDoctorResult(doctor.doctorId).doctorDiagnosis.diagnosis }} -
                      {{ mkbs.find(mkb => mkb.mkbCode === getDoctorResult(doctor.doctorId).doctorDiagnosis.diagnosis
                      ).mkbName }}»
                      <strong v-if="getDoctorResult(doctor.doctorId).doctorDiagnosis.detectability !== undefined">
                        ({{ (getDoctorResult(doctor.doctorId).doctorDiagnosis.detectability === true) ? '+' : '-'
                        }})
                      </strong>
                      <em v-if="getDoctorResult(doctor.doctorId).doctorDiagnosis.diagnosisComment !== ''">— {{
                        getDoctorResult(doctor.doctorId).doctorDiagnosis.diagnosisComment }}</em>
                    </p>
                    <p v-if="getDoctorResult(doctor.doctorId).doctorSpecial">
                      <strong>Зрение:</strong>
                      <br>
                      <span v-if="getDoctorResult(doctor.doctorId).doctorSpecial.noCorrection.od ||
                        getDoctorResult(doctor.doctorId).doctorSpecial.noCorrection.os"
                      >
                        <u>Без коррекции:</u>
                        <br>
                        {{ (getDoctorResult(doctor.doctorId).doctorSpecial.noCorrection.od) ?
                        `OD=${getDoctorResult(doctor.doctorId).doctorSpecial.noCorrection.od}` : '' }}
                        <br>
                        {{ (getDoctorResult(doctor.doctorId).doctorSpecial.noCorrection.os) ?
                        `OS=${getDoctorResult(doctor.doctorId).doctorSpecial.noCorrection.os}` : '' }}
                        <br>
                      </span>
                      <span v-if="!!(getDoctorResult(doctor.doctorId).doctorSpecial.correction.od.sph) ||
                        !!(getDoctorResult(doctor.doctorId).doctorSpecial.correction.od.cyl) ||
                        !!(getDoctorResult(doctor.doctorId).doctorSpecial.correction.od.ax) ||
                        !!(getDoctorResult(doctor.doctorId).doctorSpecial.correction.os.sph) ||
                        !!(getDoctorResult(doctor.doctorId).doctorSpecial.correction.os.cyl) ||
                        !!(getDoctorResult(doctor.doctorId).doctorSpecial.correction.os.ax)"
                      >
                        <u>Коррекция:</u>
                        <br>
                        <span v-if="getDoctorResult(doctor.doctorId).doctorSpecial.correction.od">
                          <strong>OD:</strong>
                          {{ (getDoctorResult(doctor.doctorId).doctorSpecial.correction.od.sph) ?
                          `SPH=${getDoctorResult(doctor.doctorId).doctorSpecial.correction.od.sph}` : '' }}
                          {{ (getDoctorResult(doctor.doctorId).doctorSpecial.correction.od.cyl) ?
                          `CY:=${getDoctorResult(doctor.doctorId).doctorSpecial.correction.od.cyl}` : '' }}
                          {{ (getDoctorResult(doctor.doctorId).doctorSpecial.correction.od.ax) ?
                          `AX=${getDoctorResult(doctor.doctorId).doctorSpecial.correction.od.ax}` : '' }}
                          <br>
                        </span>
                        <span v-if="getDoctorResult(doctor.doctorId).doctorSpecial.correction.os">
                          <strong>OS:</strong>
                          {{ (getDoctorResult(doctor.doctorId).doctorSpecial.correction.os.sph) ?
                          `SPH=${getDoctorResult(doctor.doctorId).doctorSpecial.correction.os.sph}` : '' }}
                          {{ (getDoctorResult(doctor.doctorId).doctorSpecial.correction.os.cyl) ?
                          `CY:=${getDoctorResult(doctor.doctorId).doctorSpecial.correction.os.cyl}` : '' }}
                          {{ (getDoctorResult(doctor.doctorId).doctorSpecial.correction.os.ax) ?
                          `AX=${getDoctorResult(doctor.doctorId).doctorSpecial.correction.os.ax}` : '' }}
                        </span>
                        <br>
                      </span>
                      <span v-if="!!(getDoctorResult(doctor.doctorId).doctorSpecial.withCorrection.od) ||
                        !!(getDoctorResult(doctor.doctorId).doctorSpecial.withCorrection.os)"
                      >
                        <u>С коррекцией:</u>
                        <br>
                        {{ (getDoctorResult(doctor.doctorId).doctorSpecial.withCorrection.od) ?
                        `OD=${getDoctorResult(doctor.doctorId).doctorSpecial.withCorrection.od}` : '' }}
                        <br>
                        {{ (getDoctorResult(doctor.doctorId).doctorSpecial.withCorrection.os) ?
                        `OS=${getDoctorResult(doctor.doctorId).doctorSpecial.withCorrection.os}` : '' }}
                      </span>
                    </p>
                    <p>
                      <strong>Годность:</strong> {{ getDoctorResult(doctor.doctorId).doctorConclusion.toString() }}
                    </p>
                  </v-card-text>
                </v-card>
              </v-expansion-panel-content>
            </v-expansion-panel>
            <br>
          </v-container>
          <v-container grid-list-md v-if="currentArchive.medosExams && currentArchive.medosExams.mustExams.length > 0">
            <h2 style="margin: 10px 0">Обследования</h2>
            <v-expansion-panel focusable>
              <v-expansion-panel-content
                v-for="exam in currentArchive.medosExams.mustExams"
                :key="exam.examId"
                v-if="examsForConclusions.includes(exam.examId)"
              >
                <div slot="header">
                  <strong>{{ exam.examName }}</strong>
                </div>
                <v-card>
                  <v-card-text style="padding: 10px 24px" v-if="getExamResult(exam.examId)">
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
                    <span v-if="exam.examId === 1 || exam.examId === 47">
                      Пациент прошел.
                    </span>
                  </v-card-text>
                </v-card>
              </v-expansion-panel-content>
            </v-expansion-panel>
          </v-container>
          <!-- Заключение терапевта -->
          <div ref="print_4">
            <h2 style="margin: 20px 0 10px">Заключение терапевта</h2>
            <div v-if="currentArchive.medosDoctorResults">
              <p>
                <strong>Жалобы:</strong> {{ getDoctorResult(1).doctorComplaints }}
              </p>
              <p v-if="getDoctorResult(1).doctorStatus">
                <strong>Объективный статус:</strong> {{ getDoctorResult(1).doctorStatus }}
              </p>
              <p v-if="getDoctorResult(1).doctorDiagnosis && getDoctorResult(1).doctorDiagnosis.diagnosis">
                <strong>Диагноз:</strong>
                «{{ getDoctorResult(1).doctorDiagnosis.diagnosis }} -
                {{ mkbs.find(mkb => mkb.mkbCode === getDoctorResult(1).doctorDiagnosis.diagnosis
                ).mkbName }}»
                <strong v-if="getDoctorResult(1).doctorDiagnosis.detectability !== undefined">
                  ({{ (getDoctorResult(1).doctorDiagnosis.detectability === true) ? '+' : '-'
                  }})
                </strong>
                <em v-if="getDoctorResult(1).doctorDiagnosis.diagnosisComment !== ''">— {{
                  getDoctorResult(1).doctorDiagnosis.diagnosisComment }}</em>
              </p>
              <p v-if="getDoctorResult(1).doctorRecommendations">
                <strong>Рекоммендации:</strong><br>
                <span v-if="getDoctorResult(1).doctorRecommendations.recommendationDoctors">
                 <u>Специалисты:</u> {{ getDoctorResult(1).doctorRecommendations.recommendationDoctors.toString() }}
                <br>
              </span>
                <span v-if="getDoctorResult(1).doctorRecommendations.recommendationExams">
                <u>Обследования:</u> {{ getDoctorResult(1).doctorRecommendations.recommendationExams.toString() }}
                <br>
              </span>
                <span v-if="getDoctorResult(1).doctorRecommendations.recommendationRecovery">
                <u>Сан. кур. лечение:</u> {{ recommendationsRecoveries.find(item => item.value === getDoctorResult(1).doctorRecommendations.recommendationRecovery).text }}
              </span>
              </p>
              <p v-if="getDoctorResult(1).doctorConclusion">
                <strong>Заключение:</strong> {{ getDoctorResult(1).doctorConclusion.toString() }}
              </p>
            </div>
          </div>
        </v-card-text>
        <v-card-actions>
          <v-spacer>
          </v-spacer>
          <v-btn :color="subSystem.primaryColor" flat @click.native="noArchiveDialog">Закрыть</v-btn>
          <v-btn :color="subSystem.primaryColor" class="white--text" @click.native="printArchiveDialog">Печать</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <!-- / Диалог конкретной архивной записи -->

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
        //* Подгруженные диагнозы.
        mkbs: [],
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
        //* Архив, который просматриваем.
        currentArchive: {},
        //* Соответствующие анализы + снимок.
        currentBloodResult: {},
        currentUrineResult: {},
        currentSmearResult: {},
        currentRwResult: {},
        currentRgResult: {},
        //* Диалог просмотра списка архивов.
        archiveListDialog: {
          show: false
        },
        //* Диалог просмотра архива.
        archiveDialog: {
          show: false
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
        //* Массив обследований, которые выводят в годности (46 — маммография, 47 — экг).
        examsForConclusions: [1, 19, 20, 21, 32, 34, 38, 46, 47],
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
        //* Справочники мочи.
        urineColors: [
          {
            value: 1,
            text: 'желтый'
          },
          {
            value: 2,
            text: 'светло-желтый'
          },
          {
            value: 3,
            text: 'соломенно-желтый'
          },
          {
            value: 4,
            text: 'бесцветный'
          }
        ],
        urineReactions: [
          {
            value: 1,
            text: 'кислая'
          },
          {
            value: 2,
            text: 'щелочная'
          },
          {
            value: 3,
            text: 'слабокислая'
          },
          {
            value: 4,
            text: 'нейтральная'
          }
        ],
        urineAcetone: [
          {
            value: 1,
            text: '0'
          },
          {
            value: 2,
            text: '+-'
          },
          {
            value: 3,
            text: '+'
          },
          {
            value: 4,
            text: '++'
          },
          {
            value: 5,
            text: '+++'
          }
        ],
        urineSalts: [
          {
            value: 0,
            text: 'нет'
          },
          {
            value: 1,
            text: 'ураты'
          },
          {
            value: 2,
            text: 'фосфаты'
          },
          {
            value: 3,
            text: 'оксолаты'
          },
          {
            value: 4,
            text: 'мочевой кислоты'
          },
          {
            value: 5,
            text: 'трипельфосфаты'
          },
          {
            value: 6,
            text: 'холестерин'
          },
          {
            value: 7,
            text: 'билирубин'
          }
        ],
        //* Справочник мазков.
        smearLeucocytes: [
          {
            value: 1,
            text: 'единичные'
          },
          {
            value: 2,
            text: 'до 25'
          },
          {
            value: 3,
            text: 'до 50'
          },
          {
            value: 4,
            text: 'до 100'
          },
          {
            value: 5,
            text: 'выше 100'
          }
        ],
        //* Справочник крови на RW.
        rwTypes: [
          {
            value: 1,
            text: 'отрицительный'
          },
          {
            value: 2,
            text: 'положительный X'
          },
          {
            value: 3,
            text: 'положительный XX'
          },
          {
            value: 4,
            text: 'положительный XXX'
          },
          {
            value: 5,
            text: 'положительный XXXX'
          },
          {
            value: 6,
            text: 'гемолиз'
          },
          {
            value: 7,
            text: 'хилезная'
          },
          {
            value: 8,
            text: 'брак'
          }
        ],
        //* Справочник рекоммендаций.
        recommendationsRecoveries: [
          {
            value: 1,
            text: 'санаторий'
          },
          {
            value: 2,
            text: 'воды целебные'
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
          primaryColor: 'pink darken-3',
          secondaryColor: 'green darken-3',
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
      //* Подгружаем диагнозы.
      this.getAllMkbs()
    },
    methods: {
      //* Методы для диалога списка архивных записей.
      openArchiveListDialog (patient) {
        this.currentEditPatient = patient
        this.archiveListDialog.show = true
      },
      noArchiveListDialog () {
        this.archiveListDialog.show = false
      },
      //* Методы для диалога конкретной архивной записи.
      openArchiveDialog (archive) {
        this.currentArchive = archive
        this.currentBloodResult = this.currentEditPatient.bloodResults.find(item => item.medosId === archive._id)
        this.currentUrineResult = this.currentEditPatient.urineClinicalResults.find(item => item.medosId === archive._id)
        this.currentSmearResult = this.currentEditPatient.smearResults.find(item => item.medosId === archive._id)
        this.currentRwResult = this.currentEditPatient.rwResults.find(item => item.medosId === archive._id)
        this.currentRgResult = this.currentEditPatient.rgResults.find(item => item.medosId === archive._id)
        this.archiveDialog.show = true
      },
      //* Методы для диалога конкретной архивной записи.
      noArchiveDialog (archive) {
        this.currentArchive = archive
        this.archiveDialog.show = false
      },
      printArchiveDialog () {
        let content1 = this.$refs.print_1.innerHTML
        let content2 = this.$refs.print_2.innerHTML
        let content3 = this.$refs.print_3.innerHTML
        let content4 = this.$refs.print_4.innerHTML
        let content5 = '<style>*{font-size: 10px;margin:0;padding:0;}</style>'
        let myWindow = window.open('', 'Print', 'height=600,width=800')

        myWindow.document.write('<html><head><title>Print</title>')
        myWindow.document.write('</head><body >')
        myWindow.document.write(content1)
        myWindow.document.write(content2)
        myWindow.document.write(content3)
        myWindow.document.write(content4)
        myWindow.document.write(content5)
        myWindow.document.write('</body></html>')

        myWindow.document.close()
        myWindow.focus()
        myWindow.print()
        myWindow.close()
        return true
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
          case 13:
            return 'Психиатр'
          case 14:
            return 'Нарколог'
        }
      },
      //* Результат такого доктора.
      getDoctorResult (doctorId) {
        return this.currentArchive.medosDoctorResults.find(result => result.doctorId === doctorId)
      },
      //* Результат такого обследования.
      getExamResult (examId) {
        return this.currentArchive.medosExamResults.find(result => result.examId === examId)
      },
      //* Запрашиваем список пациентов по введенным ФИО.
      getArchivePatients () {
        let tempQuery = {}
        tempQuery.lastName = (this.patientQuery.lastName === undefined || this.patientQuery.lastName === '') ? ' ' : this.patientQuery.lastName
        tempQuery.firstName = (this.patientQuery.firstName === undefined || this.patientQuery.firstName === '') ? ' ' : this.patientQuery.firstName
        tempQuery.middleName = (this.patientQuery.middleName === undefined || this.patientQuery.middleName === '') ? ' ' : this.patientQuery.middleName
        Axios.get(`${GKP7API}/api/v1/patient/archive/${tempQuery.lastName}/${tempQuery.firstName}/${tempQuery.middleName}/`, {
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
      //* Подгружаем все вредности для последующей работы.
      getAllMkbs () {
        Axios.get(`${GKP7API}/api/v1/mkbs`, {
          headers: {'Authorization': Authentication.getAuthenticationHeader(this)}
        }).then(({data}) => {
          if (data.success === true) {
            this.mkbs = data.mkbs
          }
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
    background-color: #ad1457;
    color: white;
    padding: 0 6px;
  }

  .print-only {
    @media screen {
      display: none
    }
  }
</style>
