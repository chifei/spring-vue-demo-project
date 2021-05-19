<template>
  <div>
    <h1 class="page-title">
      <span>Products</span>

      <router-link to="/admin/el/product/create">
        <el-button style="float:right" type="primary">New Product</el-button>
      </router-link>
    </h1>

    <el-table :data="tableData" style="width: 100%" @sort-change="sortChange">
      <el-table-column prop="name" label="Name" sortable="custom"></el-table-column>
      <el-table-column prop="description" label="Description" sortable="custom"></el-table-column>
      <el-table-column prop="updated_time" label="Updated Time" sortable="custom"></el-table-column>
      <el-table-column label="Action">
        <template slot-scope="scope">
          <el-button @click="view(scope.row)" type="primary" size="small">View</el-button>
          <el-button @click="edit(scope.row)" type="text" size="small">Edit</el-button>
          <el-button @click="confirmDelete(scope.row)" type="text"  size="small">Delete</el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      :current-page="currentPage"
      :page-sizes="[10, 20, 50, 100]"
      :page-size="pageSize"
      layout="total, sizes, prev, pager, next, jumper"
      :total="totalItems"
    ></el-pagination>
  </div>
</template>

<script>
export default {
  data() {
    const data = {
      searchName: "",
      currentPage: 1,
      pageSize: 10,
      totalItems: 0,
      tableData: []
    };
    var query = {
      name: this.searchName,
      page: this.currentPage,
      limit: this.pageSize
    };
    this.loadData(query);
    return data;
  },
  methods: {
    handleSizeChange(pageSize) {
      this.pageSize = pageSize;
    },
    handleCurrentChange(page) {
      this.currentPage = page;
    },
    loadData(query) {
      const options = Object.assign(
        {
          page: this.currentPage,
          limit: this.pageSize
        },
        query
      );
      this.$http
        .put("/admin/api/product/find", JSON.stringify({ options }))
        .then(result => {
          this.tableData = result.body.items;
          this.totalItems = result.body.total;
        });
    },
    sortChange({ column, prop, order }) {
      console.log(order);
      var query = {
        name: this.searchName,
        page: this.currentPage,
        limit: this.pageSize
      };
      if (prop && order) {
        query.sortingField = prop;
        query.desc = order === "descending";
      }
      this.loadData(query);
    },
    view(product) {
      this.$router.push("/admin/el/product/create");
    },
    view(product) {
      this.$router.push("/admin/el/product/" + product.id);
    },
    edit(product) {
      this.$router.push("/admin/el/product/" + product.id + "/update");
    },
    confirmDelete(product) {
      this.$alert("Would you like to delete it?", "Delete Product", {
        confirmButtonText: "Delete",
        callback: action => {
          this.$http
            .post(
              "/admin/api/product/batch-delete",
              JSON.stringify({ ids: [product.id] })
            )
            .then(() => {
              this.$message({
                type: "info",
                message: `Delete success`
              });
              this.loadData();
            });
        }
      });
    }
  }
};
</script>
