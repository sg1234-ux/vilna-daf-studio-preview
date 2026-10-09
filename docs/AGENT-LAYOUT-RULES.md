# Layout correction agent

The public GitHub preview runs a local rule agent, not the same hosted reasoning system as Codex. It can translate the supported teacher instructions into compositor constraints, inspect measured failures, propose repairs, test changes, and restore earlier settings. Optional hosted AI review still requires the existing server endpoint; this static repository does not provide or configure that server.

The shared rulebook is in `agent-builder/agent-brain.js`. It preserves source words and order, uses four opening commentary lines by default, keeps the Gemara gutter separate from commentary continuity, prevents takeover before neighboring text finishes, and checks clipping, source coverage, line constraints, and page tiling. Known page maps remain in the engine; rules cannot reconstruct an unknown printed page's exact line boundaries.

## Supported examples

| Teacher instruction | Interpretation |
|---|---|
| The gutter needs to surround the Gemara on all sides | 25px Gemara gutter, without a horizontal break through commentary |
| Keep only four opening commentary lines | Four opening lines and continuous commentary below |
| The last 4 lines of tosfos are seperate from the rest | Normalize wording; reconnect the Tosafos stream |
| Gemara should have 54 lines | Editable target line count, preserving all source words |
| From Gemara line 45 onward widen into Rashi | A numbered width transition into completed neighboring space |
| Gemara line 2 starts with “אמר רב” and ends with “תיקו” | Source-matched visual line anchor |
| Align Gemara line 45 to the right | Partial-line alignment at the numbered line |
| Remove Gemara dashes | Reversible display transformation |
| Keep four opening commentary lines; surround the Gemara with a gutter; remove Gemara dashes | Combine recognized operations into one proposal |
| No instruction, or Diagnose and repair measured failures | Propose bounded repairs from current diagnostics |

Explicitly named streams override a stale region dropdown. Missing line numbers, unknown operations, and unsupported evidence remain visible as unresolved instructions. Recognized operations can still be proposed alongside unresolved ones.

## Repair and review

After applying a correction, the agent compares source word counts, unplaced tokens, overflow, and failure counts with the prior diagnostics. A worse result triggers recomposition with the previous settings. Automatic repair tries at most three distinct adjustments, then stops. Undo restores the preceding settings even if that earlier draft had failures.

Repairs can restore opening/stream continuity, remeasure released-space timing, increase page height within its existing limit, or try a small type adjustment for incomplete source placement. The agent does not silently discard anchors, invent a missing source, approve a page, or claim that passing measured rules proves an exact Vilna scan match.

Run `node tests/agent-brain.test.cjs` for command and repair-flow checks. Existing source/anchor/gutter tests remain in `scripts/`.
