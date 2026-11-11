# Bava Metzia 22a reference page

Reference: https://images.e-daf.com/DafImg.asp?ID=3068&size=2

The reference pack contains editable Hebrew source and exact token maps for all three streams. The Gemara has 36 narrow lines, nine wide main lines, and the separate final word אינן. Rashi has 45 lines and Tosafos 70, including four opening lines each. Rashi releases its column after its last word and a 25px gutter. Tosafos continues in its column before using the full page width for its last 12 lines.

Sefaria's expanded abbreviations and spelling variants are retained. The first word of Sefaria 22b, אינן, belongs at the foot of the printed 22a scan. The entire הכי גרסינן Tosafos comment precedes אם יש יפות in the print and is moved intact to that position. Dash glyphs are hidden without deleting source tokens. No paid model call is needed to open the page.

The reading page loads the reference pack directly. The automatic builder remains available; adding scan=1 to its embedded draft-engine URL selects this reference pack explicitly.

Validation: `tests/bm22a-reference-browser.test.cjs` checks original Hebrew source coverage, exact line allocation, endpoints, opening lines, widths, gutters, clipping, repeated composition and the nekudos toggle. The existing automatic composition and actual Ask / Apply / Undo / local correction regression also passes.
