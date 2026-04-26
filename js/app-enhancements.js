(function () {
  const state = {
    swipers: [],
    triggers: [],
    mutationObservers: [],
    refreshTimer: 0,
    globalBindingsReady: false,
    audioReady: false,
    audioUnlocked: false
  };

  function getPath() {
    return window.location.pathname.replace(/\\/g, '/');
  }

  function getRootPrefix() {
    return getPath().includes('/pages/') ? '../' : '';
  }

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function getSettings() {
    const dbSettings = window.AppDB?.getData?.()?.settings || {};
    const readBool = (key, fallback) => {
      if (typeof dbSettings[key] === 'boolean') return dbSettings[key];
      const raw = localStorage.getItem(key);
      if (raw === 'true') return true;
      if (raw === 'false') return false;
      return fallback;
    };
    const readVolume = () => {
      const dbValue = Number(dbSettings.volume);
      if (Number.isFinite(dbValue)) return clamp(dbValue, 0, 100);
      const localValue = Number(localStorage.getItem('volume'));
      return Number.isFinite(localValue) ? clamp(localValue, 0, 100) : 70;
    };

    return {
      darkMode: readBool('darkMode', true),
      notifications: readBool('notifications', true),
      musicEnabled: readBool('musicEnabled', true),
      soundEnabled: readBool('soundEnabled', true),
      volume: readVolume(),
      language: dbSettings.language === 'en' || localStorage.getItem('language') === 'en' ? 'en' : 'uk'
    };
  }

  function assetUrl(fileName) {
    return `${getRootPrefix()}assets/audio/${fileName}`;
  }

  function hasGsap() {
    return Boolean(window.gsap);
  }

  function hasScrollTrigger() {
    return Boolean(window.gsap && window.ScrollTrigger);
  }

  function hasSwiper() {
    return typeof window.Swiper === 'function';
  }

  function hasHowler() {
    return typeof window.Howl === 'function' && window.Howler;
  }

  function shouldReduceEffects() {
    const prefersReducedMotion = Boolean(window.matchMedia?.('(prefers-reduced-motion: reduce)').matches);
    const coarsePointer = Boolean(window.matchMedia?.('(pointer: coarse)').matches);
    const lowPowerDevice = Number(navigator.hardwareConcurrency || 0) > 0 && Number(navigator.hardwareConcurrency) <= 4;
    return prefersReducedMotion || coarsePointer || lowPowerDevice;
  }

  function scheduleRefresh() {
    clearTimeout(state.refreshTimer);
    state.refreshTimer = window.setTimeout(refresh, 80);
  }

  function shouldUseAmbient() {
    const path = getPath();
    return (
      path.endsWith('/index.html')
      || path.endsWith('/pages/shop.html')
      || path.endsWith('/pages/character.html')
      || path.endsWith('/pages/setting.html')
      || path.endsWith('/')
    );
  }

  const audio = {
    sounds: {},
    init() {
      if (state.audioReady || !hasHowler()) return;

      this.sounds.click = new window.Howl({
        src: [assetUrl('click.wav')],
        preload: true,
        volume: 0.2
      });

      this.sounds.success = new window.Howl({
        src: [assetUrl('success.wav')],
        preload: true,
        volume: 0.26
      });

      this.sounds.ambient = new window.Howl({
        src: [assetUrl('ambient.wav')],
        preload: false,
        loop: true,
        volume: 0.08
      });

      state.audioReady = true;
      this.bindUnlock();
      this.bindVisibility();
      this.refresh();
    },
    bindUnlock() {
      if (this.unlockBound) return;
      this.unlockBound = true;

      const unlock = () => {
        state.audioUnlocked = true;
        this.refresh();
        window.removeEventListener('pointerdown', unlock, true);
        window.removeEventListener('keydown', unlock, true);
        window.removeEventListener('touchstart', unlock, true);
      };

      window.addEventListener('pointerdown', unlock, true);
      window.addEventListener('keydown', unlock, true);
      window.addEventListener('touchstart', unlock, true);
    },
    bindVisibility() {
      if (this.visibilityBound) return;
      this.visibilityBound = true;
      document.addEventListener('visibilitychange', () => this.refresh());
      window.addEventListener('pageshow', () => this.refresh());
      window.addEventListener('pagehide', () => this.refresh());
    },
    refresh() {
      if (!state.audioReady || !hasHowler()) return;
      const settings = getSettings();
      const masterVolume = clamp(settings.volume / 100, 0, 1);
      window.Howler.volume(masterVolume);

      if (this.sounds.click) this.sounds.click.volume(clamp(0.12 + masterVolume * 0.18, 0.12, 0.32));
      if (this.sounds.success) this.sounds.success.volume(clamp(0.16 + masterVolume * 0.22, 0.16, 0.38));

      if (!this.sounds.ambient) return;

      const ambientVolume = clamp(masterVolume * 0.14, 0.03, 0.14);
      this.sounds.ambient.volume(ambientVolume);

      if (!shouldUseAmbient() || !state.audioUnlocked || !settings.musicEnabled || document.hidden) {
        if (this.sounds.ambient.playing()) this.sounds.ambient.pause();
        return;
      }

      if (this.sounds.ambient.state() === 'unloaded') {
        this.sounds.ambient.load();
      }

      if (!this.sounds.ambient.playing()) {
        this.sounds.ambient.play();
      }
    },
    play(name) {
      if (!state.audioReady) this.init();
      if (!state.audioReady) return;

      const settings = getSettings();
      if (name !== 'ambient' && !settings.soundEnabled) return;

      const sound = this.sounds[name];
      if (!sound) return;

      if (name === 'click') {
        const now = Date.now();
        const elapsed = now - Number(this.lastClickAt || 0);
        if (elapsed < 70) return;
        this.lastClickAt = now;
        sound.stop();
      }

      sound.play();
    }
  };

  function animateIn(elements, options = {}) {
    if (!hasGsap() || shouldReduceEffects()) return;

    const nodes = Array.from(elements).filter((element) => (
      element
      && element.isConnected
      && !element.dataset.fxAnimated
    ));

    if (!nodes.length) return;

    nodes.forEach((node) => {
      node.dataset.fxAnimated = 'true';
    });

    window.gsap.fromTo(nodes, {
      autoAlpha: 0,
      y: options.y ?? 20,
      scale: options.scale ?? 0.98
    }, {
      autoAlpha: 1,
      y: 0,
      scale: 1,
      duration: options.duration ?? 0.7,
      stagger: options.stagger ?? 0.08,
      ease: options.ease ?? 'power2.out',
      overwrite: 'auto',
      clearProps: 'transform,opacity,visibility'
    });
  }

  function animateModal(modal) {
    if (!hasGsap() || shouldReduceEffects()) return;
    const content = modal?.querySelector('.modal-content');
    if (!content) return;

    window.gsap.fromTo(content, {
      autoAlpha: 0,
      y: 20,
      scale: 0.96
    }, {
      autoAlpha: 1,
      y: 0,
      scale: 1,
      duration: 0.32,
      ease: 'power2.out',
      overwrite: 'auto'
    });
  }

  function initScrollReveals() {
    state.triggers.forEach((trigger) => trigger.kill());
    state.triggers = [];

    if (!hasScrollTrigger() || shouldReduceEffects()) return;

    const revealGroups = [];
    const contentPanel = document.querySelector('.content-panel');
    if (contentPanel && document.querySelector('.home-dashboard')) {
      revealGroups.push({
        scroller: contentPanel,
        elements: document.querySelectorAll('.home-panel, .dashboard-section')
      });
    }

    if (document.querySelector('.about-grid')) {
      revealGroups.push({
        scroller: null,
        elements: document.querySelectorAll('.about-card')
      });
    }

    if (document.querySelector('.policy-grid')) {
      revealGroups.push({
        scroller: null,
        elements: document.querySelectorAll('.policy-card')
      });
    }

    if (document.querySelector('.terms-grid')) {
      revealGroups.push({
        scroller: null,
        elements: document.querySelectorAll('.terms-card')
      });
    }

    revealGroups.forEach((group) => {
      Array.from(group.elements).forEach((element) => {
        const tween = window.gsap.fromTo(element, {
          autoAlpha: 0,
          y: 24
        }, {
          autoAlpha: 1,
          y: 0,
          duration: 0.72,
          ease: 'power2.out',
          paused: true
        });

        const trigger = window.ScrollTrigger.create({
          trigger: element,
          start: 'top 92%',
          once: true,
          animation: tween,
          scroller: group.scroller || undefined
        });

        state.triggers.push(trigger);
      });
    });

    window.ScrollTrigger.refresh();
  }

  function cleanupOrphanSwipers() {
    state.swipers = state.swipers.filter((swiper) => {
      if (swiper?.el?.isConnected) return true;
      try {
        swiper.destroy(true, true);
      } catch (error) {
        return false;
      }
      return false;
    });
  }

  function initSwiper(selector, optionsFactory) {
    if (!hasSwiper()) return;

    document.querySelectorAll(`${selector}:not([data-swiper-ready])`).forEach((element) => {
      const slides = element.querySelectorAll('.swiper-slide');
      if (slides.length < 2) return;

      const swiper = new window.Swiper(element, optionsFactory(element));
      element.dataset.swiperReady = 'true';
      state.swipers.push(swiper);
    });
  }

  function initSwipers() {
    cleanupOrphanSwipers();

    initSwiper('.home-category-swiper', (element) => ({
      slidesPerView: 1.18,
      spaceBetween: 12,
      speed: 520,
      grabCursor: true,
      watchOverflow: true,
      pagination: {
        el: element.querySelector('.swiper-pagination'),
        clickable: true
      },
      breakpoints: {
        520: { slidesPerView: 2.2, spaceBetween: 14 },
        900: { slidesPerView: 4, spaceBetween: 14 }
      }
    }));

    initSwiper('.home-games-swiper', (element) => ({
      slidesPerView: 1.08,
      spaceBetween: 12,
      speed: 520,
      grabCursor: true,
      watchOverflow: true,
      pagination: {
        el: element.querySelector('.swiper-pagination'),
        clickable: true
      },
      breakpoints: {
        520: { slidesPerView: 1.5, spaceBetween: 14 },
        900: { slidesPerView: 2.2, spaceBetween: 16 }
      }
    }));

    initSwiper('.home-popular-swiper', (element) => ({
      slidesPerView: 1.08,
      spaceBetween: 12,
      speed: 520,
      grabCursor: true,
      watchOverflow: true,
      pagination: {
        el: element.querySelector('.swiper-pagination'),
        clickable: true
      },
      breakpoints: {
        520: { slidesPerView: 1.65, spaceBetween: 14 },
        900: { slidesPerView: 2.35, spaceBetween: 16 }
      }
    }));
  }

  function watchDynamicRoots() {
    const roots = [
      '#contentContainer',
      '#shopContent',
      '#itemsGrid',
      '.settings-layout',
      '.about-grid',
      '.policy-grid',
      '.terms-grid'
    ];

    roots.forEach((selector) => {
      document.querySelectorAll(selector).forEach((root) => {
        if (root.dataset.fxObserved) return;
        root.dataset.fxObserved = 'true';

        const observer = new MutationObserver(() => scheduleRefresh());
        observer.observe(root, {
          childList: true,
          subtree: true,
          attributes: false
        });
        state.mutationObservers.push(observer);
      });
    });
  }

  function watchToastsAndModals() {
    document.querySelectorAll('.toast, .auth-message').forEach((node) => {
      if (node.dataset.fxToastObserved) return;
      node.dataset.fxToastObserved = 'true';

      const observer = new MutationObserver(() => {
        const visible = node.classList.contains('show') || node.classList.contains('is-visible');
        const text = String(node.textContent || '').trim();
        const signature = `${visible}:${text}`;
        if (!visible || !text || node.dataset.fxToastLast === signature) return;

        node.dataset.fxToastLast = signature;
        audio.play('success');

        if (hasGsap() && !shouldReduceEffects()) {
          window.gsap.fromTo(node, {
            autoAlpha: 0,
            y: -10
          }, {
            autoAlpha: 1,
            y: 0,
            duration: 0.26,
            ease: 'power2.out',
            overwrite: 'auto'
          });
        }
      });

      observer.observe(node, {
        childList: true,
        subtree: true,
        characterData: true,
        attributes: true,
        attributeFilter: ['class']
      });

      state.mutationObservers.push(observer);
    });

    document.querySelectorAll('.modal').forEach((modal) => {
      if (modal.dataset.fxModalObserved) return;
      modal.dataset.fxModalObserved = 'true';

      const observer = new MutationObserver(() => {
        const visible = window.getComputedStyle(modal).display !== 'none';
        if (visible) animateModal(modal);
      });

      observer.observe(modal, {
        attributes: true,
        attributeFilter: ['style', 'class']
      });

      state.mutationObservers.push(observer);
    });
  }

  function bindGlobalInteractions() {
    if (state.globalBindingsReady) return;
    state.globalBindingsReady = true;

    document.addEventListener('pointerdown', (event) => {
      const target = event.target instanceof Element ? event.target : null;
      if (!target) return;

      const clickable = target.closest('button, a, .swiper-pagination-bullet');
      if (clickable) {
        audio.play('click');
        window.setTimeout(() => audio.refresh(), 0);
      }
    }, true);

    document.addEventListener('keydown', (event) => {
      if (event.repeat) return;
      if (event.key !== 'Enter' && event.key !== ' ') return;
      const target = event.target instanceof Element ? event.target : null;
      if (!target?.closest('button, a')) return;
      audio.play('click');
      window.setTimeout(() => audio.refresh(), 0);
    }, true);

    document.addEventListener('input', (event) => {
      const target = event.target instanceof Element ? event.target : null;
      if (!target) return;
      if (target.matches('input[type="range"], select')) {
        window.setTimeout(() => audio.refresh(), 0);
      }
    }, true);

    window.addEventListener('resize', () => scheduleRefresh());
  }

  function initPageAnimations() {
    if (shouldReduceEffects()) return;

    animateIn(document.querySelectorAll('.app-topbar, .bottom-nav'), {
      y: 16,
      scale: 1,
      duration: 0.6,
      stagger: 0.05
    });

    animateIn(document.querySelectorAll('.home-profile-card, .home-panel, .dashboard-section'), {
      y: 22
    });

    animateIn(document.querySelectorAll('.profile-card, .summary-card, .detail-card, .prefs-card, .actions-card, .settings-logout'), {
      y: 20
    });

    animateIn(document.querySelectorAll('.tabs-panel, .product-card, .avatar-item, .achievement-item, .daily-card, .history-item, .shop-empty'), {
      y: 18
    });

    animateIn(document.querySelectorAll('.hero-panel, .inventory-panel, .item-card, .inventory-empty'), {
      y: 18
    });

    animateIn(document.querySelectorAll('.auth-card, .about-card, .policy-card, .terms-card'), {
      y: 18
    });
  }

  function refresh() {
    if (hasScrollTrigger() && !shouldReduceEffects()) {
      window.gsap.registerPlugin(window.ScrollTrigger);
    }

    document.body.classList.add('app-enhanced');
    audio.init();
    audio.refresh();
    bindGlobalInteractions();
    watchDynamicRoots();
    watchToastsAndModals();
    initSwipers();
    initPageAnimations();
    initScrollReveals();
  }

  window.AppEnhancements = {
    refresh: scheduleRefresh,
    refreshAudio: () => audio.refresh(),
    playSound(name) {
      audio.play(name);
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', refresh, { once: true });
  } else {
    refresh();
  }
})();
