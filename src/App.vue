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

  .uwd-container {
    width: 100%;
  }

  .material-icons {
    font-family: 'Material Icons';
    font-weight: normal;
    font-style: normal;
    font-size: 24px;  /* Preferred icon size */
    display: inline-block;
    line-height: 1;
    text-transform: none;
    letter-spacing: normal;
    word-wrap: normal;
    white-space: nowrap;
    direction: ltr;

    /* Support for all WebKit browsers. */
    -webkit-font-smoothing: antialiased;
    /* Support for Safari and Chrome. */
    text-rendering: optimizeLegibility;

    /* Support for Firefox. */
    -moz-osx-font-smoothing: grayscale;

    /* Support for IE. */
    font-feature-settings: 'liga';
  }

</style>
