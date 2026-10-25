<script setup>
import { profile } from '../data/portfolio'

defineProps({ ready: Boolean })

const initials = profile.name
  .split(' ')
  .map((p) => p[0])
  .join('')
  .slice(0, 2)
</script>

<template>
  <header :class="['topbar', { ready }]">
    <a href="#top" class="mark" aria-label="Back to top">{{ initials }}</a>
    <nav class="links">
      <a href="#works" class="label link-underline">Work</a>
      <a href="#contact" class="label link-underline">Contact</a>
    </nav>
  </header>
</template>

<style scoped>
.topbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24px var(--gutter);
  mix-blend-mode: difference;
  opacity: 0;
  transition: opacity 1.2s var(--ease) 0.4s;
}

.topbar.ready {
  opacity: 1;
}

.mark {
  font-weight: 500;
  font-size: 0.95rem;
  letter-spacing: -0.02em;
}

.links {
  display: flex;
  gap: 28px;
}

.links .label {
  color: var(--text);
}
</style>
