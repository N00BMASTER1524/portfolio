<script setup>
import { ref, nextTick, onMounted, onUnmounted } from 'vue'
import { projects } from '../data/portfolio'

// On wide screens the section pins and the cards scroll sideways.
const section = ref(null)
const track = ref(null)
const height = ref('auto')
const offset = ref(0)
const horizontal = ref(false)
let distance = 0
let mq

async function measure() {
  horizontal.value = mq.matches
  await nextTick() // let the horizontal layout apply before measuring
  if (!horizontal.value) {
    height.value = 'auto'
    offset.value = 0
    return
  }
  distance = Math.max(0, track.value.scrollWidth - window.innerWidth)
  height.value = `${distance + window.innerHeight}px`
  onScroll()
}

function onScroll() {
  if (!horizontal.value) return
  const rect = section.value.getBoundingClientRect()
  const travel = rect.height - window.innerHeight
  const progress = travel > 0 ? Math.min(Math.max(-rect.top / travel, 0), 1) : 0
  offset.value = progress * distance
}

onMounted(() => {
  mq = window.matchMedia('(min-width: 900px)')
  measure()
  window.addEventListener('scroll', onScroll, { passive: true })
  window.addEventListener('resize', measure)
})

onUnmounted(() => {
  window.removeEventListener('scroll', onScroll)
  window.removeEventListener('resize', measure)
})
</script>

<template>
  <section id="works" ref="section" class="works" data-stage="4" :data-pin="horizontal ? '' : undefined" :style="{ height }">
    <div :class="['sticky', { horizontal }]">
      <p class="label heading">Some selected works</p>
      <div ref="track" class="track" :style="{ transform: `translate3d(${-offset}px, 0, 0)` }">
        <a
          v-for="(project, i) in projects"
          :key="project.title"
          :href="project.url"
          target="_blank"
          rel="noopener noreferrer"
          class="card"
        >
          <div class="media">
            <img v-if="project.image" :src="project.image" :alt="project.title" loading="lazy" />
            <div v-else class="cover">
              <span class="index">{{ String(i + 1).padStart(2, '0') }}</span>
              <span class="cover-title">{{ project.title }}</span>
              <span class="cover-tags">{{ project.tags.join(' · ') }}</span>
            </div>
          </div>
          <div class="meta">
            <h3>{{ project.title }}</h3>
            <span class="label">{{ project.year }}</span>
          </div>
          <p class="desc">{{ project.description }}</p>
        </a>
        <div class="card end">
          <p class="lead">And still working on plenty more.</p>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.works {
  position: relative;
  padding: 12vh 0;
}

.sticky {
  display: flex;
  flex-direction: column;
  gap: 40px;
}

.sticky.horizontal {
  position: sticky;
  top: 0;
  height: 100vh;
  justify-content: center;
  overflow: hidden;
}

.heading {
  padding: 0 var(--gutter);
}

.horizontal .heading {
  position: absolute;
  top: 88px;
  left: 0;
}

.track {
  display: flex;
  flex-direction: column;
  gap: 64px;
  padding: 0 var(--gutter);
  will-change: transform;
}

.horizontal .track {
  flex-direction: row;
  gap: 8vw;
  width: max-content;
  padding: 0 16vw;
}

.card {
  display: block;
  width: 100%;
}

.horizontal .card {
  width: min(52vw, 820px);
}

.media {
  aspect-ratio: 16 / 9;
  overflow: hidden;
  background: #18171b;
  transition: transform 1s var(--ease);
}

.card:hover .media {
  transform: scale(0.97);
}

.media img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 1.2s var(--ease);
}

.card:hover img {
  transform: scale(1.08);
}

.cover {
  position: relative;
  height: 100%;
  padding: clamp(16px, 2.4vw, 32px);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  background:
    radial-gradient(120% 80% at 100% 0%, rgba(255, 255, 255, 0.06), transparent 60%),
    linear-gradient(160deg, #1d1c21, #121115);
}

.index,
.cover-tags {
  font-size: 0.75rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--muted);
}

.cover-title {
  font-size: clamp(1.8rem, 4.4vw, 4rem);
  font-weight: 500;
  letter-spacing: -0.04em;
  line-height: 1;
  text-transform: uppercase;
}

.meta {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 16px;
  margin-top: 16px;
}

h3 {
  font-size: clamp(1.1rem, 1.5vw, 1.35rem);
  letter-spacing: -0.01em;
}

.desc {
  margin-top: 6px;
  color: var(--muted);
  font-size: 0.95rem;
}

.end {
  display: flex;
  align-items: center;
}

.horizontal .end {
  width: 28vw;
}

.end .lead {
  color: var(--muted);
}
</style>
