<script setup>
import { profile } from '../data/portfolio'

defineProps({ ready: Boolean })
</script>

<template>
  <section id="top" class="hero" data-stage="1">
    <h1 :class="['side', 'left', { in: ready }]">{{ profile.name }}</h1>
    <p :class="['side', 'right', { in: ready }]">{{ profile.role }}</p>
  </section>
</template>

<style scoped>
.hero {
  position: relative;
  height: 100vh;
  height: 100svh;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 var(--gutter);
}

.side {
  font-size: clamp(1.05rem, 1.6vw, 1.4rem);
  letter-spacing: -0.01em;
  opacity: 0;
  transition:
    opacity 1.4s var(--ease),
    transform 1.4s var(--ease);
}

.left {
  transform: translateX(-24px);
}

.right {
  transform: translateX(24px);
  text-align: right;
}

.side.in {
  opacity: 1;
  transform: none;
}

@media (max-width: 640px) {
  .hero {
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 6px;
    padding-top: 96px;
  }
  .right {
    text-align: left;
    color: var(--muted);
  }
}
</style>
