(function () {
  'use strict';

  const CAT_GIFS = Array.from({ length: 6 }, (_, i) => `assets/cats/cat${i + 1}.gif`);
  const CAT_SIZE = Math.round(72 * 1.5);

  /** Три уровня: сложность строго растёт (1 < 2 < 3). */
  const MAX_LEVEL = 3;
  const LEVEL_CFG = {
    1: { poopChance: 0, spawnMs: 2200, poopDelayMin: 0, poopDelayMax: 0 },
    2: {
      poopChance: 0.38,
      spawnMs: 1850,
      poopDelayMin: 2200,
      poopDelayMax: 3800,
    },
    3: {
      poopChance: 0.52,
      spawnMs: 1450,
      poopDelayMin: 1600,
      poopDelayMax: 3000,
    },
  };

  const MAIN_PASSWORD = 'c13';
  const RIDDLE_UNLOCK_2 = '1502';
  const RIDDLE_UNLOCK_3 = '2025';
  const TOO_MANY_CATS = 15;
  const TOO_MANY_POOPS = 8;

  const WRONG_PASSWORD_MSG = [
    'Не угадал. Думай ещё. Всего три попытки, между нами.\n(Это для атмосферы. Попыток сколько хочешь.)',
    'Снова мимо. Вторая из трёх «официальных» попыток улетела.\n(Нет, лимита нет. Мы просто дразнимся.)',
    'Ладно, ты безнадёжна… но пробуй ещё. Никаких трёх попыток на самом деле нет.',
  ];

  const WRONG_PASSWORD_MSG_AFTER =
    'Ну давай, ещё вариант. Ты почти у цели. Наверное. Возможно. В каком-то смысле.';

  const GIFT_EXTERNAL_URL = '';
  const GIFT_DOWNLOAD_PATH = 'assets/gift.pdf';

  const KONAMI = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];
  let konamiIdx = 0;

  function normPwd(s) {
    return String(s || '')
      .trim()
      .toLowerCase();
  }

  function normPwdChar(s) {
    return String(s || '')
      .trim()
      .toLowerCase()
      .charAt(0);
  }

  function normDigitsOnly(s, maxLen) {
    const d = String(s || '').replace(/\D/g, '');
    return typeof maxLen === 'number' ? d.slice(0, maxLen) : d;
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
    'Шеф-повар невидимого ресторана кивает.',
    'Вкусно. Странно. Эффективно.',
    'Кот покинул чат. Мурча.',
    'Желудок — 1, Абсурд — ∞.',
  ];
  const QUIPS_PLOP = [
    'Инцидент зафиксирован. Мораль — по желанию.',
    'Природа напомнила о себе. Грубо.',
    'Новый артефакт на поле боя.',
    'Плотность абсурда ↑',
    'Кто-то оставил «визитку».',
    'Художественный жест в стиле раннего постмодерна.',
    'Это не баг. Это инсталляция.',
  ];
  const QUIPS_FLUSH = [
    'Чистота. Относительная. Как и всё здесь.',
    'Ведро — герой дня.',
    'Утилизировано с достоинством.',
    'Пропало без следа. Как смысл.',
    'Хьюстон, проблема… решена?',
    'Спасибо, что убрали. Коты не благодарят.',
  ];
  const QUIPS_SPAWN = [
    '+1 кот. −1 покой.',
    'Ещё один участник без репетиции.',
    'Кот материализовался. Законы ждут в коридоре.',
    'Пополнение. Зал аплодирует никто.',
    'Родился в муках. Мучений будет больше.',
  ];
  const QUIPS_MANY_CATS = [
    'Котов столько, что они уже выбирают президента.',
    'Это не уровень — это митинг с усами.',
    'Скорость кормления: критически ниже скорости котов.',
    'Ты кормишь. Они множатся. Всё по плану без плана.',
    'Профсоюз котов требует повышения зарплаты.',
  ];
  const QUIPS_MANY_POOPS = [
    'Ландшафт стал… выразительным.',
    'Тут уже нужен не ведро, а археолог.',
    'Ситуация перешла в жанр «трагикомедия».',
    'Эскалация одобрена сценарием.',
    'Минкульт внёс в список наследия.',
  ];
  const QUIPS_IDLE = [
    'Подсказка: коты не читают инструкции.',
    'Еда слева внизу. Смысл — где-то в центре.',
    'Ведро любит путешествовать. Какашки — нет.',
    'Собака — это Ctrl+Z для котов.',
    'Если страшно — жми жёлтую кнопку. Если смешно — тоже.',
    'Этот уровень сертифицирован Министерством абсурда.',
    'Ты не проиграл, пока не начал драматически вздыхать.',
    'Кликни по заголовку пять раз — жди сюрприз.',
    'Секретный код: ↑↑↓↓←→←→BA. Работает, честно.',
    '🪩 кнопка ничем не помогает. Но весело.',
    'Жизнь — это уровень 1 с респавном багов.',
    'Сегодня спонсор выпуска — хаос.',
    'Лазер, клубок и коробка — тяни. Мышь сама. Коты — в шоке.',
  ];
  const QUIPS_MOUSE_CATCH = [
    'Мышь поймана. Ресторан «Не то, но с энтузиазмом» закрыт.',
    '+1 к иллюзии охоты. Мышь телепортировалась в другую вселенную.',
    'Кто-то съел не то. Но с аппетитом.',
    'Мышь: «это был спидран». Кот: «это был обед».',
    'Мышь снова на свободе. Ну, почти. В другом месте.',
  ];
  const OVERLAY_LINES = [
    { l1: 'Уровень пройден!', l2: 'Коты в ауте. Зрители — тоже.', l3: 'Передышка. Дальше — по твоей команде.' },
    { l1: 'Браво! Шекспир бы заплакал.', l2: 'Или засмеялся. Он такой.', l3: 'Дальше — только хуже. В хорошем смысле. Когда нажмёшь.' },
    { l1: 'Победа условная.', l2: 'Но аплодисменты — безусловные.', l3: 'Готовься к новой волне хаоса — и жми кнопку.' },
    { l1: 'Куратор доволен.', l2: '(Куратора не существует.)', l3: 'Следующий уровень в кулисах ждёт клика.' },
    { l1: 'Совет котов принял резолюцию.', l2: 'Кормить тебя обратно.', l3: 'Но сначала — ты решаешь, когда идти дальше.' },
    { l1: 'Вы только что спасли вселенную.', l2: 'Точнее, одну конкретную комнату.', l3: 'Вселенная — в следующем раунде. По кнопке.' },
  ];
  const WIN_SUBS = [
    'Титры длиннее самой игры.',
    'Теперь ты официально в списках театра.',
    'Немного можешь отдохнуть, кожаный мешок.',
    'Сертификат «пережил котохаос» выдаётся мысленно.',
    'Нобелевка за терпение — в пути. Возможно.',
    'Режиссёр снял шляпу. У него её не было.',
  ];
  const DOG_LABELS = [
    'ВЫПУСТИТЬ СОБАКУ',
    'ЮРИДИЧЕСКИ КОРРЕКТНЫЙ ЛАЙ',
    'КНОПКА «СТРАХ И ТРЕПЕТ»',
    'ЛАЙ ВЫСШЕЙ ИНСТАНЦИИ',
    'СОБАКА.EXE',
    'РЕЖИМ: ПАНИКА',
    'АКУСТИЧЕСКАЯ АТАКА',
    'ГАВ-ГАВ (НЕ ЗЛО)',
  ];
  const PASSWORD_EXTRA_WRONG = [
    'Бип. Неверно. Бип. (мы роботы-абсурда)',
    'Близко. Нет, ладно, не близко.',
    'Пароль в другом замке. Шутка. Просто неверно.',
    'Драматическая пауза… всё ещё неверно.',
    'Коты смотрят с осуждением.',
    'Даже ChatGPT покраснел.',
    'Мы верим в тебя. Ну, отчасти.',
  ];

  const CAT_THOUGHTS = [
    'мяу?',
    'где корм',
    'я звезда',
    'устал',
    'не трогай',
    'я главный',
    'покормите меня',
    'философски мурчу',
    '418 — я чайник',
    'верните 2007',
    'зачем я здесь',
    'это театр?',
    'мур-мур-мур',
    'котовасия',
    'без комментариев',
    'я нашёл смысл… потерял',
    'картонная коробка где',
    'вай-фай есть?',
    '🐟',
    'разыскиваю тунец',
    'я левша',
    'экзистенциальный кризис',
  ];

  const COMBO_LABELS = [
    null, null,
    'DOUBLE!',
    'TRIPLE!',
    'RAMPAGE!',
    'DOMINATING!',
    'UNSTOPPABLE!',
    'MEGA COMBO!',
    'KITTY GOD!',
    'LEGENDARY!',
    'ABSURD INFINITY!',
  ];

  const RAIN_EMOJIS = ['🐱','💩','🎉','✨','🌈','🪩','🍕','🦴','🐟','⭐','🎭','🔥','💫','🌀'];

  const MOODS = ['neon', 'cyber', 'candy', 'toxic', 'hell'];

  const CHAOS_EVENTS = [
    'tilt',
    'slowmo',
    'rainbow',
    'zoom',
    'moodSwap',
    'emojiRain',
    'catThoughts',
    'catDrunk',
    'miniFlash',
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
      case 'combo':
        blip(660, 0.06, 'triangle', 0.11, 0);
        blip(990, 0.06, 'square', 0.08, 0.04);
        blip(1320, 0.08, 'triangle', 0.07, 0.08);
        break;
      case 'disco':
        blip(440, 0.05, 'square', 0.07, 0);
        blip(660, 0.05, 'square', 0.07, 0.06);
        blip(880, 0.05, 'square', 0.07, 0.12);
        blip(1100, 0.06, 'square', 0.07, 0.18);
        break;
      case 'secret':
        blip(523, 0.12, 'triangle', 0.12, 0);
        blip(659, 0.12, 'triangle', 0.1, 0.08);
        blip(784, 0.12, 'triangle', 0.1, 0.16);
        blip(1046, 0.2, 'triangle', 0.12, 0.24);
        break;
      case 'mouse':
        blip(520, 0.04, 'sine', 0.1, 0);
        blip(880, 0.05, 'triangle', 0.08, 0.03);
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

  function showCatsVideoFullscreen() {
    const ov = document.getElementById('cats-video-overlay');
    const vid = document.getElementById('cats-loop-video');
    if (!ov || !vid) return;
    ov.classList.remove('cats-video-overlay--hidden');
    ov.setAttribute('aria-hidden', 'false');
    document.body.classList.add('body--cats-video-on');
    vid.muted = true;
    vid.setAttribute('playsinline', '');
    vid.loop = true;
    try {
      vid.currentTime = 0;
    } catch (_) {
      /* ignore */
    }
    const tryPlay = () => {
      const p = vid.play();
      if (p && typeof p.catch === 'function') {
        p.catch(() => {
          const resume = () => {
            vid.play().catch(() => {});
            ov.removeEventListener('pointerdown', resume);
          };
          ov.addEventListener('pointerdown', resume, { passive: true });
        });
      }
    };
    tryPlay();
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

  // ====== GLOBAL EMOJI RAIN ======
  function emojiRain(duration, density) {
    const container = document.getElementById('global-rain');
    if (!container) return;
    const dur = duration || 3500;
    const dens = density || 24;
    const endAt = Date.now() + dur;
    const spawn = () => {
      if (Date.now() > endAt) return;
      for (let i = 0; i < dens / 6; i += 1) {
        const d = document.createElement('span');
        d.className = 'rain-drop';
        d.textContent = pick(RAIN_EMOJIS);
        d.style.left = `${Math.random() * 100}%`;
        const fallDur = 2500 + Math.random() * 2500;
        d.style.animationDuration = `${fallDur}ms`;
        d.style.animationDelay = `${Math.random() * 200}ms`;
        d.style.fontSize = `${1 + Math.random() * 1.6}rem`;
        container.appendChild(d);
        window.setTimeout(() => d.remove(), fallDur + 400);
      }
      window.setTimeout(spawn, 180);
    };
    spawn();
  }

  // ====== CAT THOUGHT BUBBLES ======
  function showCatThought(cat, text) {
    if (!cat || !cat.el || !cat.el.isConnected) return;
    const bubble = document.createElement('div');
    bubble.className = 'cat-bubble';
    bubble.textContent = text || pick(CAT_THOUGHTS);
    const size = catSizePx(cat);
    bubble.style.left = `${cat.x + size / 2}px`;
    bubble.style.top = `${cat.y}px`;
    playfield.appendChild(bubble);
    window.setTimeout(() => bubble.remove(), 2500);
  }

  function sprinkleCatThoughts(intensity) {
    const n = intensity || 1;
    gameState.cats.forEach((cat) => {
      if (Math.random() < 0.55 * n) {
        window.setTimeout(() => showCatThought(cat), Math.random() * 1500);
      }
    });
  }

  // ====== SPARKLE TRAIL ======
  function sparkleAt(x, y, emoji) {
    const sp = document.createElement('span');
    sp.className = 'sparkle';
    sp.textContent = emoji || pick(['✨', '⭐', '💫', '·']);
    sp.style.left = `${x}px`;
    sp.style.top = `${y}px`;
    playfield.appendChild(sp);
    window.setTimeout(() => sp.remove(), 900);
  }

  // ====== COMBO SYSTEM ======
  const combo = { count: 0, lastAt: 0, resetTimer: null };
  const COMBO_WINDOW_MS = 2800;
  function bumpCombo() {
    const now = Date.now();
    if (now - combo.lastAt < COMBO_WINDOW_MS) {
      combo.count += 1;
    } else {
      combo.count = 1;
    }
    combo.lastAt = now;
    if (combo.resetTimer) clearTimeout(combo.resetTimer);
    combo.resetTimer = window.setTimeout(() => {
      combo.count = 0;
    }, COMBO_WINDOW_MS + 300);

    if (combo.count >= 2) {
      const label = COMBO_LABELS[Math.min(combo.count, COMBO_LABELS.length - 1)] || `×${combo.count}!`;
      showComboDisplay(`×${combo.count} ${label}`);
      sfx('combo');
      if (combo.count >= 5) {
        bodyShake();
        burstEmojis(['🔥', '⭐', '💫', '🏆'], 6);
      }
    }
  }
  function showComboDisplay(text) {
    const el = document.getElementById('combo-display');
    if (!el) return;
    el.textContent = text;
    el.classList.remove('active');
    void el.offsetWidth;
    el.classList.add('active');
  }

  // ====== SECRET BANNER ======
  function showSecretBanner(text) {
    const el = document.getElementById('secret-banner');
    if (!el) return;
    el.innerHTML = '';
    const inner = document.createElement('div');
    inner.className = 'secret-banner__inner';
    inner.textContent = text;
    el.appendChild(inner);
    el.classList.remove('active');
    void el.offsetWidth;
    el.classList.add('active');
    window.setTimeout(() => el.classList.remove('active'), 1800);
  }

  // ====== CHAOS EVENT SYSTEM ======
  let chaosLevel = 0;
  function updateChaosMeter() {
    const el = document.getElementById('stat-chaos');
    if (!el) return;
    const emo = ['😐', '🙂', '😵', '🤯', '🌪️', '💀', '☠️'];
    const idx = Math.min(emo.length - 1, Math.floor(chaosLevel));
    el.textContent = emo[idx];
  }

  function runChaosEvent(forced) {
    const ev = forced || pick(CHAOS_EVENTS);
    chaosLevel = Math.min(chaosLevel + 0.5, 6);
    updateChaosMeter();
    switch (ev) {
      case 'tilt':
        document.body.classList.add('chaos--tilt');
        setAbsurdTicker('Режиссёр наклонил сцену. На всякий случай.');
        window.setTimeout(() => document.body.classList.remove('chaos--tilt'), 4000);
        break;
      case 'slowmo':
        document.body.classList.add('chaos--slowmo');
        setAbsurdTicker('Время — понятие условное. Сейчас — особенно.');
        window.setTimeout(() => document.body.classList.remove('chaos--slowmo'), 3500);
        break;
      case 'rainbow':
        document.body.classList.add('chaos--rainbow');
        setAbsurdTicker('Радужный синдром активирован. Плачут единороги.');
        window.setTimeout(() => document.body.classList.remove('chaos--rainbow'), 3500);
        break;
      case 'zoom':
        document.body.classList.add('chaos--zoom');
        setAbsurdTicker('Камера решила, что она режиссёр.');
        window.setTimeout(() => document.body.classList.remove('chaos--zoom'), 3000);
        break;
      case 'moodSwap': {
        MOODS.forEach((m) => document.body.classList.remove(`mood--${m}`));
        const m = pick(MOODS);
        document.body.classList.add(`mood--${m}`);
        setAbsurdTicker(`Палитра: ${m.toUpperCase()}. Вкус — на ваш страх.`);
        window.setTimeout(() => document.body.classList.remove(`mood--${m}`), 6000);
        break;
      }
      case 'emojiRain':
        emojiRain(2800, 22);
        setAbsurdTicker('Метеоритный дождь эмодзи. Без шлемов.');
        break;
      case 'catThoughts':
        sprinkleCatThoughts(1.2);
        setAbsurdTicker('Коты подумали вслух. Некоторые — слишком.');
        break;
      case 'catDrunk':
        gameState.cats.forEach((c) => c.el.classList.add('cat--drunk'));
        setAbsurdTicker('Кошачий бар только что закрылся.');
        window.setTimeout(() => {
          gameState.cats.forEach((c) => c.el.classList.remove('cat--drunk'));
        }, 4000);
        break;
      case 'miniFlash':
        playfieldFlash();
        burstEmojis(['⚡', '💥', '🌟'], 6);
        break;
      default:
        break;
    }
  }

  let dogLabelSpin = 0;
  let absurdIdleTimer = null;
  let chaosEventTimer = null;

  function startAbsurdIdle() {
    if (absurdIdleTimer) clearInterval(absurdIdleTimer);
    absurdIdleTimer = window.setInterval(() => {
      if (!screenGame.classList.contains('screen--active') || gameState.gameWon) return;
      if (gameState.levelCompleting) return;
      maybe(0.55, () => setAbsurdTicker(pick(QUIPS_IDLE)));
    }, 14000);
  }

  function startChaosLoop() {
    if (chaosEventTimer) clearInterval(chaosEventTimer);
    chaosEventTimer = window.setInterval(() => {
      if (!screenGame.classList.contains('screen--active') || gameState.gameWon) return;
      if (gameState.levelCompleting) return;
      // Chance increases with level
      const chance = 0.4 + Math.min(0.4, gameState.level * 0.08);
      maybe(chance, () => runChaosEvent());
      // Chaos cool-down
      chaosLevel = Math.max(0, chaosLevel - 0.3);
      updateChaosMeter();
    }, 11000);
  }

  let nextId = 1;

  const gameState = {
    level: 1,
    cats: [],
    poops: [],
    dogsLeft: 3,
    catsFed: 0,
    mouseCaught: 0,
    dogCooldown: false,
    gameWon: false,
    levelCompleting: false,
    spawnTimerId: null,
    toastTimer: null,
    passwordAttempts: 0,
  };

  const playfield = document.getElementById('playfield');
  const laserEl = document.getElementById('laser');
  const propBox = document.getElementById('prop-box');
  const propYarn = document.getElementById('prop-yarn');
  const propMouse = document.getElementById('prop-mouse');
  const food = document.getElementById('food');
  const trash = document.getElementById('trash');
  const dogOverlay = document.getElementById('dog-overlay');
  const dogImg = document.getElementById('dog-img');
  const btnDog = document.getElementById('btn-dog');
  const btnParty = document.getElementById('btn-party');
  const btnChaos = document.getElementById('btn-chaos');
  const toast = document.getElementById('toast');
  const levelOverlay = document.getElementById('level-overlay');
  const btnLevelContinue = document.getElementById('btn-level-continue');
  const barkAudio = document.getElementById('bark-audio');

  let pendingFinishedLevel = 0;

  let foodDragging = false;
  let foodOffsetX = 0;
  let foodOffsetY = 0;
  let foodCaptureId = null;

  const screenGame = document.getElementById('screen-game');
  const screenWin = document.getElementById('screen-win');
  const screenPassword = document.getElementById('screen-password');

  function getLevelConfig() {
    return LEVEL_CFG[gameState.level] || LEVEL_CFG[MAX_LEVEL];
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
  let lastSparkleAt = 0;

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

  const LASER_RANGE = 270;
  const LASER_STRENGTH = 300;
  const YARN_RANGE = 210;
  const YARN_STRENGTH = 190;
  const BOX_RADIUS = 102;
  const BOX_SLOW_PULL = 78;
  const MOUSE_CHASE_RANGE = 300;
  const MOUSE_CHASE_STRENGTH = 230;
  const MOUSE_CATCH_DIST = 46;

  function makeDraggableProp(el) {
    const s = {
      x: 0,
      y: 0,
      dragging: false,
      ox: 0,
      oy: 0,
      cap: null,
      raf: null,
      lcx: 0,
      lcy: 0,
    };
    function apply() {
      el.style.left = '0';
      el.style.top = '0';
      el.style.right = 'auto';
      el.style.bottom = 'auto';
      el.style.transform = `translate3d(${s.x}px, ${s.y}px, 0)`;
    }
    function releasePointerCap() {
      if (s.cap == null) return;
      try {
        if (el.hasPointerCapture(s.cap)) el.releasePointerCapture(s.cap);
      } catch (_) {
        /* ignore */
      }
      s.cap = null;
    }
    function forceEndDrag() {
      if (!s.dragging && s.raf == null) return;
      s.dragging = false;
      el.classList.remove('prop--dragging');
      el.style.zIndex = '';
      if (s.raf != null) {
        cancelAnimationFrame(s.raf);
        s.raf = null;
      }
      releasePointerCap();
    }
    el.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      el.setPointerCapture(e.pointerId);
      s.cap = e.pointerId;
      s.dragging = true;
      el.classList.add('prop--dragging');
      el.style.zIndex = '40';
      const pf = playfield.getBoundingClientRect();
      s.ox = e.clientX - pf.left - s.x;
      s.oy = e.clientY - pf.top - s.y;
    });
    el.addEventListener('pointermove', (e) => {
      s.lcx = e.clientX;
      s.lcy = e.clientY;
      if (!s.dragging) return;
      if (s.raf != null) return;
      s.raf = requestAnimationFrame(() => {
        s.raf = null;
        if (!s.dragging) return;
        const pf = playfield.getBoundingClientRect();
        let nx = s.lcx - pf.left - s.ox;
        let ny = s.lcy - pf.top - s.oy;
        const maxX = Math.max(0, playfield.clientWidth - el.offsetWidth);
        const maxY = Math.max(0, playfield.clientHeight - el.offsetHeight);
        s.x = Math.min(Math.max(0, nx), maxX);
        s.y = Math.min(Math.max(0, ny), maxY);
        apply();
      });
    });
    function onEnd() {
      if (!s.dragging) return;
      s.dragging = false;
      el.classList.remove('prop--dragging');
      el.style.zIndex = '';
      if (s.raf != null) {
        cancelAnimationFrame(s.raf);
        s.raf = null;
      }
      releasePointerCap();
    }
    el.addEventListener('pointerup', onEnd);
    el.addEventListener('pointercancel', onEnd);
    function center() {
      return {
        x: s.x + (el.offsetWidth || 48) / 2,
        y: s.y + (el.offsetHeight || 48) / 2,
      };
    }
    return { s, apply, center, forceEndDrag };
  }

  const dragLaser = laserEl ? makeDraggableProp(laserEl) : null;
  const dragYarn = propYarn ? makeDraggableProp(propYarn) : null;
  const dragBox = propBox ? makeDraggableProp(propBox) : null;

  const mouseRun = {
    x: 80,
    y: 80,
    vx: 100,
    vy: 80,
  };

  function syncLaserCorner() {
    if (!dragLaser || !laserEl) return;
    const w = playfield.clientWidth;
    const h = playfield.clientHeight;
    const ew = laserEl.offsetWidth || 48;
    const eh = laserEl.offsetHeight || 48;
    dragLaser.s.x = Math.max(FOOD_MARGIN, w - ew - FOOD_MARGIN - 4);
    dragLaser.s.y = Math.max(FOOD_MARGIN, Math.min(h * 0.2, h - eh - FOOD_MARGIN));
    dragLaser.apply();
  }

  function syncYarnCorner() {
    if (!dragYarn || !propYarn) return;
    const w = playfield.clientWidth;
    const h = playfield.clientHeight;
    const ew = propYarn.offsetWidth || 52;
    const eh = propYarn.offsetHeight || 52;
    dragYarn.s.x = FOOD_MARGIN + 2;
    dragYarn.s.y = Math.max(FOOD_MARGIN, (h - eh) / 2);
    dragYarn.apply();
  }

  function syncBoxCorner() {
    if (!dragBox || !propBox) return;
    const w = playfield.clientWidth;
    const h = playfield.clientHeight;
    const ew = propBox.offsetWidth || 88;
    const eh = propBox.offsetHeight || 72;
    dragBox.s.x = Math.max(FOOD_MARGIN, (w - ew) / 2);
    dragBox.s.y = FOOD_MARGIN + 2;
    dragBox.apply();
  }

  function resetFieldProps() {
    if (dragLaser) {
      dragLaser.forceEndDrag();
      syncLaserCorner();
    }
    if (dragYarn) {
      dragYarn.forceEndDrag();
      syncYarnCorner();
    }
    if (dragBox) {
      dragBox.forceEndDrag();
      syncBoxCorner();
    }
    resetMouseRun();
  }

  function resetMouseRun() {
    if (!propMouse) return;
    const w = playfield.clientWidth;
    const h = playfield.clientHeight;
    const mw = propMouse.offsetWidth || 40;
    const mh = propMouse.offsetHeight || 40;
    mouseRun.x = FOOD_MARGIN + Math.random() * Math.max(8, w - mw - FOOD_MARGIN * 2);
    mouseRun.y = FOOD_MARGIN + Math.random() * Math.max(8, h - mh - FOOD_MARGIN * 2);
    const sp = 72 + Math.random() * 88;
    const ang = Math.random() * Math.PI * 2;
    mouseRun.vx = Math.cos(ang) * sp;
    mouseRun.vy = Math.sin(ang) * sp;
    applyMousePosition();
  }

  function applyMousePosition() {
    if (!propMouse) return;
    propMouse.style.left = '0';
    propMouse.style.top = '0';
    propMouse.style.transform = `translate3d(${mouseRun.x}px, ${mouseRun.y}px, 0)`;
  }

  function tickMouse(dt) {
    if (!propMouse || gameState.gameWon || gameState.levelCompleting) return;
    const w = playfield.clientWidth;
    const h = playfield.clientHeight;
    const mw = propMouse.offsetWidth || 40;
    const mh = propMouse.offsetHeight || 40;
    mouseRun.x += mouseRun.vx * dt;
    mouseRun.y += mouseRun.vy * dt;
    if (mouseRun.x <= 0) {
      mouseRun.x = 0;
      mouseRun.vx = Math.abs(mouseRun.vx) + 12;
    } else if (mouseRun.x > w - mw) {
      mouseRun.x = w - mw;
      mouseRun.vx = -Math.abs(mouseRun.vx) - 12;
    }
    if (mouseRun.y <= 0) {
      mouseRun.y = 0;
      mouseRun.vy = Math.abs(mouseRun.vy) + 12;
    } else if (mouseRun.y > h - mh) {
      mouseRun.y = h - mh;
      mouseRun.vy = -Math.abs(mouseRun.vy) - 12;
    }
    if (Math.random() < 0.012) {
      mouseRun.vx += (Math.random() - 0.5) * 100;
      mouseRun.vy += (Math.random() - 0.5) * 100;
    }
    const msp = Math.hypot(mouseRun.vx, mouseRun.vy);
    const cap = 195;
    if (msp > cap) {
      mouseRun.vx = (mouseRun.vx / msp) * cap;
      mouseRun.vy = (mouseRun.vy / msp) * cap;
    }
    applyMousePosition();
  }

  function propPull(catCx, catCy, pcx, pcy, range, strength, dt) {
    const dx = pcx - catCx;
    const dy = pcy - catCy;
    const d = Math.hypot(dx, dy);
    if (d > range || d < 5) return { ax: 0, ay: 0 };
    const nx = dx / d;
    const ny = dy / d;
    const falloff = 1 - d / range;
    return { ax: nx * strength * falloff * dt, ay: ny * strength * falloff * dt };
  }

  function applyFieldForcesToCat(cat, size, effDt) {
    const catCx = cat.x + size / 2;
    const catCy = cat.y + size / 2;
    let maxSpeed = 120;

    if (dragBox) {
      const bc = dragBox.center();
      const bd = Math.hypot(catCx - bc.x, catCy - bc.y);
      if (bd < BOX_RADIUS) {
        maxSpeed = 74;
        const bf = propPull(catCx, catCy, bc.x, bc.y, BOX_RADIUS, BOX_SLOW_PULL, effDt * 1.15);
        cat.vx += bf.ax;
        cat.vy += bf.ay;
      }
    }

    if (dragLaser) {
      const lc = dragLaser.center();
      const lf = propPull(catCx, catCy, lc.x, lc.y, LASER_RANGE, LASER_STRENGTH, effDt);
      cat.vx += lf.ax;
      cat.vy += lf.ay;
    }

    if (dragYarn) {
      const yc = dragYarn.center();
      const yf = propPull(catCx, catCy, yc.x, yc.y, YARN_RANGE, YARN_STRENGTH, effDt);
      cat.vx += yf.ax;
      cat.vy += yf.ay;
    }

    if (propMouse) {
      const mx = mouseRun.x + (propMouse.offsetWidth || 40) / 2;
      const my = mouseRun.y + (propMouse.offsetHeight || 40) / 2;
      const mf = propPull(catCx, catCy, mx, my, MOUSE_CHASE_RANGE, MOUSE_CHASE_STRENGTH, effDt);
      cat.vx += mf.ax;
      cat.vy += mf.ay;
    }

    return maxSpeed;
  }

  function tryMouseCatchByCat(cat, size) {
    if (!propMouse || gameState.gameWon || gameState.levelCompleting) return;
    const catCx = cat.x + size / 2;
    const catCy = cat.y + size / 2;
    const mx = mouseRun.x + (propMouse.offsetWidth || 40) / 2;
    const my = mouseRun.y + (propMouse.offsetHeight || 40) / 2;
    if (Math.hypot(catCx - mx, catCy - my) >= MOUSE_CATCH_DIST) return;
    gameState.mouseCaught += 1;
    sfx('mouse');
    burstEmojis(['💨', '🐭', '⭐', '❗'], 5);
    setAbsurdTicker(pick(QUIPS_MOUSE_CATCH));
    showCatThought(cat, pick(['фастфуд', 'ой', 'быстро', 'вкусняшка???', 'не мышь а мечта']));
    resetMouseRun();
    updateHud();
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
      emojiRain(4000, 30);
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
    const sm = document.getElementById('stat-mouse');
    if (sm) sm.textContent = String(gameState.mouseCaught);

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
    updateChaosMeter();
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
    if (cat.thoughtTimeoutId) {
      clearTimeout(cat.thoughtTimeoutId);
      cat.thoughtTimeoutId = null;
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
    const cfg = getLevelConfig();
    const dmin = cfg.poopDelayMin != null ? cfg.poopDelayMin : 5000;
    const dmax = cfg.poopDelayMax != null ? cfg.poopDelayMax : 8000;
    const delay = dmax > dmin ? dmin + Math.random() * (dmax - dmin) : dmin;
    cat.poopTimeoutId = window.setTimeout(() => {
      if (!cat.el.isConnected) return;
      const c = getLevelConfig();
      if (Math.random() < c.poopChance) {
        const cw = cat.el.offsetWidth || CAT_SIZE;
        const ch = cat.el.offsetHeight || CAT_SIZE;
        spawnPoop(cat.x + Math.round(cw * 0.14), cat.y + Math.round(ch * 0.56));
      }
      schedulePoopAttempts(cat);
    }, delay);
  }

  function scheduleCatThought(cat) {
    const delay = 4000 + Math.random() * 9000;
    cat.thoughtTimeoutId = window.setTimeout(() => {
      if (!cat.el.isConnected) return;
      if (Math.random() < 0.5) showCatThought(cat);
      scheduleCatThought(cat);
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
      thoughtTimeoutId: null,
    };

    el.style.transform = `translate(${x}px, ${y}px)`;
    gameState.cats.push(cat);
    schedulePoopAttempts(cat);
    scheduleCatThought(cat);
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
    bumpCombo();
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
    emojiRain(1800, 16);
    const lines = pick(OVERLAY_LINES);
    const o1 = document.getElementById('overlay-l1');
    const o2 = document.getElementById('overlay-l2');
    const o3 = document.getElementById('overlay-l3');
    if (o1) o1.textContent = lines.l1;
    if (o2) o2.textContent = lines.l2;
    if (o3) o3.textContent = lines.l3;

    levelOverlay.classList.remove('overlay--hidden');
    pendingFinishedLevel = gameState.level;
    if (btnLevelContinue) {
      btnLevelContinue.textContent =
        gameState.level >= MAX_LEVEL ? 'К победе · VICTORY' : 'Дальше · NEXT ROUND';
      btnLevelContinue.focus();
    }
  }

  function advanceAfterLevelOverlay() {
    if (!levelOverlay || levelOverlay.classList.contains('overlay--hidden')) return;
    if (!gameState.levelCompleting) return;

    const finished = pendingFinishedLevel;
    pendingFinishedLevel = 0;
    levelOverlay.classList.add('overlay--hidden');
    gameState.levelCompleting = false;

    if (finished >= MAX_LEVEL) {
      gameState.gameWon = true;
      showScreen('win');
      return;
    }

    gameState.level += 1;
    startLevel();
  }

  function startLevel() {
    clearSpawnTimer();
    clearAllEntities();
    resetFoodToCorner();
    resetTrashToCorner();
    resetFieldProps();
    const cfg = getLevelConfig();
    for (let i = 0; i < 3; i += 1) spawnCat();
    gameState.spawnTimerId = window.setInterval(onSpawnTick, cfg.spawnMs);
    sfx('boing');
    setAbsurdTicker(`Уровень ${gameState.level}. Занавес вверх. Коты вниз.`);
    startAbsurdIdle();
    startChaosLoop();
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

  // ===== PARTY MODE =====
  let partyOn = false;
  let megaParty = false;
  let partyTimer = null;
  function togglePartyMode() {
    partyOn = !partyOn;
    document.body.classList.toggle('party', partyOn);
    btnParty.classList.toggle('active', partyOn);
    if (partyOn) {
      setAbsurdTicker('🪩 PARTY MODE: ON. Коты тоже пляшут. Плохо, но искренне.');
      sfx('disco');
      emojiRain(1600, 18);
      if (partyTimer) clearInterval(partyTimer);
      partyTimer = window.setInterval(() => {
        if (!partyOn) return;
        sfx('disco');
        maybe(0.7, () => burstEmojis(['🪩','💃','🕺','✨','🎶'], 4));
      }, 2500);
    } else {
      setAbsurdTicker('Дискотека закрыта. Техничка выключила свет.');
      if (partyTimer) clearInterval(partyTimer);
      partyTimer = null;
    }
  }
  btnParty.addEventListener('click', togglePartyMode);

  btnChaos.addEventListener('click', () => {
    runChaosEvent();
    sfx('boing');
    burstEmojis(['🎲','❓','⚡','🌀'], 5);
  });

  // ===== KONAMI CODE =====
  window.addEventListener('keydown', (e) => {
    const key = e.key;
    const expected = KONAMI[konamiIdx];
    if (!expected) return;
    const match = key === expected || key.toLowerCase() === expected.toLowerCase();
    if (match) {
      konamiIdx += 1;
      if (konamiIdx >= KONAMI.length) {
        konamiIdx = 0;
        activateMegaParty();
      }
    } else {
      konamiIdx = 0;
    }
  });

  function activateMegaParty() {
    megaParty = true;
    document.body.classList.add('party', 'mega-party');
    btnParty.classList.add('active');
    partyOn = true;
    showSecretBanner('MEGA PARTY UNLOCKED');
    sfx('secret');
    emojiRain(8000, 60);
    setAbsurdTicker('МЕГА-ПАРТИ. Котов перестало волновать всё. Молодцы.');

    // Grant infinite dogs + reset cooldown
    gameState.dogsLeft = 99;
    gameState.dogCooldown = false;
    updateHud();

    // Random chaos storm
    for (let i = 0; i < 5; i += 1) {
      window.setTimeout(() => runChaosEvent(), i * 1200 + 400);
    }

    // Cats go mega
    gameState.cats.forEach((c) => c.el.classList.add('cat--mega'));
    window.setTimeout(() => {
      gameState.cats.forEach((c) => c.el.classList.remove('cat--mega'));
    }, 6000);
  }

  // ===== TITLE EASTER EGG (click 5x = meow storm) =====
  let titleClicks = 0;
  let titleClickTimer = null;
  const hudTitle = document.getElementById('hud-title');
  if (hudTitle) {
    hudTitle.addEventListener('click', () => {
      titleClicks += 1;
      if (titleClickTimer) clearTimeout(titleClickTimer);
      titleClickTimer = window.setTimeout(() => { titleClicks = 0; }, 2500);
      if (titleClicks >= 5) {
        titleClicks = 0;
        meowStorm();
      }
    });
  }

  function meowStorm() {
    showSecretBanner('MEOW STORM');
    sfx('secret');
    for (let i = 0; i < 8; i += 1) {
      window.setTimeout(() => {
        // spawn a cat
        spawnCat();
        const c = gameState.cats[gameState.cats.length - 1];
        if (c) showCatThought(c, pick(['МЯУ','МЯУ!','МЯУ?','МЯЯЯ','мррр','мр-мр-мр','👑']));
      }, i * 150);
    }
    burstEmojis(['🐱','😼','😻','😹','😿','👑'], 10);
    emojiRain(3000, 28);
  }

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

        // Sparkle trail
        const now = performance.now();
        if (now - lastSparkleAt > 55) {
          lastSparkleAt = now;
          sparkleAt(foodX + 20 + Math.random() * 20, foodY + 20 + Math.random() * 20);
        }
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
    // Slow-mo halves speed
    const timeScale = document.body.classList.contains('chaos--slowmo') ? 0.35 : 1;
    const effDt = dt * timeScale;
    tickMouse(effDt);
    gameState.cats.slice().forEach((cat) => {
      const size = catSizePx(cat);

      if (cat.scared) {
        cat.x += cat.vx * effDt;
        cat.y += cat.vy * effDt;
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

      const maxSpeed = applyFieldForcesToCat(cat, size, effDt);
      const sp = Math.hypot(cat.vx, cat.vy);
      if (sp > maxSpeed) {
        cat.vx = (cat.vx / sp) * maxSpeed;
        cat.vy = (cat.vy / sp) * maxSpeed;
      }

      cat.x += cat.vx * effDt;
      cat.y += cat.vy * effDt;

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
      tryMouseCatchByCat(cat, size);
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

  const pwd1 = document.getElementById('pwd-1');
  const pwd2 = document.getElementById('pwd-2');
  const pwd3 = document.getElementById('pwd-3');
  const stage2 = document.getElementById('riddle-stage-2');
  const stage3 = document.getElementById('riddle-stage-3');
  const riddleKey2 = document.getElementById('riddle-key-2');
  const riddleKey3 = document.getElementById('riddle-key-3');
  const btnOpenVault = document.getElementById('btn-open-vault');
  const btnClaimGift = document.getElementById('btn-claim-gift');

  let vaultCodeAccepted = false;

  function setRiddleRevealed(stageEl, revealed) {
    if (!stageEl) return;
    stageEl.classList.toggle('riddle-stage--locked', !revealed);
    stageEl.classList.toggle('riddle-stage--revealed', revealed);
    const overlay = stageEl.querySelector('.riddle-stage__unlock-overlay');
    if (overlay) overlay.setAttribute('aria-hidden', revealed ? 'true' : 'false');
    if (stageEl === stage2 && riddleKey2) {
      riddleKey2.disabled = revealed;
    } else if (stageEl === stage3 && riddleKey3) {
      riddleKey3.disabled = revealed;
    }
  }

  function resetPasswordVaultUI() {
    vaultCodeAccepted = false;
    if (pwd1) pwd1.value = '';
    if (pwd2) pwd2.value = '';
    if (pwd3) pwd3.value = '';
    if (riddleKey2) {
      riddleKey2.value = '';
      riddleKey2.disabled = false;
    }
    if (riddleKey3) {
      riddleKey3.value = '';
      riddleKey3.disabled = false;
    }
    setRiddleRevealed(stage2, false);
    setRiddleRevealed(stage3, false);
    const msgEl = document.getElementById('password-msg');
    if (msgEl) msgEl.textContent = '';
    if (btnOpenVault) btnOpenVault.hidden = false;
    if (btnClaimGift) btnClaimGift.hidden = true;
  }

  function shakeEl(el) {
    if (!el) return;
    el.classList.remove('shake');
    void el.offsetWidth;
    el.classList.add('shake');
  }

  function syncRiddleUnlockFromKeys() {
    if (riddleKey2) {
      const v2 = normDigitsOnly(riddleKey2.value, 4);
      if (riddleKey2.value !== v2) riddleKey2.value = v2;
      if (v2 === RIDDLE_UNLOCK_2) {
        setRiddleRevealed(stage2, true);
        sfx('level');
      } else {
        setRiddleRevealed(stage2, false);
        if (v2.length === 4 && v2 !== RIDDLE_UNLOCK_2) shakeEl(riddleKey2);
      }
    }
    if (riddleKey3) {
      const v3 = normDigitsOnly(riddleKey3.value, 4);
      if (riddleKey3.value !== v3) riddleKey3.value = v3;
      if (v3 === RIDDLE_UNLOCK_3) {
        setRiddleRevealed(stage3, true);
        sfx('level');
      } else {
        setRiddleRevealed(stage3, false);
        if (v3.length === 4 && v3 !== RIDDLE_UNLOCK_3) shakeEl(riddleKey3);
      }
    }
  }

  function deliverGiftFile() {
    const msg = document.getElementById('password-msg');
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
    if (msg) {
      if ((GIFT_EXTERNAL_URL && GIFT_EXTERNAL_URL.length) || (GIFT_DOWNLOAD_PATH && GIFT_DOWNLOAD_PATH.length)) {
        msg.textContent = 'Подарок в пути — загляни в «Загрузки», если вдруг не всплыло окно.';
      } else {
        msg.textContent = 'Подарок почти здесь — задайте GIFT_EXTERNAL_URL или GIFT_DOWNLOAD_PATH в script.js.';
      }
    }
    setAbsurdTicker('Подарок отдан. Коты одобрительно молчат.');
    maybe(0.4, () => burstEmojis(['🎁', '✨', '🐱'], 6, document.getElementById('global-rain')));
  }

  function buildVaultCode() {
    if (!pwd1 || !pwd2 || !pwd3) return '';
    return normPwdChar(pwd1.value) + normPwdChar(pwd2.value) + normPwdChar(pwd3.value);
  }

  function shakeVaultInputs() {
    [pwd1, pwd2, pwd3].forEach((el) => {
      if (!el) return;
      el.classList.remove('shake');
      void el.offsetWidth;
      el.classList.add('shake');
    });
  }

  [riddleKey2, riddleKey3].forEach((el) => {
    if (!el) return;
    el.addEventListener('input', () => syncRiddleUnlockFromKeys());
  });

  document.getElementById('btn-unlock').addEventListener('click', () => {
    resetPasswordVaultUI();
    showScreen('password');
    if (pwd1) pwd1.focus();
  });

  if (btnClaimGift) {
    btnClaimGift.addEventListener('click', () => {
      if (!vaultCodeAccepted) {
        const msg = document.getElementById('password-msg');
        if (msg) msg.textContent = 'Сначала нажми «Открыть сейф» с правильным кодом.';
        sfx('wrong');
        shakeVaultInputs();
        return;
      }
      deliverGiftFile();
      sfx('win');
    });
  }

  document.getElementById('password-form').addEventListener('submit', (e) => {
    e.preventDefault();
    if (vaultCodeAccepted) return;
    const msg = document.getElementById('password-msg');
    const val = buildVaultCode();

    if (val.length < 3) {
      if (msg) msg.textContent = 'Нужны все три символа в ячейках сейфа.';
      sfx('wrong');
      shakeVaultInputs();
      return;
    }

    if (val === MAIN_PASSWORD) {
      vaultCodeAccepted = true;
      gameState.passwordAttempts = 0;
      sfx('win');
      if (msg) msg.textContent = 'Код верный. Кнопка «Забрать подарок» разблокирована.';
      if (btnOpenVault) btnOpenVault.hidden = true;
      if (btnClaimGift) {
        btnClaimGift.hidden = false;
        window.requestAnimationFrame(() => btnClaimGift.focus());
      }
      return;
    }

    if (val === '666' || val === 'лол' || val === 'lol') {
      if (msg) msg.textContent = 'Смешно. Но нет.';
      sfx('wrong');
      shakeVaultInputs();
      return;
    }

    gameState.passwordAttempts += 1;
    sfx('wrong');
    shakeVaultInputs();
    const i = gameState.passwordAttempts;
    let line = i <= 3 ? WRONG_PASSWORD_MSG[i - 1] : WRONG_PASSWORD_MSG_AFTER;
    if (Math.random() < 0.5) {
      line = `${line}\n${pick(PASSWORD_EXTRA_WRONG)}`;
    }
    if (msg) msg.textContent = line;
  });

  setupTrashDrag();
  setupFoodDrag();

  if (btnLevelContinue) {
    btnLevelContinue.addEventListener('click', () => {
      sfx('boing');
      advanceAfterLevelOverlay();
    });
  }

  window.addEventListener('resize', () => {
    if (!foodDragging && !foodAnimating) {
      syncFoodCornerCoords();
      applyFoodPosition();
    }
    if (!trashDragging) {
      syncTrashCornerCoords();
      applyTrashPosition();
    }
    if (dragLaser && !dragLaser.s.dragging) syncLaserCorner();
    if (dragYarn && !dragYarn.s.dragging) syncYarnCorner();
    if (dragBox && !dragBox.s.dragging) syncBoxCorner();
    if (propMouse) {
      const mw = propMouse.offsetWidth || 40;
      const mh = propMouse.offsetHeight || 40;
      const pw = playfield.clientWidth;
      const ph = playfield.clientHeight;
      mouseRun.x = Math.min(Math.max(0, mouseRun.x), Math.max(0, pw - mw));
      mouseRun.y = Math.min(Math.max(0, mouseRun.y), Math.max(0, ph - mh));
      applyMousePosition();
    }
    updateHud();
  });

  gameState.rafId = requestAnimationFrame(loop);
  startLevel();
})();
