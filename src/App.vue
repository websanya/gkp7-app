<template>
  <transition>
    <keep-alive>
      <router-view/>
    </keep-alive>
  </transition>
</template>

<script>
  export default {
    name: 'app'
  }
</script>

<style>
  .application.theme--light {
    /*background: #dadada;*/
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
    border: 1px solid rgba(0,0,0,.42);
  }
</style>
