# Separate daf preparation library

This is preparation data, not a build job. No model inference runs when these files are read.

The requested scope is 81 physical amudim:

| Perek | Pages | Amudim |
|---|---|---:|
| Bava Metzia 2 — Eilu Metzios | 21a–33b | 26 |
| Pesachim 10 — Arvei Pesachim | 99b–121b | 45 |
| Berachos 4 — Tefillas Hashachar | 26a–30b | 10 |

Chapter boundaries follow Sefaria’s chapter navigation. BM 33b and Berachos 30b share a page with the following perek. Berachos 26a starts with the end of the previous perek. Prepare the full physical amud, marking the chapter transitions; do not cut out unrelated-looking text and silently change its layout.

## What is saved

- `manifest.json`: all 81 pages, reference image URLs, source snapshots and explicit progress states.
- `sources/`: complete Hebrew Gemara and applicable Rashi / Tosafos / Rashbam source snapshots for all 81 amudim, including nested comment boundaries and source provenance. These are Sefaria export snapshots, not OCR guesses or finalized line maps.
- `existing/`: the existing 21a, 21b, 22a, 99b and 100a guidance carried forward unchanged. 21b has Gemara anchors rather than a complete three-stream exact map. Existing renderer normalization must be retained when migrating these records. 22a’s existing complete pack includes its reconciled source and all stream maps.
- `pages/`: the first new measured scan records: BM 22b, Pesachim 100b and Berachos 26a. All printed Gemara rows have beginning/end words and observed text recorded; region widths and gutters are measured in the cited image. Pesachim 100b also has first/last words recorded for Rashi’s 13 rows, Rashbam’s 56 rows and Tosafos’s 72 rows, including previews. Pesachim 100b preparation is now complete: every line has a source span, source word IDs, display text, placement box and alignment. The current renderer needs an adapter for its four-stream physical blocks before it can load the specification.

## Initial scan findings

BM 22b has 51 main Gemara lines and the isolated next-amud preview דמדרסא. Pesachim 100b has 14 main Gemara lines and the preview אף. Berachos 26a has 38 lines from Mi Shemeso, a separate Hadran, then the opening of Tefillas Hashachar: three narrow lines, four lines widened into Tosafos’s completed space, ten full-width lines and the preview תנו. Its Rashi also contains a chapter transition.

Pesachim 100b needs a Rashi-to-Rashbam title block within the inner stream. Rashi’s print order differs from the exported order; the whole comments must be reordered explicitly. Its final Rashi words borrow אין קידוש from the start of the next amud’s Rashi. Enlarged inspection corrected the earlier misreading ידי קידוש. Both opening commentary columns are broad for four rows before narrowing beside Gemara. Full-width inspection corrected the earlier opening-box measurements. Tosafos’s last text line spans both columns below Rashbam; both commentaries finish with an isolated אף preview of 101a.

## Completion means

A new page becomes `engineReady: true` only after every line in all applicable commentary streams has been transcribed, source words have been reconciled without loss, all region transitions and alignment exceptions are recorded, and the complete specification has been checked against the cited scan. The preparation check is independent of building the page.

BM 22b and Berachos 26a remain **unfinished preparation**. Pesachim 100b preparation is complete, independently of rendering: 15 Gemara rows, 13 Rashi rows, 56 Rashbam rows and 72 Tosafos rows including carry words. Source coverage is 98 Gemara words, 88 Rashi words, 559 Rashbam words and 686 Tosafos words, plus separately identified next-page prefixes. The print’s ורוצה versus the export’s ודעתו at the start of the full-width Tosafos footer is a documented display variant, with the original source retained. Rashi’s whole-comment reorder is preserved. A completed preparation record can remain `engineReady: false` until a renderer adapter implements its physical block format; it must not be passed to the current three-stream cascade loader as if already compatible. The rest of the new pages are explicitly queued. No scan results have been fabricated for unexamined pages.

Physical measurements use the original image coordinates. They do not pretend that a scan’s glyph height is the CSS font size in a different font. The renderer must scale these measured boxes consistently and preserve the stored line boundaries. Appearance adjustments must remain separate from content maps.

Source scans: E-Daf. Hebrew text: Sefaria’s public export catalog generated 2026-10-02, downloaded 2026-10-11. Only Hebrew content is saved here; no English translations are bundled. Reference image hashes identify the particular scans examined.

## Pesachim 100b validation

Run `node scripts/check-prepared-page.cjs` and `node tests/preparation-library.test.cjs` from the repository root. These independently verify snapshot identity, every current-page source word exactly once, next-page prefix provenance, line endpoint matches, line allocation and integration gates. Preparation was checked against the scan; no paid inference or builder run was used. The record includes the measured 27-pixel left and 21-pixel right Gemara gutters. Explicit local alignment edits must override prepared defaults while preserving source spans.
