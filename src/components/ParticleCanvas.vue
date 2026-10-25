<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { sampleDrawing, drawInitials, drawImage } from '../three/shapes'
import { profile } from '../data/portfolio'

const emit = defineEmits(['ready'])
const canvas = ref(null)
let scene
let ranges = []

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}

async function portraitSample() {
  if (profile.portrait) {
    try {
      const img = await loadImage(profile.portrait)
      return { sample: sampleDrawing(drawImage(img), 30000), mode: 'image' }
    } catch {
      // fall through to initials
    }
  }
  const initials = profile.name
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
  return { sample: sampleDrawing(drawInitials(initials), 30000, 900, 600), mode: 'text' }
}

// Each [data-stage] section holds its shape over a scroll range; between
// ranges the stage interpolates, so the cloud morphs while you scroll.
function measure() {
  const vh = window.innerHeight
  const max = document.documentElement.scrollHeight - vh
  ranges = [...document.querySelectorAll('[data-stage]')].map((el) => {
    const top = el.offsetTop
    const h = el.offsetHeight
    const stage = Number(el.dataset.stage)
    let start, end
    if (el.dataset.pin !== undefined) {
      start = top
      end = top + h - vh
    } else {
      const center = top + h / 2 - vh / 2
      start = center - h * 0.12
      end = center + h * 0.12
    }
    return { stage, start: Math.min(Math.max(start, 0), max), end: Math.min(Math.max(end, 0), max) }
  })
  ranges[0].start = 0
}

function stageAt(y) {
  if (!ranges.length) return 1
  if (y <= ranges[0].end) return ranges[0].stage
  for (let i = 0; i < ranges.length - 1; i++) {
    const a = ranges[i]
    const b = ranges[i + 1]
    if (y <= a.end) return a.stage
    if (y < b.start) return a.stage + ((y - a.end) / (b.start - a.end)) * (b.stage - a.stage)
  }
  return ranges[ranges.length - 1].stage
}

function update() {
  if (!scene) return
  const y = window.scrollY
  scene.setStage(stageAt(y))
  scene.setPortraitOffset(Math.min(y, window.innerHeight * 1.2))
  const box = document.getElementById('contact-box')
  if (box) {
    const r = box.getBoundingClientRect()
    scene.setFrameRect({ w: r.width + 40, h: r.height + 40, x: r.left + r.width / 2, y: r.top + r.height / 2 })
  }
}

function onResize() {
  if (!scene) return
  scene.resize()
  measure()
  update()
}

function onPointerMove(e) {
  scene?.setMouse(e.clientX, e.clientY)
}

function onPointerLeave() {
  scene?.setMouse(null)
}

let resizeObserver

onMounted(async () => {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  await document.fonts?.ready
  try {
    // Loaded on demand so text renders before three.js arrives
    const { ParticleScene } = await import('../three/ParticleScene')
    const portrait = await portraitSample()
    scene = new ParticleScene(canvas.value, {
      portraitSample: portrait.sample,
      portraitMode: portrait.mode,
      reducedMotion,
    })
  } catch (err) {
    // No WebGL — the page still works without the particles.
    console.warn('Particles disabled:', err)
    emit('ready')
    return
  }

  measure()
  update()
  window.addEventListener('scroll', update, { passive: true })
  window.addEventListener('resize', onResize)
  window.addEventListener('pointermove', onPointerMove, { passive: true })
  document.addEventListener('pointerleave', onPointerLeave)
  // Re-measure when layout height changes (images, fonts, pinned sections)
  resizeObserver = new ResizeObserver(() => {
    measure()
    update()
  })
  resizeObserver.observe(document.body)

  setTimeout(() => emit('ready'), reducedMotion ? 0 : 900)
})

onUnmounted(() => {
  window.removeEventListener('scroll', update)
  window.removeEventListener('resize', onResize)
  window.removeEventListener('pointermove', onPointerMove)
  document.removeEventListener('pointerleave', onPointerLeave)
  resizeObserver?.disconnect()
  scene?.dispose()
})
</script>

<template>
  <canvas ref="canvas" class="particles" aria-hidden="true"></canvas>
</template>

<style scoped>
.particles {
  position: fixed;
  inset: 0;
  width: 100vw;
  height: 100vh;
  z-index: 0;
  pointer-events: none;
}
</style>
