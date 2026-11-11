# Excerpt export — 62.67

All three viewer templates load the same export controller after their preserved
page engines. Copy excerpt, Download PNG and Download SVG share this renderer.
No AI service or account is used.

Hebrew outlines are shaped using bundled HarfBuzz.js 1.6.3 (MIT). The font file
matches the loaded Drugulin/Mekorot face and weight. Mark positioning and RTL
shaping replace the previous per-character reversal; baselines come from the DOM,
not from centering each word's ink box. Hidden punctuation retains its space,
whiteouts and annotations are kept, and exports include a six-pixel border.

System or locally installed fonts whose bytes are unavailable are painted with
the browser's actual font into embedded high-resolution images rather than being
substituted. SVGs are self-contained and require neither installed fonts nor a
foreignObject renderer. Copy/PNG rasterize that same export at four times its
selected size. The optional SVG may therefore include embedded images alongside
outlines when a system/local face is used.

Only export controls are replaced. The preserved Pesachim 99b and BM 21a page
engines and their approved geometry are unchanged.

Validation: `node tests/excerpt-export-browser.test.cjs` exercises the real SVG,
PNG and Copy buttons in Pesachim 99b, BM 21a, and prepared Pesachim 100b. It compares
exported ink/nekudos with a four-times browser capture, checks unchanged source
and word boxes, verifies matching clipboard/PNG/SVG output, and covers commentary,
hidden punctuation, whiteouts, zoom and embedded system-font fallback. Font
resources and the shaping library load only when an excerpt is exported.
