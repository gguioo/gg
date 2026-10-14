(function () {
  var home = document.documentElement.getAttribute('data-home') || '/';
  var path = location.pathname.replace(/index\.html$/, '');
  if (path === home) return;
  var pl = document.getElementById('ny-parent');
  var parent = pl ? pl.getAttribute('href') : home;

  // 直接打开（无站内来源）时垫一层历史，系统返回先回目录而不是退出
  var fromSite = false;
  try { fromSite = document.referrer && new URL(document.referrer).origin === location.origin; } catch (e) {}
  if (!fromSite && !(history.state && history.state.ny)) {
    history.replaceState({ nyGuard: 1 }, '');
    history.pushState({ ny: 1 }, '');
  }
  window.addEventListener('popstate', function (e) {
    if (e.state && e.state.nyGuard) location.replace(parent);
  });

  function back() {
    if (fromSite || (history.state && history.state.ny)) history.back();
    else location.href = parent;
  }

  function blocked(el) {
    for (; el && el !== document.body; el = el.parentElement) {
      if (el.matches && el.matches('table,pre,input,textarea,select,.leaflet-container,[data-noswipe]')) return true;
      if (el.scrollWidth > el.clientWidth + 2) {
        var o = getComputedStyle(el).overflowX;
        if (o === 'auto' || o === 'scroll') return true;
      }
    }
    return false;
  }

  var wrap = document.querySelector('.wrap'), sx, sy, st, track = false, dir = 0;
  document.addEventListener('touchstart', function (e) {
    if (e.touches.length !== 1 || blocked(e.target)) { track = false; return; }
    var t = e.touches[0]; sx = t.clientX; sy = t.clientY; st = Date.now(); track = true; dir = 0;
  }, { passive: true });
  document.addEventListener('touchmove', function (e) {
    if (!track) return;
    var t = e.touches[0], dx = t.clientX - sx, dy = t.clientY - sy;
    if (!dir) { if (Math.abs(dx) < 10 && Math.abs(dy) < 10) return; dir = Math.abs(dx) > Math.abs(dy) * 1.5 ? 1 : -1; }
    if (dir !== 1) { track = false; return; }
    var m = Math.max(-60, Math.min(60, dx * 0.35));
    wrap.style.transition = 'none';
    wrap.style.transform = 'translateX(' + m + 'px)';
    wrap.style.opacity = String(1 - Math.abs(m) / 240);
  }, { passive: true });
  document.addEventListener('touchend', function (e) {
    var ok = false;
    if (track && dir === 1) {
      var t = e.changedTouches[0], dx = t.clientX - sx, dy = t.clientY - sy;
      ok = Math.abs(dx) > 80 && Math.abs(dy) < Math.abs(dx) * 0.6 && Date.now() - st < 800;
    }
    wrap.style.transition = 'transform .2s ease, opacity .2s ease';
    wrap.style.transform = ''; wrap.style.opacity = '';
    track = false;
    if (ok) back();
  }, { passive: true });
})();
