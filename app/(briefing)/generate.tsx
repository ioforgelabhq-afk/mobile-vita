import { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { Screen, Button, Mark } from '@/ui';
import { ConsentGate } from '@/features/briefing/components/ConsentGate';
import { BriefingDocument } from '@/features/briefing/components/BriefingDocument';
import { CategoryExclude } from '@/features/briefing/components/CategoryExclude';
import { DateRangeFilter, type DateRange } from '@/features/living-record/components/DateRangeFilter';
import { useBriefing } from '@/features/briefing/hooks/useBriefing';
import { EntryCategory, HealthEventType } from '@/repositories/contracts/schemas';

const ALL_CATEGORIES = [...EntryCategory.options, ...HealthEventType.options];

/** Generate an informational briefing to share with a physician (US2/US3/US4). */
export default function GenerateBriefingScreen() {
  const { consented, grantConsent, doc, generating, run } = useBriefing();
  const [range, setRange] = useState<DateRange>({});
  const [excluded, setExcluded] = useState<string[]>([]);

  const toggleCategory = (category: string) =>
    setExcluded((prev) => (prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category]));

  return (
    <Screen>
      <View className="py-3 flex-row items-center justify-between">
        <Mark size={20} />
        <Text className="font-mono text-xs text-ink-3">Resumen</Text>
      </View>
      <ScrollView contentContainerClassName="py-2 gap-3">
        <Text className="font-sans text-2xl font-bold text-ink">Resumen para tu médico</Text>

        {!consented ? (
          <ConsentGate onGrant={() => void grantConsent()} />
        ) : (
          <>
            <Text className="font-mono text-[10px] uppercase text-ink-3">Rango de fechas</Text>
            <DateRangeFilter active={range} onSelect={setRange} />

            <Text className="font-mono text-[10px] uppercase text-ink-3">
              Toca para excluir del resumen
            </Text>
            <CategoryExclude categories={ALL_CATEGORIES} excluded={excluded} onToggle={toggleCategory} />

            <Button
              label={generating ? 'Generando…' : 'Generar resumen'}
              onPress={() => void run({ ...range, excludedCategories: excluded })}
              disabled={generating}
            />

            {doc ? <BriefingDocument doc={doc} /> : null}
          </>
        )}
      </ScrollView>
    </Screen>
  );
}
