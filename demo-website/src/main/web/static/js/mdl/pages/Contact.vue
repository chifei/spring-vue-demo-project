<template>
  <div>
    <form class="contact-form">
      <div class="mdl-textfield mdl-js-textfield mdl-textfield--floating-label">
        <input
          type="text"
          name="name"
          pattern="[A-Z,a-z, ]*"
          class="mdl-textfield__input"
          id="Name"
        >
        <label class="mdl-textfield__label" for="Name">Name</label>
        <span class="mdl-textfield__error">Letters and spaces only</span>
      </div>
      <div class="mdl-textfield mdl-js-textfield mdl-textfield--floating-label">
        <input id="Email" type="email" name="email" class="mdl-textfield__input">
        <label class="mdl-textfield__label" for="Email">E-mail</label>
      </div>
      <div class="mdl-textfield mdl-js-textfield mdl-textfield--floating-label">
        <input type="text" name="subject" class="mdl-textfield__input" id="Subject">
        <label class="mdl-textfield__label" for="Subject">Subject</label>
      </div>
      <div class="mdl-textfield mdl-js-textfield mdl-textfield--floating-label">
        <textarea name="message" class="mdl-textfield__input" rows="5" id="note"></textarea>
        <label class="mdl-textfield__label" for="note">Message</label>
      </div>
      <p>
        <button
          v-on:click="submit()"
          class="mdl-button mdl-js-button mdl-button--raised mdl-js-ripple-effect mdl-button--accent"
        >Send Message</button>
      </p>
    </form>
    <dialog id="contact-dialog" class="mdl-dialog" v-bind:open="sended">
      <h4 class="mdl-dialog__title">Thank you for your feedback</h4>
      <div class="mdl-dialog__content">
        <p>Your feedback will be high valued. We will process it in 24 hours. Best Gifts Buy needs your advice. Let's make it a better community.</p>
        <p>
          Thank you.
          <br>BGB
        </p>
      </div>
      <div class="mdl-dialog__actions">
        <button type="button" class="mdl-button close" v-on:click="close()">Close</button>
      </div>
    </dialog>
  </div>
</template>

 <script>
import Section from "../components/section";

export default {
  data() {
    return {
      sended: false
    };
  },
  computed: {},
  methods: {
    submit() {
      const dialog = document.querySelector("#contact-dialog");
      if (!dialog.showModal) {
        dialogPolyfill.registerDialog(dialog);
      }
      dialog.showModal();
    },
    close() {
      document.querySelector("#contact-dialog").close();
    }
  },
  components: {
    "mdl-section": Section
  },
  mounted() {
    componentHandler.upgradeElements(
      document.querySelectorAll(".mdl-textfield")
    );
  },
  updated() {
    componentHandler.upgradeElements(
      document.querySelectorAll(".mdl-textfield")
    );
  }
};
</script>
<style scoped>
p {
  line-height: 1.58;
}
</style>

<style>
.contact-form {
  max-width: 550px;
  margin: auto;
  padding: 0 16px;
  padding-top: 40px;
}

.contact-form .mdl-textfield {
  width: 100%;
}
@media (min-width: 840px) {
  .contact-form {
    padding-top: 80px;
  }
}
</style>
