// Point-cloud generators. Every shape returns a Float32Array of `count` xyz
// triplets in screen-pixel units, centred on the viewport.

const TAU = Math.PI * 2

function gauss() {
  // Approximate standard normal (sum of uniforms)
  return (Math.random() + Math.random() + Math.random() - 1.5) / 1.5
}

export function stars(count, w, h) {
  const out = new Float32Array(count * 3)
  for (let i = 0; i < count; i++) {
    out[i * 3] = (Math.random() - 0.5) * w * 1.15
    out[i * 3 + 1] = (Math.random() - 0.5) * h * 1.15
    out[i * 3 + 2] = (Math.random() - 0.5) * 800
  }
  return out
}

// Sample filled pixels of a 2D drawing. Returns coords normalised by the
// canvas width (y up, aspect kept) so the result can be rescaled on resize.
export function sampleDrawing(draw, count, cw = 600, ch = 600) {
  const canvas = document.createElement('canvas')
  canvas.width = cw
  canvas.height = ch
  const ctx = canvas.getContext('2d', { willReadFrequently: true })
  draw(ctx, cw, ch)
  const { data } = ctx.getImageData(0, 0, cw, ch)

  // Brighter pixels are more likely to be picked, so a photo keeps its inner
  // detail (hands, arms, phone) instead of becoming a flat silhouette.
  // Brightness is contrast-stretched within the shape first.
  let lo = 1
  let hi = 0
  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] < 64) continue
    const lum = (data[i] * 0.3 + data[i + 1] * 0.59 + data[i + 2] * 0.11) / 255
    if (lum < lo) lo = lum
    if (lum > hi) hi = lum
  }
  const range = Math.max(hi - lo, 0.001)

  const filled = []
  for (let y = 0; y < ch; y += 1) {
    for (let x = 0; x < cw; x += 1) {
      const i = (y * cw + x) * 4
      const alpha = data[i + 3] / 255
      if (alpha < 0.25) continue
      const lum = (data[i] * 0.3 + data[i + 1] * 0.59 + data[i + 2] * 0.11) / 255
      const n = (lum - lo) / range
      if (Math.random() < alpha * (0.06 + 0.94 * Math.pow(n, 1.6))) filled.push(x, y)
    }
  }

  const out = new Float32Array(count * 2)
  const n = filled.length / 2
  for (let i = 0; i < count; i++) {
    if (n === 0) break
    const k = Math.floor(Math.random() * n)
    // jitter within the pixel so the cloud doesn't look gridded
    out[i * 2] = (filled[k * 2] + Math.random() - cw / 2) / cw
    out[i * 2 + 1] = (ch / 2 - filled[k * 2 + 1] - Math.random()) / cw
  }
  return out
}

export function drawInitials(text) {
  return (ctx, cw, ch) => {
    ctx.fillStyle = '#fff'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.font = `700 ${ch * 0.62}px Inter, system-ui, sans-serif`
    ctx.fillText(text, cw / 2, ch / 2)
  }
}

export function drawImage(img) {
  return (ctx, cw, ch) => {
    const scale = Math.min(cw / img.width, ch / img.height)
    const iw = img.width * scale
    const ih = img.height * scale
    ctx.drawImage(img, (cw - iw) / 2, ch - ih, iw, ih)
  }
}

export function fromSample(sample, count, size) {
  const out = new Float32Array(count * 3)
  for (let i = 0; i < count; i++) {
    out[i * 3] = sample[i * 2] * size
    out[i * 3 + 1] = sample[i * 2 + 1] * size
    out[i * 3 + 2] = gauss() * 18
  }
  return out
}

// Sphere cut into horizontal slices that slide past each other.
export function slicedSphere(count, w, h) {
  const out = new Float32Array(count * 3)
  const r = Math.min(w, h) * 0.3
  const slices = 7
  for (let i = 0; i < count; i++) {
    const u = Math.random() * 2 - 1
    const theta = Math.random() * TAU
    const s = Math.sqrt(1 - u * u)
    const band = Math.min(slices - 1, Math.floor(((u + 1) / 2) * slices))
    const shift = (band % 2 ? 1 : -1) * r * 0.1 * Math.sin(band * 1.7)
    const rr = r * (1 + gauss() * 0.015)
    out[i * 3] = s * Math.cos(theta) * rr + shift
    out[i * 3 + 1] = u * rr + (band - (slices - 1) / 2) * r * 0.06
    out[i * 3 + 2] = s * Math.sin(theta) * rr
  }
  return out
}

// Double helix running along the x axis (tilted and spun in the shader).
export function helix(count, w, h) {
  const out = new Float32Array(count * 3)
  const len = Math.max(w, h) * 1.5
  const r = Math.min(w, h) * 0.17
  const turns = 2.2
  for (let i = 0; i < count; i++) {
    const x = (Math.random() - 0.5) * len
    const t = (x / len) * TAU * turns
    let y, z
    if (Math.random() < 0.12) {
      // rungs between strands
      const rung = Math.round(t / 0.5) * 0.5
      const xr = (rung / (TAU * turns)) * len
      const k = Math.random() * 2 - 1
      out[i * 3] = xr + gauss() * 3
      y = r * Math.cos(rung) * k
      z = r * Math.sin(rung) * k
    } else {
      const phase = Math.random() < 0.5 ? 0 : Math.PI
      const spread = r * 0.09
      out[i * 3] = x
      y = r * Math.cos(t + phase) + gauss() * spread
      z = r * Math.sin(t + phase) + gauss() * spread
    }
    out[i * 3 + 1] = y
    out[i * 3 + 2] = z
  }
  return out
}

// Twisting ribbon that flows behind the work gallery.
export function ribbon(count, w, h) {
  const out = new Float32Array(count * 3)
  const len = w * 1.5
  const width = Math.min(w, h) * 0.16
  for (let i = 0; i < count; i++) {
    const x = (Math.random() - 0.5) * len
    const edge = Math.random() < 0.6
    const v = edge ? (Math.random() < 0.5 ? -1 : 1) * (0.92 + Math.random() * 0.08) : Math.random() * 2 - 1
    const a = x * 0.0028
    out[i * 3] = x
    out[i * 3 + 1] = v * width * Math.cos(a) + x * 0.18 + gauss() * 4
    out[i * 3 + 2] = v * width * Math.sin(a)
  }
  return out
}

// Rectangular frame of the given size, with a soft, grainy border.
export function frame(count, fw, fh) {
  const out = new Float32Array(count * 3)
  const thickness = 26
  const perimeter = 2 * (fw + fh)
  for (let i = 0; i < count; i++) {
    let d = Math.random() * perimeter
    let x, y
    const off = Math.abs(gauss()) * thickness
    if (d < fw) {
      x = d - fw / 2
      y = fh / 2 + off
    } else if ((d -= fw) < fh) {
      x = fw / 2 + off
      y = fh / 2 - d
    } else if ((d -= fh) < fw) {
      x = fw / 2 - d
      y = -fh / 2 - off
    } else {
      d -= fw
      x = -fw / 2 - off
      y = -fh / 2 + d
    }
    out[i * 3] = x
    out[i * 3 + 1] = y
    out[i * 3 + 2] = gauss() * 10
  }
  return out
}
