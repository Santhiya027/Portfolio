// ============================================================
// Santhiya Portfolio v2 — interactions
// ============================================================

const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const hasHover = window.matchMedia('(hover: hover)').matches;

// ---- Cursor-following glow -----------------------------------
(function cursorGlow(){
  const glow = document.getElementById('cursorGlow');
  if(!glow || !hasHover) return;

  let targetX = window.innerWidth / 2, targetY = window.innerHeight / 2;
  let curX = targetX, curY = targetY;
  let active = false;

  window.addEventListener('mousemove', (e) => {
    targetX = e.clientX;
    targetY = e.clientY;
    if(!active){
      active = true;
      document.body.classList.add('glow-active');
    }
  }, { passive: true });

  window.addEventListener('mouseleave', () => {
    document.body.classList.remove('glow-active');
    active = false;
  });

  function raf(){
    // ease toward the pointer for a soft trailing feel
    curX += (targetX - curX) * (prefersReduced ? 1 : 0.16);
    curY += (targetY - curY) * (prefersReduced ? 1 : 0.16);
    glow.style.transform = `translate(${curX}px, ${curY}px)`;
    requestAnimationFrame(raf);
  }
  raf();
})();

// ---- Per-card local spotlight (border glow follows pointer) ---
(function cardSpotlights(){
  if(!hasHover) return;
  const cards = document.querySelectorAll('.glow-card');
  cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      card.style.setProperty('--mx', x + '%');
      card.style.setProperty('--my', y + '%');
    });
  });
})();

// ---- Nav scroll state + active link ---------------------------
(function navBehavior(){
  const nav = document.getElementById('siteNav');
  const links = Array.from(document.querySelectorAll('.nav-links a[data-nav]'));
  const sections = links.map(l => document.querySelector(l.getAttribute('href'))).filter(Boolean);

  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 40);
  }, { passive: true });

  if(!sections.length) return;
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const id = '#' + entry.target.id;
      const link = links.find(l => l.getAttribute('href') === id);
      if(!link) return;
      if(entry.isIntersecting){
        links.forEach(l => l.classList.remove('active'));
        link.classList.add('active');
      }
    });
  }, { rootMargin: '-40% 0px -50% 0px', threshold: 0 });
  sections.forEach(s => observer.observe(s));
})();

// ---- Typed role rotator -----------------------------------------
(function typedRole(){
  const el = document.getElementById('typedRole');
  if(!el) return;
  const roles = [
    'Frontend Web Developer',
    'Web Designer',
    'WordPress Developer',
    'Computer Science Engineer'
  ];
  if(prefersReduced){ el.firstChild ? (el.firstChild.textContent = roles[0]) : (el.textContent = roles[0]); return; }

  let roleIndex = 0, charIndex = 0, deleting = false;
  const cursorSpan = el.querySelector('.cursor-blink');

  function render(text){
    el.childNodes[0] ? (el.childNodes[0].textContent = text) : el.insertBefore(document.createTextNode(text), el.firstChild);
  }

  // ensure a text node exists before the cursor span
  if(el.firstChild === cursorSpan){
    el.insertBefore(document.createTextNode(''), cursorSpan);
  }

  function tick(){
    const current = roles[roleIndex];
    if(!deleting){
      charIndex++;
      render(current.slice(0, charIndex));
      if(charIndex === current.length){
        deleting = true;
        setTimeout(tick, 1400);
        return;
      }
    } else {
      charIndex--;
      render(current.slice(0, charIndex));
      if(charIndex === 0){
        deleting = false;
        roleIndex = (roleIndex + 1) % roles.length;
      }
    }
    setTimeout(tick, deleting ? 40 : 70);
  }
  tick();
})();

// ---- Contact form (AJAX submit to contact.php) -------------------
(function contactForm(){
  const form = document.getElementById('contactForm');
  const status = document.getElementById('formStatus');
  if(!form) return;

  form.addEventListener('submit', async function(e){
    e.preventDefault();
    status.textContent = 'Sending…';
    status.className = 'form-status';

    try{
      const res = await fetch(form.action, {
        method: 'POST',
        body: new FormData(form)
      });
      const data = await res.json().catch(() => ({ success: res.ok }));

      if(res.ok && data.success !== false){
        status.textContent = '✓ Message sent — thank you! I\'ll reply soon.';
        status.className = 'form-status ok';
        form.reset();
      } else {
        throw new Error(data.message || 'Something went wrong.');
      }
    } catch(err){
      status.textContent = '✗ ' + (err.message || 'Could not send message. Please email me directly.');
      status.className = 'form-status err';
    }
  });
})();