<script setup>
import { experience } from '../data/portfolio'
</script>

<template>
  <section id="experience" class="experience" data-stage="4">
    <p class="label reveal">Experience</p>
    <ol class="rows">
      <li v-for="job in experience" :key="job.role + job.company" class="row reveal">
        <span class="role">{{ job.role }}</span>
        <span class="company">{{ job.company }}</span>
        <span class="period label">{{ job.period }}</span>
      </li>
    </ol>
  </section>
</template>

<style scoped>
.experience {
  position: relative;
  padding: 16vh var(--gutter) 24vh;
}

.rows {
  list-style: none;
  margin: 32px 0 0;
  padding: 0;
  border-top: 1px solid var(--line);
}

.row {
  display: grid;
  grid-template-columns: 1.2fr 1fr auto;
  align-items: baseline;
  gap: 16px;
  padding: 26px 0;
  border-bottom: 1px solid var(--line);
  font-size: clamp(1.05rem, 1.6vw, 1.4rem);
  letter-spacing: -0.01em;
}

.company {
  color: var(--muted);
}

@media (max-width: 640px) {
  .row {
    grid-template-columns: 1fr;
    gap: 4px;
  }
}
</style>
