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
    var pumpkin = [], stars = [], sparks = [], sprites = {}, wordEls = [];
    var bgLayer = null, pLayer = null, pSize = 0, liveDots = [];
    var Rx = 0, Ry = 0, topY = null;
    var pointer = { x: 0, y: 0, tx: 0, ty: 0 };
    var lastFocus = null;

    function makeSprite(color) {
      var c = document.createElement('canvas');
      c.width = c.height = 32;
      var g = c.getContext('2d');
      var grd = g.createRadialGradient(16, 16, 0, 16, 16, 16);
      grd.addColorStop(0, 'rgba(255,255,255,.95)');
      grd.addColorStop(.22, color);
      grd.addColorStop(1, 'rgba(0,0,0,0)');
      g.fillStyle = grd;
      g.fillRect(0, 0, 32, 32);
      return c;
    }

    function initSprites() {
      var cols = { orange: '#ff9a3c', gold: '#ffd27a', cream: '#fff3d6', violet: '#b48cff', pink: '#ff7aa8', blue: '#8f9dff' };
      for (var k in cols) if (!sprites[k]) sprites[k] = makeSprite(cols[k]);
    }

    function makeLayer(wCss, hCss, scale) {
      var sc = scale || DPR;
      var c = document.createElement('canvas');
      c.width = Math.max(1, Math.ceil(wCss * sc));
      c.height = Math.max(1, Math.ceil(hCss * sc));
      var g = c.getContext('2d');
      g.setTransform(sc, 0, 0, sc, 0, 0);
      return { c: c, g: g };
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
      DPR = Math.min(window.devicePixelRatio || 1, 1.6);
      W = window.innerWidth; H = window.innerHeight;
      cv.width = Math.floor(W * DPR); cv.height = Math.floor(H * DPR);
      cv.style.width = W + 'px'; cv.style.height = H + 'px';
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      cx = W * .5; cy = H * .57;
      R = Math.min(W * .26, H * .21, 190);
      pumpkin = []; stars = []; sparks = [];
      initSprites();

      /* tres lobulos: centro, izquierda, derecha */
      var C = { x: cx, y: cy, rx: R * .60, ry: R * .80 };
      var Lb = { x: cx - R * .42, y: cy, rx: R * .54, ry: R * .76 };
      var Rb = { x: cx + R * .42, y: cy, rx: R * .54, ry: R * .76 };

      Rx = R * .98; Ry = R * .82;
      topY = function (px) {
        var u = Math.max(-1, Math.min(1, (px - cx) / Rx));
        var base = -Ry * Math.sqrt(Math.max(0, 1 - u * u));
        var ad = Math.abs(px - cx);
        var dip = Ry * .065 * Math.exp(-Math.pow((ad - .34 * Rx) / (.115 * Rx), 2));
        var bump = -Ry * .022 * Math.exp(-Math.pow((ad - .68 * Rx) / (.16 * Rx), 2));
        return base + dip + bump;
      };

      var eyeY = cy - R * .14, eyeW = R * .16, eyeH = R * .22, eyeTop = eyeY - R * .04;
      var exL = cx - R * .31, exR = cx + R * .31;
      var target = W < 600 ? 500 : 820, attempts = 0;

      function addDot(px, py, sprite, size, alpha) {
        pumpkin.push({
          x: px, y: py, s: size, a: alpha,
          ph: Math.random() * 6.283, tw: .5 + Math.random() * 1.2,
          sprite: sprite
        });
      }
      function lineDots(x1, y1, x2, y2, count, sprite, size, alpha) {
        for (var q = 0; q < count; q++) {
          var tt = q / Math.max(1, count - 1);
          addDot(x1 + (x2 - x1) * tt, y1 + (y2 - y1) * tt, sprite, size, alpha);
        }
      }
      function curveDots(x1, y1, cxp, cyp, x2, y2, count, sprite, size, alpha) {
        for (var q = 0; q < count; q++) {
          var tt = q / Math.max(1, count - 1), mt = 1 - tt;
          addDot(
            mt * mt * x1 + 2 * mt * tt * cxp + tt * tt * x2,
            mt * mt * y1 + 2 * mt * tt * cyp + tt * tt * y2,
            sprite, size, alpha
          );
        }
      }
      function mouthTop(px) {
        var k = Math.min(1, Math.abs(px - cx) / (R * .37));
        return cy + R * .27 - k * k * R * .11;
      }
      function mouthBottom(px) {
        var k = Math.min(1, Math.abs(px - cx) / (R * .37));
        return mouthTop(px) + R * .16 * (1 - k * k * .62);
      }

      /* relleno de luciernagas dentro de la calabaza */
      while (pumpkin.length < target && attempts < target * 40) {
        attempts++;
        var x = cx + (Math.random() * 2 - 1) * R;
        var y = cy + (Math.random() * 2 - 1) * R * .86;
        var inside = inEllipse(x, y, C.x, C.y, C.rx, C.ry) ||
          inEllipse(x, y, Lb.x, Lb.y, Lb.rx, Lb.ry) ||
          inEllipse(x, y, Rb.x, Rb.y, Rb.rx, Rb.ry);
        if (!inside) continue;
        if (tri(x, y, exL - eyeW, eyeTop, exL + eyeW, eyeTop, exL, eyeY + eyeH)) continue;
        if (tri(x, y, exR - eyeW, eyeTop, exR + eyeW, eyeTop, exR, eyeY + eyeH)) continue;
        if (tri(x, y, cx - R * .065, cy + R * .05, cx + R * .065, cy + R * .05, cx, cy + R * .19)) continue;
        if (Math.abs(x - cx) < R * .37) {
          if (y > mouthTop(x) && y < mouthBottom(x)) continue;
        }
        var rr = Math.random();
        pumpkin.push({
          x: x, y: y, s: .55 + Math.random() * 1.15, a: .5 + Math.random() * .45,
          ph: Math.random() * 6.283, tw: .6 + Math.random() * 1.7,
          sprite: rr < .5 ? 'orange' : (rr < .8 ? 'gold' : 'cream')
        });
      }

      /* contorno brillante, para que se lea como calabaza */
      var edge = Math.max(60, Math.round(R * .78));
      for (var e = 0; e < edge; e++) {
        var exx = cx - Rx + (2 * Rx) * (e / Math.max(1, edge - 1));
        addDot(exx, cy + topY(exx), 'cream', 1.6, 1);
        addDot(exx, cy - topY(exx), 'cream', 1.6, 1);
      }

      /* costillas */
      var rib = Math.max(26, Math.round(R * .32));
      var sx = .34 * Rx;
      curveDots(cx - sx, cy + topY(cx - sx), cx - .50 * Rx, cy, cx - sx, cy - topY(cx - sx), rib, 'orange', 1.3, .8);
      curveDots(cx + sx, cy + topY(cx + sx), cx + .50 * Rx, cy, cx + sx, cy - topY(cx + sx), rib, 'orange', 1.3, .8);

      /* ojos */
      var eyeN = Math.max(14, Math.round(R * .10));
      lineDots(exL - eyeW, eyeTop, exL + eyeW, eyeTop, eyeN, 'gold', 1.7, 1);
      lineDots(exL - eyeW, eyeTop, exL, eyeY + eyeH, eyeN, 'gold', 1.7, 1);
      lineDots(exL + eyeW, eyeTop, exL, eyeY + eyeH, eyeN, 'gold', 1.7, 1);
      lineDots(exR - eyeW, eyeTop, exR + eyeW, eyeTop, eyeN, 'gold', 1.7, 1);
      lineDots(exR - eyeW, eyeTop, exR, eyeY + eyeH, eyeN, 'gold', 1.7, 1);
      lineDots(exR + eyeW, eyeTop, exR, eyeY + eyeH, eyeN, 'gold', 1.7, 1);

      /* nariz */
      var noseN = Math.max(8, Math.round(R * .05));
      lineDots(cx - R * .065, cy + R * .05, cx + R * .065, cy + R * .05, noseN, 'gold', 1.5, .95);
      lineDots(cx - R * .065, cy + R * .05, cx, cy + R * .19, noseN, 'gold', 1.5, .95);
      lineDots(cx + R * .065, cy + R * .05, cx, cy + R * .19, noseN, 'gold', 1.5, .95);

      /* boca sonriente */
      var mouthN = Math.max(28, Math.round(R * .22));
      for (var m = 0; m < mouthN; m++) {
        var mx = cx - R * .37 + (R * .74) * (m / Math.max(1, mouthN - 1));
        addDot(mx, mouthTop(mx), 'gold', 1.75, 1);
        addDot(mx, mouthBottom(mx), 'gold', 1.6, .9);
      }
      [-R * .14, R * .02].forEach(function (tx) {
        lineDots(cx + tx, mouthTop(cx + tx), cx + tx, mouthTop(cx + tx) + R * .085, 6, 'cream', 1.5, .95);
      });

      /* tallo */
      var stemY0 = cy - R * .77, stemY1 = cy - R * 1.02;
      for (var st = 0; st < 64; st++) {
        var stt = Math.random();
        var syy = stemY0 + (stemY1 - stemY0) * stt;
        var shalf = R * (.072 - .022 * stt);
        var slean = -R * .018 * stt * stt;
        addDot(cx + slean + (Math.random() * 2 - 1) * shalf, syy, Math.random() < .5 ? 'orange' : 'gold', .6, .8);
      }
      lineDots(cx - R * .072, stemY0, cx - R * .068, stemY1, 12, 'gold', 1.7, 1);
      lineDots(cx + R * .072, stemY0, cx + R * .032, stemY1, 12, 'gold', 1.7, 1);
      lineDots(cx - R * .068, stemY1, cx + R * .032, stemY1, 6, 'gold', 1.7, 1);

      /* frases que orbitan como estrellas */
      var host = $('#galaxyWords');
      wordEls = [];
      if (host) {
        host.innerHTML = '';
        var phrases = [
          ['te quiero', '#ffd27a'],
          ['me gustas', '#ffb347'],
          ['eres mi luz', '#ffe9bd'],
          ['mi lugar favorito', '#ff9a3c'],
          ['feliz halloween', '#ffc46b'],
          ['contigo todo es magia', '#ffd9a0'],
          ['te elegire otra vez', '#ffb86b']
        ];
        for (var w = 0; w < phrases.length; w++) {
          var el = document.createElement('span');
          el.className = 'gword';
          el.textContent = phrases[w][0];
          el.style.color = phrases[w][1];
          el.style.opacity = '0';
          host.appendChild(el);
          wordEls.push({
            el: el,
            ang: w * .92,
            speed: (w % 2 ? -1 : 1) * (.075 + (w % 3) * .018),
            rx: Math.min(W * .36, R * (1.85 + (w % 3) * .30)),
            ry: Math.min(H * .24, R * (1.35 + (w % 2) * .30)),
            phase: w * 1.7
          });
        }
      }

      var n = W < 600 ? 300 : 600, maxR = Math.max(W, H) * .62;
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

      liveDots = [];
      for (var ld = 0; ld < pumpkin.length; ld += 12) liveDots.push(pumpkin[ld]);
      buildBackground();
      buildPumpkinLayer();

      pointer.x = pointer.tx = W / 2;
      pointer.y = pointer.ty = H / 2;
    }

    function buildBackground() {
      var lay = makeLayer(W, H, 1), g = lay.g;

      /* polvo de estrellas fijo (no cuesta nada por frame) */
      for (var i = 0; i < 320; i++) {
        var x = Math.random() * W, y = Math.random() * H;
        g.globalAlpha = .12 + Math.random() * .5;
        g.fillStyle = Math.random() < .55 ? '#ffe9bd' : '#cdb6ff';
        g.beginPath();
        g.arc(x, y, .35 + Math.random() * .8, 0, 6.283);
        g.fill();
      }
      g.globalAlpha = 1;

      var n1 = g.createRadialGradient(cx - R * 1.2, cy - R * .6, 0, cx - R * 1.2, cy - R * .6, R * 3.2);
      n1.addColorStop(0, 'rgba(126,66,196,.22)');
      n1.addColorStop(1, 'rgba(0,0,0,0)');
      g.fillStyle = n1;
      g.fillRect(0, 0, W, H);

      var n2 = g.createRadialGradient(cx + R * 1.4, cy + R * .7, 0, cx + R * 1.4, cy + R * .7, R * 2.8);
      n2.addColorStop(0, 'rgba(255,120,50,.12)');
      n2.addColorStop(1, 'rgba(0,0,0,0)');
      g.fillStyle = n2;
      g.fillRect(0, 0, W, H);

      var hg = g.createRadialGradient(cx, cy, R * .30, cx, cy, R * 2.05);
      hg.addColorStop(0, 'rgba(8,3,16,.96)');
      hg.addColorStop(.56, 'rgba(8,3,16,.72)');
      hg.addColorStop(1, 'rgba(8,3,16,0)');
      g.fillStyle = hg;
      g.fillRect(0, 0, W, H);

      var og = g.createRadialGradient(cx, cy, R * .45, cx, cy, R * 1.55);
      og.addColorStop(0, 'rgba(255,150,60,.16)');
      og.addColorStop(.55, 'rgba(255,110,30,.10)');
      og.addColorStop(1, 'rgba(255,80,20,0)');
      g.fillStyle = og;
      g.fillRect(0, 0, W, H);

      bgLayer = lay.c;
    }

    function buildPumpkinLayer() {
      pSize = R * 2.7;
      var lay = makeLayer(pSize, pSize, DPR), g = lay.g;
      g.translate(pSize / 2 - cx, pSize / 2 - cy);

      /* silueta oscura para que la cara se lea y no pasen estrellas por detras */
      g.beginPath();
      g.moveTo(cx - Rx, cy);
      var k, tx, bx;
      for (k = 1; k <= 40; k++) {
        tx = cx - Rx + (2 * Rx) * (k / 40);
        g.lineTo(tx, cy + topY(tx));
      }
      for (k = 40; k >= 0; k--) {
        bx = cx - Rx + (2 * Rx) * (k / 40);
        g.lineTo(bx, cy - topY(bx));
      }
      g.closePath();
      g.fillStyle = 'rgba(8,3,16,.95)';
      g.fill();

      g.globalCompositeOperation = 'lighter';
      for (var i = 0; i < pumpkin.length; i++) {
        var s = pumpkin[i];
        var glow = s.s * 10;
        g.globalAlpha = s.a;
        g.drawImage(sprites[s.sprite], s.x - glow / 2, s.y - glow / 2, glow, glow);
        g.fillStyle = 'rgba(255,242,205,.92)';
        g.beginPath();
        g.arc(s.x, s.y, s.s * .45, 0, 6.283);
        g.fill();
      }
      g.globalAlpha = 1;
      pLayer = lay.c;
    }

    function updateWords(time) {
      for (var i = 0; i < wordEls.length; i++) {
        var w = wordEls[i];
        var ang = w.ang + time * w.speed;
        var depth = Math.sin(ang);
        var x = cx + Math.cos(ang) * w.rx;
        var y = cy + depth * w.ry + Math.sin(ang * 1.7 + w.phase) * R * .025;
        var op = .26 + (depth + 1) * .37;
        var sc = .82 + (depth + 1) * .16;
        w.el.style.opacity = op.toFixed(3);
        w.el.style.transform = 'translate3d(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px,0) translate(-50%,-50%) scale(' + sc.toFixed(3) + ')';
      }
    }

    function draw(t) {
      if (!running) return;
      var time = (t - startedAt) / 1000;
      pointer.x += (pointer.tx - pointer.x) * .04;
      pointer.y += (pointer.ty - pointer.y) * .04;
      var px = pointer.x / W - .5, py = pointer.y / H - .5;
      var ox = -px * R * .18, oy = -py * R * .14;

      ctx.clearRect(0, 0, W, H);
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = 'source-over';
      if (bgLayer) ctx.drawImage(bgLayer, 0, 0, W, H);
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

      ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = 1;
      if (pLayer) ctx.drawImage(pLayer, cx - pSize / 2 + ox, cy - pSize / 2 + oy, pSize, pSize);
      ctx.globalCompositeOperation = 'lighter';

      for (i = 0; i < liveDots.length; i++) {
        s = liveDots[i];
        x = s.x + ox + Math.sin(time * .9 + s.ph) * 1.2;
        y = s.y + oy + Math.cos(time * .8 + s.ph) * 1.6;
        tw = .55 + .45 * Math.sin(time * 2.2 * s.tw + s.ph);
        glow = s.s * 10 * (.85 + .25 * Math.sin(time * 3 + s.ph));
        ctx.globalAlpha = Math.max(0, Math.min(1, s.a * tw * .85));
        ctx.drawImage(sprites[s.sprite], x - glow / 2, y - glow / 2, glow, glow);
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
      updateWords(time);
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
