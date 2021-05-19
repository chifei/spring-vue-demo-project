import "babel-polyfill";
import "dialog-polyfill";
import Vue from 'vue'
import VueRouter from 'vue-router'
import App from './app/App.vue'
import Index from './pages/Index.vue';
import Category from './pages/Category.vue';
import Page from './pages/Page.vue';
import Contact from './pages/Contact.vue';

import './components/util';

Vue.use(VueRouter);

const routes = [
    {
        path: '',
        name: 'Index',
        component: Index
    },
    {
        path: '/admin/mdl/r/:id',
        name: 'Category',
        component: Category
    },
    {
        path: '/admin/mdl/p/:id',
        name: 'Page Detail',
        component: Page
    },
    {
        path: '/admin/mdl/about/contact',
        name: 'Contact',
        component: Contact
    },
];

const router = new VueRouter({
    // mode: "history",
    routes,
    scrollBehavior(to, from, savedPosition) {
        if (savedPosition) {
            return savedPosition
        } else {
            return { x: 0, y: 0 }
        }
    }
});

router.beforeEach((to, from, next) => {
    document.querySelector(".mdl-layout__drawer") && document.querySelector(".mdl-layout__drawer").removeClass("is-visible");
    document.querySelector(".mdl-layout__obfuscator") && document
        .querySelector(".mdl-layout__obfuscator")
        .removeClass("is-visible");
    next();
})
new Vue({
    el: '#app',
    router,
    render: h => h(App)
});