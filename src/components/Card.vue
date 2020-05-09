<template>
  <div>
    Card
    <div>{{cid}}</div>
  </div>
</template>

<script>
export default {
  watch: {
    $route() {
      this.cid = this.$route.params.cid;
    }
  },
  data() {
    return {
      cid: 0
    };
  }
};
</script>

<style scoped>
</style>