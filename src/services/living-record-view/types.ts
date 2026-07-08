/**
 * View models for the Living Record view (spec 003). These are derived, never persisted — see
 * data-model.md. This feature introduces no new repositories/entities (FR-014).
 */
import type { EntryCategory, HealthEventType } from '@/repositories/contracts/schemas';

export type RecordItemKind = 'entry' | 'health_event';

export interface RecordItem {
  id: string;
  kind: RecordItemKind;
  category: EntryCategory | HealthEventType;
  content: string;
  timestamp: string;
  source: string;
  /** Always 'active' — both owning repositories' list() already exclude corrected/removed items. */
  status: 'active';
}

export interface DailyHistoryPoint {
  date: string;
  score: number;
  band: 'low' | 'moderate' | 'good' | 'great';
  checkInId: string | null;
}

export interface LivingRecordFullExport {
  patientId: string;
  entries: unknown[];
  healthEvents: unknown[];
  dailyCheckins: unknown[];
  dailyScores: unknown[];
  exportedAt: string;
  format: 'json';
}

export interface RecordFilter {
  category?: string;
  from?: string; // YYYY-MM-DD
  to?: string; // YYYY-MM-DD
}
