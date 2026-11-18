/* =========================================================
   María Camila Velasco · Fonoaudióloga Miofuncional
   ========================================================= */

// Número de WhatsApp: código de país (57) + celular, sin espacios ni símbolos.
const WHATSAPP = '573155441274';

document.documentElement.classList.remove('no-js');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- Menú móvil ---------- */
const nav = document.getElementById('nav');
const navToggle = document.getElementById('navToggle');

function setMenu(open) {
  nav.classList.toggle('is-open', open);
  navToggle.setAttribute('aria-expanded', String(open));
  navToggle.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
}
navToggle.addEventListener('click', () => setMenu(!nav.classList.contains('is-open')));
nav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => setMenu(false)));
document.addEventListener('keydown', e => { if (e.key === 'Escape') setMenu(false); });

/* ---------- Encabezado y barra de progreso al bajar ---------- */
const header = document.getElementById('header');
const progress = document.createElement('div');
progress.className = 'progress';
progress.setAttribute('aria-hidden', 'true');
document.body.prepend(progress);

let ticking = false;
function onScroll() {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  header.classList.toggle('is-scrolled', window.scrollY > 10);
  progress.style.setProperty('--p', max > 0 ? Math.min(window.scrollY / max, 1) : 0);
  ticking = false;
}
window.addEventListener('scroll', () => {
  if (!ticking) { ticking = true; requestAnimationFrame(onScroll); }
}, { passive: true });
window.addEventListener('resize', onScroll);
onScroll();

/* ---------- Títulos que aparecen palabra por palabra ---------- */
document.querySelectorAll('.page-hero h1, .agenda--page h1').forEach(h => {
  const words = h.textContent.trim().split(/\s+/);
  h.textContent = '';
  words.forEach((word, i) => {
    const outer = document.createElement('span');
    const inner = document.createElement('span');
    outer.className = 'w';
    inner.style.setProperty('--wi', i);
    inner.textContent = word;
    outer.appendChild(inner);
    h.appendChild(outer);
    if (i < words.length - 1) h.appendChild(document.createTextNode(' '));
  });
});

/* ---------- Aparición al bajar (con efecto cascada) ---------- */
const revealEls = document.querySelectorAll('.reveal');
revealEls.forEach(el => {
  const hermanos = [...el.parentElement.children].filter(c => c.classList.contains('reveal'));
  if (hermanos.length > 1) el.style.setProperty('--d', `${Math.min(hermanos.indexOf(el), 6) * 0.1}s`);
});
document.querySelectorAll('.signal-card .checklist').forEach(ul =>
  [...ul.children].forEach((li, i) => li.style.setProperty('--li', i)));

// Cuando termina de aparecer, se quitan las clases para que los efectos al pasar el mouse funcionen normal.
function finishReveal(el) {
  const delay = parseFloat(el.style.getPropertyValue('--d')) || 0;
  setTimeout(() => {
    el.classList.remove('reveal', 'reveal--left', 'reveal--right', 'reveal--zoom', 'is-visible');
    el.style.removeProperty('--d');
  }, 1600 + delay * 1000);
}

const observed = document.querySelectorAll('.reveal, [data-observe]');
if ('IntersectionObserver' in window && !reduceMotion) {
  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      el.classList.add('is-visible');
      io.unobserve(el);
      if (el.classList.contains('reveal')) finishReveal(el);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  observed.forEach(el => io.observe(el));
} else {
  observed.forEach(el => el.classList.add('is-visible'));
}

/* ---------- Portada: la foto sigue suavemente al mouse (solo computador) ---------- */
const hero = document.querySelector('.hero');
const heroMedia = document.querySelector('.hero__media');
if (hero && heroMedia && !reduceMotion && window.matchMedia('(pointer: fine)').matches) {
  hero.addEventListener('pointermove', e => {
    const r = hero.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    heroMedia.style.translate = `${(x * -22).toFixed(1)}px ${(y * -16).toFixed(1)}px`;
  });
  hero.addEventListener('pointerleave', () => { heroMedia.style.translate = '0px 0px'; });
}

/* ---------- Preguntas frecuentes: abrir y cerrar con deslizamiento ---------- */
document.querySelectorAll('.faq details').forEach(d => {
  const summary = d.querySelector('summary');
  summary.addEventListener('click', e => {
    if (reduceMotion || !d.animate) return;
    e.preventDefault();
    if (d.dataset.animando) return;
    d.dataset.animando = '1';
    const cerrado = summary.offsetHeight + (d.offsetHeight - d.clientHeight);
    const abriendo = !d.open;
    if (abriendo) d.open = true;
    const abierto = d.offsetHeight;
    const duracion = abriendo ? 340 : 260;
    d.style.overflow = 'hidden';
    const a = d.animate(
      { height: abriendo ? [`${cerrado}px`, `${abierto}px`] : [`${abierto}px`, `${cerrado}px`] },
      { duration: duracion, easing: 'cubic-bezier(.2,.7,.2,1)', fill: 'forwards' });
    let terminado = false;
    const fin = () => {
      if (terminado) return;
      terminado = true;
      if (!abriendo) d.open = false;
      a.cancel();
      d.style.overflow = '';
      delete d.dataset.animando;
    };
    a.onfinish = fin;
    setTimeout(fin, duracion + 120); // respaldo por si la animación se pausa (pestaña oculta, etc.)
  });
});

/* ---------- Botón de WhatsApp: muestra un mensaje una vez por visita ---------- */
const waFloat = document.querySelector('.wa-float');
if (waFloat) {
  let yaMostrado = false;
  try { yaMostrado = sessionStorage.getItem('waTip') === '1'; } catch (e) { /* sin almacenamiento */ }
  if (!yaMostrado) {
    setTimeout(() => {
      waFloat.classList.add('show-tip');
      try { sessionStorage.setItem('waTip', '1'); } catch (e) { /* sin almacenamiento */ }
      setTimeout(() => waFloat.classList.remove('show-tip'), 5000);
    }, 4500);
  }
}

/* ---------- Formulario → WhatsApp (página agenda.html) ---------- */
const form = document.getElementById('formCita');
if (form) {
  const errorBox = document.getElementById('formError');
  const campoPaciente = document.getElementById('campoPaciente');
  const inputPaciente = form.elements.paciente;

  // Si la cita no es "Para mí", se pide el nombre del paciente.
  form.querySelectorAll('input[name="para"]').forEach(radio => {
    radio.addEventListener('change', () => {
      const otro = form.elements.para.value !== 'Para mí';
      campoPaciente.hidden = !otro;
      inputPaciente.required = otro;
      if (!otro) inputPaciente.value = '';
    });
  });

  // Quita el estado de error cuando el usuario corrige el campo.
  form.addEventListener('input', e => {
    e.target.classList.remove('is-invalid');
    if (!errorBox.hidden) errorBox.hidden = true;
  });
  form.addEventListener('change', e => e.target.classList.remove('is-invalid'));

  function showError(msg, field) {
    errorBox.textContent = msg;
    errorBox.hidden = false;
    if (field) {
      field.classList.add('is-invalid');
      field.focus();
    }
  }

  form.addEventListener('submit', e => {
    e.preventDefault();
    const f = form.elements;
    const val = name => (f[name].value || '').trim();

    // Validación
    const requeridos = [
      ['nombre', 'Escribe tu nombre completo.'],
      ['celular', 'Escribe tu número de celular.'],
      ...(inputPaciente.required ? [['paciente', 'Escribe el nombre del paciente.']] : []),
      ['edad', 'Escribe la edad del paciente.'],
      ['motivo', 'Selecciona el motivo de consulta.'],
    ];
    for (const [name, msg] of requeridos) {
      if (!val(name)) return showError(msg, f[name]);
    }
    if (val('celular').replace(/\D/g, '').length < 7) {
      return showError('Revisa el número de celular, parece incompleto.', f.celular);
    }
    if (!f.autorizo.checked) {
      return showError('Para continuar, autoriza el tratamiento de tus datos.', f.autorizo);
    }

    // Mensaje
    const lineas = [
      'Hola María Camila, quiero agendar una cita. Estos son mis datos:',
      '',
      `*Nombre:* ${val('nombre')}`,
      `*Celular:* ${val('celular')}`,
      `*Cita:* ${f.para.value}`,
    ];
    if (inputPaciente.required) lineas.push(`*Paciente:* ${val('paciente')}`);
    lineas.push(
      `*Edad del paciente:* ${val('edad')}`,
      `*Motivo:* ${val('motivo')}`,
      `*Horario preferido:* ${f.horario.value}`,
    );
    if (val('mensaje')) lineas.push(`*Comentario:* ${val('mensaje')}`);
    lineas.push('', '_Enviado desde la página web_');

    const url = `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(lineas.join('\n'))}`;
    const win = window.open(url, '_blank');
    if (win) win.opener = null;
    else window.location.href = url; // si el navegador bloquea la ventana nueva

    // Confirmación visible en la página
    const ok = document.getElementById('formOk');
    if (ok) {
      ok.hidden = true;
      void ok.offsetWidth; // reinicia la animación si se envía otra vez
      ok.hidden = false;
    }
  });
}

/* ---------- Visor de diplomas (página formacion.html) ---------- */
const lightbox = document.getElementById('lightbox');
if (lightbox) {
  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxCaption = document.getElementById('lightboxCaption');

  document.querySelectorAll('.diploma:not(.diploma--placeholder)').forEach(fig => {
    const img = fig.querySelector('img');
    if (!img) return;
    fig.tabIndex = 0;
    fig.setAttribute('role', 'button');
    const open = () => {
      lightboxImg.src = img.src;
      lightboxImg.alt = img.alt;
      const cap = fig.querySelector('figcaption');
      lightboxCaption.textContent = cap ? cap.innerText.replace(/\n+/g, ' · ') : '';
      lightbox.showModal();
    };
    fig.addEventListener('click', open);
    fig.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); } });
  });
  document.getElementById('lightboxClose').addEventListener('click', () => lightbox.close());
  lightbox.addEventListener('click', e => { if (e.target === lightbox) lightbox.close(); });
}

/* ---------- Año actual en el pie de página ---------- */
const year = document.getElementById('year');
if (year) year.textContent = new Date().getFullYear();
