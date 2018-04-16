<template>
  <v-footer :color="subsystem" app>
    <span class="white--text">Пользователь: {{ currentUser }}</span>
    <span class="white--text" style="position: absolute; right: 12px">версия: {{ VERSION }}</span>
  </v-footer>
</template>

<script>
  export default {
    props: ['subsystem', 'currentUser'],
    computed: {
      VERSION: () => {
        return require('../../../package').version
      }
    }
  }
</script>
