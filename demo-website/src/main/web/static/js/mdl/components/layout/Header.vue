<template>
  <header
    class="mdl-layout__header"
    v-bind:class="{'mdl-layout__header--seamed': seamed,'searching': searchShown,'scrolled': scrolled}"
  >
    <div class="mdl-layout-icon"></div>
    <div class="mdl-layout__header-row mdl-layout__header-main">
      <router-link to="/">
        <span class="mdl-layout__title">
          <h4>Vue Demo</h4>
        </span>
      </router-link>

      <div class="mdl-layout-spacer mdl-layout--desktop-only">
        <div class="mdl-search__header" v-on:blur="hideSearchResult()">
          <input
            type="text"
            class="mdl-search__input"
            placeholder="Search here"
            v-model="searchText"
            v-on:focus="onFocus()"
            v-on:keyup="onKeyup($event)"
          >
          <div
            class="mdl-search__input-autocomplete mdl-color--white mdl-shadow--2dp"
            v-bind:style="{height: autocompleteItems.length*42+'px',}"
          >
            <button
              v-for="item in autocompleteItems"
              v-bind:key="item"
              v-on:click="fillAutocomplete(item)"
              class="mdl-search__input-autocomplete-item mdl-button mdl-js-button mdl-js-ripple-effect"
            >{{item}}</button>
          </div>
          <i v-if="!searchShown" class="material-icons mdl-search__input-search">search</i>
          <button
            v-if="searchShown"
            v-on:click="hideSearchResult()"
            class="mdl-button mdl-js-button mdl-button--icon mdl-search__input-close"
          >
            <i class="material-icons">close</i>
          </button>
          <div class="mdl-search__search-loading" v-bind:class="{ 'is-active': loading }">
            <div class="mdl-spinner mdl-spinner--single-color mdl-js-spinner is-active"></div>
          </div>
        </div>
      </div>
      <label
        class="mdl-button mdl-js-button mdl-button--icon mdl-layout--desktop-only"
        for="fixed-header-drawer-exp"
      >
        <i class="material-icons">person</i>
      </label>
    </div>
    <div class="mdl-search__header mdl-layout--mobile-only">
      <input
        type="text"
        class="mdl-search__input"
        placeholder="Search here"
        v-model="searchText"
        v-on:focus="onFocus()"
        v-on:keyup="onKeyup($event)"
      >
      <div
        class="mdl-search__input-autocomplete mdl-color--white mdl-shadow--2dp"
        v-bind:style="{height: autocompleteItems.length*42+'px',}"
      >
        <button
          v-for="item in autocompleteItems"
          v-bind:key="item"
          v-on:click="fillAutocomplete(item)"
          class="mdl-search__input-autocomplete-item mdl-button mdl-js-button mdl-js-ripple-effect"
        >{{item}}</button>
      </div>
      <i v-if="!searchShown" class="material-icons mdl-search__input-search">search</i>
      <button
        v-if="searchShown"
        v-on:click="hideSearchResult()"
        class="mdl-button mdl-js-button mdl-button--icon mdl-search__input-close"
      >
        <i class="material-icons">close</i>
      </button>
      <div class="mdl-search__search-loading" v-bind:class="{ 'is-active': loading }">
        <div class="mdl-spinner mdl-spinner--single-color mdl-js-spinner is-active"></div>
      </div>
    </div>
    <div
      class="mdl-search__panel"
      v-bind:class="{ 'is-visible': searchShown }"
      v-on:scroll="onScroll()"
    >
      <div class="mdl-search__history-list">
        <h6 class="mdl-search__history-list-title">History</h6>
        <button
          v-for="history in histories"
          v-bind:key="history"
          v-on:click="searchHistory(history)"
          class="mdl-button mdl-js-button mdl-search__history"
        >{{history}}</button>
      </div>
      <div class="mdl-search__result">
        <h6 class="mdl-search__result-title">Result</h6>
        <div class="mdl-grid">
          <Card v-for="product in products" v-bind:key="product.id" v-bind:product="product"></Card>
        </div>
        <div class="mdl-search__more-loading" v-bind:class="{'is-active':loadingMore}">
          <div class="mdl-spinner mdl-spinner--single-color mdl-js-spinner is-active"></div>
        </div>
      </div>
    </div>
  </header>
</template>

<script>
import Card from "../card";
export default {
  props: ["seamed"],
  data() {
    const data = {
      loading: false,
      loadingMore: false,
      scrollThreshold: 80,
      searchShown: false,
      scrolled: false,
      searchText: "",
      autocompleteItems: [],
      histories: ["Birthday", "Christmasday", "Holloween"],
      products: [],
      header: document.querySelector(".mdl-layout__header"),
      input: document.querySelectorAll(".mdl-search__input"),
      panel: document.querySelector(".mdl-search__panel"),
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
  methods: {
    onFocus() {
      this.showSearchResult();
    },
    onKeyup(event) {
      if (event.keyCode == 13) {
        this.search();
      } else {
        this.autocomplete(event.target);
      }
    },
    onScroll() {
      var panel = document.querySelector(".mdl-search__panel");
      if (
        panel.scrollTop + panel.offsetHeight - panel.scrollHeight <=
        this.scrollThreshold
      ) {
        this.loadMore();
      }
    },
    showSearchResult() {
      this.searchText = "";
      this.searchShown = true;
    },
    hideSearchResult: function() {
      this.searchShown = false;
      this.searchText = "";
      this.autocompleteItems = [];
    },
    search() {
      //todo: do search here
      this.autocompleteItems = [];
      this.products = [];
      this.loadMore();
    },
    autocomplete(input) {
      this.autocompleteItems = [];
      var value = this.searchText;
      if (this.searchText) {
        var total = Math.floor(Math.random() * 6);

        for (var i = 0; i < total; i += 1) {
          this.autocompleteItems.push(this.searchText + "" + Math.random());
        }
      }
    },
    fillAutocomplete(text) {
      this.searchText = text;
      this.search();
    },
    searchHistory(text) {
      this.searchText = text;
      this.search();
    },
    loadMore() {
      if (this.loadingMore) {
        return;
      }
      this.loadingMore = true;
      this.mockData();
    },
    mockData: function() {
      setTimeout(
        function() {
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

          this.loading = false;
          this.loadingMore = false;
        }.bind(this),
        3000
      );
    },
    headerScrollFn() {
      console.log("scrolled");

      this.scrolled = this.content.scrollTop > 0;
    }
  },
  components: {
    Card
  },
  mounted() {
    if (!this.content) {
      this.content = document.querySelector(".mdl-layout__content");
    }
    this.content.addEventListener("scroll", this.headerScrollFn.bind(this));
  },
  destroyed() {
    this.content.removeEventListener("scroll", this.headerScrollFn.bind(this));
  }
};
</script>

<style scoped>
.mdl-layout__header-main a {
  text-decoration: none;
}
.mdl-layout__title > h4 {
  margin: auto;
  color: #fff;
}

.mdl-search__history-list-title,
.mdl-search__result-title {
  color: #000;
}
.mdl-search__more-loading {
  display: none;
}
.mdl-search__more-loading.is-active {
  display: block;
}
.mdl-layout__header-main,
.mdl-layout--mobile-only {
  z-index: 3;
}

@media (min-width: 769px) {
  .searching .mdl-layout__header-main {
    box-shadow: 0 2px 2px 0 rgba(0, 0, 0, 0.14),
      0 3px 1px -2px rgba(0, 0, 0, 0.2), 0 1px 5px 0 rgba(0, 0, 0, 0.12);
  }
}
@media (max-width: 768px) {
  .searching .mdl-layout--mobile-only {
    box-shadow: 0 2px 2px 0 rgba(0, 0, 0, 0.14),
      0 3px 1px -2px rgba(0, 0, 0, 0.2), 0 5px 5px 0 rgba(0, 0, 0, 0.12);
  }

  .mdl-search__input-autocomplete {
    top: 49px;
    left: 16px;
    right: 16px;
    height: 16px;
  }

  .mdl-layout__header {
    position: relative;
    height: 112px;
    transition: all 0.2s cubic-bezier(0, 0.2, 0.4, 1);
  }

  .mdl-layout__header.scrolled:not(.searching) {
    height: 56px;
  }

  .mdl-search__header {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    transition: all 0.2s cubic-bezier(0, 0.2, 0.4, 1);
    transform-origin: right 42px;
  }

  .scrolled:not(.searching) .mdl-search__header {
    left: auto;
  }

  .mdl-search__input {
    float: right;
    width: 100%;
    padding-right: 32px;
    transition: all 0.2s cubic-bezier(0, 0.2, 0.4, 1);
  }

  .mdl-search__input-search {
    z-index: -1;
  }

  .scrolled:not(.searching) .mdl-search__input {
    width: 52px;
    opacity: 0;
    cursor: pointer;
  }
}
</style>