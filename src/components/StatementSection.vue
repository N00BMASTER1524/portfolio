<script setup>
import { profile, skills } from '../data/portfolio'
</script>

<template>
  <section class="statement" data-stage="3">
    <p class="lead reveal">{{ profile.statement }}</p>
    <div class="skills">
      <div v-for="group in skills" :key="group.group" class="group reveal">
        <h3 class="label">{{ group.group }}</h3>
        <ul>
          <li v-for="item in group.items" :key="item">{{ item }}</li>
        </ul>
      </div>
    </div>
  </section>
</template>

<style scoped>
.statement {
  position: relative;
  min-height: 140vh;
  padding: 30vh var(--gutter) 14vh;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 30vh;
}

.lead {
  align-self: flex-end;
  max-width: 38ch;
  text-align: right;
}

.skills {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 32px;
  max-width: 760px;
}

.group:nth-child(2) {
  transition-delay: 0.08s;
}
.group:nth-child(3) {
  transition-delay: 0.16s;
}
.group:nth-child(4) {
  transition-delay: 0.24s;
}

h3 {
  margin-bottom: 14px;
}

ul {
  list-style: none;
  margin: 0;
  padding: 0;
  font-size: 0.95rem;
  line-height: 1.7;
}

@media (max-width: 640px) {
  .lead {
    text-align: left;
    align-self: stretch;
  }
  .skills {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
