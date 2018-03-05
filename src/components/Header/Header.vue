<template>
  <header>
    <v-navigation-drawer
        v-model="drawer"
        app
        clipped
    >
      <v-list subheader>
        <v-list-tile>
          <v-list-tile-action>
            <v-icon>home</v-icon>
          </v-list-tile-action>
          <v-list-tile-content>
            <router-link :to="'/'">
              <v-list-tile-title>Тест</v-list-tile-title>
            </router-link>
          </v-list-tile-content>
        </v-list-tile>
        <v-divider>
        </v-divider>
        <v-subheader inset>Профосмотр</v-subheader>
        <v-list-tile>
          <v-list-tile-action>
            <v-icon>local_hospital</v-icon>
          </v-list-tile-action>
          <v-list-tile-content>
            <router-link :to="'/medos/reg'">
              <v-list-tile-title>Регистратура профосмотра</v-list-tile-title>
            </router-link>
          </v-list-tile-content>
        </v-list-tile>
        <v-list-tile>
          <v-list-tile-action>
            <v-icon>local_hospital</v-icon>
          </v-list-tile-action>
          <v-list-tile-content>
            <router-link :to="'/medos/dov'">
              <v-list-tile-title>Доврачебный кабинет</v-list-tile-title>
            </router-link>
          </v-list-tile-content>
        </v-list-tile>
        <v-list-tile>
          <v-list-tile-action>
            <v-icon>local_hospital</v-icon>
          </v-list-tile-action>
          <v-list-tile-content>
            <router-link :to="'/medos/ter'">
              <v-list-tile-title>Рабочее место терапевта</v-list-tile-title>
            </router-link>
          </v-list-tile-content>
        </v-list-tile>
        <v-list-tile>
          <v-list-tile-action>
            <v-icon>local_hospital</v-icon>
          </v-list-tile-action>
          <v-list-tile-content>
            <router-link :to="'/medos/companies'">
              <v-list-tile-title>Редактор предприятий</v-list-tile-title>
            </router-link>
          </v-list-tile-content>
        </v-list-tile>
        <v-divider>
        </v-divider>
        <v-list-tile>
          <v-list-tile-action>
            <v-icon>colorize</v-icon>
          </v-list-tile-action>
          <v-list-tile-content>
            <router-link :to="'/lab'">
              <v-list-tile-title>Лаборатория</v-list-tile-title>
            </router-link>
          </v-list-tile-content>
        </v-list-tile>
        <v-divider>
        </v-divider>
        <v-list-tile>
          <v-list-tile-action>
            <v-icon>local_movies</v-icon>
          </v-list-tile-action>
          <v-list-tile-content>
            <router-link :to="'/rgs'">
              <v-list-tile-title>Флюоротека</v-list-tile-title>
            </router-link>
          </v-list-tile-content>
        </v-list-tile>
        <v-divider>
        </v-divider>
        <v-list-tile>
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
      </v-list>
    </v-navigation-drawer>
    <v-toolbar :color="subsystem" dark app fixed clipped-left>
      <v-toolbar-side-icon @click.stop="drawer = !drawer">
      </v-toolbar-side-icon>
      <v-toolbar-title>МБУЗ ГКП №7 - {{ subtitle }}</v-toolbar-title>
    </v-toolbar>
  </header>
</template>

<script>
  export default {
    props: ['subsystem', 'subtitle'],
    data () {
      return {
        drawer: true
      }
    }
  }
</script>
