# Generator listy startowej

> [Wersja angielska](README.md)

Narzędzie do generowania (losowania) listy startowej na wyścigi rowerowe. Wczytaj listę uczestników (ręcznie lub z CSV), wylosuj podział na grupy i wyeksportuj wynik jako CSV, PDF lub PNG.

Całość działa w przeglądarce — żadne dane nie są wysyłane na zewnętrzne serwery.

## Funkcjonalność

- losowanie podziału uczestników na grupy (Fisher–Yates shuffle)
- dwa tryby: podaj liczbę grup lub liczbę osób w grupie
- import uczestników z pliku CSV z podglądem i wyborem kolumny
- oznaczenie grup numerami (1, 2, 3…) lub literami (A, B, C…)
- opcjonalne godziny startu z konfigurowalnym interwałem
- eksport wyników do CSV, PDF i PNG
- responsywny interfejs (Bootstrap 5)
- wersja angielska (`index.html`) i polska (`index.pl.html`)

## Szybki start

1. Otwórz `index.html` (angielski) lub `index.pl.html` (polski) w przeglądarce.
2. Wpisz uczestników ręcznie (jeden na linię) lub wczytaj z pliku CSV.
3. Wybierz tryb podziału i kliknij **Losuj grupy**.
4. Wyeksportuj wynik jako CSV, PDF lub PNG.

## Prywatność

Wszystkie operacje odbywają się lokalnie w przeglądarce. Żadne dane nie są wysyłane, przechowywane ani udostępniane.

## Wykorzystane biblioteki

- [Bootstrap 5](https://getbootstrap.com/) — UI
- [html2canvas](https://html2canvas.hertzen.com/) — eksport do PNG
- [PDF-Lib](https://pdf-lib.js.org/) — eksport do PDF

## Struktura projektu

| Plik | Opis |
|---|---|
| `index.html` | Interfejs po angielsku |
| `index.pl.html` | Interfejs po polsku |
| `app.js` | Logika aplikacji |
| `styles.css` | Style |
| `sample.csv` | Przykładowa lista uczestników |
| `sample2.csv` | Przykładowy CSV z nagłówkami |

## Kontrybucje

Wkład jest mile widziany. Otwórz issue lub wyślij Pull Request.

## Licencja

[MIT](LICENSE)
