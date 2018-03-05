<template>
  <v-footer :color="subsystem" app>
    <span class="white--text">Пользователь: {{ currentUser }}</span>
  </v-footer>
</template>

<script>
  export default {
    props: ['subsystem', 'currentUser']
  }
</script>
