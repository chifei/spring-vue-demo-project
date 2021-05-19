<template>
  <div id="app">
    <mdl-layout>
      <router-view></router-view>
    </mdl-layout>
  </div>
</template>

<script>
import Layout from "../components/layout";
export default {
  data() {
    return {};
  },
  computed: {},
  methods: {},
  mounted() {
    componentHandler &&
      componentHandler.upgradeDom(document.querySelector("#app"));
  },
  components: {
    "mdl-layout": Layout
  }
};
</script>

<style>
body {
  background: #fff;
}

.mdl-card a {
  color: inherit;
  text-decoration: none;
}

header .el-menu {
  margin-left: -20px;
  margin-right: -20px;
}
.page-title {
  text-align: left;
}

.el-pagination {
  text-align: right;
  margin-top: 40px;
}
</style>
