/*
 * TrendiMovies - Telegram Mini App bridge (step 1).
 *
 * Does NOTHING for normal website visitors. It switches on only when the page is
 * opened from inside Telegram (Telegram adds #tgWebAppData=... to the address on the
 * first page; we remember that for the rest of the visit in sessionStorage).
 *
 * Inside Telegram it:
 *   - loads Telegram's own helper script from OUR server (the site's security rules allow only 'self'),
 *   - tells Telegram the app is ready and opens it full height,
 *   - paints Telegram's top bar in the site colour,
 *   - shows Telegram's native Back button on every page except the home page,
 *   - opens t.me links (the download buttons) through Telegram, and other outside links in the browser.
 *
 * Every step is wrapped so a failure can never break the page.
 */
(function () {
  'use strict';

  var KEY = 'tmTgApp';
  var inTelegram = false;
  try {
    if (/tgWebAppData=|tgWebAppPlatform=/.test(location.hash)) {
      sessionStorage.setItem(KEY, '1');
    }
    inTelegram = sessionStorage.getItem(KEY) === '1';
  } catch (e) {
    inTelegram = /tgWebAppData=|tgWebAppPlatform=/.test(location.hash);
  }
  if (!inTelegram) return;

  function safe(fn) {
    try { return fn(); } catch (e) { return undefined; }
  }

  function rgbToHex(css) {
    var m = String(css || '').match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
    if (!m) return null;
    if (m[4] !== undefined && parseFloat(m[4]) === 0) return null;   // transparent
    function h(n) { var s = parseInt(n, 10).toString(16); return s.length < 2 ? '0' + s : s; }
    return '#' + h(m[1]) + h(m[2]) + h(m[3]);
  }

  function siteColour() {
    return rgbToHex(getComputedStyle(document.body).backgroundColor) ||
           rgbToHex(getComputedStyle(document.documentElement).backgroundColor);
  }

  function start() {
    var tg = window.Telegram && window.Telegram.WebApp;
    if (!tg) return;

    document.documentElement.classList.add('tg-miniapp');

    safe(function () { tg.ready(); });
    safe(function () { tg.expand(); });
    safe(function () { tg.disableVerticalSwipes(); });   // so scrolling rows never closes the app

    var colour = siteColour();
    if (colour) {
      safe(function () { tg.setHeaderColor(colour); });
      safe(function () { tg.setBackgroundColor(colour); });
    }

    // Native Back button: hidden on the home page, shown everywhere else.
    function syncBack() {
      safe(function () {
        var atHome = location.pathname === '/' || location.pathname === '' || location.pathname === '/app' || location.pathname === '/app/';
        if (!atHome && history.length > 1) tg.BackButton.show(); else tg.BackButton.hide();
      });
    }
    safe(function () { tg.BackButton.onClick(function () { history.back(); }); });
    syncBack();
    window.addEventListener('pageshow', syncBack);
    window.addEventListener('popstate', syncBack);

    // Links: t.me goes through Telegram; links to other sites open in the phone's browser.
    document.addEventListener('click', function (ev) {
      if (ev.defaultPrevented || ev.button > 0 || ev.metaKey || ev.ctrlKey) return;
      var a = ev.target && ev.target.closest ? ev.target.closest('a[href]') : null;
      if (!a) return;
      var url;
      try { url = new URL(a.href, location.href); } catch (e) { return; }
      if (url.protocol !== 'http:' && url.protocol !== 'https:') return;
      if (url.hostname === 't.me' || url.hostname === 'telegram.me') {
        ev.preventDefault();
        if (!safe(function () { tg.openTelegramLink(url.href); return true; })) location.href = url.href;
      } else if (a.hasAttribute('download') || url.pathname.indexOf('/tgstream/') === 0) {
        // Direct file downloads do nothing inside Telegram's built-in browser: hand them to the phone's browser.
        ev.preventDefault();
        if (!safe(function () { tg.openLink(url.href); return true; })) window.open(url.href, '_blank');
      } else if (url.hostname !== location.hostname && !/(^|\.)trendimovies\.com$/.test(url.hostname)) {
        ev.preventDefault();
        if (!safe(function () { tg.openLink(url.href); return true; })) window.open(url.href, '_blank');
      }
    }, true);
  }

  // Load Telegram's helper script from our own server, then start.
  var s = document.createElement('script');
  s.src = '/js/telegram-web-app.js';
  s.onload = function () { safe(start); };
  document.head.appendChild(s);
})();
