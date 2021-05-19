import "babel-polyfill";
import Vue from 'vue'
import VueRouter from 'vue-router'
import ElementUI from 'element-ui'
import locale from 'element-ui/lib/locale/lang/en'
import VueResource from 'vue-resource'
import App from './App.vue'
import Product from './Product.vue'
import ProductDetail from './Product.detail.vue'
import ProductUpdate from './Product.update.vue'
import ProductCreate from './Product.create.vue'

Vue.use(ElementUI, { locale });
Vue.use(VueRouter);
Vue.use(VueResource);
const routes = [
    {
        path: '/admin/el/product',
        name: 'Product',
        component: Product
    },
    {
        path: '/admin/el/product/create',
        name: 'Product Create',
        component: ProductCreate
    },
    {
        path: '/admin/el/product/:id',
        name: 'Product Detail',
        component: ProductDetail
    },
    {
        path: '/admin/el/product/:id/update',
        name: 'Product Update',
        component: ProductUpdate
    },
];

const router = new VueRouter({
    mode: "history",
    routes
});

new Vue({
    el: '#app',
    router,
    render: h => h(App)
});
