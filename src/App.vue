<script setup>
  import HeaderComponent from './components/Header.vue';
  import FooterComponent from './components/Footer.vue';
</script>

<template>
  
  <div class="d-flex flex-column min-vh-100">

  <!-- Header -->
  <HeaderComponent />

  <!-- Контент -->
  <div class="container mt-4 flex-grow-1">
          <RouterView />
      </div>

  </div>

  <!-- Footer -->
  <FooterComponent />
 </template>

<style scoped>

</style>
