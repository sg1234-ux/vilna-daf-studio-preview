# Personal builder using ChatGPT

This version runs the builder on your own computer and uses OpenAI's supported **Continue with ChatGPT** connection. It never reads your paid OpenAI API key or falls back to your Vercel AI server.

## Windows: first-time setup

1. Install the **LTS** version of Node.js from https://nodejs.org/en/download. Use the normal installer options. The builder requires Node.js 22 or newer.
2. Download the repository's `feature/connected-layout-model` branch as a ZIP. Choose **Extract All** in Windows; do not run it from inside the ZIP.
3. Open the extracted folder and double-click **Start-Vilna-Builder.cmd**.
4. Keep the window that opens running. Your browser should open the personal builder automatically. Otherwise open http://127.0.0.1:1455/agent-builder/.
5. In the builder choose **Continue with ChatGPT**, sign in on OpenAI's page, and allow the app to use your ChatGPT plan if offered. Your account or workspace must support the feature; this cannot bypass restrictions set by OpenAI or your workspace administrator.
6. Choose an available AI model, build an amud, and ask for a correction. Apply the proposal after reviewing it.

## Avoid extra charges

Requests use your shared ChatGPT allowance. They are not unlimited. In **ChatGPT Settings → Usage**, keep permission for apps to use extra credits **off**. OpenAI controls that setting; the builder cannot turn it off for you. If allowance or account access is unavailable, this version shows an error and does not switch to a paid API key.

The Vercel version is a separate copy and still uses API credits if you ask its connected AI. Use the address starting `http://127.0.0.1:1455` for the personal connection. Keeping Vercel is optional for this personal setup; it remains useful for your public website.

## Each time you use it

Double-click **Start-Vilna-Builder.cmd**, then use the browser page it opens. Close the launcher window when finished. Internet is still needed for OpenAI and for fetching new Gemara source text. This does not download or run an AI model on your computer.

You can choose a saved account to reconnect, add another account, or sign out. Sign-in records are kept in your Windows user app-data directory, outside the extracted project. Do not share them. Approved pages in your old Vercel browser storage are not automatically copied into the personal builder; export/import them using the existing page tools.

## macOS or Linux

Install Node.js LTS, extract the project, and run `node server/local-builder.cjs` from its folder. On macOS the included `Start-Vilna-Builder.command` is another launcher, but the ZIP may require marking it executable.

## Developer notes

- Server binds to `127.0.0.1` only and verifies Host and request origin.
- Uses OAuth Authorization Code + PKCE, nonce and browser-bound state, a fixed `/auth/callback` path, issued client IDs, signature-verified ID tokens, and required plan-use scopes.
- Keeps stable host identity and distinct saved account/client records. Credentials are written atomically in private app-data storage; Windows ACLs and Unix owner-only permissions protect that directory.
- Rotating refresh tokens are renewed serially. Start only one personal builder instance at a time; the fixed listening port prevents a duplicate launcher.
- The account's model catalog controls the model picker. Responses are streamed and accepted only after a complete `response.completed` event and the shared correction contract validates them.
- Same Apply/rollback/Undo rules and source preservation apply. This changes the AI connection, not the scope of the builder's supported tools.
- Live user eligibility, allowance and sign-in cannot be verified by mock tests. Complete sign-in on the user's computer for that validation.

Official integration references:

- https://developers.openai.com/siwc/token-sharing-open-source
- https://developers.openai.com/siwc/token-sharing-open-source/sign-in
- https://developers.openai.com/siwc/token-sharing-open-source/profiles-and-sessions
- https://developers.openai.com/siwc/token-sharing-open-source/models-and-inference
