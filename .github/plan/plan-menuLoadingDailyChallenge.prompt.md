## Plan: Menu, Loading, Daily Challenge, Settings

TL;DR - Add a loading screen, a main menu (Continue / New Game / Daily Challenge / Leaderboard / Settings), persistent state autosave, daily-challenge data and UI, guarantee placement constraints for next-piece batches depending on difficulty, move theme/background and difficulty to Settings, add burger menu, and remove the on-screen Restart button. Implement UI changes in Nuxt pages and static JS/game modules; add a public JSON for daily challenges and localStorage backing for game state.

**Steps**
1. Design storage & data artifacts (*depends on step 2 for paths*)
   - Add `public/data/daily-challenges.json` (schema below).
   - Decide and standardize localStorage keys: `blocklogic.save`, `blocklogic.saveMeta`, `blocklogic.dailyAttempts:{yyyy-mm-dd}`.
2. Add loading screen and asset preloader (*parallel with step 3*)
   - Create a `Loading` component/HTML overlay that shows the logo and a progress bar.
   - Hook into static script loading and game initialization to update progress and hide when ready.
3. Build main Menu UI and navigation flow (*depends on step 2*)
   - Create a `Menu` component / route shown at app start or via burger menu.
   - Menu options: Continue (enabled if autosave exists), New Game, Daily Challenge, Leaderboard, Settings.
   - Replace in-page leaderboard with a Menu-based leaderboard; keep `GET /api/leaderboard` as canonical source.
4. Implement autosave / continue flow (*depends on step 1*)
   - On every successful `placePiece()` call, call `ScoreBackupManager.saveGame(state)` to persist to `localStorage`.
   - Save minimal serializable state: grid array, current hand, next queue, score, streak, random seed (if used), timestamp.
   - `Continue` loads this state into the `Game` instance; validate integrity before resuming.
   - Add save expiration / versioning to avoid invalid restores.
5. Daily Challenge feature
   - Add `public/data/daily-challenges.json` with entries: { id, date, presetGrid (sparse list), targetScore, maxAttempts (3) }.
   - Menu shows today’s challenge entry with remaining attempts; hitting it starts a game seeded from `presetGrid` and `targetScore`.
   - Track attempts in localStorage with `blocklogic.dailyAttempts:{date}` and decrement on game over only when player finishes a try.
   - Add button inside Daily Challenge results area to show leaderboard for that day (query `GET /api/leaderboard?challengeId=...` — if server-side support not added, show local leaderboard or global leaderboard filtered by recent timestamps).
6. Next-3 placement guarantee logic & Difficulty modes
   - Move Piece generation into `PieceGenerator` / `Pieces.js` logic.
   - After player places the 3rd piece (when revealing new hand), ensure at least N pieces in the new hand are placeable, where N depends on difficulty:
     - Normal: ensure at least 1 placeable piece.
     - Easy: ensure at least 2 placeable pieces.
     - Hard: no guarantee (fully random).
   - Implementation approach: when generating the new hand, attempt (bounded tries) to find a permutation of candidate pieces where required count is placeable (use `Grid.canPlacePiece` checks). If attempts fail, fall back to current behavior.
7. Settings: theme, background gradients, difficulty
   - Move theme toggle into `Settings` component.
   - Add background presets (5–6 gradients) and dark/light variants; store choice in `localStorage` and apply via `Renderer` or body CSS variables.
   - Add Difficulty selector with options: Easy / Normal / Hard. Persist in `localStorage` and influence PieceGenerator rules.
8. UI changes: burger menu & main screen polish
   - Add a burger menu button top-right on the main game screen that opens the `Menu` overlay.
   - Remove the `#restart-btn` from the main game screen; move restart control into Menu and Game Over modal.
9. Tests & verification
   - Add Playwright E2E tests to cover: loading screen show/hide, continue resume, autosave after piece placement, daily challenge load + attempt count, next-3 guarantee on Normal/Easy/Hard, settings persistence.
10. Documentation & migration notes
   - Update README and dev notes with localStorage keys, daily-challenges schema and how to add entries, and steps to enable DB-backed challenge leaderboards (if desired).

**Relevant files**
- `pages/index.vue` — show/hide `Loading` and `Menu` overlays; add burger button.
- `app.vue` — global wrappers and mounting of menu/loading overlays.
- `public/data/daily-challenges.json` — new artifact to store challenges.
- `public/js/Game.js` — load/save state, expose resume API, start seeded daily challenge.
- `public/js/Grid.js` — `canPlacePiece()` used by guarantee logic.
- `public/js/Pieces.js` — piece definitions; integrate with `PieceGenerator` helper.
- `public/js/ScoreBackupManager.js` — extend with `saveGame()` / `loadGame()` and daily attempts helpers.
- `public/js/Renderer.js` — apply background presets and animate loading bar.
- `public/js/InputHandler.js` — ensure interactions still work with menu overlays.
- `pages/index.vue` — move leaderboard UI into menu; keep API calls intact.
- `server/api/leaderboard` — (optional) extend to accept `challengeId` if storing challenge-specific leaderboard server-side.

**Verification**
1. Manual: Start app, verify loading screen progress and that Menu appears; verify Continue resumes a saved game; verify New Game resets state.
2. Autosave: Place a piece, reload page, choose Continue → game resumes with same grid/score.
3. Daily Challenge: Add a sample entry to `public/data/daily-challenges.json`, start challenge, lose/win and confirm attempt counts and leaderboard button behavior.
4. Next-3 guarantee: Create grids where only limited placements exist and validate generation respects Easy/Normal/Hard constraints.
5. Settings persistence: Change background & difficulty, reload page, verify selected options persist and affect gameplay.
6. Playwright: Add tests to `tests/e2e.spec.js` for critical flows above.

**Decisions & Assumptions**
- Use client-side JSON (`public/data/daily-challenges.json`) for challenge definitions to avoid backend changes initially. Optionally later add an API and admin flow for challenge rotations.
- LocalStorage is acceptable for saves and attempt counters; include version field to handle breaking changes.
- Guarantee algorithm will use bounded random attempts to avoid expensive search; worst-case fallback is to use fully-random hand.
- Leaderboard per-challenge is optional and will require server changes; plan assumes global leaderboard remains unchanged.

**Further Considerations / Questions**
1. Persisted save format: include a `version` integer to allow future migrations. Recommend version=1.
2. Do you want server-backed daily challenge leaderboards now, or is a local/client-only attempt/leaderboard acceptable as v1? (Recommend client-first, server later.)
3. Visual design: provide the logo and gradient assets or should I pick accessible default gradients? (Recommend 6 curated gradients with light/dark variants.)
