<script setup>
import { profile } from '../data/portfolio'
</script>

<template>
  <section id="contact" class="contact" data-stage="5">
    <div id="contact-box" class="box">
      <p class="label">Get in touch</p>
      <a :href="`mailto:${profile.email}`" class="email">{{ profile.email }}</a>
      <p class="others">
        or find me on
        <template v-for="(s, i) in profile.socials" :key="s.label">
          <a :href="s.url" target="_blank" rel="noopener noreferrer" class="link-underline">{{ s.label }}</a
          ><span v-if="i < profile.socials.length - 1">, </span>
        </template>
        <template v-if="profile.resumeUrl">
          · <a :href="profile.resumeUrl" target="_blank" rel="noopener noreferrer" class="link-underline">Resume</a>
        </template>
      </p>
    </div>
  </section>
</template>

<style scoped>
.contact {
  position: relative;
  height: 100vh;
  height: 100svh;
  display: grid;
  place-items: center;
  padding: 0 var(--gutter);
}

.box {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 18px;
  padding: clamp(28px, 4vw, 44px) clamp(24px, 4vw, 56px);
  text-align: center;
  max-width: 100%;
}

.email {
  font-size: clamp(1.6rem, 5vw, 4.2rem);
  letter-spacing: -0.035em;
  line-height: 1;
  overflow-wrap: anywhere;
  transition: opacity 0.4s;
}

.email:hover {
  opacity: 0.7;
}

.others {
  color: var(--muted);
  font-size: 0.95rem;
}

.others a {
  color: var(--text);
}
</style>
