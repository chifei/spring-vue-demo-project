<template>
  <div class="mdl-layout mdl-js-layout mdl-layout--fixed-header">
    <mdl-header v-bind:seamed="!headerShowShadow"></mdl-header>
    <mdl-drawer></mdl-drawer>
    <mdl-search></mdl-search>
    <main class="mdl-layout__content" v-on:scroll="onScroll($event)">
      <slot></slot>
      <mdl-footer></mdl-footer>
    </main>
  </div>
</template>

<script>
import Header from "./Header.vue";
import Drawer from "./Drawer.vue";
import Search from "./Search.vue";
import Footer from "./Footer.vue";

export default {
  data() {
    const data = {
      headerShowShadow: false
    };
    console.log(data);
    return data;
  },
  methods: {
    onScroll(event) {
      this.headerShowShadow =
        document.querySelector(".mdl-layout__content").scrollTop > 0;
    }
  },
  components: {
    "mdl-header": Header,
    "mdl-drawer": Drawer,
    "mdl-search": Search,
    "mdl-footer": Footer
  }
};
</script>

