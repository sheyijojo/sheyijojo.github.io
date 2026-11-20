(function(){
'use strict';
var d=document,root=d.documentElement,reduce=window.matchMedia('(prefers-reduced-motion:reduce)').matches;
var fine=window.matchMedia('(hover:hover) and (pointer:fine)').matches;
/* scroll progress + sticky header state */
var bar=d.createElement('div');bar.id='prog';bar.setAttribute('aria-hidden','true');d.body.appendChild(bar);
var hdr=d.querySelector('header.wrap'),tick=false;
function onScroll(){
  if(tick)return;tick=true;
  requestAnimationFrame(function(){
    var h=root.scrollHeight-root.clientHeight,y=window.pageYOffset;
    bar.style.transform='scaleX('+(h>0?Math.min(1,y/h):0)+')';
    if(hdr)hdr.classList.toggle('scrolled',y>8);
    tick=false;
  });
}
window.addEventListener('scroll',onScroll,{passive:true});window.addEventListener('resize',onScroll);onScroll();
/* scroll reveal with stagger */
var SEL='.hero > *,.blk > .head,.layers .col,.concerns,.cases .case,.frame,.pan,.side .fig,.doc > h2,.doc > .fig,.doc > .tbl,.doc > .note,.dim';
var io=('IntersectionObserver' in window)?new IntersectionObserver(function(es){
  es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}});
},{rootMargin:'0px 0px -8% 0px',threshold:.08}):null;
function prep(scope){
  var els=(scope||d).querySelectorAll(SEL),n=0;
  Array.prototype.forEach.call(els,function(el){
    if(el.dataset.rv)return;el.dataset.rv='1';
    if(!io||reduce){el.classList.add('in');return}
    if(!el.classList.contains('dim'))el.classList.add('rv');
    el.style.setProperty('--d',(Math.min(n++,6)*70)+'ms');
    io.observe(el);
  });
}
root.classList.add('js');prep();
['cases','storyGrid','layers'].forEach(function(id){
  var t=d.getElementById(id);if(!t||!('MutationObserver' in window))return;
  new MutationObserver(function(){prep(t)}).observe(t,{childList:true});
});
/* active section in nav: a clicked link wins until you scroll by hand; otherwise the last section whose top passed 40% of the viewport, and the final link at page bottom */
var links=Array.prototype.slice.call(d.querySelectorAll('nav a.nl[href^="#"]'));
var navSecs=[],forced=null;
links.forEach(function(a){var s=d.getElementById(a.getAttribute('href').slice(1));if(s)navSecs.push({a:a,s:s})});
function setActive(){
  if(!navSecs.length)return;
  var line=window.innerHeight*0.4,cur=null;
  if(forced){navSecs.forEach(function(n){if(n.s===forced)cur=n})}
  else{
    navSecs.forEach(function(n){if(n.s.getBoundingClientRect().top<=line)cur=n});
    if(root.scrollHeight-root.clientHeight-window.pageYOffset<4)cur=navSecs[navSecs.length-1];
  }
  navSecs.forEach(function(n){if(n===cur)n.a.setAttribute('aria-current','true');else n.a.removeAttribute('aria-current')});
}
if(navSecs.length){
  navSecs.forEach(function(n){n.a.addEventListener('click',function(){forced=n.s;setActive()})});
  ['wheel','touchmove','keydown'].forEach(function(t){window.addEventListener(t,function(){if(forced){forced=null;setActive()}},{passive:true})});
  window.addEventListener('scroll',function(){requestAnimationFrame(setActive)},{passive:true});window.addEventListener('resize',setActive);setActive();
}
/* pointer spotlight on cards */
d.addEventListener('pointermove',function(e){
  var f=e.target.closest&&e.target.closest('.frame');
  if(f){var r=f.getBoundingClientRect();f.style.setProperty('--mx',(e.clientX-r.left)+'px');f.style.setProperty('--my',(e.clientY-r.top)+'px')}
},{passive:true});
/* blueprint crosshair cursor (mouse only, off for reduced motion) */
if(fine&&!reduce){
  var c=d.createElement('div');c.id='cur';c.setAttribute('aria-hidden','true');d.body.appendChild(c);
  var x=0,y=0,cx=0,cy=0,run=false;
  function loop(){cx+=(x-cx)*.28;cy+=(y-cy)*.28;c.style.transform='translate('+cx+'px,'+cy+'px)';
    if(Math.abs(x-cx)>.3||Math.abs(y-cy)>.3)requestAnimationFrame(loop);else run=false}
  d.addEventListener('pointermove',function(e){
    if(e.pointerType==='touch')return;x=e.clientX;y=e.clientY;c.classList.add('on');
    var hot=e.target.closest&&e.target.closest('a,button,.col,.case');c.classList.toggle('big',!!hot);
    if(!run){run=true;requestAnimationFrame(loop)}
  },{passive:true});
  d.addEventListener('pointerleave',function(){c.classList.remove('on')});
}
})();
