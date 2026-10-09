# Build 60 tool and placement inventory

Audited October 8, 2026. This is an interface audit for planning a consistent tool panel. No amud layout or application behavior was changed.

**Interface rules adopted after this audit:** All amud tools belong beside the daf, never above it. Approved amudim must not show the agent menu. The subsequent interface change moves Reflow page edits and Select excerpt into the side panel, keeps that panel beside the daf at every width, and removes the agent shell when opening a saved approved amud. The tables below preserve the original audit for comparison. Daf geometry is unchanged. The 100a/21b toolbox is now the shared structure for all pages, with phrase focus, lesson visuals, punctuation and Exact Slide PNG export added to the older page engines. Approved teaching views also hide the Automatic composition report and composition-test status messages; these diagnostics remain available in draft authoring. Loading and export feedback remain visible. Archival open source is now the default font preset, and the Typography chooser is removed from the visible interface.

**Approved-page opening:** Newly approved builder pages now save their finished rendered text and geometry in browser storage. Existing approvals such as Bava Metzia 21b migrate after one successful load. Later openings restore the saved page without source requests or composition, and resizing does not recompose it. Clearing browser storage removes these local snapshots and approvals; they are not bundled GitHub pages. Storage failures remain visible.

**Phrase navigation:** A Milim ID profile is optional. All page engines can derive navigation phrases from Gemara punctuation and common clause transitions without a network request. Existing matching chart phrases keep their IDs; uncovered ending text uses automatic divisions. These divisions are heuristic teaching units, not a verified semantic phrase map. Phrase focus and lesson visuals work with either source. Printed line geometry is unchanged.

## Scope and placement key

The live combined selector contains three bundled amudim: Pesachim 99b (Build 44), Pesachim 100a (engine 62.53), and Bava Metzia 21a (Build 51). It also contains “Build a new amud — Agent.” Additional approved drafts are saved in the user's browser and opened through the builder. No additional saved drafts appeared in the inspected browser, so their individual content and enabled states were not verified. Their shared interface is included below as **Builder / saved drafts**.

- **Outer bar:** Build 60's persistent top bar, outside the selected amud iframe.
- **H:** the selected amud's own header, below the outer bar; actions are on its right.
- **S1–S10:** numbered sections of the amud tool panel, from top to bottom. See the section-order table.
- **W:** floating Word note window, displayed after turning Notes on.
- **Daf:** direct interaction on the text or annotation layer.
- **B1–B4:** builder's separate outer correction panel, from top to bottom.
- **Absent:** no control in that interface. **Hidden:** control exists in source but is deliberately hidden. **Conditional:** present, with availability dependent on selection, mode, page data, or browser support.

At wide iframe widths, the amud tool panel is 260 pixels wide and sits to the left of the daf. At iframe widths of **1,120 pixels or less**, it becomes a full-width panel **above the daf**, in the same section order. It is a long scrolling stack rather than a fixed teaching toolbar. The amud's own header scrolls with its document; the outer Build 60 bar stays outside that scroll.

The builder adds a **340-pixel outer panel** to the left of an iframe containing the engine's own panel and daf. Consequently, a wide overall window can still give the inner engine an iframe narrow enough to move its tools above the daf. At builder widths of **800 pixels or less**, the builder's correction panel also stacks above the preview. This accounts for substantial placement differences even where the engine has the same tools.

## Section order on each amud

| Position | Pesachim 99b | Bava Metzia 21a | Pesachim 100a | Builder / saved drafts: inner engine |
|---|---|---|---|---|
| Outer bar | Amud selector; Open full page | Same | Same | Same |
| H | Reflow page edits; Select excerpt | Same | Same | Same, inside preview iframe |
| S1 | Sefaria reference and Load; no section heading | Bava Metzia 21a: Masechta, Amud, Load selected amud | Amud: approval and load status; loading controls hidden | Agent draft / page identity: status; loading controls hidden |
| S2 | Navigate and edit | Navigate and edit | Navigate and edit, including Phrase Focus Navigator | Same as 100a |
| S3 | Text display | Text display | Lesson visuals | Lesson visuals |
| S4 | Reading accuracy | Reading accuracy | Text display | Text display |
| S5 | Annotations | Annotations | Reading accuracy | Reading accuracy |
| S6 | Project file | Project file | Annotations | Annotations |
| S7 | Automatic composition | Automatic composition | Project file | Project file |
| S8 | Typography | Typography | Automatic composition | Automatic composition |
| S9 | Excerpt workflow | Excerpt workflow | Typography | Typography |
| S10 | — | — | Excerpt workflow | Excerpt workflow |

Adding Lesson visuals shifts every section below Navigate and edit down by one on 100a and builder pages. Adding Phrase Focus Navigator also increases the height of Navigate and edit, pushing subsequent tools further down.

## Complete amud tool comparison

Controls sharing one location and availability rule are listed together. Within each section, this table follows the current top-to-bottom order.

| Tool / interaction | Pesachim 99b | Bava Metzia 21a | Pesachim 100a | Builder / saved drafts | Availability / difference |
|---|---|---|---|---|---|
| Amud selector | Outer bar | Outer bar | Outer bar | Outer bar | Shared combined-page selector; saved drafts appear only where browser storage contains them. |
| Open full page | Outer bar, right of selector | Same | Same | Same | Opens the selected route in another tab; removes the combined outer bar, but builder routes retain their builder panel. |
| Reflow page edits | H, first action | H, first action | H, first action | Inner H, first action | Explicit recomposition action; different from zoom. |
| Select excerpt | H, second action | H, second action | H, second action | Inner H, second action | Starts drag selection on the daf; exports are far below in Excerpt workflow. |
| Sefaria reference input + Load | S1, visible | S1, hidden | S1, hidden | Inner S1, hidden; visible reference field also exists at B1 | Three different approaches to loading pages. 99b also loads on Enter. |
| Masechta selector | Absent | S1, first dropdown | S1, hidden | Inner S1, hidden | 100a and engine still display the Masechta label without its dropdown. |
| Amud selector inside the page | Absent | S1, second dropdown | S1, hidden | Inner S1, hidden | Separate from the outer Build 60 Amud selector; engine leaves its label visible. |
| Load selected amud | Absent | S1, below dropdowns | S1, hidden | Inner S1, hidden | Duplicates part of the outer selector's purpose on 21a. |
| Navigate / Edit | S2, first button pair | Same | Same | Inner S2 | Shared. Edit makes text regions editable. |
| Word by word | S2, navigation button pair, left | Same | Same | Inner S2 | Available on all three bundled amudim. |
| Phrase by phrase | S2, navigation button pair, right | Same | S2, disabled | Inner S2, conditional | Live 99b and 21a report phrase navigation available; 100a reports no Milim ID phrase map. Saved drafts depend on their own phrase data. |
| Focus: Off / On | Absent | Absent | S2, below navigation status; disabled | Inner S2, Phrase Focus Navigator | Requires verified phrase profile and phrase navigation. Distinct from manual Focus fade. |
| Visible phrase window: 1 / 2 / 3 / Custom | Absent | Absent | S2, under Focus; disabled | Inner S2, under Focus | Custom reveals a number field, range 1–12; window changes require active focus and phrase support. |
| Previous / Next phrase | Absent | Absent | S2, below phrase window; disabled | Inner S2, below phrase window | Require focus, a selected phrase, and an available previous/next phrase. |
| Notes: Off / On | S2, below navigation status | Same | S2, below Phrase Focus Navigator | Inner S2, below Phrase Focus Navigator | Opens/closes floating Word note editor. |
| Fade selection / Restore selection | S2, Focus fade block | Same | Same | Inner S2 | Require Edit mode and selected Gemara words. Present when disabled. |
| Restore all faded text | S2, below fade/restore pair | Same | Same | Inner S2 | Requires Edit mode and existing faded words. |
| Visual link URL field | Absent | Absent | S3, Lesson visuals | Inner S3 | Field is visible even when phrase actions are unavailable. Accepts lesson links such as Google Slides or Canva. |
| Attach / Open / Remove visual | Absent | Absent | S3, beneath URL; disabled initially | Inner S3 | Attach requires a selected verified phrase in phrase mode; Open and Remove require an attached link. 100a currently lacks the phrase profile. |
| Attached visual icon | Absent | Absent | Conditional on Daf | Conditional on inner Daf | Generated beside a phrase with attached visuals; opens the linked visual. Not a permanent toolbar control. |
| Nekudos: On / Off | S3, first display toggle | Same | S4, first display toggle | Inner S4 | Shared. |
| Punctuation: On / Off | Absent | Absent | S4, second display toggle | Inner S4 | Engine-only display control. |
| Gemara line numbers: Off / On | S3, second display toggle | Same | S4, third display toggle | Inner S4 | Shared function, different ordinal position. |
| Whole-page size −50% / percentage / +50% | S3, below display toggles | Same | S4, below display toggles | Inner S4 | Shared; zooms completed page without reflow. Observed 99b and 21a at 150%, 100a at 100%; view state can change. |
| Choose reading start word | Daf, click Gemara word | Same | Same | Inner Daf | Starting word/phrase is displayed in Reading accuracy. |
| Start reading / Stop / Reset | S4, Reading accuracy | Same | S5, Reading accuracy | Inner S5 | Start requires a selected Gemara word and speech-recognition support; Stop requires active reading; Reset requires reading state. Microphone functionality was not exercised in this audit. |
| Annotate page | S5, first control | Same | S6, first control | Inner S6 | Enables drawing on the daf annotation layer. |
| Pen / Highlighter / Eraser | S5, below Annotate page | Same | S6, same order | Inner S6 | Shared three-button row. |
| Annotation color | S5, below tool row | Same | S6 | Inner S6 | Color picker. |
| Stroke width | S5, below Color | Same | S6 | Inner S6 | Slider, range 1–18, with displayed value. |
| Annotation Undo / Redo / Clear all | S5, bottom row | Same | S6, bottom row | Inner S6 | Availability follows annotation history and existing strokes. These are annotation actions, not general text-edit undo/redo. |
| Save project / Open project | S6 | Same | S7 | Inner S7 | Saves/loads .vds project data. Open uses a hidden file input; that input is not an additional visible tool. |
| Daf font preset | S8, Typography | Same | S9, Typography | Inner S9 | All offer Archival open source, OT Vilna installed license, Vilna MF installed license, Build 31 comparison. Installed font choices depend on font availability. |
| Download Exact Slide PNG | Absent | Absent | S10, first export | Inner S10, first export | Requires an excerpt selection. Explicit PNG download is new to engine pages. |
| Copy excerpt | S9, first export | Same | S10, second export | Inner S10, second export | Requires selection. All attempt PNG clipboard copy. Older pages fall back to SVG download; engine falls back to Exact Slide PNG download. |
| Download SVG | S9, “Download Canva SVG” | Same | S10, “Download Vector SVG (optional)” | Inner S10, same as 100a | Requires selection. Different label for the vector export workflow. |
| Clear selection | S9, last export action | Same | S10, last export action | Inner S10 | Requires excerpt selection. |
| Word note textarea | W | W | W | W inside preview | Shown when Notes is on; needs a selected word to edit. Notes are included in project saves. |
| Close notes × | W, upper right | Same | Same | Inner W | Closes the notes window. |
| Drag Word note window | W, title bar | Same | Same | Inner W | Fixed-position overlay initially 290px from iframe left and 110px from iframe top; user can move it. |
| Click/select a word or phrase | Daf in Navigate mode | Same | Same; word only without phrase map | Inner Daf, page-dependent | Shared text interaction; phrase availability differs. |
| Left / Right arrow navigation | Keyboard while selected text is in Navigate mode | Same | Same | Same | Left advances; Right moves backward by selected unit. Ignored while typing in inputs/selects/textareas or using modifier keys. |
| Edit text directly | Daf in Edit mode | Same | Same | Inner Daf | Click/type in editable regions; Reflow page edits is separately located in H. |
| Drag excerpt rectangle | Daf after Select excerpt | Same | Same | Inner Daf | Selection overlay; export actions are in the last sidebar section. |
| Draw / erase annotations | Daf after Annotate page | Same | Same | Inner Daf | Canvas interaction using chosen annotation tool, color and width. |

There is no visible per-word font-size toolbar in these interfaces. Stored word-font scaling exists in project data, but it is not exposed as a current control.

## Builder-only controls and placement

These controls are outside the inner engine. The three bundled amud routes do not show them. Browser-saved approved drafts use this builder route and therefore retain this surrounding interface.

| Tool / field | Location in builder's outer panel | Availability / options |
|---|---|---|
| Sefaria reference | B1, first field | Amud to build. |
| Perek identifier | B1, second field | Optional evidence. |
| Rashbam status in this perek | B1, third field | Not yet verified / First Rashbam amud / Rashbam appeared earlier. |
| Build draft without a PDF | B1, bottom action | Fetches source and builds draft. |
| Which stream finishes? | B3, measured correction, first dropdown | Unchosen / Rashi–Rashbam / Tosafos. |
| Which commentary continues? | B3, second dropdown | Tosafos / Rashi–Rashbam. |
| Narrow continuation lines before full width | B3, number field | Range 1–12. |
| Apply measured takeover | B3, below continuation count | Conditional on ready draft and correction inputs. |
| Region needing attention | B3, below measured-correction block | Whole page / Opening commentary / Gemara / Rashi–Rashbam / Tosafos / Region transition / Rashbam heading. |
| What looks wrong? | B3, textarea beneath region | Free-text correction request. |
| Ask agent to diagnose | B3, beneath feedback | Optional AI review; observed unavailable in live builder. |
| Apply agent's proposed adjustment | B3, below proposed-result status | Requires applicable proposal. |
| Approve and add this amud | B4, first action | Locked while hard rules or Rashbam policy are unresolved. |
| Approved local amud links | B4, below approval action | Appear when this browser has saved approved drafts. |

## Status displays, not action tools

| Display | 99b | 21a | 100a | Builder / saved drafts |
|---|---|---|---|---|
| Load/composition status | S1 | S1 | S1 | Inner S1; also B1 build status |
| Verification / approval identity | No separate verification badge | S1 | S1 | Inner S1; builder header and B4 status also visible |
| Navigation and focus guidance | S2 | S2 | S2, including focus status | Inner S2 |
| Reading start, accuracy, correct/review/missed, transcript | S4 | S4 | S5 | Inner S5 |
| Amud, pattern, page fill, rule check | S7 | S7 | S8 | Inner S8 plus B2 diagnostics |
| Font availability/status | S8 | S8 | S9 | Inner S9 |
| Build progress: Source / Compose / Validate / Approve | Absent | Absent | Absent | Sticky strip at top of outer builder panel; indicators, not navigation buttons |
| Pattern, Text, Rashbam, Page fit, Occupancy, Transition, Bands, Approval, failure list | Absent as builder diagnostics | Absent as builder diagnostics | Absent as builder diagnostics | B2 |
| Agent readiness | Absent | Absent | Absent | Builder header, right side |

Live 99b displayed a mapped-token-preservation warning during this audit. This is recorded as a status observation, not a finding that its visual layout needs changing. No layout correction was attempted.

## Decisions for the consistent interface

1. **Use one shared tool shell and one section order** for every amud. Amud data and the approved daf geometry can remain page-specific.
2. **Keep tool positions stable when a feature is unavailable.** Show its disabled control with a short reason, such as “Phrase map needed,” rather than removing the section and shifting the remaining tools.
3. **Use one amud picker.** The current outer picker, 99b reference-loader, 21a internal selectors, and builder reference field have overlapping purposes. Keep the build reference field within authoring controls.
4. **Place excerpt selection and export together.** Currently Select excerpt is in H while Copy/Download/Clear are at the very bottom of the tool panel.
5. **Keep everyday teaching controls easy to reach.** Proposed common order: Navigate and focus; Notes and lesson visuals; Text display; Reading; Annotations; Excerpts; Project files. Put typography, reflow and composition diagnostics in an advanced area.
6. **Give builder corrections a dedicated authoring area.** Its extra panel currently competes with the teaching panel and triggers the stacked responsive layout.
7. **Standardize names and defaults.** In particular, SVG export wording, manual Focus fade versus automatic Phrase Focus, and initial zoom differ or can be confused.

These are proposed interface decisions for discussion, not implemented changes.

## Sources and method

Compared rendered controls in the live combined Build 60 selector with the repository HTML, CSS and event handlers. Presence, placement, labels and initial enabled states were inspected. Conditional rules were checked in source; this was not an end-to-end functional test of every tool.

- [Combined selector](../index.html), [routing and browser-saved draft handling](../launcher.js), [outer bar layout](../launcher.css).
- Pesachim 99b: [HTML](../pesachim-99b/index.html), [styles](../pesachim-99b/styles.css), [behavior](../pesachim-99b/app.js).
- Bava Metzia 21a: [HTML](../bava-metzia-21a/index.html), [styles](../bava-metzia-21a/styles.css), [behavior](../bava-metzia-21a/app.js).
- Pesachim 100a / shared draft engine: [HTML](../draft-engine/index.html), [styles](../draft-engine/styles.css), [behavior](../draft-engine/app.js).
- Builder / saved drafts wrapper: [HTML](../agent-builder/index.html), [styles](../agent-builder/styles.css), [behavior](../agent-builder/app.js).
