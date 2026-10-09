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


const prenupCards=$$('.prenup-card'),prenupPaths=[1,2,3,4,5,6].map(n=>`assets/prenup-${n}.jpg`);
prenupCards.forEach((card,i)=>{const img=$('img',card);img.addEventListener('load',()=>card.classList.add('has-photo'));img.addEventListener('error',()=>card.classList.remove('has-photo'));if(img.complete&&img.naturalWidth>0)card.classList.add('has-photo');card.addEventListener('click',()=>{previousFocus=document.activeElement;currentImage=i;lightboxImage.src=prenupPaths[i];lightboxImage.alt=`Prenuptial photo ${i+1}`;caption.textContent=`Prenup photo ${i+1} of ${prenupPaths.length}`;lightbox.hidden=false;document.body.style.overflow='hidden';$('#lightboxClose').focus();});});
const musicButton=$('#musicToggle'),music=$('#backgroundMusic');
let synthContext=null,synthTimer=null,synthNodes=[],synthStep=0,musicStarted=false;
function stopSynth(){
 if(synthTimer)clearInterval(synthTimer);synthTimer=null;
 synthNodes.forEach(n=>{try{n.stop()}catch(e){}});synthNodes=[];
 if(synthContext&&synthContext.state!=='closed')synthContext.close();synthContext=null;
}
function setMusicState(playing){
 musicStarted=playing;musicButton.classList.toggle('playing',playing);
 musicButton.setAttribute('aria-pressed',String(playing));
 musicButton.setAttribute('aria-label',playing?'Pause background music':'Play background music');
 $('.music-label',musicButton).textContent=playing?'Pause music':'Tap for music';
}
function playSynth(){
 const AC=window.AudioContext||window.webkitAudioContext;if(!AC)throw Error('Audio unsupported');
 synthContext=new AC();const ctx=synthContext,master=ctx.createGain();master.gain.value=.05;master.connect(ctx.destination);
 const melody=[261.63,329.63,392,329.63,293.66,349.23,440,349.23,261.63,329.63,392,523.25,440,392,349.23,293.66],roots=[130.81,174.61,146.83,196];
 function note(f,t,d,v,type){const o=ctx.createOscillator(),g=ctx.createGain();o.type=type;o.frequency.value=f;g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(v,t+.12);g.gain.setValueAtTime(v,t+d-.18);g.gain.exponentialRampToValueAtTime(.0001,t+d);o.connect(g);g.connect(master);o.start(t);o.stop(t+d+.02);synthNodes.push(o);}
 function phrase(){const now=ctx.currentTime+.05;melody.forEach((f,i)=>{const t=now+i*.48;note(melody[(i+synthStep)%melody.length],t,1.25,.13,'sine');if(i%4===0){const r=roots[(Math.floor(i/4)+synthStep)%roots.length];note(r,t,2,.07,'triangle');note(r*1.5,t+.05,1.6,.025,'sine');}});synthStep=(synthStep+1)%melody.length;}
 phrase();synthTimer=setInterval(phrase,melody.length*480);
}
async function startMusic(useFallback=true){
 if(musicStarted)return true;
 try{
  // Try the configured MP3 first. It must be present at assets/background-music.mp3.
  try{
   music.load();
   if(music.readyState===0)await new Promise((resolve,reject)=>{
    const timer=setTimeout(()=>reject(Error('MP3 unavailable')),1200);
    music.addEventListener('canplay',()=>{clearTimeout(timer);resolve();},{once:true});
    music.addEventListener('error',()=>{clearTimeout(timer);reject(Error('MP3 unavailable'));},{once:true});
   });
   await music.play();
  }catch(e){if(!useFallback)throw e;playSynth();}
  setMusicState(true);return true;
 }catch(e){setMusicState(false);return false;}
}
async function toggleMusic(){
 if(musicStarted){music.pause();stopSynth();setMusicState(false);return;}
 if(!await startMusic(true))alert('Music could not start. Please try again in a modern browser.');
}
musicButton.addEventListener('click',toggleMusic);

// Attempt autoplay on load. Audible autoplay is commonly blocked by browser settings.
// If blocked, retry on the visitor's first interaction and keep the visible music button.
window.addEventListener('load',async()=>{
 const started=await startMusic(false);
 if(!started){
  $('.music-label',musicButton).textContent='Tap for music';
  const retry=async()=>{
   if(!musicStarted)await startMusic(true);
   window.removeEventListener('pointerdown',retry);
   window.removeEventListener('keydown',retry);
   window.removeEventListener('touchstart',retry);
  };
  window.addEventListener('pointerdown',retry,{once:true});
  window.addEventListener('keydown',retry,{once:true});
  window.addEventListener('touchstart',retry,{once:true,passive:true});
 }
});
music.addEventListener('ended',()=>setMusicState(false));
