# Actionable Checklist: Menu, Loading, Daily Challenge, Settings

This checklist breaks the implementation plan into granular, actionable tasks. Check items as you complete them.

## 1 — Storage & Data Artifacts
- [ ] Create `public/data/daily-challenges.json` with sample entry and schema.
- [ ] Define and document localStorage keys: `blocklogic.save:v1`, `blocklogic.saveMeta:v1`, `blocklogic.dailyAttempts:{yyyy-mm-dd}`.
- [ ] Add README notes describing challenge JSON schema and localStorage formats.

## 2 — Loading Screen & Preloader
- [ ] Add `components/Loading.vue` (or HTML overlay) showing logo + progress bar.
- [ ] Add CSS for loading overlay and responsive layout.
- [ ] Hook loading display to app bootstrap in `app.vue` / `pages/index.vue`.
- [ ] Implement asset/script load progress events; update progress bar until game ready.
- [ ] Hide loading overlay and reveal Menu/Game when initialization completes.

## 3 — Main Menu UI
- [ ] Add `components/Menu.vue` overlay with options: Continue, New Game, Daily Challenge, Leaderboard, Settings.
- [ ] Add menu styling and keyboard/esc dismiss behavior.
- [ ] Add `Continue` button state (enabled when `blocklogic.save` exists and valid).
- [ ] Move existing leaderboard out of page into Menu; add `Leaderboard` view inside menu.
- [ ] Wire menu navigation routes / overlay toggles.

## 4 — Autosave / Continue Flow
- [ ] Add `ScoreBackupManager.saveGame(state)` and `loadGame()` functions in `public/js/ScoreBackupManager.js`.
- [ ] On each successful `placePiece()` call, call `saveGame()` with minimal state `{version, grid, hand, nextQueue, score, streak, seed, ts}`.
- [ ] Implement `Game.resumeFromState(state)` to validate and restore state.
- [ ] Add save versioning and expiration policy (e.g., expiryDays = 14).
- [ ] Add UI confirmation when loading a corrupted or incompatible save.

## 5 — Daily Challenge
- [ ] Create `public/data/daily-challenges.json` sample and schema.
- [ ] Add `Menu -> Daily Challenge` view showing today’s challenge and remaining attempts.
- [ ] Implement daily attempt tracking in localStorage `blocklogic.dailyAttempts:{date}`.
- [ ] Implement `Game.startDailyChallenge(challenge)` to seed grid and set `targetScore`.
- [ ] Add CTA in Daily Challenge results to view the challenge leaderboard (client-side or server-filtered).
- [ ] Add server-side optional extension plan to support `GET /api/leaderboard?challengeId=...`.

## 6 — Next-3 Guarantee & Difficulty Modes
- [ ] Refactor piece generation into `PieceGenerator` inside `public/js/Pieces.js` (or a new file).
- [ ] Implement function `generateHand(requiredPlaceableCount)` that attempts bounded permutations to satisfy constraints.
- [ ] After the 3rd placement, call `generateHand()` with required count based on difficulty.
- [ ] Add `difficulty` option persisted to localStorage and read by `PieceGenerator`.
- [ ] Add fallback logic: after X attempts, accept random hand.
- [ ] Add unit/integration test scenarios for Easy/Normal/Hard guarantee behavior.

## 7 — Settings: Theme, Backgrounds, Difficulty
- [ ] Create `components/Settings.vue` with controls for theme (dark/light), background preset, difficulty.
- [ ] Provide 5–6 curated gradient backgrounds and dark/light variants; include CSS variables mapping.
- [ ] Persist settings to localStorage (`blocklogic.settings:v1`) and apply on app load.
- [ ] Move existing theme toggle from the header into Settings view.
- [ ] Ensure `Renderer` reads background choice and updates canvas/body styling.

## 8 — UI: Burger Menu & Remove Restart Button
- [ ] Add burger menu button to top-right of main game area in `pages/index.vue` (or header component).
- [ ] Wire burger to open `Menu.vue` overlay.
- [ ] Remove `#restart-btn` from main game UI markup and styles.
- [ ] Add `Restart Game` action inside Menu and inside Game Over modal.

## 9 — Tests & Verification
- [ ] Add Playwright tests for loading screen visibility and progress completion.
- [ ] Add Playwright test to verify autosave after piece placement and `Continue` resume.
- [ ] Add Playwright test for Daily Challenge flow (start, attempt decrement, show leaderboard button).
- [ ] Add tests for Next-3 guarantee under Easy/Normal/Hard using controlled grids.
- [ ] Add tests to verify settings persistence and background application.

## 10 — Documentation & Cleanup
- [ ] Update `README.md` with new features, localStorage keys, and daily challenge JSON schema.
- [ ] Add changelog entry describing UI and behavior changes.
- [ ] Remove unused `#restart-btn` CSS and markup references.
- [ ] Review and tidy any global styles affected by background presets.

## Optional / Later Work
- [ ] Implement server-backed challenge leaderboards and admin interface.
- [ ] Add automatic daily rotation and admin tooling for challenge creation.
- [ ] Add analytics hooks for tracking challenge engagement and failures.

---

File created from plan: `plan-menuLoadingDailyChallenge` — use this checklist to break work into PR-sized commits.