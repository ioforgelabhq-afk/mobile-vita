# Feature: Living Record View

A single, persistent view of everything VITA has learned about the patient — Living Record
entries, health events, and daily score history — with correction, removal, filtering, and
export. Serves **Pillar 3 (better Living Record)**. Resolves the daily-checkin feature's deferred
"V1" gap (no place to browse history beyond today's result).

## Status

All four user stories implemented. **27/27 tasks complete** · **77 tests across 18 suites** · iOS
Metro bundle verified.

## What makes this feature different

**Zero new repositories, zero new entities** (FR-014) — verified by an empty `git status` on
`src/repositories/` after implementation. This is a pure read/aggregate feature: one new service
(`src/services/living-record-view/`) merges results from the four existing repositories
(`LivingRecordRepository`, `HealthEventRepository`, `DailyCheckinRepository`,
`DailyScoreRepository`) and routes corrections/removals back to whichever repository actually
owns the item.

## Spec Kit artifacts

| Doc | What |
|-----|------|
| [spec.md](./spec.md) | Requirements, user stories, success criteria |
| [plan.md](./plan.md) | Technical plan + Constitution Check |
| [research.md](./research.md) | Decisions (aggregation-only design, unified item shape, export composition) |
| [data-model.md](./data-model.md) | View models only — `RecordItem`, `DailyHistoryPoint`, export shape |
| [contracts/README.md](./contracts/README.md) | The one new service interface (no repository contracts) |
| [quickstart.md](./quickstart.md) | Run + validation scenarios |
| [tasks.md](./tasks.md) | Dependency-ordered task list |
| [checklists/requirements.md](./checklists/requirements.md) | Spec quality checklist |
| [checklists/privacy-review.md](./checklists/privacy-review.md) | Privacy & safety review addendum |

## Architecture

Key code:
- Screen: [`app/(record)/index.tsx`](../../app/(record)/index.tsx)
- Service: [`src/services/living-record-view/`](../../src/services/living-record-view) — `loadItems`, `loadDailyHistory`, `filterItems`, `correctItem`, `removeItem`, `exportAll`
- Components: [`src/features/living-record/components/`](../../src/features/living-record/components) — `RecordItemCard`, `DailyHistoryRow`, `CategoryFilter`, `DateRangeFilter`, `EmptyState`
- Hook: `src/features/living-record/hooks/useLivingRecordView.ts`

Entry point: a "Ver mi Registro Vivo" button on the daily check-in result screen.

## Known gap

`exportAll()` composes the full export payload (entries + health events + check-ins + scores) and
is fully tested, but the UI currently shows an **in-app summary** rather than writing/sharing a
file — that needs `expo-file-system`/`expo-sharing`, intentionally not added here (plan scoped "no
new dependencies"). A natural follow-up task.

## Run & test

```bash
npm install
npx expo start          # after a daily check-in, tap "Ver mi Registro Vivo"
npm test                # 77 logic tests
npm run lint
```
