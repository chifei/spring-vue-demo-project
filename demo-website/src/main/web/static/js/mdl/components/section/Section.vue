<template>
  <div class="mdl-section">
    <h4 class="mdl-section__title">
      {{title}}
      <router-link v-if="sectionLink" v-bind:to="sectionLink">
        <button
          class="mdl-button mdl-button--raised mdl-js-button mdl-js-ripple-effect mdl-section__title-button"
        >ALL</button>
      </router-link>

      <small class="mdl-section__subtitle">{{subtitle}}</small>
    </h4>
    <Carousel
      v-bind:disableDesktop="disableDesktop"
      v-bind:options="options"
      v-bind:items="products"
      v-bind:large="large"
    >
      <template v-slot:item="{ item }">
        <Card v-bind:product="item" v-bind:large="large"></Card>
      </template>
    </Carousel>
  </div>
</template>

<script>
import Carousel from "../util/Carousel.vue";
import Card from "../card";

export default {
  props: ["title", "subtitle", "large", "disableDesktop", "sectionLink"],
  data() {
    const data = {
      options: {
        type: "carousel",
        perView: 8,
        breakpoints: {
          1919: {
            perView: 7
          },
          1599: {
            perView: 6
          },
          1439: {
            perView: 5
          },
          800: {
            perView: 3
          },
          425: {
            perView: 1,
            type: "slider",
            loop: false,
            peek: { before: 0, after: 100 }
          }
        }
      },
      products: [
        {
          img: "../static/img/10.jpg",
          name: "Your card",
          desc: "yourcard llc",
          important: true,
          star: 4.5
        },
        {
          img: "../static/img/7.jpg",
          name: "Rocket",
          desc: "happymobile",
          star: 3.5
        },
        {
          img: "../static/img/8.jpg",
          name: "Google Gallery",
          desc: "Google LLC",
          star: 4.8
        },
        {
          img: "../static/img/9.jpg",
          name: "Youtube",
          desc: "Google LLC",
          star: 4.8
        },
        {
          img: "../static/img/1.jpg",
          name: "Camera",
          desc: "Google LLC",
          star: 4.8
        }
      ]
    };
    if (this.large === "true") {
      data.options = {
        type: "carousel",
        perView: 7,
        breakpoints: {
          1919: {
            perView: 6
          },
          1599: {
            perView: 5
          },
          1439: {
            perView: 4
          },
          800: {
            perView: 3
          },
          425: {
            perView: 1,
            type: "slider",
            loop: false,
            peek: { before: 0, after: 100 }
          }
        }
      };
    }
    console.log(data);
    return data;
  },
  methods: {},
  components: {
    Carousel,
    Card
  }
};
</script>

<style scoped>
.mdl-banner {
  position: relative;
  padding: 30px 0;
}

.mdl-banner .glide__track {
  padding: 0 16px;
}

.mdl-banner .glide__bullets {
  bottom: 14px;
}

.glide--carousel {
  position: relative;
}
</style>