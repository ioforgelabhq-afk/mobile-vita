import { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen, Button, Mark } from '@/ui';
import { EmptyState } from '@/features/living-record/components/EmptyState';
import { RecordItemCard } from '@/features/living-record/components/RecordItemCard';
import { DailyHistoryRow } from '@/features/living-record/components/DailyHistoryRow';
import { CategoryFilter } from '@/features/living-record/components/CategoryFilter';
import { DateRangeFilter } from '@/features/living-record/components/DateRangeFilter';
import { useLivingRecordView } from '@/features/living-record/hooks/useLivingRecordView';
import type { LivingRecordFullExport } from '@/services/living-record-view/types';

/**
 * The Living Record view (Pillar 3): unified browsing of entries + health events (US1), daily
 * score history (US2), correct/remove from one place (US3), and filter + export (US4).
 */
export default function LivingRecordScreen() {
  const router = useRouter();
  const {
    items,
    allItemsEmpty,
    filteredEmpty,
    categories,
    category,
    setCategory,
    range,
    setRange,
    history,
    correct,
    remove,
    doExport,
  } = useLivingRecordView();
  const [exportSummary, setExportSummary] = useState<LivingRecordFullExport | null>(null);

  const handleExport = async () => {
    const result = await doExport();
    setExportSummary(result);
  };

  return (
    <Screen>
      <View className="py-3">
        <Mark size={20} />
      </View>
      <ScrollView contentContainerClassName="py-2 gap-4">
        <Text className="font-sans text-2xl font-bold text-ink">Tu Registro Vivo</Text>

        <Button
          label="Preparar resumen para tu médico"
          variant="outline"
          onPress={() => router.push('/(briefing)/physicians')}
        />

        {history.length > 0 ? (
          <View className="gap-1">
            <Text className="font-mono text-xs uppercase text-ink-3">Historial diario</Text>
            {history.map((p) => (
              <DailyHistoryRow key={p.date} point={p} />
            ))}
            <Text className="font-sans text-xs text-ink-3 mt-1">
              Indicador de bienestar informativo, no un diagnóstico.
            </Text>
          </View>
        ) : null}

        {allItemsEmpty ? (
          <EmptyState
            title="Aún no hay mucho aquí"
            body="A medida que converses con VITA, tu registro irá creciendo."
          />
        ) : (
          <>
            <CategoryFilter categories={categories} selected={category} onSelect={setCategory} />
            <DateRangeFilter active={range} onSelect={setRange} />

            {filteredEmpty ? (
              <EmptyState title="Nada por aquí" body="No hay elementos que coincidan con este filtro." />
            ) : (
              <View className="gap-3">
                {items.map((item) => (
                  <RecordItemCard
                    key={`${item.kind}-${item.id}`}
                    item={item}
                    onCorrect={(content) => void correct(item, { content })}
                    onRemove={() => void remove(item)}
                  />
                ))}
              </View>
            )}

            <Button label="Exportar mi registro" variant="outline" onPress={() => void handleExport()} />
            {exportSummary ? (
              <Text className="font-sans text-xs text-ink-3 text-center">
                Listo: {exportSummary.entries.length} entradas · {exportSummary.healthEvents.length}{' '}
                eventos · {exportSummary.dailyCheckins.length} registros diarios ·{' '}
                {exportSummary.dailyScores.length} indicadores
              </Text>
            ) : null}
          </>
        )}
      </ScrollView>
    </Screen>
  );
}
