<template>
    <el-card class="product-detail-card">
        <div slot="header" class="clearfix">
            <h3>{{Login}}</h3>
        </div>
        <el-form ref="form" :model="form" label-width="120px">
            <el-form-item label="Name">
                <el-input v-model="form.username"></el-input>
            </el-form-item>
            <el-form-item label="Password">
                <el-input type="password" v-model="form.password"></el-input>
            </el-form-item>
            <el-form-item>
                <el-button type="primary" @click="submit">Login</el-button>
            </el-form-item>
        </el-form>
    </el-card>
</template>

<script>
    export default {
        data() {
            return {
                form: {}
            };
        },
        methods: {
            submit() {
                this.$http
                    .post("/admin/api/user/login", JSON.stringify(this.form))
                    .then(loginResponse => {
                        if (this.hasFromURL(loginResponse.body.fromURL)) {
                            window.location.href = loginResponse.body.fromURL;
                        } else {
                            window.location.href = "/admin/";
                        }
                    });
            },
            hasFromURL(fromURL) {
                return fromURL && fromURL !== "/login" && fromURL !== "/logout";
            }
        }
    };
</script>

<style scoped>
    .product-detail-card {
        max-width: 500px;
        margin: 40px auto;
    }
</style>
