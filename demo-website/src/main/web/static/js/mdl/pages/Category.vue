<template>
  <div class="mdl-section mdl-category" v-bind:id="'category_'+_uid" v-on:scroll="onScroll()">
    <h2 class="mdl-category__title">{{$route.params.id}}</h2>
    <div class="mdl-category__container">
      <div class="mdl-grid">
        <Card v-for="product in products" v-bind:key="product.id" v-bind:product="product"></Card>
      </div>
      <div class="mdl-search__more-loading" v-bind:class="{'is-active':loadingMore}">
        <div class="mdl-spinner mdl-spinner--single-color mdl-js-spinner is-active"></div>
      </div>
    </div>
  </div>
</template>

 <script>
import Card from "../components/card";
export default {
  data() {
    const data = {
      loading: false,
      loadingMore: true,
      scrollThreshold: 80,
      searchShown: false,
      searchText: "",
      autocompleteItems: [],
      histories: ["Birthday", "Christmasday", "Holloween"],
      products: [],
      header: document.querySelector(".mdl-layout__header"),
      input: document.querySelectorAll(".mdl-search__input"),
      panel: document.querySelector(".mdl-layout__content"),
      resultList: document.querySelector(".mdl-search__result .mdl-grid"),
      searchIcon: document.querySelectorAll(".mdl-search__input-search"),
      closeBtn: document.querySelectorAll(".mdl-search__input-close"),
      history: document.querySelectorAll(".mdl-search__history"),
      content: document.querySelector(".mdl-layout__content"),
      searchLoading: document.querySelectorAll(".mdl-search__search-loading"),
      searchLoadingSpinner: document.querySelectorAll(
        ".mdl-search__search-loading .mdl-spinner"
      ),
      moreLoadingSpinner: document.querySelector(
        ".mdl-search__more-loading .mdl-spinner"
      )
    };
    return data;
  },
  computed: {},
  methods: {
    onScroll() {
      const panel = document.querySelector(".mdl-layout__content");
      if (
        panel.scrollTop + panel.offsetHeight - panel.scrollHeight <=
        this.scrollThreshold
      ) {
        this.loadMore();
      }
    },
    loadMore() {
      if (this.loadingMore) {
        return;
      }
      this.loadingMore = true;
      setTimeout(
        function() {
          this.mockData();
        }.bind(this),
        3000
      );
    },
    mockData: function() {
      for (var i = 0; i < 5; i += 1) {
        this.products.push({
          img: "../static/img/10.jpg",
          name: "Your card",
          desc: "yourcard llc",
          star: 4.5
        });
        this.products.push({
          img: "../static/img/7.jpg",
          name: "Rocket",
          desc: "happymobile",
          star: 3.5
        });
        this.products.push({
          img: "../static/img/8.jpg",
          name: "Google Gallery",
          desc: "Google LLC",
          star: 4.8
        });
        this.products.push({
          img: "../static/img/9.jpg",
          name: "Youtube",
          desc: "Google LLC",
          star: 4.8
        });
        this.products.push({
          img: "../static/img/1.jpg",
          name: "Camera",
          desc: "Google LLC",
          star: 4.8
        });
      }

      this.loading = false;
      this.loadingMore = false;
    }
  },
  mounted() {
    this.mockData();
    componentHandler.upgradeElement(
      document.querySelector(".mdl-category .mdl-spinner")
    );
    document
      .querySelector(".mdl-layout__content")
      .addEventListener("scroll", this.onScroll.bind(this));
  },
  updated() {
    componentHandler.upgradeElement(
      document.querySelector(".mdl-category .mdl-spinner")
    );
  },
  destroyed() {
    document
      .querySelector(".mdl-layout__content")
      .removeEventListener("scroll", this.onScroll.bind(this));
  },
  components: {
    Card
  }
};
</script>
<style scoped>
.mdl-grid {
  margin-left: -16px;
  margin-right: -16px;
}

.mdl-category {
  margin: auto;
}

.mdl-category > * {
  max-width: none;
}

@media (min-width: 769px) {
  .mdl-category {
    max-width: 632px;
  }

  .mdl-card {
    width: 200px;
  }
}

@media (min-width: 880px) {
  .mdl-category {
    max-width: 848px;
  }
}

@media (min-width: 1096px) {
  .mdl-category {
    max-width: 1064px;
  }
}

@media (min-width: 1312px) {
  .mdl-category {
    max-width: 1280px;
  }
}

@media (min-width: 1528px) {
  .mdl-category {
    max-width: 1496px;
  }
}

@media (min-width: 1744x) {
  .mdl-category {
    max-width: 1712px;
  }
}
</style>