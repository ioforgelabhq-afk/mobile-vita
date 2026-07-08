/**
 * Living Record View — pure aggregation over existing repositories (spec 003; research D1–D5).
 *
 * Introduces NO new repositories or persisted entities (FR-014). Every method here either reads
 * via existing repositories' `list()`/`export()`, or dispatches `correct`/`remove` to whichever
 * repository actually owns the item — never reimplementing that logic. This keeps corrections
 * consistent everywhere else that reads the same data "for free" (FR-009), since there is exactly
 * one source of truth per item.
 */
import {
  livingRecordRepository,
  healthEventRepository,
  dailyCheckinRepository,
  dailyScoreRepository,
} from '@/repositories';
import type { EntryCategory } from '@/repositories/contracts/schemas';
import type { RecordItem, DailyHistoryPoint, LivingRecordFullExport, RecordFilter } from './types';

export interface RecordItemPatch {
  content?: string;
  category?: EntryCategory; // only meaningful when item.kind === 'entry'
}

/** Unified, sorted (newest first) view of entries + health events (FR-001/002). */
export async function loadItems(patientId: string): Promise<RecordItem[]> {
  const [entries, events] = await Promise.all([
    livingRecordRepository().list(patientId),
    healthEventRepository().list(patientId),
  ]);

  const entryItems: RecordItem[] = entries.map((e) => ({
    id: e.id,
    kind: 'entry',
    category: e.category,
    content: e.content,
    timestamp: e.createdAt,
    source: e.source,
    status: 'active',
  }));

  const eventItems: RecordItem[] = events.map((e) => ({
    id: e.id,
    kind: 'health_event',
    category: e.type,
    content: e.title,
    timestamp: e.occurredAt,
    source: e.source,
    status: 'active',
  }));

  return [...entryItems, ...eventItems].sort((a, b) => b.timestamp.localeCompare(a.timestamp));
}

/** Client-side filter over an already-loaded list (FR-011/012/013). Pure, no I/O. */
export function filterItems(items: RecordItem[], filter: RecordFilter): RecordItem[] {
  return items.filter((item) => {
    if (filter.category && item.category !== filter.category) return false;
    const day = item.timestamp.slice(0, 10); // YYYY-MM-DD
    if (filter.from && day < filter.from) return false;
    if (filter.to && day > filter.to) return false;
    return true;
  });
}

/** Daily history, ascending by date; callers must not render trend UI below 2 points (FR-004/006). */
export async function loadDailyHistory(patientId: string): Promise<DailyHistoryPoint[]> {
  const scores = await dailyScoreRepository().list(patientId);
  return scores
    .map((s) => ({ date: s.date, score: s.score, band: s.band, checkInId: s.checkInId }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

/** Correct/remove pass-through to the item's OWNING repository (FR-007/008/009). */
export async function correctItem(
  item: RecordItem,
  patch: RecordItemPatch,
  clientMutationId: string,
): Promise<RecordItem> {
  if (item.kind === 'entry') {
    const updated = await livingRecordRepository().correct(
      item.id,
      { content: patch.content, category: patch.category },
      clientMutationId,
    );
    return { ...item, id: updated.id, content: updated.content, category: updated.category, timestamp: updated.createdAt };
  }
  const updated = await healthEventRepository().correct(
    item.id,
    { title: patch.content },
    clientMutationId,
  );
  return { ...item, content: updated.title, timestamp: updated.occurredAt };
}

export async function removeItem(item: RecordItem, clientMutationId: string): Promise<void> {
  if (item.kind === 'entry') {
    await livingRecordRepository().remove(item.id, clientMutationId);
    return;
  }
  await healthEventRepository().remove(item.id, clientMutationId);
}

/** Composes the full export from the 4 existing repositories (FR-010; research D5). */
export async function exportAll(patientId: string): Promise<LivingRecordFullExport> {
  const [entryExport, healthEvents, dailyCheckins, dailyScores] = await Promise.all([
    livingRecordRepository().export(patientId),
    healthEventRepository().list(patientId),
    dailyCheckinRepository().list(patientId),
    dailyScoreRepository().list(patientId),
  ]);
  return {
    patientId,
    entries: entryExport.entries,
    healthEvents,
    dailyCheckins,
    dailyScores,
    exportedAt: new Date().toISOString(),
    format: 'json',
  };
}
