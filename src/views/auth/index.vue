<script setup lang="ts">
const highlights = ['Deep work', 'Project notes', 'Idea timeline']
</script>

<template>
  <main class="auth-page">
    <section class="auth-shell">
      <aside class="auth-brand">
        <div class="auth-brand__top">
          <img class="auth-brand__logo" src="@/assets/images/logo.png" alt="LiFocus">
          <span>LiFocus</span>
        </div>

        <div class="auth-brand__content">
          <p class="auth-brand__eyebrow">
            Rising To The Top
          </p>
          <h1>Focus your thoughts before they fade.</h1>
          <p class="auth-brand__copy">
            Capture projects, notes, and timelines in one quiet place built for momentum.
          </p>
        </div>

        <div class="auth-brand__highlights">
          <span v-for="item in highlights" :key="item">{{ item }}</span>
        </div>
      </aside>

      <section class="auth-panel">
        <RouterView />
      </section>
    </section>

    <footer class="auth-footer">
      @ 2025 Copyright LiFocus. All Rights Reserved. MapleWan
    </footer>
  </main>
</template>

<style scoped>
.auth-page {
  min-height: 100%;
  display: flex;
  flex-direction: column;
  overflow: auto;
  background: linear-gradient(135deg, #f7f8fb 0%, #edf4f2 48%, #f4f1f7 100%);
}

.auth-shell {
  width: min(1120px, calc(100% - 40px));
  min-height: 640px;
  margin: auto;
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(380px, 440px);
  overflow: hidden;
  border: 1px solid rgba(80, 54, 109, 0.12);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.72);
  box-shadow: 0 24px 80px rgba(45, 25, 76, 0.14);
  backdrop-filter: blur(18px);
}

.auth-brand {
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 44px;
  overflow: hidden;
  color: #fff;
  /* background:
    linear-gradient(145deg, rgba(29, 17, 50, 0.94), rgba(37, 78, 72, 0.86)),
    url('@/assets/images/favicon1.jpg') center / cover; */
  background:
    linear-gradient(145deg, rgba(29, 17, 50, 0.94), rgba(37, 78, 72, 0.86))
}

.auth-brand::after {
  content: "";
  position: absolute;
  inset: auto 0 0;
  height: 42%;
  background: linear-gradient(180deg, transparent, rgba(29, 17, 50, 0.74));
}

.auth-brand__top,
.auth-brand__content,
.auth-brand__highlights {
  position: relative;
  z-index: 1;
}

.auth-brand__top {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 20px;
  font-weight: 800;
}

.auth-brand__logo {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  object-fit: cover;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.22);
}

.auth-brand__eyebrow {
  margin: 0 0 14px;
  color: rgba(255, 255, 255, 0.7);
  font-size: 13px;
  font-weight: 700;
  text-transform: uppercase;
}

.auth-brand h1 {
  max-width: 520px;
  margin: 0;
  font-size: 58px;
  line-height: 0.98;
  letter-spacing: 0;
}

.auth-brand__copy {
  max-width: 460px;
  margin: 22px 0 0;
  color: rgba(255, 255, 255, 0.76);
  font-size: 16px;
  line-height: 1.7;
}

.auth-brand__highlights {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.auth-brand__highlights span {
  padding: 9px 12px;
  border: 1px solid rgba(255, 255, 255, 0.22);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.08);
  color: rgba(255, 255, 255, 0.82);
  font-size: 13px;
  font-weight: 700;
}

.auth-brand__highlights span:nth-child(2) {
  border-color: rgba(126, 190, 176, 0.34);
  background: rgba(126, 190, 176, 0.12);
}

@media (max-width: 1060px) {
  .auth-brand h1 {
    font-size: 48px;
  }
}

.auth-panel {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 44px;
  background: rgba(255, 255, 255, 0.9);
}

.auth-footer {
  padding: 18px;
  color: #685182;
  font-size: 12px;
  text-align: center;
}

@media (max-width: 860px) {
  .auth-shell {
    width: min(480px, calc(100% - 28px));
    min-height: auto;
    margin: 20px auto 0;
    grid-template-columns: 1fr;
  }

  .auth-brand {
    min-height: 300px;
    padding: 28px;
  }

  .auth-brand h1 {
    font-size: 36px;
  }

  .auth-panel {
    padding: 28px;
  }
}

@media (max-width: 480px) {
  .auth-shell {
    width: 100%;
    margin-top: 0;
    border-width: 0;
    border-radius: 0;
  }

  .auth-brand {
    min-height: 260px;
    padding: 24px 20px;
  }

  .auth-panel {
    padding: 24px 18px 32px;
  }

  .auth-footer {
    padding: 14px 12px;
  }
}
</style>
