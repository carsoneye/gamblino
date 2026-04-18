---
name: next-phase
description: Advance the build state to the next phase — verify the current PR merged, move the row in PHASE.md from Current → Done, switch to a fresh phase branch, and kick off the new phase with /feature-dev.
---

# /next-phase

Invoked between phases. Does NOT run during a phase.

## Steps

1. **Read state.** Open `PHASE.md` and read the Current block. Call the completed phase `N` and the next one `N+1`.

2. **Verify merge.** Run `gh pr list --state merged --head phase/NN-slug --limit 1 --json number,title,mergedAt`. If no merged PR matches the current phase's branch, STOP and tell the user — do not advance state on an unmerged phase.

3. **Sync main.** `git checkout main && git pull --ff-only origin main`.

4. **Update PHASE.md.**
   - Move the Current row into the Done table with today's date + verification summary.
   - Pull the next row out of Upcoming and write it into Current with `Status: not started` and the correct `phase/NN-slug` branch name.
   - Leave Upcoming minus the promoted row.

5. **Commit state bump.** `git add PHASE.md && git commit -m "chore: advance to phase NN — <slug>"` on `main`. Push.

6. **Create phase branch.** `git checkout -b phase/NN-slug`. Push with `-u`.

7. **Kick off.** Print the kickoff command from the new Current block (`/feature-dev phase N — …`) and stop. The user runs it in a fresh session.

## Rules

- Never advance past an unmerged PR. The append-only Done table is the audit record.
- One commit per advance, on `main`, message `chore: advance to phase NN — <slug>`.
- If verification for the completed phase was not recorded in the PR body, ask the user for the command output before writing to Done.
- Do not modify the Upcoming list's ordering or dependencies — those live in the plan file.
