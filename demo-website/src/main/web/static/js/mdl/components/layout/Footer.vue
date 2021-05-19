<template>
  <footer class="mdl-mega-footer">
    <div class="mdl-mega-footer__middle-section">
      <div class="mdl-mega-footer__drop-down-section">
        <input class="mdl-mega-footer__heading-checkbox" type="checkbox" checked>
        <h1 class="mdl-mega-footer__heading">Features</h1>
        <ul class="mdl-mega-footer__link-list">
          <li>
            <router-link to="/admin/mdl/p/About">About</router-link>
          </li>
          <li>
            <router-link to="/admin/mdl/p/Terms">Terms</router-link>
          </li>
          <li>
            <router-link to="/admin/mdl/p/Partners">Partners</router-link>
          </li>
          <li>
            <router-link to="/admin/mdl/p/Updates">Updates</router-link>
          </li>
        </ul>
      </div>

      <div class="mdl-mega-footer__drop-down-section">
        <input class="mdl-mega-footer__heading-checkbox" type="checkbox" checked>
        <h1 class="mdl-mega-footer__heading">Details</h1>
        <ul class="mdl-mega-footer__link-list">
          <li>
            <router-link to="/admin/mdl/p/Specs">Specs</router-link>
          </li>
          <li>
            <router-link to="/admin/mdl/p/Tools">Tools</router-link>
          </li>
          <li>
            <router-link to="/admin/mdl/p/Resources">Resources</router-link>
          </li>
        </ul>
      </div>

      <div class="mdl-mega-footer__drop-down-section">
        <input class="mdl-mega-footer__heading-checkbox" type="checkbox" checked>
        <h1 class="mdl-mega-footer__heading">Technology</h1>
        <ul class="mdl-mega-footer__link-list">
          <li>
            <router-link to="/admin/mdl/p/How it works">How it works</router-link>
          </li>
          <li>
            <router-link to="/admin/mdl/p/Patterns">Patterns</router-link>
          </li>
          <li>
            <router-link to="/admin/mdl/p/Usage">Usage</router-link>
          </li>
          <li>
            <router-link to="/admin/mdl/p/Products">Products</router-link>
          </li>
          <li>
            <router-link to="/admin/mdl/p/Contracts">Contracts</router-link>
          </li>
        </ul>
      </div>

      <div class="mdl-mega-footer__drop-down-section">
        <input class="mdl-mega-footer__heading-checkbox" type="checkbox" checked>
        <h1 class="mdl-mega-footer__heading">FAQ</h1>
        <ul class="mdl-mega-footer__link-list">
          <li>
            <router-link to="/admin/mdl/p/Questions">Questions</router-link>
          </li>
          <li>
            <router-link to="/admin/mdl/p/Answers">Answers</router-link>
          </li>
          <li>
            <router-link to="/admin/mdl/p/Contact us">Contact us</router-link>
          </li>
        </ul>
      </div>
    </div>

    <div class="mdl-mega-footer__bottom-section">
      <div class="mdl-logo">Title</div>
      <ul class="mdl-mega-footer__link-list">
        <li>
          <router-link to="/admin/mdl/p/Help">Help</router-link>
        </li>
        <li>
          <router-link to="/admin/mdl/p/Privacy & Terms">Privacy & Terms</router-link>
        </li>
      </ul>
    </div>
  </footer>
</template>

<script>
export default {
  data() {
    const data = {};
    return data;
  },
  methods: {}
};
</script>

<style scoped>
.mdl-mega-footer {
  margin-top: 80px;
}
</style>