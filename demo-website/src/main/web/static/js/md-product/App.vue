<template>
    <md-app>
        <md-app-toolbar class="md-primary">
            <md-button class="md-icon-button" @click="menuVisible = !menuVisible">
                <md-icon>menu</md-icon>
            </md-button>
            <span class="md-title">{{$route.name}}</span>
        </md-app-toolbar>

        <md-app-drawer :md-active.sync="menuVisible">
            <md-toolbar class="md-transparent" md-elevation="0">
                <h3>Navigation</h3>
            </md-toolbar>

            <md-list>
                <md-list-item>
                    <router-link to="/admin/md/product" class="md-list-item-text" @click="closeMenu">Product</router-link>
                </md-list-item>
            </md-list>
        </md-app-drawer>

        <md-app-content>
            <router-view></router-view>
        </md-app-content>
    </md-app>
</template>

<script>
    export default {
        data() {
            return {
                menuVisible: false
            };
        },
        methods: {
            closeMenu() {
                this.menuVisible = false;
            }
        },
        created() {
            if (!this.$route.name) {
                this.$router.push("/admin/md/product");
            }
        }
    };
</script>

<style>
    body,
    .md-app {
        height: 100%;
    }
</style>
<style scoped>
    .md-drawer {
        width: 230px;
        max-width: calc(100vw - 125px);
    }

    .md-theme-default a:not(.md-button) {
        color: inherit;
    }
</style>

