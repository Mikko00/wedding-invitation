const $ = (s, root=document) => root.querySelector(s);
const $$ = (s, root=document) => [...root.querySelectorAll(s)];

// Responsive navigation
const menuToggle = $('#menuToggle'), navigation = $('#navigation');
menuToggle.addEventListener('click', () => {
  const open = navigation.classList.toggle('open');
  menuToggle.setAttribute('aria-expanded', String(open));
  menuToggle.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
  menuToggle.textContent = open ? '×' : '☰';
});
$$('#navigation a').forEach(a => a.addEventListener('click', () => {
  navigation.classList.remove('open'); menuToggle.setAttribute('aria-expanded','false'); menuToggle.textContent='☰';
}));

// Gentle scroll reveal
const revealObserver = new IntersectionObserver(entries => entries.forEach(entry => {
  if (entry.isIntersecting) { entry.target.classList.add('in-view'); revealObserver.unobserve(entry.target); }
}), {threshold: .12});
$$('.reveal').forEach(el => revealObserver.observe(el));

// Wedding countdown — local time in the Philippines
function updateCountdown() {
  const wedding = new Date('2027-01-10T10:00:00+08:00');
  const remaining = Math.max(0, wedding - new Date());
  const values = {
    days: Math.floor(remaining / 86400000),
    hours: Math.floor((remaining % 86400000) / 3600000),
    minutes: Math.floor((remaining % 3600000) / 60000),
    seconds: Math.floor((remaining % 60000) / 1000)
  };
  Object.entries(values).forEach(([id, value]) => { const el = document.getElementById(id); if(el) el.textContent = String(value).padStart(2,'0'); });
}
updateCountdown(); setInterval(updateCountdown, 1000);

// Invitation lightbox with previous/next and keyboard support
const imagePaths = [1,2,3].map(n => `assets/invitation-page-${n}.png`);
const captions = ['Page 1 of 3 · The Invitation','Page 2 of 3 · Our Loved Ones','Page 3 of 3 · Guest Guide'];
const lightbox = $('#lightbox'), lightboxImage = $('#lightboxImage'), caption = $('#lightboxCaption');
let currentImage = 0, previousFocus = null;
function showImage(index) {
  currentImage = (index + imagePaths.length) % imagePaths.length;
  lightboxImage.src = imagePaths[currentImage];
  lightboxImage.alt = captions[currentImage];
  caption.textContent = captions[currentImage];
}
function openLightbox(index) {
  previousFocus = document.activeElement;
  showImage(index); lightbox.hidden = false; document.body.style.overflow = 'hidden'; $('#lightboxClose').focus();
}
function closeLightbox() {
  lightbox.hidden = true; document.body.style.overflow = ''; if(previousFocus) previousFocus.focus();
}
$$('.invite-card').forEach((card, i) => card.addEventListener('click', () => openLightbox(i)));
$('#lightboxClose').addEventListener('click', closeLightbox);
$('#prevImage').addEventListener('click', () => showImage(currentImage - 1));
$('#nextImage').addEventListener('click', () => showImage(currentImage + 1));
lightbox.addEventListener('click', e => { if(e.target === lightbox) closeLightbox(); });
document.addEventListener('keydown', e => {
  if(lightbox.hidden) return;
  if(e.key === 'Escape') closeLightbox();
  if(e.key === 'ArrowLeft') showImage(currentImage - 1);
  if(e.key === 'ArrowRight') showImage(currentImage + 1);
});

// Back to top
const backTop = $('#backTop');
window.addEventListener('scroll', () => backTop.classList.toggle('visible', window.scrollY > 550), {passive:true});
backTop.addEventListener('click', () => window.scrollTo({top:0,behavior:'smooth'}));

// Small, occasional falling petals (disabled for reduced-motion preference)
if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const layer = $('#petals');
  function makePetal() {
    const p = document.createElement('span'); p.className = 'petal'; p.textContent = Math.random() > .5 ? '✿' : '❀';
    p.style.left = `${Math.random()*100}vw`; p.style.setProperty('--drift', `${Math.random()*160-80}px`);
    p.style.animationDuration = `${9+Math.random()*9}s`; p.style.fontSize = `${10+Math.random()*13}px`;
    layer.appendChild(p); setTimeout(() => p.remove(), 19000);
  }
  for(let i=0;i<9;i++) setTimeout(makePetal, i*650);
  setInterval(makePetal, 1800);
}

// RSVP: prepares a ready-to-send email, does not pretend to save data online.
$('#rsvpForm').addEventListener('submit', e => {
  e.preventDefault();
  const data = new FormData(e.currentTarget);
  const name = String(data.get('name') || '').trim();
  const attendance = data.get('attendance');
  const guests = data.get('guests');
  const note = String(data.get('note') || '').trim();
  const message = `Hello Mikko and Maria Ellaine!%0D%0A%0D%0AName: ${encodeURIComponent(name)}%0D%0AResponse: ${encodeURIComponent(attendance)}%0D%0ANumber of guests: ${encodeURIComponent(guests)}%0D%0A${note ? `Message: ${encodeURIComponent(note)}%0D%0A` : ''}%0D%0A`;
  const result = $('#rsvpResult');
  result.hidden = false;
  result.innerHTML = `<strong>Thank you, ${escapeHtml(name)}!</strong><br>Your RSVP message is ready. Choose below to open your email app, or copy the details to message the couple. <p><button type="button" id="emailRsvp">Open email draft</button> <button type="button" id="copyRsvp">Copy RSVP text</button></p>`;
  const plain = `Hello Mikko and Maria Ellaine!\n\nName: ${name}\nResponse: ${attendance}\nNumber of guests: ${guests}${note ? `\nMessage: ${note}` : ''}`;
  $('#emailRsvp').addEventListener('click', () => {
    // Replace this placeholder with the couple's actual RSVP email address before publishing.
    window.location.href = `mailto:?subject=${encodeURIComponent('Wedding RSVP — ' + name)}&body=${message}`;
  });
  $('#copyRsvp').addEventListener('click', async () => {
    try { await navigator.clipboard.writeText(plain); $('#copyRsvp').textContent = 'Copied ✓'; }
    catch { const ta = document.createElement('textarea'); ta.value = plain; document.body.appendChild(ta); ta.select(); document.execCommand('copy'); ta.remove(); $('#copyRsvp').textContent = 'Copied ✓'; }
  });
  result.scrollIntoView({behavior:'smooth',block:'center'});
});
function escapeHtml(value) { return value.replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch])); }
