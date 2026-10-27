# Editable excerpts and text formatting — 62.68

## Editable PowerPoint export

The shared viewer menu adds **Download editable PowerPoint** beside the SVG
button. It writes one native, ungrouped text box per word, with Unicode Hebrew
and source nekudos, measured positions, font names, sizes, and weights. The
export expands only enough to include complete words intersecting the selection.
Headers and other labels also split into separate words. The original page text,
line boundaries, and approved layouts remain untouched.

The PPTX sets explicit Hebrew paragraph direction and complex-script font faces.
Punctuation hidden on the page keeps its character/space in the editable text,
with the paper color. Whiteouts retain pale editable words. Drawn annotations
are a separate transparent image layer; words are never flattened into it.

Canva and PowerPoint can substitute fonts they do not have. The menu supplies
links to the same Drugulin CLM and Mekorot font files used by the viewer. This
export does not guarantee that an external editor supports or installs custom
fonts. The existing SVG and PNG routes remain available for fixed appearance.

PptxGenJS 4.0.1 and its bundled JSZip load only when this option is used. All
processing is local. No paid inference or user file upload occurs.

## Builder text-formatting requests

Pesachim 100b's renderer now restores commentary opening-word markers using the
first separator in each saved Sefaria comment leaf, including the borrowed
next-page prefix. Tokens retain their original source IDs and line spans.
Existing comments without a separator are not guessed to have an opening span.

Examples supported locally before calling a connected model:

- Make the dibbur hamschilim bold.
- Make the dibbur hamaschilim not bold.
- Make the dibbur hamaschilim a little bigger.
- Make the Tosafos dibbur hamaschilim 14px.
- Make the selected word bold.
- Make the selected phrase 12pt.

Explicit px or pt sizes and larger/smaller requests are bounded. Rules persist in
project settings; older saved physical projects regain the opening-word markers by source ID without replacing their text or geometry. Rules can be undone through the existing builder guard. Fixed
scan lines preserve all words and endpoints; fitting may limit absolute sizes
so that enlarged words do not overlap or clip. Saved approved text styles retain
their size ratios during word-navigation restoration.

## Validation

`node tests/editable-excerpt-browser.test.cjs` uses the actual export button on
Pesachim 99b, BM 21a and prepared Pesachim 100b. It inspects native DrawingML
text boxes, Hebrew direction/font metadata, exact Unicode text/nekudos, word
coordinates, selection edges, and unchanged source/layout. Sample PPTX files
were rendered with LibreOffice using the bundled fonts for visual review.

`node tests/pes100b-prepared-browser.test.cjs` checks local Ask/Apply bold,
regular-weight, relative enlargement, explicit sizes and selected-word styling,
as well as project Save/Open and the original scan/geometry checks. Existing
SVG/PNG/clipboard export regression and launcher lesson tools remain separate.
External Canva import has not been validated in a signed-in Canva session.
