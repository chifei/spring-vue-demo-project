<template>
  <el-card class="product-detail-card">
    <div slot="header" class="clearfix">
      <h3>{{product.name}}</h3>
    </div>
    <el-form ref="form" :model="product" label-width="120px">
      <el-form-item label="Name">
        <el-input v-model="product.name"></el-input>
      </el-form-item>
      <el-form-item label="Description">
        <el-input type="textarea" v-model="product.description"></el-input>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="submit">Save</el-button>
        <el-button @click="goBack()">Cancel</el-button>
      </el-form-item>
    </el-form>
  </el-card>
</template>

<script>
export default {
  data() {
    const data = {
      product: {}
    };
    this.$http
      .get("/admin/api/product/" + this.$route.params.id)
      .then(result => {
        data.product = result.body;
      });
    return data;
  },
  methods: {
    submit() {
      this.$http
        .put(
          "/admin/api/product/" + this.$route.params.id,
          JSON.stringify(this.product)
        )
        .then(result => {
          this.goBack();
        });
    },
    goBack() {
      this.$router.go(-1);
    }
  }
};
</script>

<style>
.product-detail-card {
  max-width: 800px;
  margin: 40px auto;
}
</style>
