# Race Day

[![Validate](https://github.com/devymahoni/insider-fe/actions/workflows/ci.yml/badge.svg)](https://github.com/devymahoni/insider-fe/actions/workflows/ci.yml)

A six-round horse racing simulation built for the Insider One frontend assessment with Vue 3, TypeScript, Pinia and Vite.

## Run locally

Use Node.js 22.12+ and npm.

```sh
npm ci
npm run dev
```

Open the local URL printed by Vite. Generate a schedule, choose a playback speed, then start the meeting. Pause and resume preserve progress. Each result appears only after every runner in that round finishes.

## Assessment rules

- Twenty horses with distinct colors and condition scores from 1 to 100.
- Six rounds at 1200, 1400, 1600, 1800, 2000 and 2200 metres.
- Ten horses sampled without replacement for each round; horses may participate in multiple rounds.
- Sequential animated rounds with ordered results published after each round.

The brief mentions a list of “1 to 20” horses and later explicitly requires twenty available horses. This implementation follows the explicit twenty-horse rule.

## Design decisions

The domain module owns horse generation, Fisher–Yates sampling, condition-weighted finish times and progress calculation. Randomness is injectable, so tests can reproduce a meeting. Animation and published standings use the same finish times.

Pinia owns the meeting lifecycle; Vue components display state and dispatch actions. A view-owned animation clock advances simulation time and cleans up on unmount. Playback is accelerated by a base factor of ten; the speed control multiplies that factor. Hidden browser tabs pause the meeting, and long frame stalls are capped to prevent a sudden catch-up.

Generate is disabled while running or paused to protect the active meeting. After completion, generate another schedule to start again. The roster remains available throughout the session. State is in memory and resets on page reload.

See [architecture](docs/architecture.md), [QA acceptance criteria](docs/qa.md), and [task tracking](TASKS.md) for responsibilities and validation scope.

## Checks

```sh
npm run test:unit
npm run build
npm run format:check
npx playwright install chromium
npm run test:e2e
npm run test:visual
```

Unit tests cover domain invariants and store transitions. Browser tests exercise the six-round journey, pause/resume, regeneration and responsive rendering. Playwright starts a local Vite server on `127.0.0.1:5173`; transient screenshots and failure artifacts go to `/tmp/insider-qa`.

Run all three suites with `npm run test:all`. Browser tests use a controlled clock instead of fixed sleeps, and a seeded random source makes the displayed meeting reproducible.

GitHub Actions runs formatting, unit tests, the production build and functional Chromium tests on Linux, plus visual comparisons in a separate macOS job. Visual baselines are platform-specific; run the visual tests on macOS to match the committed Chromium baselines. Review intentional visual changes before updating snapshots with `npm run test:visual -- --update-snapshots`.

## Project layout

```text
src/domain/       Pure race rules and their unit tests
src/stores/       Pinia lifecycle and integration tests
src/composables/  Browser animation clock
src/components/   Roster, racetrack, program and results UI
tests/e2e/       Browser acceptance tests
docs/            Architecture and QA criteria
```

No backend or external API is required.
