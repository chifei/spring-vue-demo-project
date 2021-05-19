<template>
    <md-card>
        <md-table v-model="tableData" :md-sort-fn="sortChange">
            <md-table-toolbar>
                <h1 class="md-title">
                    <span>Product</span>
                    <router-link to="/admin/md/product/create">
                        <md-button style="float:right" class="md-primary md-raised">New Product</md-button>
                    </router-link>
                </h1>
            </md-table-toolbar>

            <md-table-row slot="md-table-row" slot-scope="{ item }">
                <md-table-cell md-label="Name" md-sort-by="name">{{ item.name }}</md-table-cell>
                <md-table-cell md-label="Description" md-sort-by="description">{{ item.description }}</md-table-cell>
                <md-table-cell md-label="Action">
                    <template>
                        <md-button @click="view(item)" class="md-primary md-dense md-plain">View</md-button>
                        <md-button @click="edit(item)" class="md-primary md-dense md-plain">Edit</md-button>
                        <md-button @click="confirmDelete(item)" class="md-accent md-dense md-plain">Delete</md-button>
                    </template>
                </md-table-cell>
            </md-table-row>
        </md-table>
        <div class="pagination" v-if="pages>1">
            <md-button v-if="currentPage!==1" class="md-icon-button md-primary" @click="pageChangePrev()">
                <md-icon>keyboard_arrow_left</md-icon>
            </md-button>
            <span v-if="pageAtStart">
        <md-button
                class="md-icon-button"
                v-for="n in pageItemSize"
                v-bind:key="n"
                v-bind:class="{ 'md-primary': n===currentPage }"
                @click="pageChange(n)"
        >{{n}}</md-button>
      </span>
            <span v-if="pageAtMiddle">
        <md-button
                class="md-icon-button"
                v-for="n in 5"
                v-bind:key="n"
                v-bind:class="{ 'md-primary': n+currentPage-3===currentPage }"
                @click="pageChange(n+currentPage-3)"
        >{{n+currentPage-3}}</md-button>
      </span>
            <span v-if="pageAtEnd">
        <md-button
                class="md-icon-button"
                v-for="n in 5"
                v-bind:key="n"
                v-bind:class="{ 'md-primary': n+pages-5===currentPage }"
                @click="pageChange(n+pages-5)"
        >{{n+pages-5}}</md-button>
      </span>

            <md-button
                    v-if="currentPage!==pages"
                    class="md-icon-button md-primary"
                    @click="pageChangeNext()"
            >
                <md-icon>keyboard_arrow_right</md-icon>
            </md-button>
        </div>

        <md-dialog-confirm
                :md-active.sync="showDialog"
                md-title="Delete Product"
                md-content="Would you like to delete it?"
                md-confirm-text="Delete"
                md-cancel-text="Cancel"
                @md-cancel="showDialog = false"
                @md-confirm="doDelete()"
        />

        <md-dialog-alert
                :md-active.sync="deleteSuccess"
                md-content="Product deleted"
                md-confirm-text="OK"
        />
    </md-card>
</template>

<script>
    export default {
        data() {
            const data = {
                showDialog: false,
                deleteSuccess: false,
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
        computed: {
            pageAtStart() {
                return this.currentPage <= 3 || this.pages <= 5;
            },
            pageAtMiddle() {
                return !this.pageAtStart && !this.pageAtEnd;
            },
            pageAtEnd() {
                return !this.pageAtStart && this.pages - this.currentPage < 3;
            },
            pages() {
                return this.totalItems / this.pageSize;
            },
            pageItemSize() {
                return Math.min(5, this.pages);
            }
        },
        methods: {
            pageChange(page) {
                this.currentPage = page;
            },
            pageChangePrev() {
                this.pageChange(Math.max(this.currentPage - 1, 0));
            },
            pageChangeNext() {
                this.pageChange(Math.min(this.currentPage + 1, this.pages));
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
                    .put("/admin/api/product/find", JSON.stringify({options}))
                    .then(result => {
                        this.tableData = result.body.items;
                        this.totalItems = result.body.total;
                    });
            },
            sortChange({column, prop, order}) {
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
                this.$router.push("/admin/md/product/" + product.id);
            },
            edit(product) {
                this.$router.push("/admin/md/product/" + product.id + "/update");
            },
            confirmDelete(product) {
                console.log(product);
                this.showDialog = true;
                this.deletingProductId = product.id;
            },
            doDelete() {
                this.$http
                    .post(
                        "/admin/api/product/batch-delete",
                        JSON.stringify({ids: [this.deletingProductId]})
                    )
                    .then(() => {
                        this.deleteSuccess = true;
                        this.loadData();
                    });
            }
        }
    };
</script>

<style>
    .pagination {
        margin-top: 20px;
        float: right;
    }

    .md-table .md-table-content {
        flex: 1 1 auto !important;
    }
</style>
v