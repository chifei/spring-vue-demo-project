import Vue from 'vue'
import ElementUI from 'element-ui'
import VueResource from 'vue-resource'

import Login from './Login.vue'

Vue.use(ElementUI);
Vue.use(VueResource);

new Vue({
    el: '#app',
    render: h => h(Login)
});
