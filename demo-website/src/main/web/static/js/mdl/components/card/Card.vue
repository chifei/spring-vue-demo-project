<template>
  <div
    class="mdl-cell mdl-card mdl-shadow--2dp mdl-cell--3-col mdl-cell--2-col-phone mdl-cell--4-col-tablet"
  >
    <router-link v-bind:to="'/admin/mdl/p/'+product.name">
      <div
        class="mdl-card__background"
        v-bind:style="{'max-height': imgMaxHeight}"
        v-bind:class="{'mdl-card__background--large':large}"
      >
        <img class="mdl-card__image" v-bind:src="product.img">
      </div>
    </router-link>
    <div class="mdl-card__title">
      <router-link v-bind:to="'/admin/mdl/p/'+product.name">
        <h5 class="mdl-card__title-text">{{product.name}}</h5>
      </router-link>
    </div>
    <div class="mdl-card__supporting-text">{{product.desc}}</div>
    <div class="mdl-card__actions">
      <span class="mdl-card__actions-text">
        <i class="material-icons">star</i>
        {{product.star}}
      </span>
      <span
        class="mdl-card__actions-text mdl-color-text--primary mdl-card__actions-text--right"
      >Free</span>
    </div>
  </div>
</template>
<script>
export default {
  props: ["product", "large"],
  data() {
    const data = {
      imgMaxHeight: window.innerHeight - 122 - 60 - 128 + "px"
    };
    return data;
  },
  mounted() {
    this.imgMaxHeight = window.innerHeight - 122 - 60 - 128 + "px";
  },
  updated() {
    this.imgMaxHeight = window.innerHeight - 122 - 60 - 128 + "px";
    console.log(this.imgMaxHeight);
  }
};
</script>
<style>
.mdl-card__background a {
  display: block;
}
</style>
