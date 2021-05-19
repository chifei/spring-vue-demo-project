<template>
  <div v-bind:class="containerClass" v-bind:id="'carousel_'+_uid">
    <div v-bind:class="trackClass" class="glide__track" data-glide-el="track">
      <div class="glide__slides mdl-grid">
        <slot v-for="item in items" name="item" v-bind:item="item"></slot>
      </div>
    </div>
  </div>
</template>

<script>
import { CustomCarousel } from "./index";
import Card from "../card";

export default {
  props: [
    "containerClass",
    "trackClass",
    "large",
    "items",
    "options",
    "disableDesktop"
  ],
  data() {
    const data = {
      banners: [],
      carousel: null
    };
    return data;
  },
  methods: {
    renderCarousel() {
      this.carousel = CustomCarousel("#carousel_" + this._uid, this.options);
      if (this.disableDesktop) {
        if (window.innerWidth < 768) {
          this.carousel.enable();
        } else {
          this.carousel.disable();
        }
        this.carousel.on(
          "resize",
          function() {
            if (window.innerWidth < 768) {
              this.carousel.enable();
            } else {
              this.carousel.disable();
            }
          }.bind(this)
        );
      }
    }
  },
  components: {
    Card
  },
  mounted() {
    this.renderCarousel();
  },
  updated() {
    this.renderCarousel();
  }
};
</script>

<style>
.glide--swipeable .mdl-card {
  cursor: auto;
}
</style>