<template>
  <v-app>
    <v-content>
      <v-container fluid fill-height>
        <v-layout align-center justify-center>
          <v-flex xs12 sm8 md4>
            <v-card class="elevation-12">
              <v-toolbar dark color="primary">
                <v-toolbar-title>Войдите в систему</v-toolbar-title>
                <v-spacer>
                </v-spacer>
              </v-toolbar>
              <v-card-text>
                <v-form v-model="validLogin">
                  <v-text-field label="Логин"
                                v-model="credentials.username"
                                prepend-icon="person"
                                :rules="rules"
                                required>
                  </v-text-field>
                  <v-text-field label="Пароль"
                                v-model="credentials.password"
                                prepend-icon="lock"
                                :rules="rules"
                                :append-icon="loginPasswordVisible ? 'visibility' : 'visibility_off'"
                                :append-icon-cb="() => (loginPasswordVisible = !loginPasswordVisible)"
                                :type="loginPasswordVisible ? 'text' : 'password'"
                                @keyup.enter="submitAuthentication()"
                                required>
                  </v-text-field>
                </v-form>
              </v-card-text>
              <v-card-actions>
                <v-spacer>
                </v-spacer>
                <v-btn color="primary" @click.native="submitAuthentication()">Войти</v-btn>
              </v-card-actions>
            </v-card>

            <v-snackbar :timeout="6000"
                        bottom="bottom"
                        color="red lighten-1"
                        v-model="snackbar">
              {{ message }}
            </v-snackbar>
          </v-flex>
        </v-layout>
      </v-container>
    </v-content>
  </v-app>
</template>

<script>
  import Authentication from '@/components/pages/Authentication'

  export default {
    data () {
      return {
        snackbar: false,
        validLogin: false,
        loginPasswordVisible: false,
        rules: [(value) => !!value || 'Поле обязательно для заполнения'],
        credentials: {
          username: '',
          password: ''
        },
        message: ''
      }
    },
    methods: {
      submitAuthentication () {
        Authentication.authenticate(this, this.credentials, '/')
      }
    }
  }
</script>
