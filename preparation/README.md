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

## Preparation without isolated next-page previews

At the user's request on 2026-10-14, new records omit isolated next-page preview words. Existing completed records remain preserved. Main text and complete commentary printed on the current page remain included when a canonical source reference crosses the amud boundary. `nextPagePreviewPolicy` and the collection checker enforce this distinction.

| Newly completed physical page | Gemara rows | Rashi rows | Rashbam rows | Tosafos rows |
|---|---:|---:|---:|---:|
| BM 24a | 48 | 42 | — | 69 |
| Berachos 27b | 50 | 48 | — | 29 |
| Pesachim 102a | 32 | 23 | 41 | 49 |

These counts exclude isolated previews. All three remain preparation-complete and renderer-adapter-pending. BM 24a retains the canonical 87-word Tosafos prefix already printed on 23b in `previousSourceSpan`, without rendering it twice. Berachos 27b includes the main Rashi comment מעברין לך filed under 28a; its isolated following preview is excluded. Pesachim 102a consumes the 241-word Tosafos continuation from canonical 101b span [483,724] before its own 128-word Tosafos source. The first incoming word לברך was the previous page's preview and is main text here. Incoming source IDs are qualified by their original amud to prevent collisions with this page's own source IDs; original IDs and snapshot hashes remain available for validation.

Berachos 28a is additionally complete without isolated previews: 56 Gemara rows (21 narrow, 20 widening left, 15 full width), 49 Rashi rows and 28 Tosafos rows. The seven-word opening Rashi source comment מעברין לך was already printed on physical 27b and is retained in `previousSourceSpan`; the new page begins with ה״ג דלמא מעברין לך. The printed תורה אור margin heading is separate from the four broad Rashi opening rows. The collection checker verifies the preceding-page source overlap, all current source IDs, printed endpoint variants and block allocations. Builder integration remains paused.

BM 24b is complete without isolated previews: 51 Gemara rows (34 narrow and 17 widened left), 40 Rashi rows (four opening and 36 side), and 66 Tosafos rows (four opening, 58 side and four full-width footer). Rashi is on the left and Tosafos on the right. The inline Mishnah remains in the last two Gemara rows. The source-linked row observations are retained in `observations/bava-metzia-24b.json`; `python scripts/prepare-physical-page.py preparation/observations/bava-metzia-24b.json` recompiles this page without calling an AI service. This compiler requires manually reviewed scan observations and currently handles pages whose canonical source is entirely printed on the same amud. Existing cross-amud records are preserved.

Pesachim 102b is complete without isolated previews: 20 Gemara rows, 11 Rashi rows (four opening and seven side), 51 Rashbam rows (15 narrow and 36 wide), and 68 Tosafos rows (four opening, 23 narrow, 37 wide and four full-width footer). Rashbam has a separate title below Rashi. The canonical source repeats the identical קידושא והבדלה comment at two leaf paths; the scan prints it once. Both source identities remain stored, the unprinted duplicate is explicitly linked to the printed occurrence, and the checker verifies their exact equality and distinct identities. The printed Tosafos אירוסין / canonical המזון endpoint difference is explicit. Manual observations are saved in `observations/pesachim-102b.json`. The compiler supports exact duplicate canonical leaves with documented single printed occurrence; builder integration remains paused.

Berachos 28b is complete without isolated previews: 54 Gemara rows (five narrow, 34 widened right and 15 full width), 48 Rashi rows and four Tosafos rows. This opening differs from prior pages: all four broad opening rows are full-width Rashi, while Tosafos begins in a narrow region beside Gemara and has no broad opening rows. Rashi has one side overhang row before the first Gemara baseline; it is not a fifth broad row. `openingLayout` and the collection checker preserve this distinction. Gemara widens right after Tosafos, then fully after Rashi. Saved observations: `observations/berakhot-28b.json`. Preparation remains separate from the paused builder adapter.

BM 25a is complete without isolated previews: 46 Gemara rows (31 narrow and 15 widened left), 65 Rashi rows (four opening, 54 side, seven full-width footer) and 39 Tosafos rows (four opening and 35 side). Rashi is on the right, Tosafos on the left. The Rashi tripod illustration is anchored to its source token and has a separate exclusion box. The extra printed ה״ג הא דלא אשתייר ביה מידי heading and printed דלית / canonical דאית are explicit variants; canonical source identities remain unchanged. Observations: `observations/bava-metzia-25a.json`. Builder integration remains paused.

Pesachim 103a is complete without isolated previews: 35 Gemara rows, 13 Rashi rows (four opening and nine side), 54 Rashbam rows (31 narrow, 14 wider and nine full-width footer) and 59 Tosafos rows (four opening, 42 narrow and 13 wider). Tosafos prints one לא הוי ידעיתו comment where the canonical source duplicates it: source span [599,689] retains the exact duplicate with links to the printed occurrence. All 689 original Tosafos words remain preserved; the current physical amud prints [0,424], ending כלומר. The isolated דברים preview is omitted. Canonical continuation [424,599] starts דברים and is deferred to physical 103b, whose opening main text was inspected to confirm the boundary. The manifest records this incoming continuation for later preparation. The checker verifies printed, deferred and duplicate spans as separate contiguous parts. Observations: `observations/pesachim-103a.json`. Builder integration remains paused.

## Additional preparation — Berachos 29a, BM 25b, Pesachim 103b

| Page | Gemara rows | Rashi rows | Rashbam rows | Tosafos rows |
|---|---:|---:|---:|---:|
| Berachos 29a | 56 | 50 | — | 38 |
| BM 25b | 45 | 51 | — | 71 |
| Pesachim 103b | 29 | 17 | 49 | 64 |

These counts omit isolated next-page previews. All remain preparation-complete and renderer-adapter-pending. Manual scan observations are saved beside the page records.

Berachos 29a has Rashi on the right and Tosafos on the left. Gemara has 31 narrow rows, ten widened left and 15 full width. Repeated wording in the closing discussion is disambiguated with inspected full-row text, preserving the intended source occurrence.

BM 25b has Rashi on the left and Tosafos on the right. Gemara has 42 narrow rows and three widened left. Rashi has four opening and 47 side rows; Tosafos has four opening, 54 narrow and 13 full-width footer rows.

Pesachim 103b has Rashi above Rashbam on the left and Tosafos on the right. Tosafos begins with the 175-word continuation from canonical 103a span [424,599], now main text on this page. Incoming IDs include their original amud and retain the original source ID and snapshot hash. Its four opening, 34 narrow and 26 wider rows include all 356 own-source words and all 175 incoming words exactly once. Rashbam has 20 narrow, 27 wider and two full-width footer rows. Its comments follow the inspected printed order rather than the canonical leaf order. The complete four-word על שבע comment is printed in the footer although canonically filed under 104a; the following isolated והא preview is omitted. The 104a manifest entry records this already-printed canonical prefix to prevent duplication during later preparation. The compiler now supports incoming continuations and complete comments borrowed from the next canonical snapshot; the collection checker verifies their original sources independently. Builder integration remains paused.


## Additional preparation — Berachos 29b, BM 26a, Pesachim 104a

| Page | Gemara rows | Rashi rows | Rashbam rows | Tosafos rows |
|---|---:|---:|---:|---:|
| Berachos 29b | 52 | 42 | — | 72 |
| BM 26a | 32 | 56 | — | 67 |
| Pesachim 104a | 49 | 21 | 47 | 58 |

These counts omit isolated next-page previews. All three are preparation-complete and renderer-adapter-pending, with reproducible manual observations in `observations/`. No paid inference or builder integration was run.

Berachos 29b has Rashi on the left and Tosafos on the right. Gemara has 34 narrow rows and 18 widened left; Rashi has four opening and 38 side rows. Tosafos has four opening, 60 narrow and eight full-width footer rows. Repeated prayer wording and the closing Tosafos discussion are disambiguated using inspected full-row text.

BM 26a has Rashi on the right and Tosafos on the left. Gemara has 32 narrow rows. Rashi has four opening, 39 side and 13 wider rows below Gemara; Tosafos has four opening, 39 side, 15 wider and nine full-width footer rows. The isolated שנפל, קידושא and בפחות previews are excluded.

Pesachim 104a has 47 narrow Gemara rows and two widened left. Rashi has four opening and 17 side rows; a separate Rashbam title precedes 39 side rows and eight full-width footer rows. Tosafos has four opening and 54 side rows. Rashi and Rashbam whole comments are explicitly reordered to match the scan. The complete canonical four-word Rashbam prefix על שבע — מפרשינן לקמיה is preserved in `previousSourceSpan: [0,4]` and verified against its original source identities already printed on 103b. It is not printed twice. The short printed Rashbam gloss חתימה — סוף הברכה חותם בברוך is absent from the canonical snapshot; rows 6–7 explicitly retain the additional display words and documented insertion variants. Isolated ולית previews are omitted. The compiler checks the prior page reference, exact prefix length, text and canonical identities before accepting the previously printed prefix. Builder integration remains paused.


## First connected rendering test — Pesachim 100b

Pesachim 100b is now `engineReady: true` with the `physical-page-v1` adapter.
The builder loads its saved physical blocks and all four text streams automatically,
without calling an AI service or fetching new Hebrew source. The other 23 new
preparation-complete records remain gated pending their own adapter validation.

The 100b browser regression checks every displayed line, every measured block,
initial composition, local Ask/Apply alignment, preservation of next-page previews,
free saved-scan rebuilding, and project Save/Open. Appearance settings are saved.
Unimplemented requests to alter measured line breaks or column boundaries are
rejected rather than silently ignored. Existing slide and PDF tools remain shared.

Open `agent-builder/index.html?ref=Pesachim%20100b` to build the test page directly,
or enter `Pesachim 100b` in the New Amud builder. No scan-reading AI call is needed.
Run `node tests/pes100b-prepared-browser.test.cjs` with Playwright/Chromium installed.
