document.getElementById('year').textContent = new Date().getFullYear();

const header = document.getElementById('header');
const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 10);
onScroll();
window.addEventListener('scroll', onScroll);

const navToggle = document.getElementById('nav-toggle');
const mainNav = document.getElementById('main-nav');

navToggle.addEventListener('click', () => {
  const isOpen = mainNav.classList.toggle('open');
  navToggle.setAttribute('aria-expanded', isOpen);
});

mainNav.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    mainNav.classList.remove('open');
    navToggle.setAttribute('aria-expanded', 'false');
  });
});

const sections = document.querySelectorAll('main section[id]');
const navLinks = document.querySelectorAll('.main-nav a[href^="#"]');

const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const id = entry.target.getAttribute('id');
      navLinks.forEach(link => {
        link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
      });
    }
  });
}, { rootMargin: '-40% 0px -50% 0px' });

sections.forEach(section => sectionObserver.observe(section));

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('in-view');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });

document.querySelectorAll('[data-animate]').forEach(el => revealObserver.observe(el));

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

document.querySelectorAll('[data-stagger]').forEach(group => {
  group.querySelectorAll('[data-animate]').forEach((el, i) => {
    el.style.transitionDelay = reduceMotion ? '0ms' : `${i * 90}ms`;
  });
});

function animateCount(el) {
  const target = parseInt(el.dataset.count, 10);

  if (reduceMotion) {
    el.textContent = target.toLocaleString();
    return;
  }

  const duration = 1400;
  const start = performance.now();

  function tick(now) {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.floor(eased * target).toLocaleString();
    if (progress < 1) requestAnimationFrame(tick);
  }

  requestAnimationFrame(tick);
}

const countObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      animateCount(entry.target);
      countObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.6 });

document.querySelectorAll('[data-count]').forEach(el => countObserver.observe(el));

function initTilt(selector, { max = 8, scale = 1.02 } = {}) {
  if (reduceMotion) return;

  document.querySelectorAll(selector).forEach(card => {
    card.classList.add('tilt');

    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      const rotateY = x * max * 2;
      const rotateX = -y * max * 2;
      card.style.transform = `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(${scale}) translateY(-4px)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });
}

initTilt('.achievement-card', { max: 8, scale: 1.02 });
initTilt('.skill-group', { max: 6, scale: 1.015 });
initTilt('.project-card', { max: 5, scale: 1.01 });
initTilt('.stack-item', { max: 6, scale: 1.03 });

function wrapWords(node) {
  const extraClasses = node.classList ? Array.from(node.classList) : [];

  Array.from(node.childNodes).forEach(child => {
    if (child.nodeType === Node.TEXT_NODE) {
      const frag = document.createDocumentFragment();
      child.textContent.split(/(\s+)/).forEach(part => {
        if (part === '') return;
        if (/^\s+$/.test(part)) {
          frag.appendChild(document.createTextNode(part));
        } else {
          const span = document.createElement('span');
          span.className = ['word-fade', ...extraClasses].join(' ');
          span.textContent = part;
          frag.appendChild(span);
        }
      });
      node.replaceChild(frag, child);
    } else if (child.nodeType === Node.ELEMENT_NODE) {
      wrapWords(child);
    }
  });
}

const headlineEls = document.querySelectorAll('h1, h2');

headlineEls.forEach(el => {
  wrapWords(el);
  el.querySelectorAll('.word-fade').forEach((span, i) => {
    span.style.transitionDelay = reduceMotion ? '0ms' : `${i * 60}ms`;
  });
});

const wordObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.querySelectorAll('.word-fade').forEach(span => span.classList.add('in-view'));
      wordObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.3 });

headlineEls.forEach(el => wordObserver.observe(el));

function fitDriveEmbeds() {
  document.querySelectorAll('.project-video').forEach(container => {
    const iframe = container.querySelector('iframe');
    if (!iframe) return;
    const scale = container.clientWidth / 480;
    iframe.style.transform = `scale(${scale})`;
  });
}

fitDriveEmbeds();
window.addEventListener('resize', fitDriveEmbeds);
