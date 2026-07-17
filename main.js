const menuButton = document.querySelector('.menu-button');
const nav = document.querySelector('.nav');

window.lucide?.createIcons({
  attrs: {
    'stroke-width': 1.65,
  },
});

menuButton?.addEventListener('click', () => {
  const isOpen = nav.classList.toggle('is-open');
  menuButton.setAttribute('aria-expanded', String(isOpen));
});

nav?.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => {
  nav.classList.remove('is-open');
  menuButton?.setAttribute('aria-expanded', 'false');
}));

const hero = document.querySelector('[data-hero]');
const heroVideo = document.querySelector('[data-hero-video]');

if (hero) {
  const revealHero = () => {
    hero.classList.remove('is-intro-pending');
    hero.classList.add('is-intro-ready');
  };

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (reduceMotion || !heroVideo) {
    revealHero();
  } else {
    hero.classList.add('is-intro-pending');
    heroVideo.addEventListener('ended', revealHero, { once: true });
    heroVideo.addEventListener('error', revealHero, { once: true });
    window.setTimeout(() => {
      if (heroVideo.readyState < HTMLMediaElement.HAVE_METADATA) revealHero();
    }, 1800);
    window.setTimeout(revealHero, 8000);

    const playback = heroVideo.play();
    playback?.catch(revealHero);
  }
}

document.addEventListener('keydown', (event) => {
  if (event.key !== 'Escape') return;
  nav?.classList.remove('is-open');
  menuButton?.setAttribute('aria-expanded', 'false');
});

const menuScene = document.querySelector('[data-menu-scene]');
const menuCarousel = document.querySelector('[data-menu-carousel]');
const menuItems = [...document.querySelectorAll('[data-menu-item]')];
const menuVisuals = [...document.querySelectorAll('[data-menu-visual]')];
let activeMenuIndex = 0;
let menuScrollFrame = 0;

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
const lerp = (start, end, progress) => start + (end - start) * progress;

const setActiveMenuProduct = (index) => {
  if (index === activeMenuIndex) return;
  activeMenuIndex = index;
  menuItems.forEach((item, itemIndex) => item.classList.toggle('is-active', itemIndex === activeMenuIndex));
};

const getOrbitSlots = () => {
  const width = menuCarousel.clientWidth;
  const height = menuCarousel.clientHeight;
  const right = Math.min(width * .32, 225);
  const left = Math.min(width * .28, 195);
  const up = Math.min(height * .31, 180);
  const down = Math.min(height * .29, 165);

  return [
    { x: 0, y: 0, scale: 1, blur: 0, opacity: 1, rotation: 0, zIndex: 6 },
    { x: right, y: -up, scale: .54, blur: 1.7, opacity: .52, rotation: 15, zIndex: 5 },
    { x: right * .9, y: down, scale: .43, blur: 3, opacity: .33, rotation: 27, zIndex: 4 },
    { x: -left, y: down * 1.12, scale: .39, blur: 4, opacity: .22, rotation: -20, zIndex: 3 },
    { x: -left * .92, y: -up * .82, scale: .42, blur: 3.4, opacity: .29, rotation: -26, zIndex: 4 },
    { x: right * .18, y: -up * 1.3, scale: .4, blur: 4, opacity: .2, rotation: 7, zIndex: 3 },
  ];
};

const renderMenuScroll = () => {
  menuScrollFrame = 0;
  if (!menuScene || !menuCarousel || menuItems.length !== menuVisuals.length || !menuItems.length) return;
  if (window.matchMedia('(max-width: 720px)').matches) return;

  const distance = Math.max(menuScene.offsetHeight - window.innerHeight, 1);
  const progress = clamp(-menuScene.getBoundingClientRect().top / distance, 0, 1);
  const journey = progress * (menuItems.length - 1);
  const baseIndex = Math.min(menuItems.length - 1, Math.floor(journey));
  const stepProgress = baseIndex === menuItems.length - 1 ? 0 : journey - baseIndex;
  const activeIndex = Math.min(menuItems.length - 1, Math.floor(journey + .5));
  const slots = getOrbitSlots();
  const arcProgress = Math.sin(stepProgress * Math.PI);

  setActiveMenuProduct(activeIndex);
  menuScene.style.setProperty('--scroll-progress', String(progress));
  menuCarousel.style.setProperty('--scroll-progress', String(progress));

  menuVisuals.forEach((visual, visualIndex) => {
    const relativeIndex = (visualIndex - baseIndex + menuVisuals.length) % menuVisuals.length;
    const start = slots[relativeIndex];
    const end = slots[(relativeIndex - 1 + menuVisuals.length) % menuVisuals.length];
    const isLeavingCenter = relativeIndex === 0;
    const isEnteringCenter = relativeIndex === 1;
    const arcX = isLeavingCenter ? -menuCarousel.clientWidth * .18 * arcProgress : isEnteringCenter ? menuCarousel.clientWidth * .08 * arcProgress : 0;
    const arcY = isLeavingCenter ? menuCarousel.clientHeight * .22 * arcProgress : isEnteringCenter ? -menuCarousel.clientHeight * .13 * arcProgress : 0;

    visual.style.setProperty('--orbit-x', `${lerp(start.x, end.x, stepProgress) + arcX}px`);
    visual.style.setProperty('--orbit-y', `${lerp(start.y, end.y, stepProgress) + arcY}px`);
    visual.style.setProperty('--orbit-scale', String(lerp(start.scale, end.scale, stepProgress)));
    visual.style.setProperty('--orbit-blur', `${lerp(start.blur, end.blur, stepProgress)}px`);
    visual.style.setProperty('--orbit-saturation', String(lerp(start.blur ? .72 : 1, end.blur ? .72 : 1, stepProgress)));
    visual.style.setProperty('--orbit-rotation', `${lerp(start.rotation, end.rotation, stepProgress)}deg`);
    visual.style.opacity = String(lerp(start.opacity, end.opacity, stepProgress));
    visual.style.zIndex = String(Math.round(lerp(start.zIndex, end.zIndex, stepProgress)));
  });
};

const requestMenuScrollRender = () => {
  if (menuScrollFrame) return;
  menuScrollFrame = requestAnimationFrame(renderMenuScroll);
};

if (menuScene && menuCarousel && menuItems.length === menuVisuals.length && menuItems.length) {
  menuScene.style.setProperty('--menu-products', String(menuItems.length));
  menuItems.forEach((item, index) => item.classList.toggle('is-active', index === 0));
  window.addEventListener('scroll', requestMenuScrollRender, { passive: true });
  window.addEventListener('resize', requestMenuScrollRender);
  new ResizeObserver(requestMenuScrollRender).observe(menuCarousel);
  requestMenuScrollRender();
}
