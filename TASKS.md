# Insider One — Task tracking

Status: `[ ]` pending · `[-]` in progress · `[x]` completed.

| No  | Status | Task                                      | Owner           | Acceptance criteria                                                          |
| --- | ------ | ----------------------------------------- | --------------- | ---------------------------------------------------------------------------- |
| 1   | [x]    | Extract assessment requirements           | Coordination    | Required rules and bonus criteria identified                                 |
| 2   | [x]    | Define architecture and data model        | Architecture    | Module boundaries, state transitions and domain contract documented          |
| 3   | [x]    | Implement the pure race engine            | Architecture    | Reproducible randomness, valid schedules, consistent rankings and unit tests |
| 4   | [x]    | Set up Vue, TypeScript and Pinia          | Senior frontend | Application runs and type checking passes                                    |
| 5   | [x]    | Build roster, program and results views   | Senior frontend | Twenty horses, six rounds and incremental results displayed correctly        |
| 6   | [x]    | Connect animation and race controls       | Senior frontend | Rounds run sequentially and lifecycle resources are released                 |
| 7   | [x]    | Define acceptance and edge-case scenarios | QA              | Every required rule mapped to a verification scenario                        |
| 8   | [x]    | Run unit, E2E and visual validation       | QA              | Critical flows, mobile rendering and runtime health verified                 |
| 9   | [x]    | Complete integration and code review      | Coordination    | Findings resolved; build and relevant tests pass                             |
| 10  | [x]    | Complete README and delivery checks       | Coordination    | Setup, design decisions and test commands documented                         |

## Assessment acceptance criteria

- Vue components with Pinia or Vuex state management.
- Twenty horses with unique colors and condition scores from 1 to 100.
- Generate creates six rounds, each with ten distinct horses randomly selected from the roster.
- Round distances are 1200, 1400, 1600, 1800, 2000 and 2200 metres, in that order.
- Start runs rounds sequentially with visible horse movement.
- Results appear in order after each round finishes.
- Maintainable code and documented decisions, with bonus unit, E2E and visual tests.

## Delivery requirements

The assessment email requests a public GitHub repository shared by reply within three days.
The public repository is available at [devymahoni/insider-fe](https://github.com/devymahoni/insider-fe), with the local `main` branch tracking `origin/main`. Email delivery remains a separate step.

## Latest validation

- Unit: 17 tests passed.
- E2E: two complete user-flow scenarios passed.
- Visual: two scenarios passed against four Chromium/macOS reference screenshots.
- TypeScript, production build and Prettier checks passed.
- GitHub Actions runs Linux quality/E2E checks and macOS visual comparisons on pushes and pull requests. See the [workflow history](https://github.com/devymahoni/insider-fe/actions/workflows/ci.yml) for remote results.
