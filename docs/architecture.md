# Architecture

This is a client-side race simulation with three layers. Vue components render and collect intent. A Pinia store owns the meeting lifecycle. A framework-independent domain module creates the roster, draws the schedule, and calculates race outcomes.

## Domain boundary

`src/domain/race.ts` exports plain TypeScript values and pure functions. It has no Vue, DOM, timer, or storage dependencies. Randomness is an explicit injectable input; `createSeededRandom` makes any draw or race reproducible in tests. Fisher–Yates shuffling samples ten distinct horses independently for each round without mutating the roster.

The domain generates all twenty horses. The brief's initial “1 to 20” phrase conflicts with its explicit requirement for twenty available horses and ten runners per round; the implementation follows the explicit rules. Conditions are integers from 1 to 100 and all horse colors are distinct. Round distances remain in the specified order.

`simulateRound` computes one immutable result before animation begins. Each horse receives a speed from its condition plus bounded random form. Results sort by ascending physical finish time, with horse ID as a deterministic tie-breaker. The rendered position uses `progressAt(elapsedMs, timeMs)` against those same finish times, so visual winners and published results cannot diverge. Simulation time is physical milliseconds; presentation can accelerate its clock without changing the outcome.

## Application state

The store owns one roster, one schedule, the current round, elapsed simulation time, completed results, and the meeting status. Components must call store actions rather than mutate race data directly. Derived values such as current runners and progress stay computed rather than duplicated in state.

The lifecycle is `idle → ready → running ⇄ paused`, followed by `completed` when round six ends. `generate()` moves `idle`, `ready`, or `completed` to `ready`, resetting results and elapsed time while preserving the roster. `start()` only starts a prepared schedule or resumes a paused meeting. A round completes only after its slowest horse crosses the line; its result is appended once, then the next round starts. Completed meetings cannot advance past round six. Regeneration during running or paused meetings is disabled so one user's intent cannot invalidate an in-flight clock.

Animation uses elapsed time rather than frame counts. This keeps behavior independent of display refresh rate and enables controlled time advancement in integration tests. The store's `tick()` applies a tenfold simulation rate and the selected playback multiplier. It carries unused elapsed time across round boundaries, so a delayed frame does not lose race time or skip results. Only `useRaceClock` touches the browser animation clock. Its continuously refreshed timestamp avoids accumulating paused time, and visibility changes clear that timestamp and pause an active meeting. Frame deltas are capped at 100ms to avoid a catch-up jump after browser stalls. Component teardown cancels its animation frame, removes its visibility listener, and pauses an active meeting. Reduced-motion preferences should simplify presentation without altering race rules.

## Verification

Domain tests verify roster invariants, all six race distances, unique valid draws across many seeds, determinism, input immutability, bounded progress, condition advantage, and invalid inputs. Store tests should verify illegal transitions, pause/resume, sequential rounds, exactly-once result publication, and reset behavior. Browser tests should exercise a complete meeting and keyboard-operable controls. Visual checks should cover desktop, narrow screens, and reduced motion.

No backend, routing library, persistence layer, generic event bus, or extra state framework is needed for this bounded feature. These would add coordination cost without satisfying another requirement. A future server-authoritative game can replace the domain-call boundary while preserving component responsibilities.
