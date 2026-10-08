# Pesachim 100a review draft — Build 62.52

This draft uses the recovered Sefaria Hebrew responses and a DafYomi.org Vilna scan as a visual reference. No scan image is required at runtime.

- 25 central Gemara lines, beginning דילמא משבשתא היא and ending כשם שמפסיקין לקידוש.
- Four opening commentary lines; Tosafos left, Rashi/Rashbam right.
- Rashi concludes before the short רשב״ם heading; one empty commentary line separates them.
- Both commentary columns widen beneath the Gemara. Tosafos occupies the final full-width line.
- Hebrew source words are retained, including Sefaria's expanded names; horizontal compression is restricted by the existing 0.86 validation threshold.
- Review-draft status is separate from teacher approval. The page is not added to approved local amudim.

Validation: source coverage and stage allocation check, existing anchored-layout checks, punctuation checks, and JavaScript syntax checks pass. Local Chromium could not launch because the execution environment denies its socket creation. Live rendering must be checked before calling this layout complete.

Protected Pesachim 99b and Bava Metzia 21a fixture files are unchanged.

Teacher correction: surround the Gemara with a 25px gutter on all four sides. The opening remains four commentary lines; commentary leading and page height accommodate the top and bottom gutters without dropping source lines. Build 62.51 live checks passed source placement, clipping, and punctuation geometry; Build 62.52 must repeat the rendered gutter checks.
