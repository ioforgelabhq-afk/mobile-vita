import { Text, View } from 'react-native';
import { Card } from '@/ui';
import { EmptyState } from '@/features/living-record/components/EmptyState';
import type { BriefingDocument as BriefingDocumentModel } from '@/services/briefing/types';

/**
 * Renders a generated briefing: disclaimer banner first and always visible (FR-009/Principle
 * III — never diagnostic), then each section, then an empty-state when there's nothing in scope
 * (FR-010) instead of a blank document.
 */
export function BriefingDocument({ doc }: { doc: BriefingDocumentModel }) {
  return (
    <View className="gap-3">
      <Card className="bg-surface-2 border-secondary">
        <Text className="font-sans text-xs text-ink-2">{doc.disclaimer}</Text>
      </Card>

      {doc.isEmpty ? (
        <EmptyState
          title="No hay información para este resumen"
          body="Ajusta el rango de fechas o las categorías, o vuelve más tarde cuando tengas más registros."
        />
      ) : (
        doc.sections.map((section) =>
          section.items.length === 0 ? null : (
            <Card key={section.title} className="gap-2">
              <Text className="font-sans text-base font-semibold text-ink">{section.title}</Text>
              {section.items.map((item, i) => (
                <Text key={i} className="font-sans text-sm text-ink-2">
                  · {item}
                </Text>
              ))}
            </Card>
          ),
        )
      )}

      <Text className="font-mono text-[10px] text-ink-3">
        Generado {new Date(doc.generatedAt).toLocaleString('es-MX')}
      </Text>
    </View>
  );
}
