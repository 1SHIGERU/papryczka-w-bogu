# Źródła treści i materiałów

Odczytano 29.09.2026. Dane biznesowe używane w stronie przepisane z briefu przekazanego przez właściciela (`pasted_content.txt`) i poniższych oficjalnych źródeł. Brakujących informacji nie uzupełniać domysłem.

- Oficjalna witryna: https://www.papryczkawbogu.pl/
- Oficjalna karta/menu i istniejący zewnętrzny system zamówień: https://www.papryczkawbogu.pl/restauracja/papryczka-w-bogu
- Potwierdzony link do Facebooka z oficjalnej witryny: https://www.facebook.com/profile.php?id=100051124369968
- Oficjalna galeria (strona główna) zawiera sześć oryginalnych plików JPG. Lokalnie są responsywne, skompresowane warianty WebP tych zdjęć; obrazy pochodzą z hosta Restaumatic/Imgix, bez stocków ani generowania zdjęć jedzenia.

Pliki galerii i źródłowe adresy:

1. `public/images/gallery-01-640.webp` i `gallery-01-1200.webp` — `https://restaumatic-production.imgix.net/uploads/accounts/184499/media_library/154301a0-4e8c-4aa5-b8a3-e15be424c5f6.jpg` (wnętrze).
2. `public/images/gallery-02-640.webp` i `gallery-02-1200.webp` — `https://restaumatic-production.imgix.net/uploads/accounts/184499/media_library/c70e59a7-b9ea-44da-a5f2-3e0e79c9db85.jpg` (posiłek i zupa).
3. `public/images/gallery-03-640.webp` i `gallery-03-1200.webp` — `https://restaumatic-production.imgix.net/uploads/accounts/184499/media_library/8737be37-e7ca-4c60-9077-db251956d705.jpg` (słodkie wypieki z owocami).
4. `public/images/gallery-04-640.webp` i `gallery-04-1200.webp` — `https://restaumatic-production.imgix.net/uploads/accounts/184499/media_library/ee441fdf-e984-4afc-b5d9-2b045a9d5178.jpg` (szaszłyk i zupa).
5. `public/images/gallery-05-640.webp` i `gallery-05-1200.webp` — `https://restaumatic-production.imgix.net/uploads/accounts/184499/media_library/d5d7bfb8-b97f-460e-a328-64af57eefb53.jpg` (wypiek).
6. `public/images/gallery-06-640.webp` i `gallery-06-1200.webp` — `https://restaumatic-production.imgix.net/uploads/accounts/184499/media_library/717535f2-e18b-42b0-9bc4-f9f09f6bf94f.jpg` (szaszłyk, zupa i stół).

Źródło menu potwierdziło dodatkowo skład burgera „Kurczak w płatkach”, hamburgera „Wołowy” 100%, hamburgera „Camembert”, zapiekanek „Klasyczna”/„Chłopska”, pełnych zapiekańców w foremce 1000 ml oraz skład MINI. Składy dopisano do `src/data/menu.json` tylko dla pozycji rzeczywiście opisanych w oficjalnej ofercie. Składy zupy dnia, dania dnia i innych nieopisanych pozycji pozostają oznaczone jako do uzupełnienia.

Nie znaleziono zdjęć konkretnych pizz/burgerów z aktualnej oficjalnej galerii. Zdjęcia używane na kartach menu są podpisane jako poglądowe kadry z galerii, a nie jako katalogowe zdjęcia danego produktu; przed publikacją warto zastąpić je zdjęciami produktów przekazanymi przez właściciela. Urodzinowy telefon 508 709 344 wymaga potwierdzenia. Ceny menu wymagają potwierdzenia przed publikacją.

## Dodatkowe oficjalne materiały odnalezione w karcie zamówień

- Oryginalne logo/wordmark (białe liternictwo na przezroczystym tle; pozostawiono oryginalne piksele): https://restaumatic-production.imgix.net/uploads/restaurants/203203/logo/1667825988.png?auto=compress%2Cformat&fit=clip&h=500&w=500 — zapisane jako `public/wordmark.png`; wyświetlane w ciemnym kolorze przez styl CSS na jasnym tle.
- Fotografia pizzy z oficjalnej karty zamówień: https://restaumatic-production.imgix.net/uploads/accounts/184499/media_library/30320389-c547-474f-8184-986b4c100a29.jpg?auto=compress%2Cformat&fit=max&w=1200 — źródłowy obraz 1200×801 zapisano na nowo (bez kadrowania) jako `public/images/pizza-hero-640.webp` i `pizza-hero-1200.webp`.
- Odrębny znak `public/brand-mark.svg` / `public/app-icon.png` jest prostym autorskim motywem papryczki, spójnym z istniejącym wordmarkiem i używanym jako favicon/ikona projektu; nie jest przedstawiany jako oryginalne historyczne logo firmy.
