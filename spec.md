# JEE Prep Tracker — Multi-Change Update

## Current State
- Timer page has a single "Total Target Hours" input for the entire JEE prep (~3000h) and overall progress bar
- Subject titles (Physics, Chemistry, Maths) in Syllabus have `textShadow` glow via `SUBJECT_TITLE_GLOW` object — user found this too strong
- K3B section border glow is very subtle (boxShadow: rgba(251,191,36,0.08)) — user wants it visible/glowing again
- Dashboard quote card glow is subtle (boxShadow: rgba(251,191,36,0.2)) — user wants it glowing again
- `ChapterData` type has: done, notesDone, moduleDone, ncertDone, revisions — no `questionsSolved` field
- `buildInitialChapterData()` in syllabusData.ts builds chapters without `questionsSolved`
- `ChapterRow` component has no Questions Solved input

## Requested Changes (Diff)

### Add
- `questionsSolved: number` field to `ChapterData` type (types/index.ts)
- `questionsSolved: 0` to `buildInitialChapterData()` in syllabusData.ts
- "Q Solved" number input in `ChapterRow` component — only visible for JEE modes (`jee` and `jeeChemistry`), NOT for `school` mode
- Migration in Syllabus.tsx useEffect: also migrate `questionsSolved` to `0` for any JEE chapters that don't have the field (class11 and class12 keys only)
- Timer page: weekly target input (`jee_weekly_target`, default 40h/week)
- Timer page: This Week card — Mon–Sun progress bar + 7-column day bars vs weekly target
- Timer page: This Month card — calendar month total, breakdown by weeks (expandable to show daily entries)
- Timer page: This Year card — year total, all 12 months as horizontal bars

### Modify
- `SUBJECT_TITLE_GLOW` in Syllabus.tsx: set all three entries to `{}` (empty object) so no textShadow glow on Physics/Chemistry/Maths titles
- K3B section outer div boxShadow: strengthen from `rgba(251,191,36,0.08)` to `rgba(251,191,36,0.35)` so it glows visibly gold
- Dashboard quote card boxShadow: strengthen from `rgba(251,191,36,0.2)` to `rgba(251,191,36,0.45)` with a pulsing/ambient feel
- Timer page: replace `jee_overall_target` with `jee_weekly_target` (keep `jee_daily_log` as-is)
- Timer page subtitle: "Track daily hours → weekly target → monthly → yearly"
- Dashboard Study Journey card: read `jee_weekly_target` for the weekly display (instead of overall target)

### Remove
- Timer page: "Total Target Hours" for full JEE prep
- Timer page: "JEE Prep Journey" overall progress bar card
- Timer page: "At your current pace..." days-to-finish estimate
- Subject title glow textShadow CSS (keep border/color theming, just remove the glow)

## Implementation Plan

### File 1: src/frontend/src/types/index.ts
- Add `questionsSolved: number` to `ChapterData` interface

### File 2: src/frontend/src/data/syllabusData.ts
- In `buildInitialChapterData()`, add `questionsSolved: 0` to each chapter's initial data object

### File 3: src/frontend/src/pages/Syllabus.tsx
- Set `SUBJECT_TITLE_GLOW` to `{ Physics: {}, Chemistry: {}, Maths: {} }` — removes textShadow
- Strengthen K3B outer wrapper boxShadow to `0 0 40px rgba(251,191,36,0.35), 0 4px 24px rgba(0,0,0,0.4)`
- In `ChapterRow`: add a `questionsSolved` number input (label "Q:", min 0, max 9999) alongside the `revisions` input — only shown when `mode !== 'school'`
- In `ChapterRow`'s `safeData`, default `questionsSolved: data.questionsSolved ?? 0`
- In `DEFAULT_CHAPTER_DATA`, add `questionsSolved: 0`
- In migration useEffect: also migrate `questionsSolved: 0` for missing fields in class11/class12 chapters

### File 4: src/frontend/src/pages/Dashboard.tsx
- Strengthen quote card boxShadow to `0 0 24px rgba(251,191,36,0.45), 0 0 8px rgba(251,191,36,0.3), 0 2px 8px rgba(0,0,0,0.5)`
- Study Journey card: change from reading `jee_overall_target` to reading `jee_weekly_target` (default 40); show "This week: X/Yh" instead of overall progress

### File 5: src/frontend/src/pages/Timer.tsx
- Full rewrite with:
  - Utility functions: `getWeekStart(dateStr)`, `getWeekDays(weekStartStr)`, `getWeekLabel(weekStartStr)`, `getWeeksInMonth(year, month)`, `sumHours(dates, log)`
  - `jee_weekly_target` localStorage (default 40, replaces `jee_overall_target`)
  - Row 1: Live Timer (left) + Log Today + Weekly Target input (right)
  - Row 2: This Week full-width — 7-day column bar chart + progress bar vs weekly target
  - Row 3: This Month (left) + This Year (right)
  - Row 4: Full Daily Log (all-time, scrollable with delete)
  - Week = Mon–Sun; month = calendar month; year = calendar year
  - Expandable week rows in Monthly card to show daily breakdown
  - Color scheme: week=emerald, month=purple, year=amber
