<template>
  <form novalidate class="md-layout" @submit.prevent="validate">
    <div class="md-layout-item"></div>
    <md-card class="md-layout-item md-size-50 md-small-size-100">
      <md-card-header>
        <div class="md-title">Product Create</div>
      </md-card-header>

      <md-card-content>
        <div class="md-layout md-gutter">
          <div class="md-layout-item md-size-100">
            <md-field :class="getValidationClass('name')">
              <label for="name">Name</label>
              <md-input name="name" id="name" v-model="product.name" :disabled="sending"/>
              <span class="md-error" v-if="!$v.product.name.required">The first name is required</span>
              <span class="md-error" v-else-if="!$v.product.name.minlength">Invalid first name</span>
            </md-field>
          </div>

          <div class="md-layout-item md-size-100">
            <md-field :class="getValidationClass('description')">
              <label for="description">Description</label>
              <md-input
                name="description"
                id="description"
                v-model="product.description"
                :disabled="sending"
              />
            </md-field>
          </div>
        </div>
      </md-card-content>

      <md-progress-bar md-mode="indeterminate" v-if="sending"/>

      <md-card-actions>
        <md-button type="submit" class="md-primary" :disabled="sending">Save</md-button>
      </md-card-actions>
    </md-card>
    <div class="md-layout-item"></div>
  </form>
</template>

<script>
import { validationMixin } from "vuelidate";
import { required } from "vuelidate/lib/validators";
export default {
  mixins: [validationMixin],
  data() {
    return {
      sending: false,
      product: {}
    };
  },
  validations: {
    product: {
      name: {
        required
      }
    }
  },
  methods: {
    getValidationClass(fieldName) {
      const field = this.$v.product[fieldName];

      if (field) {
        return {
          "md-invalid": field.$invalid && field.$dirty
        };
      }
    },
    validate() {
      this.$v.$touch();

      if (!this.$v.$invalid) {
        this.save();
      }
    },
    save() {
      this.sending = true;
      this.$http
        .post("/admin/api/product", JSON.stringify(this.product))
        .then(result => {
          this.sending = false;
          this.goBack();
        });
    },
    goBack() {
      this.$router.go(-1);
    }
  }
};
</script>

