<template>
  <el-card class="product-detail-card">
    <div slot="header" class="clearfix">
      <h3>{{product.name}}</h3>
    </div>
    <el-form ref="form" label-width="120px">
      <el-form-item label="Name">
        <span>{{product.name}}</span>
      </el-form-item>
      <el-form-item label="Description">
        <span>{{product.description}}</span>
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
  }
};
</script>

<style>
.product-detail-card {
  max-width: 800px;
  margin: 40px auto;
}
</style>
