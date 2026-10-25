<script setup>
import { profile } from '../data/portfolio'
</script>

<template>
  <section id="about" class="intro" data-stage="2">
    <p class="lead reveal">{{ profile.intro }}</p>
    <p class="label location reveal">{{ profile.location }}</p>
  </section>
</template>

<style scoped>
.intro {
  position: relative;
  min-height: 130vh;
  padding: 18vh var(--gutter);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.lead {
  max-width: 34ch;
}

.location {
  align-self: flex-end;
}
</style>
