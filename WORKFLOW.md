# Workflow

How work on this site moves from idea to live page, how it is backed up, and how it is logged.

## 1. Stages

| # | Stage | Output | Gate to next stage |
|---|-------|--------|--------------------|
| 1 | Setup | Repository, this workflow | Done |
| 2 | Mockups | Design directions in `mockups/` | Nils picks a direction |
| 3 | Design sign-off | Chosen direction, final copy, photo, tutoring details | Nils approves |
| 4 | Build | Working site in `site/` | Passes the review checklist |
| 5 | Launch | Site live on GitHub Pages | Nils approves the preview |
| 6 | Upkeep | Content updates as needed | Each change logged |

Nothing is built before stage 3 is approved, and nothing goes live before stage 5 is approved.

## 2. Repository layout

```
README.md      What this project is
WORKFLOW.md    This file
LOG.md         Dated work log (newest first)
mockups/       Design directions and notes
site/          The website itself (added at the build stage)
docs/          Content sources: bio, project write-ups, tutoring details
```

## 3. Backups

- GitHub is the backup. Every piece of finished work is committed and pushed in the same session it was made.
- `main` always holds the last approved state. The live site is published from `main`.
- New work happens on a short branch (`design/...`, `build/...`, `content/...`) and is merged into `main` only after approval.
- Milestones are tagged so any earlier state can be restored: `v0.1-mockups`, `v0.2-design-approved`, `v1.0-launch`, then `v1.1`, `v1.2` and so on.
- To roll back: check out the tag or revert the commit. Nothing is ever force-pushed over `main`.

## 4. Logging

Two layers, so there is always a record of what changed and why.

1. **Commit messages** record what changed. Format: `area: short summary`, where area is one of `setup`, `design`, `build`, `content`, `fix`, `docs`.
2. **`LOG.md`** records why. One entry per work session, newest first:

```
## YYYY-MM-DD - short title
- Done: what was completed
- Decided: choices made and who made them
- Open: questions waiting on Nils
- Next: the next step
```

`LOG.md` is updated in the same commit as the work it describes.

## 5. Review checklist (before anything merges to `main`)

- Every fact on the page matches a source Nils provided or confirmed.
- No student names, photos, work samples or identifying details.
- School names follow the naming decision recorded in `LOG.md`.
- Pages checked at phone and desktop widths, in light and dark themes.
- Intake form tested end to end with a test submission.
- Links work; no placeholder text remains.

## 6. Privacy rules

- No passwords, keys or private contact details are committed. The repository is public.
- Intake form submissions go to Nils's inbox through the form service and are never stored in this repository.
