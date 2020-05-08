<template>
  <div id="app">
    여기서 부터 코드를 시작합니다!
    <router-view></router-view>
  </div>
</template>

<script>
import Navbar from "./components/Navbar.vue";
export default {
  name: "app",
  components: { Navbar },
  data() {
    return {};
  }
};
</script>

<style>
</style>