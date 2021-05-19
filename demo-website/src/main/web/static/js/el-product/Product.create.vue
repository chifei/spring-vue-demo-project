<template>
  <el-card class="product-detail-card">
    <div slot="header" class="clearfix">
      <h3>Product Create</h3>
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
    return {
      product: {}
    };
  },
  methods: {
    submit() {
      this.$http
        .post("/admin/api/product/", JSON.stringify(this.product))
        .then(result => {
          this.goBack();
        });
    },
    goBack() {
      this.$router.history.go(-1);
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
