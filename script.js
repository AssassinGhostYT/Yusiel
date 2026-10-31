(function () {
  'use strict';

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (sel, ctx) { return (ctx || document).querySelector(sel); };
  var $$ = function (sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); };
  var PALETTE = ['#ff8a2b', '#ff4f8b', '#c9a1ff', '#ffe9bd', '#ff6b6b', '#ffb15c'];

  /* ---------- aviso flotante ---------- */
  var toastTimer;
  function toast(msg) {
    var el = $('#toast');
    if (!el) return;
    el.textContent = msg;
    el.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { el.classList.remove('show'); }, 3800);
  }

  /* ---------- murcielagos ---------- */
  var batTpl = $('#batTemplate');
  if (batTpl) {
    $$('.bat').forEach(function (bat) {
      bat.appendChild(batTpl.content.cloneNode(true));
    });
  }

  /* ---------- estrellas ---------- */
  (function () {
    var cv = $('#stars');
    if (!cv) return;
    var ctx = cv.getContext('2d');
    var w = 0, h = 0, stars = [], shoot = null, last = 0;

    function build() {
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth;
      h = window.innerHeight;
      cv.width = Math.floor(w * dpr);
      cv.height = Math.floor(h * dpr);
      cv.style.width = w + 'px';
      cv.style.height = h + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var count = Math.min(190, Math.round((w * h) / 11000));
      stars = [];
      for (var i = 0; i < count; i++) {
        stars.push({
          x: Math.random() * w,
          y: Math.random() * h,
          r: Math.random() * 1.3 + 0.35,
          a: Math.random() * 0.7 + 0.2,
          tw: Math.random() * 0.014 + 0.004,
          dir: Math.random() > 0.5 ? 1 : -1,
          drift: Math.random() * 0.06 + 0.01,
          warm: Math.random() > 0.72
        });
      }
    }

    build();

    var resizeTimer;
    window.addEventListener('resize', function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () {
        build();
        if (reduce) frame(performance.now());
      }, 180);
    });

    function frame(t) {
      var dt = Math.min(34, (t - last) || 16);
      last = t;
      ctx.clearRect(0, 0, w, h);

      for (var i = 0; i < stars.length; i++) {
        var s = stars[i];
        if (!reduce) {
          s.a += s.tw * s.dir * (dt / 16);
          if (s.a > 1) { s.a = 1; s.dir = -1; }
          if (s.a < 0.12) { s.a = 0.12; s.dir = 1; }
          s.y += s.drift * (dt / 16);
          if (s.y > h + 2) s.y = -2;
        }
        ctx.globalAlpha = s.a;
        ctx.fillStyle = s.warm ? '#ffe6b8' : '#d9c9ff';
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, 6.2832);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      if (!reduce) {
        if (!shoot && Math.random() < 0.005) {
          shoot = {
            x: w * (0.15 + Math.random() * 0.7),
            y: h * Math.random() * 0.4,
            life: 0,
            len: Math.random() * 70 + 70,
            speed: Math.random() * 0.18 + 0.14,
            angle: Math.PI * 0.22
          };
        }
        if (shoot) {
          shoot.life += dt;
          var p = shoot.life / 800;
          if (p >= 1) {
            shoot = null;
          } else {
            var d = shoot.life * shoot.speed;
            var x = shoot.x + Math.cos(shoot.angle) * d;
            var y = shoot.y + Math.sin(shoot.angle) * d;
            ctx.globalAlpha = (1 - p) * 0.9;
            ctx.strokeStyle = '#ffe9bd';
            ctx.lineWidth = 1.4;
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x - Math.cos(shoot.angle) * shoot.len, y - Math.sin(shoot.angle) * shoot.len);
            ctx.stroke();
            ctx.globalAlpha = 1;
          }
        }
        requestAnimationFrame(frame);
      }
    }

    requestAnimationFrame(frame);
  })();

  /* ---------- maquina de escribir ---------- */
  (function () {
    var out = $('#typed');
    if (!out) return;
    var phrases = [
      'La noche más oscura se vuelve dulce si estás tú.',
      'No creo en fantasmas, pero tu recuerdo me persigue bonito.',
      'Eres mi dulce favorito y mi único truco de magia.',
      'Si el miedo tuviera nombre, el tuyo sería mi lugar seguro.'
    ];
    if (reduce) {
      out.textContent = phrases[0];
      return;
    }
    var pi = 0, ci = 0, deleting = false;
    function tick() {
      var phrase = phrases[pi];
      if (!deleting) {
        ci++;
        out.textContent = phrase.slice(0, ci);
        if (ci >= phrase.length) {
          deleting = true;
          setTimeout(tick, 2400);
          return;
        }
        setTimeout(tick, 40 + Math.random() * 35);
      } else {
        ci--;
        out.textContent = phrase.slice(0, ci);
        if (ci <= 0) {
          deleting = false;
          pi = (pi + 1) % phrases.length;
          setTimeout(tick, 420);
          return;
        }
        setTimeout(tick, 18);
      }
    }
    setTimeout(tick, 900);
  })();

  /* ---------- aparicion al hacer scroll ---------- */
  (function () {
    var els = $$('.reveal');
    if (!('IntersectionObserver' in window)) {
      els.forEach(function (el) { el.classList.add('in'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.16, rootMargin: '0px 0px -7% 0px' });

    els.forEach(function (el) {
      var sibs = el.parentElement ? Array.prototype.filter.call(el.parentElement.children, function (c) {
        return c.classList && c.classList.contains('reveal');
      }) : [];
      var idx = sibs.indexOf(el);
      el.style.setProperty('--d', Math.min(idx < 0 ? 0 : idx, 5));
      io.observe(el);
    });
  })();

  /* ---------- cartas que se voltean ---------- */
  $$('.card').forEach(function (card) {
    card.addEventListener('click', function () {
      var flipped = card.classList.toggle('flipped');
      card.setAttribute('aria-pressed', String(flipped));
    });
  });

  /* ---------- corazones ---------- */
  function heartNode(size, color) {
    var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 100 95');
    svg.setAttribute('aria-hidden', 'true');
    svg.style.width = size + 'px';
    svg.style.height = size + 'px';
    svg.style.color = color;
    svg.classList.add('flying-heart');
    var use = document.createElementNS('http://www.w3.org/2000/svg', 'use');
    use.setAttribute('href', '#heart');
    svg.appendChild(use);
    return svg;
  }

  function burst(n, cx, cy) {
    if (reduce) return;
    for (var i = 0; i < n; i++) {
      var el = heartNode(10 + Math.random() * 18, PALETTE[Math.floor(Math.random() * PALETTE.length)]);
      el.style.left = cx + 'px';
      el.style.top = cy + 'px';
      document.body.appendChild(el);
      var dx = (Math.random() - 0.5) * 280;
      var dy = -(120 + Math.random() * 250);
      var rot = (Math.random() - 0.5) * 220;
      var anim = el.animate([
        { transform: 'translate(-50%,-50%) scale(.4)', opacity: 0 },
        { transform: 'translate(calc(-50% + ' + (dx * 0.35) + 'px), calc(-50% + ' + (dy * 0.5) + 'px)) scale(1) rotate(' + (rot * 0.4) + 'deg)', opacity: 1, offset: 0.25 },
        { transform: 'translate(calc(-50% + ' + dx + 'px), calc(-50% + ' + dy + 'px)) scale(.65) rotate(' + rot + 'deg)', opacity: 0 }
      ], { duration: 1600 + Math.random() * 900, easing: 'cubic-bezier(.2,.7,.3,1)' });
      anim.onfinish = (function (node) {
        return function () { node.remove(); };
      })(el);
    }
  }

  function confetti(n) {
    if (reduce) return;
    for (var i = 0; i < n; i++) {
      var el = heartNode(9 + Math.random() * 16, PALETTE[Math.floor(Math.random() * PALETTE.length)]);
      el.classList.remove('flying-heart');
      el.classList.add('confetti');
      el.style.left = (Math.random() * 100) + 'vw';
      el.style.top = '-8vh';
      document.body.appendChild(el);
      var dx = (Math.random() - 0.5) * 280;
      var spin = 360 + Math.random() * 620;
      var anim = el.animate([
        { transform: 'translate(0,0) rotate(0deg)', opacity: 0 },
        { transform: 'translate(' + (dx * 0.3) + 'px, 22vh) rotate(' + (spin * 0.25) + 'deg)', opacity: 1, offset: 0.18 },
        { transform: 'translate(' + dx + 'px, 118vh) rotate(' + spin + 'deg)', opacity: 0.9 }
      ], { duration: 3200 + Math.random() * 2600, delay: Math.random() * 700, easing: 'cubic-bezier(.3,.4,.5,1)' });
      anim.onfinish = (function (node) {
        return function () { node.remove(); };
      })(el);
    }
  }

  /* ---------- deseo ---------- */
  var wishBtn = $('#wishBtn');
  if (wishBtn) {
    wishBtn.addEventListener('click', function () {
      var r = wishBtn.getBoundingClientRect();
      burst(18, r.left + r.width / 2, r.top + r.height / 2);
      toast('Deseo enviado a la luna. Ella sabe guardar secretos.');
    });
  }

  /* ---------- modal del conjuro ---------- */
  var modal = $('#modal');
  var spellBtn = $('#spellBtn');
  var modalClose = $('#modalClose');
  var lastFocus = null;

  function openModal() {
    if (!modal) return;
    lastFocus = document.activeElement;
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('locked');
    setTimeout(function () {
      if (modalClose) modalClose.focus();
    }, 80);
  }

  function closeModal() {
    if (!modal) return;
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('locked');
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  if (spellBtn) spellBtn.addEventListener('click', openModal);
  if (modalClose) modalClose.addEventListener('click', closeModal);
  if (modal) {
    modal.addEventListener('click', function (e) {
      if (e.target === modal) closeModal();
    });
  }
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && modal && modal.classList.contains('open')) closeModal();
  });

  $$('[data-answer]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      closeModal();
      confetti(70);
      burst(26, window.innerWidth / 2, window.innerHeight * 0.7);
      toast(btn.getAttribute('data-answer') === 'magia'
        ? 'Entonces ya soy el más afortunado de esta noche.'
        : 'Trato hecho: primero los dulces, después el resto de la vida.');
    });
  });

  /* ---------- chispas del cursor ---------- */
  if (window.matchMedia('(hover: hover) and (pointer: fine)').matches && !reduce) {
    var lastSpark = 0;
    window.addEventListener('pointermove', function (e) {
      var now = performance.now();
      if (now - lastSpark < 42) return;
      lastSpark = now;
      var s = document.createElement('span');
      s.className = 'spark';
      s.style.left = e.clientX + 'px';
      s.style.top = e.clientY + 'px';
      s.style.setProperty('--dx', (Math.random() * 30 - 15).toFixed(1) + 'px');
      document.body.appendChild(s);
      setTimeout(function () { s.remove(); }, 1000);
    }, { passive: true });
  }

  /* ---------- musica ambiental ---------- */
  (function () {
    var btn = $('#audioBtn');
    if (!btn) return;
    var ctx = null, master = null, on = false, built = false;

    function build() {
      ctx = new (window.AudioContext || window.webkitAudioContext)();
      master = ctx.createGain();
      master.gain.value = 0;
      master.connect(ctx.destination);

      var lp = ctx.createBiquadFilter();
      lp.type = 'lowpass';
      lp.frequency.value = 720;
      lp.Q.value = 0.6;
      lp.connect(master);

      [110, 164.81, 220, 329.63].forEach(function (f, i) {
        var osc = ctx.createOscillator();
        osc.type = i % 2 ? 'sine' : 'triangle';
        osc.frequency.value = f;
        osc.detune.value = (i - 1.5) * 5;

        var g = ctx.createGain();
        g.gain.value = i === 3 ? 0.03 : 0.07;
        osc.connect(g);
        g.connect(lp);
        osc.start();

        var lfo = ctx.createOscillator();
        lfo.frequency.value = 0.05 + i * 0.013;
        var lg = ctx.createGain();
        lg.gain.value = i === 3 ? 0.012 : 0.03;
        lfo.connect(lg);
        lg.connect(g.gain);
        lfo.start();
      });

      var len = Math.floor(ctx.sampleRate * 4);
      var buffer = ctx.createBuffer(1, len, ctx.sampleRate);
      var data = buffer.getChannelData(0);
      for (var s = 0; s < len; s++) data[s] = (Math.random() * 2 - 1) * 0.55;
      var noise = ctx.createBufferSource();
      noise.buffer = buffer;
      noise.loop = true;
      var nf = ctx.createBiquadFilter();
      nf.type = 'lowpass';
      nf.frequency.value = 380;
      var ng = ctx.createGain();
      ng.gain.value = 0.045;
      noise.connect(nf);
      nf.connect(ng);
      ng.connect(master);
      noise.start();

      built = true;
    }

    btn.addEventListener('click', function () {
      try {
        if (!built) build();
        var now = ctx.currentTime;
        if (on) {
          master.gain.cancelScheduledValues(now);
          master.gain.setTargetAtTime(0.0001, now, 0.3);
          on = false;
          setTimeout(function () {
            if (!on && ctx && ctx.state === 'running') ctx.suspend();
          }, 900);
        } else {
          ctx.resume();
          master.gain.cancelScheduledValues(now);
          master.gain.setTargetAtTime(0.16, now, 0.5);
          on = true;
        }
        btn.classList.toggle('playing', on);
        btn.setAttribute('aria-pressed', String(on));
        btn.setAttribute('aria-label', on ? 'Silenciar música de la noche' : 'Activar música de la noche');
      } catch (err) {
        toast('Tu navegador no deja sonar la magia.');
      }
    });
  })();

  /* ---------- paralaje suave de la luna ---------- */
  (function () {
    var moon = $('.moon');
    if (!moon || reduce) return;
    var ticking = false;
    window.addEventListener('scroll', function () {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () {
        var y = window.scrollY || window.pageYOffset || 0;
        moon.style.transform = 'translate3d(0,' + Math.min(y * 0.09, 230) + 'px,0)';
        ticking = false;
      });
    }, { passive: true });
  })();

})();
