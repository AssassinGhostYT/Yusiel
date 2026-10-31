(function () {
  'use strict';

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (sel, ctx) { return (ctx || document).querySelector(sel); };
  var $$ = function (sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); };
  var PALETTE = ['#ff8a2b', '#ffb347', '#ffd27a', '#e0490f', '#ffe9bd', '#ff6b35'];

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

  /* ---------- hojas de otoño ---------- */
  (function () {
    var host = $('#leaves');
    if (!host || reduce) return;
    var colors = ['#ff8a2b', '#e0630f', '#c1440e', '#ffb347', '#ffd27a', '#b34a12', '#d97a1f'];
    var shapes = ['leaf-maple', 'leaf-oak', 'leaf-maple'];
    var count = window.innerWidth < 700 ? 12 : 22;
    for (var i = 0; i < count; i++) {
      var leaf = document.createElement('span');
      leaf.className = 'leaf';
      leaf.style.left = (Math.random() * 100) + 'vw';
      leaf.style.setProperty('--size', (8 + Math.random() * 18) + 'px');
      leaf.style.setProperty('--leaf', colors[Math.floor(Math.random() * colors.length)]);
      leaf.style.setProperty('--dur', (9 + Math.random() * 12) + 's');
      leaf.style.setProperty('--delay', (-Math.random() * 20) + 's');
      leaf.style.setProperty('--drift', ((Math.random() * 2 - 1) * 160) + 'px');
      leaf.style.setProperty('--spin', ((Math.random() * 2 - 1) * 720) + 'deg');
      leaf.style.setProperty('--sway', (2.6 + Math.random() * 3) + 's');
      leaf.innerHTML = '<svg viewBox="0 0 100 100" aria-hidden="true"><use href="#' + shapes[Math.floor(Math.random() * shapes.length)] + '"/></svg>';
      host.appendChild(leaf);
    }
  })();

  /* ---------- luciérnagas ---------- */
  (function () {
    var host = $('#fireflies');
    if (!host || reduce) return;
    var count = window.innerWidth < 700 ? 8 : 14;
    for (var i = 0; i < count; i++) {
      var f = document.createElement('i');
      f.className = 'firefly';
      f.style.left = (Math.random() * 100) + '%';
      f.style.top = (10 + Math.random() * 80) + '%';
      f.style.setProperty('--dur', (8 + Math.random() * 10) + 's');
      f.style.setProperty('--delay', (-Math.random() * 12) + 's');
      f.style.setProperty('--fx', ((Math.random() * 2 - 1) * 90) + 'px');
      f.style.setProperty('--fy', (-40 - Math.random() * 110) + 'px');
      host.appendChild(f);
    }
  })();

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

  /* ---------- guardar la noche ---------- */
  var saveBtn = $('#saveNight');
  if (saveBtn) {
    saveBtn.addEventListener('click', function () {
      var r = saveBtn.getBoundingClientRect();
      burst(22, r.left + r.width / 2, r.top + r.height / 2);
      confetti(70);
      toast('Guardada. Que este octubre te dure hasta el próximo.');
      var label = $('#saveLabel');
      if (label) label.textContent = 'Guardada para siempre';
    });
  }

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

  /* ---------- galaxia de luciérnagas ---------- */
  (function () {
    var overlay = $('#galaxyOverlay');
    var openBtn = $('#galaxyBtn');
    var closeBtn = $('#galaxyClose');
    var cv = $('#galaxyCanvas');
    if (!overlay || !openBtn || !cv) return;
    var ctx = cv.getContext('2d');
    var W = 0, H = 0, DPR = 1, cx = 0, cy = 0, R = 120;
    var running = false, raf = 0, startedAt = 0;
    var pumpkin = [], stars = [], sparks = [], sprites = {};
    var pointer = { x: 0, y: 0, tx: 0, ty: 0 };
    var lastFocus = null;

    function makeSprite(color) {
      var c = document.createElement('canvas');
      c.width = c.height = 64;
      var g = c.getContext('2d');
      var grd = g.createRadialGradient(32, 32, 0, 32, 32, 32);
      grd.addColorStop(0, 'rgba(255,255,255,.95)');
      grd.addColorStop(.22, color);
      grd.addColorStop(1, 'rgba(0,0,0,0)');
      g.fillStyle = grd;
      g.fillRect(0, 0, 64, 64);
      return c;
    }

    function initSprites() {
      var cols = { orange: '#ff9a3c', gold: '#ffd27a', cream: '#fff3d6', violet: '#b48cff', pink: '#ff7aa8', blue: '#8f9dff' };
      for (var k in cols) if (!sprites[k]) sprites[k] = makeSprite(cols[k]);
    }

    function tri(px, py, ax, ay, bx, by, cx2, cy2) {
      var d = (by - cy2) * (ax - cx2) + (cx2 - bx) * (ay - cy2);
      if (!d) return false;
      var l1 = ((by - cy2) * (px - cx2) + (cx2 - bx) * (py - cy2)) / d;
      var l2 = ((cy2 - ay) * (px - cx2) + (ax - cx2) * (py - cy2)) / d;
      return l1 >= 0 && l2 >= 0 && (1 - l1 - l2) >= 0;
    }

    function inEllipse(px, py, ex, ey, rx, ry) {
      var dx = (px - ex) / rx, dy = (py - ey) / ry;
      return dx * dx + dy * dy <= 1;
    }

    function build() {
      DPR = Math.min(window.devicePixelRatio || 1, 2);
      W = window.innerWidth; H = window.innerHeight;
      cv.width = Math.floor(W * DPR); cv.height = Math.floor(H * DPR);
      cv.style.width = W + 'px'; cv.style.height = H + 'px';
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      cx = W * .5; cy = H * .56;
      R = Math.min(W * .23, H * .20, 165);
      pumpkin = []; stars = []; sparks = [];
      initSprites();

      var eyeY = cy - R * .16, eyeW = R * .13, eyeH = R * .20;
      var exL = cx - R * .34, exR = cx + R * .34;
      var target = W < 600 ? 420 : 780, attempts = 0;

      while (pumpkin.length < target && attempts < target * 40) {
        attempts++;
        var x = cx + (Math.random() * 2 - 1) * R * 1.08;
        var y = cy + (Math.random() * 2 - 1) * R * .98;
        var inside = inEllipse(x, y, cx, cy, R * .74, R * .68) ||
          inEllipse(x, y, cx - R * .46, cy, R * .42, R * .65) ||
          inEllipse(x, y, cx + R * .46, cy, R * .42, R * .65);
        if (!inside) continue;
        if (tri(x, y, exL - eyeW, eyeY, exL + eyeW, eyeY, exL, eyeY + eyeH)) continue;
        if (tri(x, y, exR - eyeW, eyeY, exR + eyeW, eyeY, exR, eyeY + eyeH)) continue;
        if (tri(x, y, cx - R * .07, cy + R * .10, cx + R * .07, cy + R * .10, cx, cy + R * .20)) continue;
        var mdx = Math.abs(x - cx);
        if (mdx < R * .38) {
          var smile = cy + R * .24 + Math.pow(mdx / (R * .38), 2) * R * .06;
          if (y > smile && y < cy + R * .36) continue;
        }
        var rr = Math.random();
        pumpkin.push({
          x: x, y: y, s: .55 + Math.random() * 1.2, a: .55 + Math.random() * .45,
          ph: Math.random() * 6.283, tw: .6 + Math.random() * 1.7,
          sprite: rr < .55 ? 'orange' : (rr < .82 ? 'gold' : 'cream')
        });
      }

      for (var i = 0; i < 70; i++) {
        var t = i / 70;
        pumpkin.push({
          x: cx - R * .02 + Math.sin(t * Math.PI) * R * .07 + (Math.random() * 2 - 1) * R * .035,
          y: cy - R * .66 - t * R * .20 + (Math.random() * 2 - 1) * R * .03,
          s: .5 + Math.random() * .85, a: .5 + Math.random() * .4,
          ph: Math.random() * 6.283, tw: .8 + Math.random(),
          sprite: Math.random() < .65 ? 'gold' : 'orange'
        });
      }

      var n = W < 600 ? 500 : 950, maxR = Math.max(W, H) * .62;
      for (var j = 0; j < n; j++) {
        var rad = Math.pow(Math.random(), .72) * maxR + 16;
        var arm = (j % 2) * Math.PI;
        var ang = Math.random() * 6.283 + rad * .017 + arm;
        var cc = Math.random();
        stars.push({
          r: rad, a: ang + (Math.random() * 2 - 1) * .32,
          s: .35 + Math.random() * 1.1, al: .25 + Math.random() * .55,
          ph: Math.random() * 6.283, tw: .4 + Math.random() * 1.4,
          sprite: cc < .3 ? 'violet' : (cc < .55 ? 'pink' : (cc < .72 ? 'cream' : (cc < .88 ? 'orange' : 'blue')))
        });
      }

      pointer.x = pointer.tx = W / 2;
      pointer.y = pointer.ty = H / 2;
    }

    function nebula() {
      var g = ctx.createRadialGradient(cx - R * 1.2, cy - R * .6, 0, cx - R * 1.2, cy - R * .6, R * 3.2);
      g.addColorStop(0, 'rgba(126,66,196,.22)');
      g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);
      var g2 = ctx.createRadialGradient(cx + R * 1.4, cy + R * .7, 0, cx + R * 1.4, cy + R * .7, R * 2.8);
      g2.addColorStop(0, 'rgba(255,120,50,.12)');
      g2.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g2;
      ctx.fillRect(0, 0, W, H);
    }

    function draw(t) {
      if (!running) return;
      var time = (t - startedAt) / 1000;
      pointer.x += (pointer.tx - pointer.x) * .04;
      pointer.y += (pointer.ty - pointer.y) * .04;
      var px = pointer.x / W - .5, py = pointer.y / H - .5;
      var ox = -px * R * .18, oy = -py * R * .14;

      ctx.clearRect(0, 0, W, H);
      nebula();
      ctx.globalCompositeOperation = 'lighter';

      var i, s, ang, x, y, tw, size, glow;
      for (i = 0; i < stars.length; i++) {
        s = stars[i];
        ang = s.a + time * .035;
        x = cx + Math.cos(ang) * s.r + ox * .6;
        y = cy + Math.sin(ang) * s.r * .55 + oy * .6;
        tw = .65 + .35 * Math.sin(time * s.tw + s.ph);
        ctx.globalAlpha = s.al * tw;
        size = s.s * 3.2;
        ctx.drawImage(sprites[s.sprite], x - size, y - size, size * 2, size * 2);
      }

      for (i = 0; i < pumpkin.length; i++) {
        s = pumpkin[i];
        x = s.x + ox + Math.sin(time * .9 + s.ph) * 1.2;
        y = s.y + oy + Math.cos(time * .8 + s.ph) * 1.6;
        tw = .55 + .45 * Math.sin(time * 2.2 * s.tw + s.ph);
        glow = s.s * 10 * (.85 + .25 * Math.sin(time * 3 + s.ph));
        ctx.globalAlpha = s.a * tw;
        ctx.drawImage(sprites[s.sprite], x - glow / 2, y - glow / 2, glow, glow);
        ctx.fillStyle = 'rgba(255,242,205,.9)';
        ctx.beginPath();
        ctx.arc(x, y, s.s * .45, 0, 6.283);
        ctx.fill();
      }

      for (i = sparks.length - 1; i >= 0; i--) {
        var sp = sparks[i];
        sp.x += sp.vx; sp.y += sp.vy; sp.vy += .015; sp.life -= .012;
        if (sp.life <= 0) { sparks.splice(i, 1); continue; }
        ctx.globalAlpha = Math.max(0, sp.life);
        size = sp.s * 9;
        ctx.drawImage(sprites[sp.sprite], sp.x - size, sp.y - size, size * 2, size * 2);
      }

      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = 'source-over';
      if (!reduce) raf = requestAnimationFrame(draw);
    }

    function start() {
      stop();
      running = true;
      startedAt = performance.now();
      raf = requestAnimationFrame(draw);
    }

    function stop() {
      running = false;
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
    }

    function openGalaxy() {
      lastFocus = document.activeElement;
      overlay.classList.add('open');
      overlay.setAttribute('aria-hidden', 'false');
      document.body.classList.add('galaxy-open');
      build();
      start();
      if (closeBtn) setTimeout(function () { closeBtn.focus(); }, 100);
    }

    function closeGalaxy() {
      stop();
      overlay.classList.remove('open');
      overlay.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('galaxy-open');
      if (lastFocus && lastFocus.focus) lastFocus.focus();
    }

    openBtn.addEventListener('click', openGalaxy);
    if (closeBtn) closeBtn.addEventListener('click', closeGalaxy);
    overlay.addEventListener('click', function (e) { if (e.target === overlay) closeGalaxy(); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && overlay.classList.contains('open')) closeGalaxy();
    });

    cv.addEventListener('pointermove', function (e) {
      var rect = cv.getBoundingClientRect();
      pointer.tx = e.clientX - rect.left;
      pointer.ty = e.clientY - rect.top;
    });

    cv.addEventListener('pointerdown', function (e) {
      var rect = cv.getBoundingClientRect();
      var x = e.clientX - rect.left, y = e.clientY - rect.top;
      for (var k = 0; k < 30; k++) {
        var a = Math.random() * 6.283, speed = 1 + Math.random() * 4;
        sparks.push({
          x: x, y: y, vx: Math.cos(a) * speed, vy: Math.sin(a) * speed - 1,
          s: .35 + Math.random() * .7, life: .6 + Math.random() * .45,
          sprite: Math.random() < .55 ? 'orange' : 'gold'
        });
      }
      if (reduce) start();
    });

    var rz;
    window.addEventListener('resize', function () {
      if (!overlay.classList.contains('open')) return;
      clearTimeout(rz);
      rz = setTimeout(function () { build(); start(); }, 200);
    });
  })();

  /* ---------- música de la noche (YouTube) ---------- */
  (function () {
    var btn = $('#audioBtn');
    var frame = $('#ytFrame');
    if (!btn || !frame) return;

    var audible = false;
    var paused = false;
    var unlocked = false;

    function cmd(func, args) {
      try {
        frame.contentWindow.postMessage(JSON.stringify({
          event: 'command',
          func: func,
          args: args || []
        }), 'https://www.youtube.com');
      } catch (err) {}
    }

    function applySound() {
      if (!audible || paused) return;
      cmd('unMute');
      cmd('setVolume', [70]);
      cmd('playVideo');
    }

    function paint() {
      var playing = audible && !paused;
      btn.classList.toggle('playing', playing);
      btn.setAttribute('aria-pressed', String(playing));
      btn.setAttribute('aria-label', playing ? 'Silenciar música de la noche' : 'Activar música de la noche');
    }

    function unlock(e) {
      if (e && e.target && e.target.closest && e.target.closest('#audioBtn')) return;
      if (unlocked || paused) return;
      unlocked = true;
      audible = true;
      paint();
      applySound();
      [600, 1500, 3000].forEach(function (ms) {
        setTimeout(function () {
          if (audible && !paused) applySound();
        }, ms);
      });
    }

    btn.addEventListener('click', function () {
      if (!audible || paused) {
        paused = false;
        audible = true;
        unlocked = true;
        applySound();
      } else {
        paused = true;
        cmd('pauseVideo');
        cmd('mute');
      }
      paint();
    });

    ['pointerdown', 'touchstart', 'keydown', 'wheel'].forEach(function (ev) {
      window.addEventListener(ev, unlock, { passive: true });
    });

    frame.addEventListener('load', function () {
      if (unlocked) applySound();
    });

    window.addEventListener('load', function () {
      setTimeout(function () {
        if (!audible) {
          toast('Toca la pantalla para encender la música.');
        }
      }, 2600);
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
