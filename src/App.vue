<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import Lenis from 'lenis'
import ParticleCanvas from './components/ParticleCanvas.vue'
import TopBar from './components/TopBar.vue'
import HeroSection from './components/HeroSection.vue'
import IntroSection from './components/IntroSection.vue'
import StatementSection from './components/StatementSection.vue'
import WorksSection from './components/WorksSection.vue'
import ExperienceSection from './components/ExperienceSection.vue'
import ContactSection from './components/ContactSection.vue'
import { profile } from './data/portfolio'

const ready = ref(false)
let lenis
let observer
let rafId

function raf(time) {
  lenis.raf(time)
  rafId = requestAnimationFrame(raf)
}

// Smooth-scroll in-page anchor links.
function onClick(e) {
  const a = e.target.closest('a[href^="#"]')
  if (!a || !lenis) return
  e.preventDefault()
  const hash = a.getAttribute('href')
  lenis.scrollTo(hash === '#top' ? 0 : hash, { duration: 1.6 })
}

function onReady() {
  ready.value = true
  observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible')
          observer.unobserve(entry.target)
        }
      })
    },
    { threshold: 0.15 },
  )
  document.querySelectorAll('.reveal').forEach((el) => observer.observe(el))
}

onMounted(() => {
  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    lenis = new Lenis({ lerp: 0.09 })
    rafId = requestAnimationFrame(raf)
  }
  document.addEventListener('click', onClick)
})

onUnmounted(() => {
  cancelAnimationFrame(rafId)
  lenis?.destroy()
  observer?.disconnect()
  document.removeEventListener('click', onClick)
})
</script>

<template>
  <ParticleCanvas @ready="onReady" />
  <TopBar :ready="ready" />
  <main>
    <HeroSection :ready="ready" />
    <IntroSection />
    <StatementSection />
    <WorksSection />
    <ExperienceSection />
    <ContactSection />
  </main>
  <footer class="footer">
    <span class="label">{{ profile.name }} — © {{ new Date().getFullYear() }}</span>
    <span class="label">Built with Vue &amp; three.js</span>
  </footer>
</template>

<style scoped>
.footer {
  position: relative;
  z-index: 1;
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 8px 24px;
  padding: 28px var(--gutter) 36px;
}
</style>
