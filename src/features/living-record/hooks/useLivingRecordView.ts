import { useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { authRepository } from '@/repositories';
import {
  loadItems,
  loadDailyHistory,
  filterItems,
  correctItem,
  removeItem,
  exportAll,
} from '@/services/living-record-view';
import type { RecordItemPatch } from '@/services/living-record-view';
import type { RecordItem } from '@/services/living-record-view/types';
import type { DateRange } from '@/features/living-record/components/DateRangeFilter';
import { uuid } from '@/lib/ids';

/**
 * Drives the Living Record view: loads the unified item list + daily history via TanStack Query,
 * applies client-side category/date filters (FR-011/012/013), and exposes correct/remove/export
 * actions that dispatch through the aggregation service (never a repository directly).
 */
export function useLivingRecordView() {
  const qc = useQueryClient();
  const [category, setCategory] = useState<string | null>(null);
  const [range, setRange] = useState<DateRange>({});

  const { data: patientId } = useQuery({
    queryKey: ['patientId'],
    queryFn: async () => (await authRepository().getOrCreateLocalIdentity()).id,
  });

  const { data: items = [] } = useQuery({
    queryKey: ['living-record-items', patientId],
    queryFn: () => loadItems(patientId!),
    enabled: !!patientId,
  });

  const { data: history = [] } = useQuery({
    queryKey: ['living-record-history', patientId],
    queryFn: () => loadDailyHistory(patientId!),
    enabled: !!patientId,
  });

  const categories = useMemo(
    () => Array.from(new Set(items.map((i) => i.category))).sort(),
    [items],
  );

  const filtered = useMemo(
    () => filterItems(items, { category: category ?? undefined, ...range }),
    [items, category, range],
  );

  const invalidate = () => {
    void qc.invalidateQueries({ queryKey: ['living-record-items', patientId] });
    void qc.invalidateQueries({ queryKey: ['living-record-history', patientId] });
  };

  const correct = async (item: RecordItem, patch: RecordItemPatch) => {
    await correctItem(item, patch, uuid());
    invalidate();
  };

  const remove = async (item: RecordItem) => {
    await removeItem(item, uuid());
    invalidate();
  };

  const doExport = async () => {
    if (!patientId) return null;
    return exportAll(patientId);
  };

  return {
    items: filtered,
    allItemsEmpty: items.length === 0,
    filteredEmpty: items.length > 0 && filtered.length === 0,
    categories,
    category,
    setCategory,
    range,
    setRange,
    history,
    correct,
    remove,
    doExport,
  };
}
