<template>
  <header>
    <v-navigation-drawer
        v-model="drawer"
        app
        clipped
    >
      <v-list subheader v-if="currentUser.roles">
        <div
            v-if="currentUser.roles.medos.admin ||
            currentUser.roles.medos.receptionist ||
            currentUser.roles.medos.premedical ||
            currentUser.roles.medos.functionalDiagnostics ||
            currentUser.roles.medos.doctor ||
            currentUser.roles.medos.exam ||
            currentUser.roles.superuser"
        >
          <v-subheader inset>Профосмотр</v-subheader>
          <v-divider></v-divider>
          <v-list-tile
              v-if="currentUser.roles.medos.admin ||
            currentUser.roles.medos.receptionist ||
            currentUser.roles.superuser">
            <v-list-tile-action>
              <v-icon>local_hospital</v-icon>
            </v-list-tile-action>
            <v-list-tile-content>
              <router-link :to="'/medos/reception'">
                <v-list-tile-title>Регистратура профосмотра</v-list-tile-title>
              </router-link>
            </v-list-tile-content>
          </v-list-tile>
          <v-list-tile
              v-if="currentUser.roles.medos.admin ||
            currentUser.roles.medos.premedical ||
            currentUser.roles.superuser">
            <v-list-tile-action>
              <v-icon>local_hospital</v-icon>
            </v-list-tile-action>
            <v-list-tile-content>
              <router-link :to="'/medos/premedical'">
                <v-list-tile-title>Доврачебный кабинет</v-list-tile-title>
              </router-link>
            </v-list-tile-content>
          </v-list-tile>
          <v-list-tile
              v-if="currentUser.roles.medos.admin ||
            currentUser.roles.medos.doctor ||
            currentUser.roles.superuser">
            <v-list-tile-action>
              <v-icon>local_hospital</v-icon>
            </v-list-tile-action>
            <v-list-tile-content>
              <router-link :to="'/medos/doctor'">
                <v-list-tile-title>Врач профосмотра</v-list-tile-title>
              </router-link>
            </v-list-tile-content>
          </v-list-tile>
          <v-list-tile
              v-if="currentUser.roles.medos.admin ||
            currentUser.roles.medos.exam ||
            currentUser.roles.superuser">
            <v-list-tile-action>
              <v-icon>local_hospital</v-icon>
            </v-list-tile-action>
            <v-list-tile-content>
              <router-link :to="'/medos/exam'">
                <v-list-tile-title>Обследования профосмотра</v-list-tile-title>
              </router-link>
            </v-list-tile-content>
          </v-list-tile>
          <v-list-tile
              v-if="currentUser.roles.medos.admin ||
            currentUser.roles.medos.doctor ||
            currentUser.roles.superuser">
            <v-list-tile-action>
              <v-icon>local_hospital</v-icon>
            </v-list-tile-action>
            <v-list-tile-content>
              <router-link :to="'/medos/archive'">
                <v-list-tile-title>Архив профосмотра</v-list-tile-title>
              </router-link>
            </v-list-tile-content>
          </v-list-tile>
          <v-list-tile
              v-if="currentUser.roles.medos.admin || currentUser.roles.superuser">
            <v-list-tile-action>
              <v-icon>local_hospital</v-icon>
            </v-list-tile-action>
            <v-list-tile-content>
              <router-link :to="'/medos/reports'">
                <v-list-tile-title>Отчеты профосмотра</v-list-tile-title>
              </router-link>
            </v-list-tile-content>
          </v-list-tile>
          <v-divider>
          </v-divider>
        </div>
        <div
            v-if="currentUser.roles.radiography.assistant ||
            currentUser.roles.radiography.admin ||
            currentUser.roles.laboratory.assistant ||
            currentUser.roles.laboratory.admin ||
            currentUser.roles.vaccination.assistant ||
            currentUser.roles.vaccination.admin ||
            currentUser.roles.superuser"
        >
          <v-subheader inset>Параклиника</v-subheader>
          <v-divider>
          </v-divider>
          <v-list-tile
              v-if="currentUser.roles.radiography.assistant ||
              currentUser.roles.radiography.admin ||
              currentUser.roles.superuser"
          >
            <v-list-tile-action>
              <v-icon>local_movies</v-icon>
            </v-list-tile-action>
            <v-list-tile-content>
              <router-link :to="'/radiography'">
                <v-list-tile-title>Снимки</v-list-tile-title>
              </router-link>
            </v-list-tile-content>
          </v-list-tile>
          <v-list-tile
              v-if="currentUser.roles.laboratory.assistant ||
              currentUser.roles.laboratory.admin ||
              currentUser.roles.superuser"
          >
            <v-list-tile-action>
              <v-icon>colorize</v-icon>
            </v-list-tile-action>
            <v-list-tile-content>
              <router-link :to="'/laboratory'">
                <v-list-tile-title>Лаборатория</v-list-tile-title>
              </router-link>
            </v-list-tile-content>
          </v-list-tile>
          <v-list-tile
              v-if="currentUser.roles.vaccination.assistant ||
              currentUser.roles.vaccination.admin ||
              currentUser.roles.superuser">
            <v-list-tile-action>
              <v-icon>local_drink</v-icon>
            </v-list-tile-action>
            <v-list-tile-content>
              <router-link :to="'/vaccines'">
                <v-list-tile-title>Прививки</v-list-tile-title>
              </router-link>
            </v-list-tile-content>
          </v-list-tile>
          <v-divider>
          </v-divider>
        </div>
        <div v-if="currentUser.roles.medos.admin || currentUser.roles.superuser">
          <v-subheader inset>Управление</v-subheader>
          <v-divider>
          </v-divider>
          <!--<v-list-tile v-if="currentUser.roles.superuser">-->
            <!--<v-list-tile-action>-->
              <!--<v-icon>settings</v-icon>-->
            <!--</v-list-tile-action>-->
            <!--<v-list-tile-content>-->
              <!--<router-link :to="'/admin/users'">-->
                <!--<v-list-tile-title>Редактор пользователей</v-list-tile-title>-->
              <!--</router-link>-->
            <!--</v-list-tile-content>-->
          <!--</v-list-tile>-->
          <v-list-tile v-if="currentUser.roles.medos.admin || currentUser.roles.superuser">
            <v-list-tile-action>
              <v-icon>settings</v-icon>
            </v-list-tile-action>
            <v-list-tile-content>
              <router-link :to="'/admin/companies'">
                <v-list-tile-title>Редактор предприятий</v-list-tile-title>
              </router-link>
            </v-list-tile-content>
          </v-list-tile>
        </div>
      </v-list>
    </v-navigation-drawer>
    <v-toolbar :color="subsystem" dark app fixed clipped-left>
      <v-toolbar-side-icon @click.stop="drawer = !drawer">
      </v-toolbar-side-icon>
      <v-toolbar-title>МБУЗ ГКП №7 - {{ subtitle }}</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-tooltip bottom>
        <v-btn
            slot="activator"
            @click.native="signOut"
            color="transparent"
            large
            icon
        >
          <v-icon>exit_to_app</v-icon>
        </v-btn>
        <span>Выйти</span>
      </v-tooltip>
    </v-toolbar>
  </header>
</template>

<script>
  import Authentication from '@/components/pages/Authentication'

  export default {
    props: ['subsystem', 'subtitle', 'currentUser'],
    data () {
      return {
        drawer: true
      }
    },
    methods: {
      signOut () {
        Authentication.signOut(this)
      }
    }
  }
</script>
