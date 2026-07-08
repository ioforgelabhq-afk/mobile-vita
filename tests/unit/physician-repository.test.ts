/**
 * T010 [US1] — PhysicianRepository CRUD: name-only add, update, soft-delete remove, no
 * uniqueness enforced (FR-001–004).
 */
import { memoryStore } from '@/lib/storage/store';
import { Physician } from '@/repositories/contracts/schemas';
import { MockPhysicianRepository } from '@/repositories/mock/physician.repository';
import { uuid } from '@/lib/ids';

const PATIENT = 'local-patient';

function build() {
  return new MockPhysicianRepository(memoryStore<Physician>());
}

it('adds a physician with only a name (FR-001)', async () => {
  const repo = build();
  const p = await repo.add({ patientId: PATIENT, name: 'Dra. García' }, uuid());
  expect(p.name).toBe('Dra. García');
  expect(p.specialty).toBeNull();
  expect(await repo.list(PATIENT)).toHaveLength(1);
});

it('lists all saved physicians (FR-002)', async () => {
  const repo = build();
  await repo.add({ patientId: PATIENT, name: 'Dr. A' }, uuid());
  await repo.add({ patientId: PATIENT, name: 'Dr. B' }, uuid());
  expect(await repo.list(PATIENT)).toHaveLength(2);
});

it('updates a physician (FR-003)', async () => {
  const repo = build();
  const p = await repo.add({ patientId: PATIENT, name: 'Dr. A' }, uuid());
  const updated = await repo.update(p.id, { specialty: 'cardiología' }, uuid());
  expect(updated.specialty).toBe('cardiología');
  expect(updated.name).toBe('Dr. A');
});

it('removes a physician (soft delete, FR-004)', async () => {
  const repo = build();
  const p = await repo.add({ patientId: PATIENT, name: 'Dr. A' }, uuid());
  await repo.remove(p.id, uuid());
  expect(await repo.list(PATIENT)).toHaveLength(0);
});

it('allows duplicate names (no uniqueness enforced)', async () => {
  const repo = build();
  await repo.add({ patientId: PATIENT, name: 'Dr. Pérez' }, uuid());
  await repo.add({ patientId: PATIENT, name: 'Dr. Pérez' }, uuid());
  expect(await repo.list(PATIENT)).toHaveLength(2);
});

it('is idempotent per clientMutationId on add', async () => {
  const repo = build();
  const cmid = uuid();
  const first = await repo.add({ patientId: PATIENT, name: 'Dr. A' }, cmid);
  const replay = await repo.add({ patientId: PATIENT, name: 'Dr. B' }, cmid);
  expect(replay.id).toBe(first.id);
  expect(await repo.list(PATIENT)).toHaveLength(1);
});
