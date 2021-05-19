<template>
  <div id="app">
    <el-container>
      <el-header>
        <el-menu
          :default-active="activeIndex"
          class="el-menu-demo"
          mode="horizontal"
          @select="handleSelect"
          background-color="#545c64"
          text-color="#fff"
          active-text-color="#ffd04b"
        >
          <el-menu-item index="product">Product</el-menu-item>
        </el-menu>
      </el-header>
      <el-main>
        <router-view></router-view>
      </el-main>
    </el-container>
  </div>
</template>

<script>
export default {
  computed: {
    activeIndex() {
      return this.$route.path.split("/")[3];
    }
  },
  methods: {
    handleSelect(key, keyPath) {
      this.$router.push("/admin/el/" + key);
    }
  },
  created() {
    if (!this.$route.name) {
      this.$router.push("/admin/el/product");
    }
  }
};
</script>

<style>
body {
  margin: 0;
}

header .el-menu {
  margin-left: -20px;
  margin-right: -20px;
}
.page-title {
  text-align: left;
}

.el-pagination {
  text-align: right;
  margin-top: 40px;
}
</style>
