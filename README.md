# Starting List Generator

> [Polish version](README.pl.md)

Web version (GitHub Pages): https://ridede.github.io/starting-list-generator/

A browser-based tool for generating randomized starting groups for cycling races. Load a participant list (manually or from CSV), shuffle them into groups, and export the result as CSV, PDF, or PNG.

Everything runs in the browser — no data is sent to any server.

## Features

- randomized group assignment using the Fisher–Yates shuffle algorithm
- two modes: set the number of groups or the number of people per group
- CSV import with preview and column selection
- group labels as numbers (1, 2, 3…) or letters (A, B, C…)
- optional start time scheduling with configurable interval
- export results to CSV, PDF, and PNG
- responsive UI (Bootstrap 5)
- available in English (`index.html`) and Polish (`index.pl.html`)

## Quick start

1. Open `index.html` (English) or `index.pl.html` (Polish) in a browser.
2. Enter participants manually (one per line) or load from a CSV file.
3. Choose a grouping mode and click **Generate groups** / **Losuj grupy**.
4. Export the result as CSV, PDF, or PNG.

## Privacy

All processing happens locally in the browser. No data is sent, stored, or shared externally.

## Tech stack

- [Bootstrap 5](https://getbootstrap.com/) — UI
- [html2canvas](https://html2canvas.hertzen.com/) — PNG export
- [PDF-Lib](https://pdf-lib.js.org/) — PDF export

## Project structure

| File | Description |
|---|---|
| `index.html` | English UI |
| `index.pl.html` | Polish UI |
| `app.js` | Application logic |
| `styles.css` | Styles |
| `sample.csv` | Sample participant list |
| `sample2.csv` | Sample CSV with headers |

## Contributing

Contributions are welcome. Open an issue or submit a Pull Request.

## License

[MIT](LICENSE)
