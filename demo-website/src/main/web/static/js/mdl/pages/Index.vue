<template>
  <div>
    <Banner></Banner>
    <mdl-section
      title="Top Apps and Games"
      subtitle="Hits of the week"
      sectionLink="/admin/mdl/r/top-apps-and-games"
      v-bind:large="true"
      v-bind:disableDesktop="true"
    ></mdl-section>
    <mdl-section
      title="Apps For Work"
      subtitle="Recomended"
      sectionLink="/admin/mdl/r/app-for-work"
      v-bind:large="false"
      v-bind:disableDesktop="true"
    ></mdl-section>
  </div>
</template>

 <script>
import Banner from "../components/banner";
import Section from "../components/section";
export default {
  data() {
    return {
      items: [{ name: "asf" }, { name: "zxvzxv" }, { name: "qwer" }]
    };
  },
  computed: {},
  methods: {},
  components: {
    Banner,
    "mdl-section": Section
  }
};
</script>
