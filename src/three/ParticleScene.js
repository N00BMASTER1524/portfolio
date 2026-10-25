import {
  WebGLRenderer,
  Scene,
  OrthographicCamera,
  BufferGeometry,
  BufferAttribute,
  ShaderMaterial,
  Points,
  AdditiveBlending,
  Vector2,
} from 'three'
import * as shapes from './shapes'

// One point cloud that morphs through a sequence of shapes as `stage` goes
// from 0 to SHAPES.length - 1. Units are screen pixels (orthographic camera).
const SHAPES = ['aStars', 'aPortrait', 'aSphere', 'aHelix', 'aRibbon', 'aFrame']

const vertexShader = /* glsl */ `
  attribute vec3 aStars;
  attribute vec3 aPortrait;
  attribute vec3 aSphere;
  attribute vec3 aHelix;
  attribute vec3 aRibbon;
  attribute vec3 aFrame;
  attribute vec4 aRand;

  uniform float uStage;
  uniform float uTime;
  uniform float uSize;
  uniform float uPixelRatio;
  uniform vec2 uMouse;
  uniform float uMouseForce;
  uniform vec2 uFrameOffset;
  uniform vec2 uPortraitOffset;

  varying float vAlpha;

  vec3 rotY(vec3 p, float a) { float c = cos(a), s = sin(a); return vec3(c * p.x + s * p.z, p.y, -s * p.x + c * p.z); }
  vec3 rotX(vec3 p, float a) { float c = cos(a), s = sin(a); return vec3(p.x, c * p.y - s * p.z, s * p.y + c * p.z); }
  vec2 rot2(vec2 p, float a) { float c = cos(a), s = sin(a); return vec2(c * p.x - s * p.y, s * p.x + c * p.y); }

  void main() {
    // Stagger each particle within a transition so morphs feel organic.
    // Integer stages stay exact, so a resting shape is always crisp.
    float base = floor(clamp(uStage, 0.0, 4.999));
    float f = clamp((uStage - base - aRand.x * 0.4) / 0.6, 0.0, 1.0);
    float stage = base + f;

    vec3 portrait = aPortrait + vec3(uPortraitOffset, 0.0);
    vec3 sphere = rotY(aSphere, uTime * 0.18);
    vec3 helix = rotX(aHelix, uTime * 0.3);
    helix.xy = rot2(helix.xy, 0.32);
    vec3 ribbon = aRibbon;
    ribbon.y += sin(ribbon.x * 0.004 + uTime * 0.5) * 50.0;
    ribbon = rotX(ribbon, sin(uTime * 0.2) * 0.4);
    vec3 frame = aFrame + vec3(uFrameOffset, 0.0);

    vec3 p = aStars;
    p = mix(p, portrait, smoothstep(0.0, 1.0, clamp(stage, 0.0, 1.0)));
    p = mix(p, sphere, smoothstep(0.0, 1.0, clamp(stage - 1.0, 0.0, 1.0)));
    p = mix(p, helix, smoothstep(0.0, 1.0, clamp(stage - 2.0, 0.0, 1.0)));
    p = mix(p, ribbon, smoothstep(0.0, 1.0, clamp(stage - 3.0, 0.0, 1.0)));
    p = mix(p, frame, smoothstep(0.0, 1.0, clamp(stage - 4.0, 0.0, 1.0)));

    // Burst outward mid-transition
    float burst = sin(3.14159 * f);
    p += (aRand.yzw - 0.5) * burst * 140.0;

    // Gentle idle drift
    p += vec3(
      sin(uTime * 0.7 + aRand.y * 6.283),
      cos(uTime * 0.6 + aRand.z * 6.283),
      0.0
    ) * (1.0 + aRand.w * 2.0);

    // Push particles away from the cursor
    vec2 d = p.xy - uMouse;
    float dist = length(d);
    float force = smoothstep(160.0, 0.0, dist) * uMouseForce;
    p.xy += (d / max(dist, 0.001)) * force * 60.0;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);

    float depth = clamp(1.0 + p.z / 700.0, 0.45, 1.7);
    gl_PointSize = uSize * uPixelRatio * (0.5 + aRand.w * 1.0) * depth;
    vAlpha = (0.25 + 0.75 * aRand.y) * clamp(depth, 0.5, 1.0);
  }
`

const fragmentShader = /* glsl */ `
  varying float vAlpha;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    if (d > 0.5) discard;
    float a = smoothstep(0.5, 0.05, d) * vAlpha;
    gl_FragColor = vec4(vec3(0.93, 0.93, 0.95), a * 0.85);
  }
`

export class ParticleScene {
  constructor(canvas, { portraitSample, portraitMode = 'text', reducedMotion = false }) {
    this.canvas = canvas
    this.reducedMotion = reducedMotion
    this.portraitSample = portraitSample
    this.portraitMode = portraitMode
    this.stage = 0
    this.targetStage = 0
    this.mouse = new Vector2(99999, 99999)
    this.mouseForce = 0
    this.frameRect = { w: 600, h: 260, x: 0, y: 0 }

    this.renderer = new WebGLRenderer({ canvas, antialias: false, alpha: true, powerPreference: 'high-performance' })
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    this.scene = new Scene()
    this.camera = new OrthographicCamera(-1, 1, 1, -1, -3000, 3000)

    this.geometry = new BufferGeometry()
    this.material = new ShaderMaterial({
      vertexShader,
      fragmentShader,
      transparent: true,
      depthWrite: false,
      blending: AdditiveBlending,
      uniforms: {
        uStage: { value: 0 },
        uTime: { value: 0 },
        uSize: { value: 2.6 },
        uPixelRatio: { value: this.renderer.getPixelRatio() },
        uMouse: { value: this.mouse },
        uMouseForce: { value: 0 },
        uFrameOffset: { value: new Vector2() },
        uPortraitOffset: { value: new Vector2() },
      },
    })
    this.points = new Points(this.geometry, this.material)
    this.points.frustumCulled = false
    this.scene.add(this.points)

    this.start = performance.now()
    this.resize()
    this.loop = this.loop.bind(this)
    this.raf = requestAnimationFrame(this.loop)
  }

  build() {
    const { w, h } = this
    const count = w < 760 ? 14000 : 26000
    this.count = count
    const g = this.geometry

    const starsPos = shapes.stars(count, w, h)
    let portrait
    if (this.portraitMode === 'image') {
      // Photo silhouette: stands on the bottom edge of the screen, like a bust
      const size = Math.min(h * 0.88, w * 1.2)
      portrait = shapes.fromSample(this.portraitSample, count, size)
      const shift = -(h - size) / 2 - size * 0.04
      for (let i = 1; i < portrait.length; i += 3) portrait[i] += shift
    } else {
      portrait = shapes.fromSample(this.portraitSample, count, Math.min(w * (w < 760 ? 0.92 : 0.75), h * 1.2))
    }
    const sets = {
      aStars: starsPos,
      aPortrait: portrait,
      aSphere: shapes.slicedSphere(count, w, h),
      aHelix: shapes.helix(count, w, h),
      aRibbon: shapes.ribbon(count, w, h),
      aFrame: shapes.frame(count, this.frameRect.w, this.frameRect.h),
    }

    // ~12% of particles stay as a background star field in every stage.
    const rand = new Float32Array(count * 4)
    for (let i = 0; i < count; i++) {
      rand[i * 4] = Math.random()
      rand[i * 4 + 1] = Math.random()
      rand[i * 4 + 2] = Math.random()
      rand[i * 4 + 3] = Math.random()
      if (i < count * 0.12) {
        for (const key of SHAPES.slice(1)) {
          sets[key][i * 3] = starsPos[i * 3]
          sets[key][i * 3 + 1] = starsPos[i * 3 + 1]
          sets[key][i * 3 + 2] = starsPos[i * 3 + 2]
        }
      }
    }
    this.starCount = Math.floor(count * 0.12)

    g.setAttribute('position', new BufferAttribute(new Float32Array(count * 3), 3))
    for (const key of SHAPES) g.setAttribute(key, new BufferAttribute(sets[key], 3))
    g.setAttribute('aRand', new BufferAttribute(rand, 4))
  }

  setFrameRect(rect) {
    const changed = Math.abs(rect.w - this.frameRect.w) > 1 || Math.abs(rect.h - this.frameRect.h) > 1
    this.frameRect = rect
    // Centre of the DOM box in world coords
    this.material.uniforms.uFrameOffset.value.set(rect.x - this.w / 2, this.h / 2 - rect.y)
    if (changed && this.geometry.attributes.aFrame) {
      const pos = shapes.frame(this.count, rect.w, rect.h)
      const stars = this.geometry.attributes.aStars.array
      pos.set(stars.subarray(0, this.starCount * 3))
      this.geometry.attributes.aFrame.array.set(pos)
      this.geometry.attributes.aFrame.needsUpdate = true
    }
  }

  setPortraitOffset(y) {
    this.material.uniforms.uPortraitOffset.value.set(0, y)
  }

  setStage(stage) {
    this.targetStage = stage
  }

  setMouse(x, y) {
    if (x === null) {
      this.mouseForce = 0
      return
    }
    this.mouse.set(x - this.w / 2, this.h / 2 - y)
    this.mouseForce = 1
  }

  resize() {
    this.w = window.innerWidth
    this.h = window.innerHeight
    this.renderer.setSize(this.w, this.h, false)
    Object.assign(this.camera, { left: -this.w / 2, right: this.w / 2, top: this.h / 2, bottom: -this.h / 2 })
    this.camera.updateProjectionMatrix()
    this.build()
  }

  loop(now) {
    const t = (now - this.start) / 1000
    const u = this.material.uniforms
    // Ease toward the scroll-driven stage for a soft, weighty feel
    this.stage += (this.targetStage - this.stage) * (this.reducedMotion ? 1 : 0.08)
    u.uStage.value = this.stage
    u.uTime.value = this.reducedMotion ? 0 : t
    u.uMouseForce.value += (this.mouseForce - u.uMouseForce.value) * 0.08
    this.renderer.render(this.scene, this.camera)
    this.raf = requestAnimationFrame(this.loop)
  }

  dispose() {
    cancelAnimationFrame(this.raf)
    this.geometry.dispose()
    this.material.dispose()
    this.renderer.dispose()
  }
}
