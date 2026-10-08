# Pesachim 100a approved page — Build 62.53

This page uses the recovered Sefaria Hebrew responses and a DafYomi.org Vilna scan as a visual reference. No scan image is required at runtime.

- 25 central Gemara lines, beginning דילמא משבשתא היא and ending כשם שמפסיקין לקידוש.
- Four opening commentary lines; Tosafos left, Rashi/Rashbam right.
- Rashi concludes before the short רשב״ם heading; one empty commentary line separates them.
- Both commentary columns widen beneath the Gemara. Tosafos occupies the final full-width line.
- Hebrew source words are retained, including Sefaria's expanded names; horizontal compression is restricted by the existing 0.86 validation threshold.
- Teacher approved the 100a layout. It is a built-in entry in the combined Build 60 selector and does not require browser-local approval storage.

Validation: source coverage and stage allocation check, existing anchored-layout checks, punctuation checks, and JavaScript syntax checks pass. Local Chromium could not launch because the execution environment denies its socket creation. Live rendering must be checked before calling this layout complete.

Protected Pesachim 99b and Bava Metzia 21a fixture files are unchanged.

Teacher correction: surround the Gemara with a 25px gutter on all four sides. The opening remains four commentary lines; commentary leading and page height accommodate the top and bottom gutters without dropping source lines. Build 62.51 live checks passed source placement, clipping, and punctuation geometry; Build 62.52 must repeat the rendered gutter checks.

Build 62.52 live verification passed all mapped and region rules, measured a 25px gutter on all four sides, retained four opening lines and 25 Gemara lines, and found no clipped regions or lines. The teacher approved the result before adding 100a to the existing pages.
