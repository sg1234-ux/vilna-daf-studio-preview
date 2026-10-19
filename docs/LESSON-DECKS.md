# Whole-deck lesson links

Build 62.62 provides a free, text-based Google Slides import under **Lesson visuals → Match a whole deck**. Paste the usual Google Slides edit/share URL into Visual link and choose **Match Google Slides deck**. The reader preserves Google's actual slide IDs; every imported link opens its specific slide.

The program compares Hebrew quotes on each slide against the current daf's Gemara words. It ignores nekudos and punctuation. Quotes shorter than three words, missing Hebrew and repeated ambiguous passages are left for manual choice. This is quote matching, not semantic AI interpretation or OCR. Image-only slides and English explanations need a manually selected phrase. Canva links still work as individual visual links; automatic Canva-deck reading is not included.

The review panel shows each slide's text, proposed phrases and a checkbox. Review the checked matches, change the proposed choices, or click a word on the daf and choose **Use selected phrase** on an unmatched slide. Choose **Add reviewed slide links** to apply. Importing and canceling do not change existing links. The daf's source and geometry are not recomposed. Changing the daf or phrase boundaries invalidates pending assignments.

Multiple slides may attach to one phrase; its visual icon opens a list so every attached link remains accessible. Existing single-link behavior is retained. Use **Save project** to preserve the assignments in the existing `.vds` format. Opening that project restores them.

If the deck requires sign-in, keep its current sharing settings. Expand **Deck needs sign-in?**, open its text view in your browser, save that page as **HTML only**, then use **Load saved slide view**. This file is parsed on the device and is not sent to the server. A saved view must belong to the pasted deck URL and contain Google's original slide identifiers.

The Vercel endpoint and local runner use the same reader. They fetch only the standard Google Slides HTML view, bound its size and reading time, reject external redirects and return plain text plus verified slide IDs. No Google credentials, OpenAI keys or paid AI calls are used. The import supports up to 150 slides and an 8 MB slide view. Google HTML-view structure can change; unsupported or inaccessible decks produce a visible error instead of invented assignments.

Validation: `node tests/lesson-deck.test.cjs`, `node tests/lesson-deck-browser.test.cjs` and `node tests/lesson-visuals-browser.test.cjs`. Browser tests use Playwright and an optional `PLAYWRIGHT_CHROMIUM_EXECUTABLE`, bundled BM 21a text and deterministic slide fixtures; all external services are blocked. The Google sample deck's HTML view was also checked during development to confirm extraction of its actual five slide IDs.

The deck controls and their styles now come from shared `lesson-deck-controls.js` and `lesson-deck.css` files, loaded by all three viewer templates: the draft engine, preserved BM 21a (51.1) and preserved Pesachim 99b (44.1). Existing newer pages and approved drafts use the draft engine. Main-menu regression tests cover BM 21a, Pesachim 99b, Pesachim 100a and BM 22a through the real launcher. Legacy compositor source/layout logic is retained. The launcher and viewer script URLs are refreshed so existing menu selections load the updated controls.
