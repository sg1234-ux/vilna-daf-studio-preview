/* Phrase navigation follows text clauses, independently of printed line breaks. */
window.GemaraPhraseParser = (() => {
  const cues = [
    "אמר ליה", "אמר לו", "אמר לה", "אמר רב", "אמר רבי", "אמר מר",
    "איכא דאמרי", "ואיכא דאמרי", "ואיתימא", "אי הכי", "אי נמי",
    "מאי טעמא", "מנא הני מילי", "מנין", "מאי", "מהו",
    "תא שמע", "תשמע", "מיתיבי", "ורמינהו", "איבעיא להו", "בעי",
    "תניא", "דתניא", "תנן", "דתנן", "תנו רבנן", "דתנו רבנן",
    "אלא", "פשיטא", "מהו דתימא", "קא משמע לן", "או דלמא",
    "משום", "כיון", "כדי", "הלכה", "דברי רבי", "רבי יוסי אומר"
  ];
  function parse(texts, normalize, ignored) {
    const assignments = Array(texts.length).fill(null), phrases = [];
    const values = texts.map(normalize), patterns = cues.map(cue => cue.split(" ").map(normalize));
    let pending = [], previous = null;
    function flush() {
      if (!pending.length) return;
      const index = phrases.length;
      phrases.push(pending.map(i => texts[i]).join(" "));
      pending.forEach(i => assignments[i] = index);
      pending = [];
    }
    texts.forEach((text, index) => {
      if (ignored(values[index])) {
        if (values[index]) flush(); // Mishnah / Gemara heading, not a spoken phrase.
        else if (/[.!?׃:]/u.test(text)) flush();
        return;
      }
      const cue = patterns.some(pattern => pattern.every((part, offset) => values[index + offset] === part));
      const endsSentence = previous != null && /[.!?׃:]\s*["'׳״»”’\])}]*\s*$/u.test(texts[previous]);
      const endsClause = previous != null && /[,;]\s*["'׳״»”’\])}]*\s*$/u.test(texts[previous]);
      if (endsSentence || (pending.length >= 3 && (cue || endsClause))) flush();
      pending.push(index);
      previous = index;
    });
    flush();
    return { phrases, assignments, source: "automatic" };
  }
  function resolve(texts, profile, mapped, normalize, ignored) {
    // Keep existing chart phrase IDs (and their linked lesson visuals) when aligned.
    if (profile?.length && mapped) {
      const first = mapped.findIndex(index => index != null);
      let last = mapped.length - 1;
      while (last >= 0 && mapped[last] == null) last--;
      const prefixCovered = texts.slice(0, first).every(text => ignored(normalize(text)));
      const middleCovered = mapped.slice(first, last + 1).every((index, offset) => index != null || ignored(normalize(texts[first + offset])));
      if (first >= 0 && prefixCovered && middleCovered) {
        const tail = parse(texts.slice(last + 1), normalize, ignored);
        return {
          phrases: [...profile, ...tail.phrases],
          assignments: [...mapped.slice(0, last + 1), ...tail.assignments.map(index => index == null ? null : index + profile.length)],
          source: tail.phrases.length ? "mixed" : "chart"
        };
      }
    }
    return parse(texts, normalize, ignored);
  }
  return { parse, resolve };
})();
