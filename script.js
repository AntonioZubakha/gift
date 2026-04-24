(function () {
  'use strict';

  const CAT_GIFS = Array.from({ length: 6 }, (_, i) => `assets/cats/cat${i + 1}.gif`);
  const CAT_SIZE = Math.round(72 * 1.5);

  const LEVEL_CFG = {
    1: { poopChance: 0, spawnMs: 2000 },
    2: { poopChance: 0.1, spawnMs: 2000 },
    3: { poopChance: 0.15, spawnMs: 1800 },
    4: { poopChance: 0.2, spawnMs: 1600 },
    5: { poopChance: 0.25, spawnMs: 1500 },
  };

  const MAIN_PASSWORD = 'c13';
  const TOO_MANY_CATS = 15;
  const TOO_MANY_POOPS = 8;

  const WRONG_PASSWORD_MSG = [
    'Не угадал. Думай ещё. Всего три попытки, между нами.\n(Это для атмосферы. Попыток сколько хочешь.)',
    'Снова мимо. Вторая из трёх «официальных» попыток улетела.\n(Нет, лимита нет. Мы просто дразнимся.)',
    'Ладно, ты безнадёжна… но пробуй ещё. Никаких трёх попыток на самом деле нет.',
  ];

  const WRONG_PASSWORD_MSG_AFTER =
    'Ну давай, ещё вариант. Ты почти у цели. Наверное.';

  const GIFT_EXTERNAL_URL = '';
  const GIFT_DOWNLOAD_PATH = 'assets/gift.pdf';

  function normPwd(s) {
    return String(s || '')
      .trim()
      .toLowerCase();
  }

  const pick = (arr) => arr[(Math.random() * arr.length) | 0];
  const maybe = (p, fn) => {
    if (Math.random() < p) fn();
  };

  const QUIPS_FEED = [
    'Ням. Кот доволен. Физика — нет.',
    'Один кот меньше. Зато драма больше.',
    'Корм принят. Жалоб нет. Законов тоже.',
    'Кот поел. Вселенная всё ещё не объяснилась.',
    'Это был не кот. Это был акт голодного реализма.',
  ];
  const QUIPS_PLOP = [
    'Инцидент зафиксирован. Мораль — по желанию.',
    'Природа напомнила о себе. Грубо.',
    'Новый артефакт на поле боя.',
    'Плотность абсурда ↑',
    'Кто-то оставил «визитку».',
  ];
  const QUIPS_FLUSH = [
    'Чистота. Относительная. Как и всё здесь.',
    'Ведро герой дня.',
    'Утилизировано с достоинством.',
    'Пропало без следа. Как смысл.',
    'Хьюстон, проблема… решена?',
  ];
  const QUIPS_SPAWN = [
    '+1 кот. −1 покой.',
    'Ещё один участник без репетиции.',
    'Кот материализовался. Законы ждут в коридоре.',
    'Пополнение. Зал аплодирует никто.',
  ];
  const QUIPS_MANY_CATS = [
    'Котов столько, что они уже выбирают президента.',
    'Это не уровень — это митинг с усами.',
    'Скорость кормления: критически ниже скорости котов.',
    'Ты кормишь. Они множатся. Всё по плану без плана.',
  ];
  const QUIPS_MANY_POOPS = [
    'Ландшафт стал… выразительным.',
    'Тут уже нужен не ведро, а археолог.',
    'Ситуация перешла в жанр «трагикомедия».',
    'Эскалация одобрена сценарием.',
  ];
  const QUIPS_IDLE = [
    'Подсказка: коты не читают инструкции.',
    'Еда слева внизу. Смысл — где-то в центре.',
    'Ведро любит путешествовать. Какашки — нет.',
    'Собака — это Ctrl+Z для котов.',
    'Если страшно — жми жёлтую кнопку. Если смешно — тоже.',
    'Этот уровень сертифицирован Министерством абсурда.',
    'Ты не проиграл, пока не начал драматически вздыхать.',
  ];
  const OVERLAY_LINES = [
    { l1: 'Уровень пройден!', l2: 'Коты в ауте. Зрители — тоже.', l3: 'Следующий акт через 2 секунды.' },
    { l1: 'Браво! Шекспир бы заплакал.', l2: 'Или засмеялся. Он такой.', l3: 'Дальше — только хуже. В хорошем смысле.' },
    { l1: 'Победа условная.', l2: 'Но аплодисменты — безусловные.', l3: 'Готовься к новой волне хаоса.' },
    { l1: 'Куратор доволен.', l2: '(Куратора не существует.)', l3: 'Следующий уровень уже в кулисах.' },
  ];
  const WIN_SUBS = [
    'Титры длиннее самой игры.',
    'Теперь ты официально в списках театра.',
    'Можно отдыхать. Коты — нет.',
    'Сертификат «пережил котохаос» выдаётся мысленно.',
  ];
  const DOG_LABELS = [
    'ВЫПУСТИТЬ СОБАКУ',
    'ЮРИДИЧЕСКИ КОРРЕКТНЫЙ ЛАЙ',
    'КНОПКА «СТРАХ И ТРЕПЕТ»',
    'ЛАЙ ВЫСШЕЙ ИНСТАНЦИИ',
    'СОБАКА.EXE',
    'РЕЖИМ: ПАНИКА',
  ];
  const PASSWORD_EXTRA_WRONG = [
    'Бип. Неверно. Бип. (мы роботы-абсурда)',
    'Близко. Нет, ладно, не близко.',
    'Пароль в другом замке. Шутка. Просто неверно.',
    'Драматическая пауза… всё ещё неверно.',
  ];

  let sfxCtx = null;
  function sfxCtxGet() {
    if (!sfxCtx) {
      try {
        sfxCtx = new (window.AudioContext || window.webkitAudioContext)();
      } catch (_) {
        return null;
      }
    }
    if (sfxCtx.state === 'suspended') sfxCtx.resume();
    return sfxCtx;
  }

  document.body.addEventListener(
    'pointerdown',
    () => {
      const c = sfxCtxGet();
      if (c) c.resume();
    },
    { once: true },
  );

  function sfx(kind) {
    const ctx = sfxCtxGet();
    if (!ctx) return;
    const t0 = ctx.currentTime;
    const bus = ctx.createGain();
    bus.gain.value = 0.32;
    bus.connect(ctx.destination);

    function blip(freq, dur, type, vol, delay) {
      const t = t0 + (delay || 0);
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = type;
      o.frequency.setValueAtTime(freq, t);
      g.gain.setValueAtTime(vol, t);
      g.gain.exponentialRampToValueAtTime(0.008, t + dur);
      o.connect(g);
      g.connect(bus);
      o.start(t);
      o.stop(t + dur + 0.02);
    }

    switch (kind) {
      case 'feed':
        blip(380, 0.05, 'triangle', 0.14, 0);
        blip(720, 0.07, 'sine', 0.1, 0.04);
        blip(960, 0.06, 'triangle', 0.06, 0.08);
        break;
      case 'plop':
        blip(95, 0.14, 'square', 0.09, 0);
        blip(55, 0.18, 'sine', 0.11, 0.02);
        break;
      case 'flush':
        blip(320, 0.06, 'sawtooth', 0.08, 0);
        blip(180, 0.14, 'triangle', 0.1, 0.05);
        blip(440, 0.08, 'sine', 0.05, 0.1);
        break;
      case 'level':
        blip(523, 0.16, 'triangle', 0.1, 0);
        blip(659, 0.16, 'triangle', 0.09, 0.1);
        blip(784, 0.2, 'triangle', 0.1, 0.2);
        break;
      case 'spawn':
        blip(880, 0.035, 'sine', 0.06, 0);
        break;
      case 'wrong':
        blip(110, 0.22, 'sawtooth', 0.12, 0);
        blip(75, 0.18, 'square', 0.08, 0.08);
        break;
      case 'win':
        blip(392, 0.18, 'triangle', 0.1, 0);
        blip(494, 0.18, 'triangle', 0.09, 0.08);
        blip(587, 0.22, 'triangle', 0.1, 0.16);
        blip(784, 0.28, 'triangle', 0.08, 0.24);
        break;
      case 'boing':
        blip(200, 0.08, 'triangle', 0.12, 0);
        blip(350, 0.1, 'sine', 0.08, 0.04);
        break;
      default:
        break;
    }
  }

  function bodyShake() {
    document.body.classList.remove('body--shake');
    void document.body.offsetWidth;
    document.body.classList.add('body--shake');
    window.setTimeout(() => document.body.classList.remove('body--shake'), 450);
  }

  function playfieldFlash() {
    playfield.classList.remove('playfield--impact');
    void playfield.offsetWidth;
    playfield.classList.add('playfield--impact');
    window.setTimeout(() => playfield.classList.remove('playfield--impact'), 380);
  }

  function setAbsurdTicker(text) {
    const el = document.getElementById('absurd-ticker');
    if (el) el.textContent = text;
  }

  function burstEmojis(emojis, n, container) {
    const fx = container || document.getElementById('playfield-fx');
    if (!fx) return;
    const w = fx.clientWidth || 320;
    const h = fx.clientHeight || 240;
    for (let i = 0; i < n; i += 1) {
      const sp = document.createElement('span');
      sp.className = 'fx-emoji';
      sp.textContent = pick(emojis);
      sp.style.left = `${10 + Math.random() * (w - 40)}px`;
      sp.style.top = `${10 + Math.random() * (h - 40)}px`;
      const dx = (Math.random() - 0.5) * 120;
      const dy = -80 - Math.random() * 100;
      sp.style.setProperty('--fx-dx', `${dx}px`);
      sp.style.setProperty('--fx-dy', `${dy}px`);
      fx.appendChild(sp);
      window.setTimeout(() => sp.remove(), 1200);
    }
  }

  let dogLabelSpin = 0;
  let absurdIdleTimer = null;

  function startAbsurdIdle() {
    if (absurdIdleTimer) clearInterval(absurdIdleTimer);
    absurdIdleTimer = window.setInterval(() => {
      if (!screenGame.classList.contains('screen--active') || gameState.gameWon) return;
      if (gameState.levelCompleting) return;
      maybe(0.55, () => setAbsurdTicker(pick(QUIPS_IDLE)));
    }, 14000);
  }

  let nextId = 1;

  const gameState = {
    level: 1,
    cats: [],
    poops: [],
    dogsLeft: 3,
    catsFed: 0,
    dogCooldown: false,
    gameWon: false,
    levelCompleting: false,
    spawnTimerId: null,
    toastTimer: null,
    passwordAttempts: 0,
  };

  const playfield = document.getElementById('playfield');
  const food = document.getElementById('food');
  const trash = document.getElementById('trash');
  const dogOverlay = document.getElementById('dog-overlay');
  const dogImg = document.getElementById('dog-img');
  const btnDog = document.getElementById('btn-dog');
  const toast = document.getElementById('toast');
  const levelOverlay = document.getElementById('level-overlay');
  const barkAudio = document.getElementById('bark-audio');

  let foodDragging = false;
  let foodOffsetX = 0;
  let foodOffsetY = 0;
  let foodCaptureId = null;

  const screenGame = document.getElementById('screen-game');
  const screenWin = document.getElementById('screen-win');
  const screenPassword = document.getElementById('screen-password');

  function getLevelConfig() {
    return LEVEL_CFG[gameState.level] || LEVEL_CFG[5];
  }

  function catSizePx(cat) {
    const px = cat.el.offsetWidth;
    return px > 0 ? px : CAT_SIZE;
  }

  const FOOD_MARGIN = 12;
  const FOOD_FEED_HOLD_MS = 160;
  const FOOD_RETURN_MS = 450;

  let foodX = FOOD_MARGIN;
  let foodY = FOOD_MARGIN;
  let foodAnimating = false;
  let foodMoveRaf = null;
  let lastFoodClientX = 0;
  let lastFoodClientY = 0;
  let foodOverlapTimer = null;
  let foodOverlapCat = null;
  let foodReturnEndHandler = null;
  let foodReturnFallbackId = null;

  let trashX = 0;
  let trashY = 0;
  let trashDragging = false;
  let trashOffsetX = 0;
  let trashOffsetY = 0;
  let trashCaptureId = null;
  let trashMoveRaf = null;
  let lastTrashClientX = 0;
  let lastTrashClientY = 0;

  function syncFoodCornerCoords() {
    const h = playfield.clientHeight;
    const w = playfield.clientWidth;
    const fh = food.offsetHeight || 64;
    const fw = food.offsetWidth || 64;
    foodX = FOOD_MARGIN;
    foodY = Math.max(FOOD_MARGIN, h - fh - FOOD_MARGIN);
    if (w > fw + FOOD_MARGIN * 2) {
      foodX = Math.min(foodX, w - fw - FOOD_MARGIN);
    }
  }

  function releaseFoodPointerCapture() {
    if (foodCaptureId != null) {
      try {
        if (food.hasPointerCapture(foodCaptureId)) {
          food.releasePointerCapture(foodCaptureId);
        }
      } catch (_) {
        /* ignore */
      }
      foodCaptureId = null;
    }
  }

  function applyFoodPosition() {
    food.style.left = '0';
    food.style.top = '0';
    food.style.right = 'auto';
    food.style.bottom = 'auto';
    food.style.transform = `translate3d(${foodX}px, ${foodY}px, 0)`;
  }

  function cancelFoodMoveRaf() {
    if (foodMoveRaf != null) {
      cancelAnimationFrame(foodMoveRaf);
      foodMoveRaf = null;
    }
  }

  function clearFoodOverlapWatch() {
    if (foodOverlapTimer != null) {
      clearTimeout(foodOverlapTimer);
      foodOverlapTimer = null;
    }
    foodOverlapCat = null;
  }

  function clearFoodReturnListener() {
    if (foodReturnEndHandler) {
      food.removeEventListener('transitionend', foodReturnEndHandler);
      foodReturnEndHandler = null;
    }
  }

  function clearFoodReturnFallback() {
    if (foodReturnFallbackId != null) {
      clearTimeout(foodReturnFallbackId);
      foodReturnFallbackId = null;
    }
  }

  function finishFoodReturnAnimation() {
    clearFoodReturnFallback();
    clearFoodReturnListener();
    food.style.transition = 'none';
    void food.offsetHeight;
    foodAnimating = false;
    food.classList.remove('food--busy');
    requestAnimationFrame(() => {
      food.style.transition = '';
    });
  }

  function resetFoodToCorner() {
    foodDragging = false;
    foodAnimating = false;
    food.style.zIndex = '';
    food.classList.remove('food--dragging', 'food--busy');
    clearFoodOverlapWatch();
    cancelFoodMoveRaf();
    clearFoodReturnFallback();
    clearFoodReturnListener();
    food.style.transition = 'none';
    syncFoodCornerCoords();
    applyFoodPosition();
    releaseFoodPointerCapture();
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        food.style.transition = '';
      });
    });
  }

  function returnFoodSmoothly() {
    clearFoodOverlapWatch();
    cancelFoodMoveRaf();
    foodDragging = false;
    releaseFoodPointerCapture();
    food.classList.remove('food--dragging');
    food.style.zIndex = '';
    clearFoodReturnFallback();
    clearFoodReturnListener();

    const h = playfield.clientHeight;
    const w = playfield.clientWidth;
    const fh = food.offsetHeight || 64;
    const fw = food.offsetWidth || 64;
    const endX = FOOD_MARGIN;
    const endY = Math.max(FOOD_MARGIN, h - fh - FOOD_MARGIN);
    const safeEndX = w > fw + FOOD_MARGIN * 2 ? Math.min(endX, w - fw - FOOD_MARGIN) : endX;

    if (Math.hypot(foodX - safeEndX, foodY - endY) < 4) {
      foodX = safeEndX;
      foodY = endY;
      applyFoodPosition();
      return;
    }

    foodAnimating = true;
    food.classList.add('food--busy');
    food.style.transition = 'none';
    applyFoodPosition();
    void food.offsetHeight;

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        food.style.transition = `transform ${FOOD_RETURN_MS}ms cubic-bezier(0.2, 0.85, 0.25, 1)`;
        foodX = safeEndX;
        foodY = endY;
        applyFoodPosition();

        foodReturnEndHandler = (ev) => {
          if (ev.propertyName !== 'transform') return;
          finishFoodReturnAnimation();
        };
        food.addEventListener('transitionend', foodReturnEndHandler);
        foodReturnFallbackId = window.setTimeout(() => {
          foodReturnFallbackId = null;
          if (foodAnimating) finishFoodReturnAnimation();
        }, FOOD_RETURN_MS + 160);
      });
    });
  }

  function syncTrashCornerCoords() {
    const w = playfield.clientWidth;
    const h = playfield.clientHeight;
    const tw = trash.offsetWidth || 72;
    const th = trash.offsetHeight || 72;
    trashX = Math.max(FOOD_MARGIN, w - tw - FOOD_MARGIN);
    trashY = Math.max(FOOD_MARGIN, h - th - FOOD_MARGIN);
  }

  function applyTrashPosition() {
    trash.style.left = '0';
    trash.style.top = '0';
    trash.style.right = 'auto';
    trash.style.bottom = 'auto';
    trash.style.transform = `translate3d(${trashX}px, ${trashY}px, 0)`;
  }

  function releaseTrashPointerCapture() {
    if (trashCaptureId != null) {
      try {
        if (trash.hasPointerCapture(trashCaptureId)) {
          trash.releasePointerCapture(trashCaptureId);
        }
      } catch (_) {
        /* ignore */
      }
      trashCaptureId = null;
    }
  }

  function cancelTrashMoveRaf() {
    if (trashMoveRaf != null) {
      cancelAnimationFrame(trashMoveRaf);
      trashMoveRaf = null;
    }
  }

  function resetTrashToCorner() {
    trashDragging = false;
    trash.classList.remove('trash--dragging');
    trash.style.zIndex = '';
    cancelTrashMoveRaf();
    releaseTrashPointerCapture();
    syncTrashCornerCoords();
    applyTrashPosition();
  }

  function showScreen(name) {
    screenGame.classList.toggle('screen--active', name === 'game');
    screenWin.classList.toggle('screen--active', name === 'win');
    screenPassword.classList.toggle('screen--active', name === 'password');
    if (name === 'win') {
      sfx('win');
      bodyShake();
      const ws = document.getElementById('win-sub');
      if (ws) ws.textContent = pick(WIN_SUBS);
      const wf = document.getElementById('win-fx');
      window.setTimeout(() => {
        burstEmojis(['🎉', '🐱', '🎊', '✨', '😵', '🏆'], 18, wf);
      }, 80);
    }
  }

  function setToast(text, durationMs) {
    if (gameState.toastTimer) clearTimeout(gameState.toastTimer);
    toast.textContent = text || '';
    if (durationMs && text) {
      gameState.toastTimer = setTimeout(() => {
        toast.textContent = '';
      }, durationMs);
    }
  }

  function updateHud() {
    document.getElementById('stat-level').textContent = String(gameState.level);
    document.getElementById('stat-fed').textContent = String(gameState.catsFed);
    document.getElementById('stat-cats').textContent = String(gameState.cats.length);
    document.getElementById('stat-poops').textContent = String(gameState.poops.length);
    document.getElementById('stat-dogs').textContent = String(gameState.dogsLeft);
    document.getElementById('dogs-left-label').textContent = String(gameState.dogsLeft);

    if (gameState.cats.length >= TOO_MANY_CATS) {
      setToast(pick(QUIPS_MANY_CATS), 0);
      maybe(0.08, () => sfx('wrong'));
    } else if (gameState.poops.length >= TOO_MANY_POOPS) {
      setToast(pick(QUIPS_MANY_POOPS), 0);
      maybe(0.08, () => sfx('plop'));
    } else if (!gameState.levelCompleting) {
      setToast('', 0);
    }

    updateDogButton();
  }

  function updateDogButton() {
    if (gameState.dogsLeft <= 0 || gameState.dogCooldown) {
      btnDog.textContent = gameState.dogsLeft <= 0 ? 'СОБАКИ ЗАКОНЧИЛИСЬ (сюжетно)' : 'СОБАКА ПЕРЕЗАРЯЖАЕТСЯ…';
    } else {
      btnDog.textContent = DOG_LABELS[dogLabelSpin % DOG_LABELS.length];
    }
    btnDog.disabled = gameState.dogsLeft <= 0 || gameState.dogCooldown;
  }

  function clearSpawnTimer() {
    if (gameState.spawnTimerId) {
      clearInterval(gameState.spawnTimerId);
      gameState.spawnTimerId = null;
    }
  }

  function removeCat(cat) {
    if (cat.poopTimeoutId) {
      clearTimeout(cat.poopTimeoutId);
      cat.poopTimeoutId = null;
    }
    const i = gameState.cats.indexOf(cat);
    if (i !== -1) gameState.cats.splice(i, 1);
    cat.el.remove();
  }

  function removePoop(poop, opts) {
    const i = gameState.poops.indexOf(poop);
    if (i !== -1) gameState.poops.splice(i, 1);
    poop.el.remove();
    if (opts && opts.fromBin && !opts.quiet) {
      sfx('flush');
      setAbsurdTicker(pick(QUIPS_FLUSH));
      maybe(0.35, () => burstEmojis(['✨', '🧹', '♻️', '✓'], 4));
    }
  }

  function clearAllEntities() {
    gameState.cats.slice().forEach(removeCat);
    gameState.poops.slice().forEach(removePoop);
  }

  function playBark() {
    const tryPlay = () => {
      barkAudio.currentTime = 0;
      const p = barkAudio.play();
      if (p && typeof p.catch === 'function') {
        p.catch(() => playBarkSynth());
      }
    };
    if (barkAudio.readyState >= 2) tryPlay();
    else {
      barkAudio.addEventListener('canplay', tryPlay, { once: true });
      barkAudio.load();
      setTimeout(() => {
        if (barkAudio.paused) playBarkSynth();
      }, 400);
    }
  }

  function playBarkSynth() {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const dur = 0.16 + Math.random() * 0.08;
      const f0 = 340 + Math.random() * 140;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(f0, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(70 + Math.random() * 40, ctx.currentTime + dur);
      gain.gain.setValueAtTime(0.18 + Math.random() * 0.06, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + dur);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + dur);
      osc.onended = () => ctx.close();
    } catch (_) {
      /* ignore */
    }
  }

  function schedulePoopAttempts(cat) {
    if (gameState.level < 2) return;
    const delay = 5000 + Math.random() * 3000;
    cat.poopTimeoutId = window.setTimeout(() => {
      if (!cat.el.isConnected) return;
      const cfg = getLevelConfig();
      if (Math.random() < cfg.poopChance) {
        const cw = cat.el.offsetWidth || CAT_SIZE;
        const ch = cat.el.offsetHeight || CAT_SIZE;
        spawnPoop(cat.x + Math.round(cw * 0.14), cat.y + Math.round(ch * 0.56));
      }
      schedulePoopAttempts(cat);
    }, delay);
  }

  function spawnCat() {
    if (gameState.gameWon || gameState.levelCompleting) return;
    const w = playfield.clientWidth;
    const h = playfield.clientHeight;

    const el = document.createElement('div');
    el.className = 'cat';
    const img = document.createElement('img');
    img.src = CAT_GIFS[(Math.random() * CAT_GIFS.length) | 0];
    img.alt = 'Cat';
    el.appendChild(img);
    playfield.appendChild(el);

    const size = el.offsetWidth || CAT_SIZE;
    const x = Math.random() * Math.max(1, w - size);
    const y = Math.random() * Math.max(1, h - size);

    const angle = Math.random() * Math.PI * 2;
    const speed = 40 + Math.random() * 60;
    const cat = {
      id: nextId++,
      el,
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      scared: false,
      poopTimeoutId: null,
    };

    el.style.transform = `translate(${x}px, ${y}px)`;
    gameState.cats.push(cat);
    schedulePoopAttempts(cat);
    maybe(0.12, () => sfx('spawn'));
    maybe(0.14, () => setAbsurdTicker(pick(QUIPS_SPAWN)));
    maybe(0.08, () => burstEmojis(['🐱', '❓', '➕'], 2));
    updateHud();
    tryCheckLevelClear();
  }

  function spawnPoop(x, y) {
    const w = playfield.clientWidth;
    const h = playfield.clientHeight;
    const px = Math.min(Math.max(0, x), Math.max(0, w - 48));
    const py = Math.min(Math.max(0, y), Math.max(0, h - 48));

    const el = document.createElement('div');
    el.className = 'poop';
    const img = document.createElement('img');
    img.src = 'assets/poop/poop.gif';
    img.alt = 'Poop';
    img.draggable = false;
    el.appendChild(img);
    playfield.appendChild(el);

    const poop = {
      id: nextId++,
      el,
      x: px,
      y: py,
    };
    el.style.transform = `translate(${px}px, ${py}px)`;
    gameState.poops.push(poop);
    sfx('plop');
    playfieldFlash();
    setAbsurdTicker(pick(QUIPS_PLOP));
    maybe(0.4, () => burstEmojis(['💩', '❗', '📎'], 3));
    updateHud();
    tryCheckLevelClear();
  }

  function feedCatAt(cat) {
    clearFoodOverlapWatch();
    gameState.catsFed += 1;
    sfx('feed');
    setAbsurdTicker(pick(QUIPS_FEED));
    maybe(0.45, () => burstEmojis(['😺', '🍽️', '✨', '⭐'], 5));
    removeCat(cat);
    updateHud();
    tryCheckLevelClear();
    returnFoodSmoothly();
  }

  function tryCheckLevelClear() {
    if (gameState.gameWon || gameState.levelCompleting) return;
    if (gameState.cats.length === 0 && gameState.poops.length === 0) {
      completeLevel();
    }
  }

  function onSpawnTick() {
    if (gameState.gameWon || gameState.levelCompleting) return;
    if (gameState.cats.length === 0 && gameState.poops.length === 0) {
      completeLevel();
      return;
    }
    spawnCat();
  }

  function completeLevel() {
    if (gameState.levelCompleting || gameState.gameWon) return;
    gameState.levelCompleting = true;
    clearSpawnTimer();

    sfx('level');
    bodyShake();
    playfieldFlash();
    burstEmojis(['🎭', '✨', '🏆', '👏', '😵'], 10);
    const lines = pick(OVERLAY_LINES);
    const o1 = document.getElementById('overlay-l1');
    const o2 = document.getElementById('overlay-l2');
    const o3 = document.getElementById('overlay-l3');
    if (o1) o1.textContent = lines.l1;
    if (o2) o2.textContent = lines.l2;
    if (o3) o3.textContent = lines.l3;

    levelOverlay.classList.remove('overlay--hidden');

    const finished = gameState.level;

    window.setTimeout(() => {
      levelOverlay.classList.add('overlay--hidden');
      gameState.levelCompleting = false;

      if (finished >= 5) {
        gameState.gameWon = true;
        showScreen('win');
        return;
      }

      gameState.level += 1;
      startLevel();
    }, 2000);
  }

  function startLevel() {
    clearSpawnTimer();
    clearAllEntities();
    resetFoodToCorner();
    resetTrashToCorner();
    const cfg = getLevelConfig();
    for (let i = 0; i < 3; i += 1) spawnCat();
    gameState.spawnTimerId = window.setInterval(onSpawnTick, cfg.spawnMs);
    sfx('boing');
    setAbsurdTicker(`Уровень ${gameState.level}. Занавес вверх. Коты вниз.`);
    startAbsurdIdle();
    updateHud();
  }

  function showDogGif() {
    dogImg.src = 'assets/dog/dog.gif';
    dogOverlay.classList.add('dog-overlay--visible');
  }

  function hideDogGif() {
    dogOverlay.classList.remove('dog-overlay--visible');
  }

  function activateNormalDog() {
    if (gameState.dogsLeft <= 0 || gameState.dogCooldown) return;
    dogLabelSpin += 1;
    gameState.dogsLeft -= 1;
    gameState.dogCooldown = true;
    btnDog.disabled = true;
    updateHud();

    bodyShake();
    playfieldFlash();
    setAbsurdTicker('СОБАКА. Сцена. Хаос. Держись.');
    burstEmojis(['🐕', '‼️', '💨', '🔊'], 8);
    playBark();
    showDogGif();

    const w = playfield.clientWidth;
    const h = playfield.clientHeight;
    gameState.cats.forEach((cat) => {
      cat.scared = true;
      cat.el.classList.add('cat--scared');
      const cz = catSizePx(cat);
      const cx = cat.x + cz / 2;
      const cy = cat.y + cz / 2;
      const tcx = w / 2;
      const tcy = h / 2;
      let dx = cx - tcx;
      let dy = cy - tcy;
      const len = Math.hypot(dx, dy) || 1;
      dx /= len;
      dy /= len;
      const speed = 320;
      cat.vx = dx * speed;
      cat.vy = dy * speed;
    });

    const duration = 2000 + Math.random() * 1000;
    window.setTimeout(() => {
      gameState.cats.slice().forEach(removeCat);
      hideDogGif();
      updateHud();
      tryCheckLevelClear();
    }, duration);

    window.setTimeout(() => {
      gameState.dogCooldown = false;
      updateDogButton();
    }, 5000);
  }

  btnDog.addEventListener('click', () => {
    activateNormalDog();
  });

  function rectsOverlap(a, b) {
    return a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;
  }

  function rectsOverlapSoft(foodRect, catRect, inset) {
    const inner = {
      left: catRect.left + inset,
      right: catRect.right - inset,
      top: catRect.top + inset,
      bottom: catRect.bottom - inset,
    };
    if (inner.left >= inner.right || inner.top >= inner.bottom) {
      return rectsOverlap(foodRect, catRect);
    }
    return rectsOverlap(foodRect, inner);
  }

  function checkFoodCatOverlap() {
    if (!foodDragging || foodAnimating) return;
    const fr = food.getBoundingClientRect();
    const inset = 10;
    let found = null;
    for (const cat of gameState.cats) {
      if (cat.scared) continue;
      const cr = cat.el.getBoundingClientRect();
      if (rectsOverlapSoft(fr, cr, inset)) {
        found = cat;
        break;
      }
    }
    if (!found) {
      clearFoodOverlapWatch();
      return;
    }
    if (foodOverlapCat === found && foodOverlapTimer != null) {
      return;
    }
    clearFoodOverlapWatch();
    foodOverlapCat = found;
    const targetCat = found;
    foodOverlapTimer = window.setTimeout(() => {
      foodOverlapTimer = null;
      if (!foodDragging || foodAnimating) return;
      if (!gameState.cats.includes(targetCat)) return;
      feedCatAt(targetCat);
      foodOverlapCat = null;
    }, FOOD_FEED_HOLD_MS);
  }

  function checkTrashPoopOverlap() {
    if (!trashDragging) return;
    const tr = trash.getBoundingClientRect();
    let removed = false;
    let flushN = 0;
    for (const poop of gameState.poops.slice()) {
      const pr = poop.el.getBoundingClientRect();
      if (rectsOverlap(tr, pr)) {
        removePoop(poop, { fromBin: true, quiet: flushN > 0 });
        flushN += 1;
        removed = true;
      }
    }
    if (removed) {
      updateHud();
      tryCheckLevelClear();
    }
  }

  function setupTrashDrag() {
    trash.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      trash.setPointerCapture(e.pointerId);
      trashCaptureId = e.pointerId;
      trashDragging = true;
      trash.classList.add('trash--dragging');
      const pf = playfield.getBoundingClientRect();
      trashOffsetX = e.clientX - pf.left - trashX;
      trashOffsetY = e.clientY - pf.top - trashY;
      trash.style.zIndex = '40';
    });

    trash.addEventListener('pointermove', (e) => {
      lastTrashClientX = e.clientX;
      lastTrashClientY = e.clientY;
      if (!trashDragging) return;
      if (trashMoveRaf != null) return;
      trashMoveRaf = window.requestAnimationFrame(() => {
        trashMoveRaf = null;
        if (!trashDragging) return;
        const pf = playfield.getBoundingClientRect();
        let nx = lastTrashClientX - pf.left - trashOffsetX;
        let ny = lastTrashClientY - pf.top - trashOffsetY;
        const maxX = playfield.clientWidth - trash.offsetWidth;
        const maxY = playfield.clientHeight - trash.offsetHeight;
        nx = Math.min(Math.max(0, nx), Math.max(0, maxX));
        ny = Math.min(Math.max(0, ny), Math.max(0, maxY));
        trashX = nx;
        trashY = ny;
        applyTrashPosition();
        checkTrashPoopOverlap();
      });
    });

    const onTrashPointerEnd = () => {
      if (!trashDragging) return;
      trashDragging = false;
      trash.classList.remove('trash--dragging');
      trash.style.zIndex = '';
      cancelTrashMoveRaf();
      releaseTrashPointerCapture();
    };

    trash.addEventListener('pointerup', onTrashPointerEnd);
    trash.addEventListener('pointercancel', onTrashPointerEnd);
  }

  function setupFoodDrag() {
    food.addEventListener('pointerdown', (e) => {
      if (foodAnimating) {
        e.preventDefault();
        return;
      }
      e.preventDefault();
      food.setPointerCapture(e.pointerId);
      foodCaptureId = e.pointerId;
      foodDragging = true;
      food.classList.add('food--dragging');
      const pf = playfield.getBoundingClientRect();
      foodOffsetX = e.clientX - pf.left - foodX;
      foodOffsetY = e.clientY - pf.top - foodY;
      food.style.zIndex = '40';
    });

    food.addEventListener('pointermove', (e) => {
      lastFoodClientX = e.clientX;
      lastFoodClientY = e.clientY;
      if (!foodDragging || foodAnimating) return;
      if (foodMoveRaf != null) return;
      foodMoveRaf = window.requestAnimationFrame(() => {
        foodMoveRaf = null;
        if (!foodDragging || foodAnimating) return;
        const pf = playfield.getBoundingClientRect();
        let nx = lastFoodClientX - pf.left - foodOffsetX;
        let ny = lastFoodClientY - pf.top - foodOffsetY;
        const maxX = playfield.clientWidth - food.offsetWidth;
        const maxY = playfield.clientHeight - food.offsetHeight;
        nx = Math.min(Math.max(0, nx), Math.max(0, maxX));
        ny = Math.min(Math.max(0, ny), Math.max(0, maxY));
        foodX = nx;
        foodY = ny;
        applyFoodPosition();
        checkFoodCatOverlap();
      });
    });

    const onFoodPointerEnd = () => {
      if (!foodDragging) return;
      foodDragging = false;
      food.classList.remove('food--dragging');
      food.style.zIndex = '';
      clearFoodOverlapWatch();
      cancelFoodMoveRaf();
      releaseFoodPointerCapture();
    };

    food.addEventListener('pointerup', onFoodPointerEnd);
    food.addEventListener('pointercancel', onFoodPointerEnd);
  }

  function tickCats(dt) {
    const w = playfield.clientWidth;
    const h = playfield.clientHeight;
    gameState.cats.slice().forEach((cat) => {
      const size = catSizePx(cat);

      if (cat.scared) {
        cat.x += cat.vx * dt;
        cat.y += cat.vy * dt;
        if (cat.x < -size || cat.x > w + size || cat.y < -size || cat.y > h + size) {
          removeCat(cat);
        } else {
          cat.el.style.transform = `translate(${cat.x}px, ${cat.y}px)`;
        }
        return;
      }

      if (Math.random() < 0.02) {
        cat.vx += (Math.random() - 0.5) * 40;
        cat.vy += (Math.random() - 0.5) * 40;
      }
      const maxSpeed = 120;
      const sp = Math.hypot(cat.vx, cat.vy);
      if (sp > maxSpeed) {
        cat.vx = (cat.vx / sp) * maxSpeed;
        cat.vy = (cat.vy / sp) * maxSpeed;
      }

      cat.x += cat.vx * dt;
      cat.y += cat.vy * dt;

      if (cat.x <= 0) {
        cat.x = 0;
        cat.vx = Math.abs(cat.vx);
      } else if (cat.x > w - size) {
        cat.x = w - size;
        cat.vx = -Math.abs(cat.vx);
      }
      if (cat.y <= 0) {
        cat.y = 0;
        cat.vy = Math.abs(cat.vy);
      } else if (cat.y > h - size) {
        cat.y = h - size;
        cat.vy = -Math.abs(cat.vy);
      }

      cat.el.style.transform = `translate(${cat.x}px, ${cat.y}px)`;
    });
  }

  let lastTs = 0;
  function loop(ts) {
    if (!lastTs) lastTs = ts;
    const dt = Math.min(0.05, (ts - lastTs) / 1000);
    lastTs = ts;
    tickCats(dt);
    gameState.rafId = requestAnimationFrame(loop);
  }

  document.getElementById('btn-unlock').addEventListener('click', () => {
    showScreen('password');
    document.getElementById('password-input').focus();
  });

  document.getElementById('password-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const input = document.getElementById('password-input');
    const msg = document.getElementById('password-msg');
    const val = normPwd(input.value);

    if (val === MAIN_PASSWORD) {
      msg.textContent = '';
      gameState.passwordAttempts = 0;
      sfx('win');
      setAbsurdTicker('Доступ. Или иллюзия доступа. В любом случае — молодец.');
      if (GIFT_EXTERNAL_URL && GIFT_EXTERNAL_URL.length > 0) {
        window.open(GIFT_EXTERNAL_URL, '_blank', 'noopener,noreferrer');
      }
      if (GIFT_DOWNLOAD_PATH && GIFT_DOWNLOAD_PATH.length > 0) {
        const a = document.createElement('a');
        a.href = GIFT_DOWNLOAD_PATH;
        a.download = 'gift.pdf';
        document.body.appendChild(a);
        a.click();
        a.remove();
      }
      if ((!GIFT_EXTERNAL_URL || GIFT_EXTERNAL_URL.length === 0) && (!GIFT_DOWNLOAD_PATH || GIFT_DOWNLOAD_PATH.length === 0)) {
        msg.textContent = 'Подарок почти здесь — задайте GIFT_EXTERNAL_URL или GIFT_DOWNLOAD_PATH в script.js.';
      }
      return;
    }

    gameState.passwordAttempts += 1;
    sfx('wrong');
    const i = gameState.passwordAttempts;
    let line = i <= 3 ? WRONG_PASSWORD_MSG[i - 1] : WRONG_PASSWORD_MSG_AFTER;
    if (Math.random() < 0.5) {
      line = `${line}\n${pick(PASSWORD_EXTRA_WRONG)}`;
    }
    msg.textContent = line;
  });

  setupTrashDrag();
  setupFoodDrag();

  window.addEventListener('resize', () => {
    if (!foodDragging && !foodAnimating) {
      syncFoodCornerCoords();
      applyFoodPosition();
    }
    if (!trashDragging) {
      syncTrashCornerCoords();
      applyTrashPosition();
    }
    updateHud();
  });

  gameState.rafId = requestAnimationFrame(loop);
  startLevel();
})();
