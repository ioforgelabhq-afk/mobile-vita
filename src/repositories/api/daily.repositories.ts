/**
 * API stubs for the daily-guidance repositories — conform to docs/api/openapi.yaml
 * (/daily-checkins, /daily-scores, /health-events, /insights). Inert until the backend exists;
 * screens don't change when these replace the mocks (Principle IX).
 */
import type {
  DailyCheckinRepository,
  CheckinPatch,
} from '@/repositories/contracts/daily-checkin.repository';
import type {
  DailyScoreRepository,
  SaveScoreInput,
} from '@/repositories/contracts/daily-score.repository';
import type {
  HealthEventRepository,
  AddHealthEventInput,
  HealthEventPatch,
} from '@/repositories/contracts/health-event.repository';
import type {
  InsightRepository,
  AddInsightInput,
} from '@/repositories/contracts/insight.repository';
import type { DailyCheckin, DailyScore, HealthEvent, Insight } from '@/repositories/contracts/schemas';
import { RepositoryError } from '@/repositories/contracts/errors';

const notImpl = (name: string): never => {
  throw new RepositoryError('internal_error', `${name} not implemented (no backend yet)`);
};

export class ApiDailyCheckinRepository implements DailyCheckinRepository {
  async forDate(_p: string, _d: string): Promise<DailyCheckin | null> { return notImpl('ApiDailyCheckinRepository'); }
  async startOrResume(_p: string, _d: string): Promise<DailyCheckin> { return notImpl('ApiDailyCheckinRepository'); }
  async update(_id: string, _patch: CheckinPatch, _c: string): Promise<DailyCheckin> { return notImpl('ApiDailyCheckinRepository'); }
  async complete(_id: string, _s: string, _c: string): Promise<DailyCheckin> { return notImpl('ApiDailyCheckinRepository'); }
  async list(_p: string): Promise<DailyCheckin[]> { return notImpl('ApiDailyCheckinRepository'); }
}

export class ApiDailyScoreRepository implements DailyScoreRepository {
  async forDate(_p: string, _d: string): Promise<DailyScore | null> { return notImpl('ApiDailyScoreRepository'); }
  async save(_i: SaveScoreInput, _c: string): Promise<DailyScore> { return notImpl('ApiDailyScoreRepository'); }
  async list(_p: string): Promise<DailyScore[]> { return notImpl('ApiDailyScoreRepository'); }
}

export class ApiHealthEventRepository implements HealthEventRepository {
  async list(_p: string): Promise<HealthEvent[]> { return notImpl('ApiHealthEventRepository'); }
  async add(_i: AddHealthEventInput, _c: string): Promise<HealthEvent> { return notImpl('ApiHealthEventRepository'); }
  async correct(_id: string, _patch: HealthEventPatch, _c: string): Promise<HealthEvent> { return notImpl('ApiHealthEventRepository'); }
  async remove(_id: string, _c: string): Promise<void> { return notImpl('ApiHealthEventRepository'); }
}

export class ApiInsightRepository implements InsightRepository {
  async list(_p: string, _o?: { includeDismissed?: boolean }): Promise<Insight[]> { return notImpl('ApiInsightRepository'); }
  async add(_i: AddInsightInput, _c: string): Promise<Insight> { return notImpl('ApiInsightRepository'); }
  async dismiss(_id: string, _c: string): Promise<Insight> { return notImpl('ApiInsightRepository'); }
}
