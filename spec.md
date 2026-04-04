# AIR PREP — Daily Tracker Rev1 & Rev2

## Current State
The Daily Tracker shows a list of dates (grouped by month). Each day has two toggles: Module and DPP. Data is stored in `jee_daily_log` local storage key as `{ moduleDone, dppDone }`.

## Requested Changes (Diff)

### Add
- **REV1 toggle** per day — "Revision 1" = quick revision of the latest lecture topic (done right after the lecture)
- **REV2 toggle** per day — "Revision 2" = revision of all past topics (done before the upcoming lecture)
- Both toggles stored in `DayLog` as `rev1Done` and `rev2Done`
- Summary stats: REV1 count and REV2 count added to the summary bar
- "All Done" badge logic updated to require all 4 (Module + DPP + Rev1 + Rev2)
- Tooltip/label hints in the UI explaining the difference between Rev1 and Rev2

### Modify
- `DayLog` interface: add `rev1Done: boolean` and `rev2Done: boolean`
- `DayRow` component: add two new toggle buttons after DPP, styled consistently
- Summary card: expand grid from 4 to 6 stats (add Rev1 Done %, Rev2 Done %)
- Month section header summary: add rev1/rev2 counts

### Remove
- Nothing removed

## Implementation Plan
1. Extend `DayLog` interface with `rev1Done` and `rev2Done`
2. Update `DayRow` to render REV1 and REV2 toggle buttons (styled in amber/orange for Rev1, purple for Rev2)
3. Update `toggleDay` handler to accept new fields
4. Update summary stats in summary bar and month section header
5. Update "all done" badge condition
