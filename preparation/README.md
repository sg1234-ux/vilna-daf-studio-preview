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

BM 22b preparation is complete, with 52 Gemara rows and 70 rows each for Rashi and Tosafos, including previews. The opening is four broad lines: the fifth commentary row belongs to the side column, with a measured 67-pixel Rashi overhang. Tosafos whole comments are reordered explicitly to match print. Berachos 26a preparation is also complete: 57 physical Gemara rows including its Hadran and preview, 57 Rashi rows including its independent Hadran and preview, and 53 Tosafos rows including its preview. Its opening Tosafos already contains the Hadran and the first comment on Tefillas Hashachar while Gemara is still finishing Mi Shemeso. Pesachim 100b preparation is complete, independently of rendering: 15 Gemara rows, 13 Rashi rows, 56 Rashbam rows and 72 Tosafos rows including carry words. Source coverage is 98 Gemara words, 88 Rashi words, 559 Rashbam words and 686 Tosafos words, plus separately identified next-page prefixes. The print’s ורוצה versus the export’s ודעתו at the start of the full-width Tosafos footer is a documented display variant, with the original source retained. Rashi’s whole-comment reorder is preserved. A completed preparation record can remain `engineReady: false` until a renderer adapter implements its physical block format; it must not be passed to the current three-stream cascade loader as if already compatible. The rest of the new pages are explicitly queued. No scan results have been fabricated for unexamined pages.

Physical measurements use the original image coordinates. They do not pretend that a scan’s glyph height is the CSS font size in a different font. The renderer must scale these measured boxes consistently and preserve the stored line boundaries. Appearance adjustments must remain separate from content maps.

Source scans: E-Daf. Hebrew text: Sefaria’s public export catalog generated 2026-10-02, downloaded 2026-10-11. Only Hebrew content is saved here; no English translations are bundled. Reference image hashes identify the particular scans examined.

## Pesachim 100b validation

Run `node scripts/check-prepared-page.cjs` and `node tests/preparation-library.test.cjs` from the repository root. These independently verify snapshot identity, every current-page source word exactly once, next-page prefix provenance, line endpoint matches, line allocation and integration gates. Preparation was checked against the scan; no paid inference or builder run was used. The record includes the measured 27-pixel left and 21-pixel right Gemara gutters. Explicit local alignment edits must override prepared defaults while preserving source spans.

## Reference-image collection

All 81 reference images were retrieved and verified as images on 2026-10-14. `reference-images.json` preserves their source URLs, byte sizes and SHA-256 hashes. Retrieval does not mean that all pages have been visually read or mapped. Run `node scripts/check-prepared-collection.cjs` for BM 22b’s full source identity, printed variants and corrected four-line opening allocation checks. Builder integration remains separate and paused.

Berachos 26a source coverage is 539 Gemara lexical tokens, 313 Rashi tokens and 299 Tosafos tokens, with heading/source-marker distinctions recorded and next-page words tracked separately. Run `node scripts/check-prepared-collection.cjs` to check both BM 22b and Berachos 26a. Remaining pages retain queued status; retrieval is not visual preparation.

## Additional completed preparation — 2026-10-14

BM 23a, Berachos 26b and Pesachim 101a are now separately prepared and source-checked. They remain `engineReady: false` pending the collection-wide renderer adapter.

| Page | Gemara rows | Rashi rows | Rashbam rows | Tosafos rows |
|---|---:|---:|---:|---:|
| BM 23a | 53 | 51 | — | 57 |
| Berachos 26b | 50 | 41 | — | 73 |
| Pesachim 101a | 32 | 12 | 51 | 71 |

Counts include isolated next-page previews. BM 23a widens Gemara first into completed Rashi and then to full width. Berachos 26b has Rashi on the left and Tosafos on the right; Gemara widens left, while Tosafos continues into a full-width footer. Pesachim 101a has four broad opening rows in each commentary: the fourth Tosafos row includes the large ולשמואל heading. It has an independent Rashbam title, wider commentary regions below Gemara, a full-width Tosafos footer and a separately recorded printed editorial cross-reference.

The complete source snapshots remain unchanged. Printed abbreviations, the Pesachim 101a מפינה לפינה / source מבית לבית difference, and borrowed preview forms are recorded explicitly. Run `node scripts/check-prepared-collection.cjs`, `node scripts/check-prepared-page.cjs` and `node tests/preparation-library.test.cjs`. These checks establish preparation integrity; they do not claim the paused builder adapter has been implemented or visually tested.

## Additional completed preparation — BM 23b, Berachos 27a, Pesachim 101b

| Page | Gemara rows | Rashi rows | Rashbam rows | Tosafos rows |
|---|---:|---:|---:|---:|
| BM 23b | 57 | 62 | — | 71 |
| Berachos 27a | 51 | 73 | — | 34 |
| Pesachim 101b | 34 | 26 | 44 | 61 |

Counts include previews where printed. Pesachim 101b Rashbam has no isolated next-page preview. The four broad opening rows remain distinct from the side commentary. These records are preparation-complete and remain gated from the paused renderer adapter.

BM 23b has Rashi on the left and Tosafos on the right. Rashi's triangle annotation has a separate exclusion area for its adjacent text. Gemara widens left after Rashi ends. The entire באושפיזא Tosafos comment is printed here although the canonical snapshot files it under 24a; its words are retained as a separately identified borrowed prefix, and its last row spans the full width. Its following ומודה is the preview of the next comment.

Berachos 27a widens Gemara left after Tosafos ends. Rashi continues into eight full-width footer rows. Marginal headings such as תורה אור are not inserted into Rashi's source text.

Pesachim 101b has Rashi above a separate Rashbam section on the left and Tosafos on the right. Rashbam has 16 narrow rows, 20 wider rows and eight full-width footer rows. Tosafos has four opening rows, 38 narrow rows, 18 wider rows and the לברך preview. The canonical Tosafos source continues beyond the physical amud: all 724 source words remain saved, 484 are assigned to the printed page including its preview, and the remaining 240 are explicitly deferred to physical 102a. `deferredSourceSpan`, `sourceContinuations` and 102a's manifest `incomingSourceContinuation` preserve that boundary. The next preparation must reconcile this continuation with its own canonical snapshot and must not discard or duplicate overlapping source text. The collection checker verifies source identities in both the printed prefix and deferred suffix, independently of building.
