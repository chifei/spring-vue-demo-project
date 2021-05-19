<template>
  <form novalidate class="md-layout">
    <div class="md-layout-item"></div>
    <md-card class="md-layout-item md-size-50 md-small-size-100">
      <md-card-header>
        <div class="md-title">{{product.name}}</div>
      </md-card-header>

      <md-card-content>
        <div class="md-layout md-gutter">
          <div class="md-layout-item md-size-100">
            <md-field>
              <label for="name">Name</label>
              <md-input name="name" id="name" v-model="product.name" disabled="true"/>
            </md-field>
          </div>

          <div class="md-layout-item md-size-100">
            <md-field>
              <label for="description">Description</label>
              <md-textarea
                name="description"
                id="description"
                v-model="product.description"
                md-autogrow="true"
                disabled="true"
              />
            </md-field>
          </div>
        </div>
      </md-card-content>

      <md-card-actions>
        <md-button class="md-primary" @click="goBack()">Close</md-button>
      </md-card-actions>
    </md-card>
    <div class="md-layout-item"></div>
  </form>
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
    goBack() {
      return this.$router.go(-1);
    }
  }
};
</script>
