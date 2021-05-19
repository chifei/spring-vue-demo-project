<template>
  <div class="mdl-layout__drawer mdl-layout__drawer--fullscreen">
    <button
      class="mdl-button mdl-js-button mdl-button--icon mdl-layout__drawer-close"
      v-on:click="close()"
    >
      <i class="material-icons">close</i>
    </button>
    <span class="mdl-layout__title">Vue Demo</span>
    <nav class="mdl-navigation">
      <router-link
        class="mdl-navigation__link"
        to="/admin/mdl/r/Top-Apps-and-Games"
      >Top Apps and Games</router-link>
      <router-link class="mdl-navigation__link" to="/admin/mdl/r/Apps-For-Work">Apps For Work</router-link>
      <router-link class="mdl-navigation__link" to="/admin/mdl/p/about">About</router-link>
      <router-link class="mdl-navigation__link" to="/admin/mdl/about/contact">Contact us</router-link>
    </nav>
  </div>
</template>

<script>
export default {
  data() {
    const data = {
      isVisible: false
    };
    return data;
  },
  methods: {
    close() {
      document.querySelector(".mdl-layout__drawer").removeClass("is-visible");
      document
        .querySelector(".mdl-layout__obfuscator")
        .removeClass("is-visible");
    }
  },
  mounted() {
    console.log(document.querySelector(".mdl-layout__drawer-close"));
    console.log("456");
    componentHandler.upgradeElement(
      document.querySelector(".mdl-layout__drawer-close")
    );
  },
  updated() {
    console.log("123");

    componentHandler.upgradeElement(
      document.querySelector(".mdl-layout__drawer-close")
    );
  }
};
</script>
