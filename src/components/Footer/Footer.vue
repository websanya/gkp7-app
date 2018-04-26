<template>
  <v-footer :color="subsystem" app>
    <span class="white--text">Пользователь: {{ userName }}</span>
    <span class="white--text" style="position: absolute; right: 12px">версия: {{ VERSION }}</span>
  </v-footer>
</template>

<script>
  export default {
    props: {
      subsystem: '',
      currentUser: {
        type: Object
      }
    },
    computed: {
      VERSION: () => {
        return require('../../../package').version
      },
      userName () {
        return this.currentUser.fio
      }
      // doctorId () {
      //   if (this.currentUser.roles.medos.doctor) {
      //     switch (this.currentUser.roles.medos.doctor) {
      //       case 1:
      //         return ' (Терапевт)'
      //       case 2:
      //         return ' (Оториноларинголог)'
      //       case 3:
      //         return ' (Дерматовенеролог)'
      //       case 4:
      //         return ' (Офтальмолог)'
      //       case 5:
      //         return ' (Хирург)'
      //       case 6:
      //         return ' (Невролог)'
      //       case 7:
      //         return ' (Стоматолог)'
      //     }
      //   }
      // }
    }
  }
</script>
