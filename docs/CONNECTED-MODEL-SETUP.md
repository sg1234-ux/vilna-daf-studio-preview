# Connect the layout model

The builder can now send natural instructions, actual rendered line text and positions, source text, diagnostics, saved constraints, and the last eight conversation/result entries to an OpenAI model. The model proposes supported layout settings through a strict function contract. It does not execute code or approve pages. Apply uses the existing compositor, measured checks, rollback, and Undo.

## Activate the server

Import this repository into Vercel as an **Other** project, with no build command or output directory override. This repository contains the two Node serverless endpoints in `api/agent/`; `vercel.json` allows a 60-second function window. You can deploy the feature branch before merging it. Do not paste an API key into chat, the browser connection panel, a source file, or GitHub.

Set these environment variables in the host's project settings, then deploy:

| Variable | Value |
|---|---|
| `OPENAI_API_KEY` | Your OpenAI project API key, stored only as a host secret |
| `AGENT_ACCESS_TOKEN` | A randomly generated access password of at least 24 characters |
| `AGENT_ALLOWED_ORIGINS` | `https://sg1234-ux.github.io` plus the exact Vercel site origin if using its builder; comma separated, no trailing slash |
| `OPENAI_MODEL` | Optional; defaults to `gpt-6-astra`, configurable to an available compatible model |

The access password authenticates the teacher to this small private agent service; it is **not** the OpenAI key. Keep it private. Reviews require it even when the origin is allowed. Restrict API usage in the API account. The server's ten-reviews-per-minute throttle is per running function instance and is not a global billing cap.

Open the deployed site's `/agent-builder/` page. Under **Connect the AI agent**, enter the host's HTTPS address and agent access password. The password is kept in browser session storage, never in page approval snapshots or permanent local storage. Confirm **AI agent connected**. A successful status check establishes configuration; the first review verifies actual provider/account/model access.

Build an unapproved draft and describe the correction naturally. Review the proposal and choose Apply. When ambiguity or unsupported controls remain, Apply stays disabled and the agent explains the missing detail. If the model request fails, no stale or local proposal is substituted. Local rule mode remains clearly labelled when disconnected.

To use the existing GitHub Pages builder, merge the frontend changes and enter the same hosted server address. GitHub Pages itself cannot execute these endpoints. Approved teaching views remain unchanged.

## Checks and limits

Run `node tests/connected-model.test.cjs`, `node tests/agent-brain.test.cjs`, `node tests/phrase-parser.test.cjs`, and the scripts in `scripts/`. The model tests use an injected provider response: they verify the complete request/validation path without pretending that a paid live request was made.

Exact unfamiliar Vilna line boundaries require verified evidence. The model receives line coordinates, not a raster screenshot. Source context is capped at 24,000 characters per stream and 200 rendered lines, with explicit truncation flags. Notes, recordings and student data are not included. Context/history resets when a different draft is built and disappears when the browser session ends. Repeated automatic repair uses the existing bounded local repair loop; the model receives results on the next teacher instruction. Punctuation toggles, arbitrary single-region widths, page-mode changes and source edits are not model-executable controls in this release.

API responses use `store:false`; the service does not maintain its own conversation database. This does not override the provider's account retention policy. Rotate the agent password and API key through host settings if needed.
