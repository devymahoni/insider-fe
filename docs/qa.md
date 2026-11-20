# QA acceptance plan

The flow under test is: load the racing desk → generate a schedule → start and complete six races → inspect each published result.

## Acceptance criteria

| ID    | Scenario                 | Expected result                                                                                          |
| ----- | ------------------------ | -------------------------------------------------------------------------------------------------------- |
| QA-01 | Initial horse roster     | Exactly 20 horses; distinct identifiers and colors; integer condition scores from 1 to 100.              |
| QA-02 | Generate a schedule      | Six rounds, ordered 1200, 1400, 1600, 1800, 2000 and 2200 metres.                                        |
| QA-03 | Entrants per round       | Exactly 10 distinct horses, all drawn from the current roster.                                           |
| QA-04 | Start                    | Only the active round advances; horses visibly progress.                                                 |
| QA-05 | Finish a round           | Publish a complete ordered result once, then advance to the next round.                                  |
| QA-06 | Complete the meeting     | Six result sets, with each entrant ranked exactly once; controls reach a stable completed state.         |
| QA-07 | Pause and resume         | Progress freezes while paused and continues without a jump or duplicate result.                          |
| QA-08 | Repeated controls        | Repeated Start cannot create concurrent races; regeneration safely resets state.                         |
| QA-09 | Responsive layout        | Desktop and mobile retain readable controls, roster, track and results without horizontal page overflow. |
| QA-10 | Accessibility and health | Named keyboard-operable controls; meaningful headings; no relevant console errors or framework overlays. |

## Validation strategy

- Pure domain unit tests cover seeded generation, invariant preservation, race progress and ranking.
- Store/integration checks cover legal transitions and repeated controls.
- Playwright exercises the complete user journey and captures desktop/mobile rendering.
- Visual regression checks compare stable states with animations disabled.

Browser path: the Browser plugin and its browser skill are not listed in this session. Use the repository Playwright workflow for repeatable browser validation.

## Verified scope

Final validation: 17 unit tests, 2 functional E2E scenarios and 2 visual scenarios (4 screenshot baselines) passed. Browser console warnings/errors and uncaught errors: none.

- Unit suites cover domain invariants, store transitions, repeated starts, paused-state protection, complete meetings, speed scaling, frame clamping and view cleanup.
- Chromium E2E covers six sequential finishes (10 standings per round), real runner movement, pause/resume, locked generation and regeneration after completion.
- Runtime checks collect console errors and uncaught page errors from before navigation.
- Desktop 1440 × 1000 and mobile 390 × 844 generated-schedule states were visually inspected for clipping and horizontal page overflow. Completed results were inspected separately.
- Four screenshot baselines cover desktop/mobile generated schedules, paused runners and completed results. They are deterministic (seeded randomness and controlled clock) and live in `tests/e2e/racing.spec.ts-snapshots`. They were produced with Playwright Chromium on macOS (`chromium-darwin`). Review and regenerate baselines intentionally when styling changes; Linux or other browser rendering needs its own approved baseline.

Run `npm run test:unit` for unit suites, `npm run test:e2e` for functional browser checks, `npm run test:visual` for screenshot regression tests, or `npm run test:all` for all three suites. Install the matching browser with `npx playwright install chromium` first. Transient screenshots/traces are written to `/tmp/insider-qa`.

Remaining scope: Firefox/Safari, assistive-technology testing and a full automated accessibility audit are not included. Native buttons, select fields, details and tables provide semantic keyboard behavior; the Generate action is also exercised through Enter in the browser suite.
