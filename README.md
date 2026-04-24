# gift

Статический сайт-квест **Cat Chaos** (HTML, CSS, без сборки).

## GitHub Pages

1. Запушьте репозиторий в ветку **`main`** (корень — `index.html`, `style.css`, `script.js`, папка **`assets/`**).
2. В репозитории: **Settings → Pages → Build and deployment**.
3. В поле **Source** выберите **GitHub Actions** (не «Deploy from a branch»).
4. После успешного workflow сайт будет по адресу:

   **https://antoniozubakha.github.io/gift/**

Файл **`.nojekyll`** отключает Jekyll, чтобы статика отдавалась как есть.

## Локальный просмотр

```bash
python -m http.server 8080
```

Откройте http://localhost:8080/

## Настройки

В **`script.js`**: пароль подарка, `GIFT_EXTERNAL_URL`, `GIFT_DOWNLOAD_PATH`, тексты загадок — в **`index.html`**.
