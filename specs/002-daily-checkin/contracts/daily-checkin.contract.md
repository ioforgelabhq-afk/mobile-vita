# Contract: DailyCheckinRepository

Owns the one-per-day check-in lifecycle (FR-004/005). Health-bearing fields are consent-gated.

```ts
interface DailyCheckinRepository {
  /** The check-in for a local date, or null (used to enforce one-per-day / show today's result). */
  forDate(patientId: string, date: string /* YYYY-MM-DD */): Promise<DailyCheckin | null>;

  /** Returns today's in-progress check-in (resume) or creates one. Never a 2nd completed record/day. */
  startOrResume(patientId: string, date: string): Promise<DailyCheckin>;

  /** Merge captured signals (mood/energy/sleep/symptoms/notes) into today's check-in. */
  update(checkInId: string, patch: CheckinPatch, clientMutationId: string): Promise<DailyCheckin>;

  /** Mark complete and link the produced DailyScore. Idempotent per clientMutationId. */
  complete(checkInId: string, dailyScoreId: string, clientMutationId: string): Promise<DailyCheckin>;

  list(patientId: string): Promise<DailyCheckin[]>;
}

// CheckinPatch: { mood?; energy?; sleepHours?; symptoms?: string[]; notes?: string }
```

**Behavioral guarantees**

- `forDate`/`startOrResume` enforce uniqueness on `(patientId, date)` — one completed check-in per
  local day (FR-004); a partial check-in resumes same-day without duplication (FR-005, FR-023).
- Persisting symptoms/notes requires `store_health_data` consent (FR-018); without it, `update`
  skips persisting health fields (the flow still shows a score).
- All mutations enqueue on the shared SyncQueue with `clientMutationId` (replay-safe).
