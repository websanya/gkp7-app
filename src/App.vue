<template>
  <v-app>
    <transition>
      <keep-alive>
        <router-view/>
      </keep-alive>
    </transition>
  </v-app>
</template>

<script>
  export default {
    name: 'app'
  }
</script>

<style>
  .application.theme--light {
    background: #f1f1f1;
  }

  .application--wrap {
    align-items: center;
    justify-content: center;
  }

  table.table thead th {
    font-weight: 700;
    text-align: left;
  }

  .snack__content {
    color: inherit;
    padding-right: 16px;
  }

  .gkp7--no--margin {
    margin-left: 0;
    margin-right: 0;
  }

  .footer {
    padding: 0 12px;
  }

  .btn--large.btn--flat {
    border: 1px solid rgba(0, 0, 0, .42);
  }
</style>
