import { useQuery, useQueryClient } from '@tanstack/react-query';
import { authRepository, physicianRepository } from '@/repositories';
import type { PhysicianFormValues } from '@/features/briefing/components/PhysicianForm';
import { uuid } from '@/lib/ids';

/** List/add/update/remove physician contacts via the registry (never a concrete impl). */
export function usePhysicians() {
  const qc = useQueryClient();

  const { data: patientId } = useQuery({
    queryKey: ['patientId'],
    queryFn: async () => (await authRepository().getOrCreateLocalIdentity()).id,
  });

  const { data: physicians = [] } = useQuery({
    queryKey: ['physicians', patientId],
    queryFn: () => physicianRepository().list(patientId!),
    enabled: !!patientId,
  });

  const invalidate = () => void qc.invalidateQueries({ queryKey: ['physicians', patientId] });

  const toPatch = (v: PhysicianFormValues) => ({
    name: v.name.trim(),
    specialty: v.specialty.trim() || undefined,
    organization: v.organization.trim() || undefined,
    phone: v.phone.trim() || undefined,
    email: v.email.trim() || undefined,
    notes: v.notes.trim() || undefined,
  });

  const add = async (values: PhysicianFormValues) => {
    if (!patientId) return;
    await physicianRepository().add({ patientId, ...toPatch(values) }, uuid());
    invalidate();
  };

  const update = async (physicianId: string, values: PhysicianFormValues) => {
    await physicianRepository().update(physicianId, toPatch(values), uuid());
    invalidate();
  };

  const remove = async (physicianId: string) => {
    await physicianRepository().remove(physicianId, uuid());
    invalidate();
  };

  return { physicians, add, update, remove };
}
