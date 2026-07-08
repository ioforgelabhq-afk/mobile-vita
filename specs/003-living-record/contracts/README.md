# "Contracts" — Living Record View

This feature adds **no new repository contracts** (FR-014; research D1). There is nothing to
document under `repositories/contracts/` — instead, this documents the one new **service**
interface, which is pure/deterministic and calls only existing repository methods.

## LivingRecordViewService (`src/services/living-record-view/`)

```ts
interface LivingRecordViewService {
  /** Aggregates entries + health events into one unified, sorted list (FR-001/002). */
  loadItems(patientId: string): Promise<RecordItem[]>;

  /** Client-side filter over an already-loaded list (FR-011/012/013). */
  filterItems(items: RecordItem[], opts: { category?: string; from?: string; to?: string }): RecordItem[];

  /** Daily history, ascending by date; no trend framing below 2 points (FR-004/006). */
  loadDailyHistory(patientId: string): Promise<DailyHistoryPoint[]>;

  /** Correct/remove pass-through to the item's OWNING repository — never reimplemented (FR-007/008/009). */
  correctItem(item: RecordItem, patch: { content?: string; category?: string }, clientMutationId: string): Promise<RecordItem>;
  removeItem(item: RecordItem, clientMutationId: string): Promise<void>;

  /** Composes the full export from the 4 existing repositories (FR-010; research D5). */
  exportAll(patientId: string): Promise<LivingRecordFullExport>;
}
```

**Behavioral guarantees**

- `loadItems`/`loadDailyHistory` never write; purely derived from `LivingRecordRepository`,
  `HealthEventRepository`, `DailyCheckinRepository`, `DailyScoreRepository` `list()`/`export()`.
- `correctItem`/`removeItem` dispatch to the repository that owns `item.kind` — a `RecordItem` of
  kind `entry` routes to `LivingRecordRepository.correct/remove`; kind `health_event` routes to
  `HealthEventRepository.correct/remove`. No duplicate correction logic exists in this service.
- Works fully offline (reads/writes are local); no new sync-queue entries beyond what the
  underlying repositories already enqueue (Principle VIII, unchanged).
