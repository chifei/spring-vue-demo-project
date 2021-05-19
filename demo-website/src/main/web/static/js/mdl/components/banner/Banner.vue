<template>
  <Carousel
    containerClass="mdl-section mdl-carousel mdl-banner mdl-color--primary"
    trackClass="mdl-section__child--fullscreen"
    v-bind:items="banners"
    large="true"
    v-bind:options="options"
  >
    <template v-slot:item="{ item }">
      <Card
        v-bind:product="item"
        v-bind:class="{'mdl-card--large': item.important,'mdl-color--primary': true}"
        v-bind:large="true"
      ></Card>
    </template>
  </Carousel>
</template>

<script>
import Carousel from "../util/Carousel.vue";
import Card from "../card";

export default {
  name: "mdl-banner",
  data() {
    const data = {
      options: {
        type: "carousel",
        startAt: 0,
        perView: 8,
        peek: 100,
        bullet: true,
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
            perView: 3,
            peek: 100
          },
          425: {
            perView: 1,
            peek: { before: 0, after: 100 }
          }
        }
      },
      banners: [
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