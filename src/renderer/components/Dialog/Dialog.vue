<template>
  <dialog ref="dialog">
    <header class="toolbar toolbar-header">
      <h1 class="title">{{title}}</h1>
    </header>

          <slot/>

      <footer class="toolbar toolbar-footer">
          <div class="toolbar-actions">
              <button @click="cancelDialog" class="btn btn-default">Cancel</button>
              <button @click="saveDialog" class="btn btn-primary pull-right">Save</button>
          </div>
      </footer>
  </dialog>
</template>

<script>
export default {
  name: 'm-dialog',
  props: {
    value: {
      type: Boolean,
      default: () => false,
    },
    title: {
      type: String,
      default: () => null,
    }
  },
  methods:{
    cancelDialog(){
      this.$refs.dialog.close();
      this.$emit('input',false);
      this.$emit('close');
    },
    saveDialog(){
      this.$emit('input',false);
      this.$emit('approve',this.$refs.dialog);
    },
  },
  watch:{
    value(v){
      if(v) {
        this.$refs.dialog.showModal();
      }
    },
  },
}
</script>

<style lang="scss">
dialog {
  padding: 0;
  border: 1px solid #bebebe;
  border-radius: 6px;
  box-shadow: 0 0 30px rgba(0,0,0,.1);
  overflow: hidden;
  max-width: 80%;
  min-width: 400px;

  &::backdrop {
      background: rgba(0,0,0,0.2);
  }
}
</style>
