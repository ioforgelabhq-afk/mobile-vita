/**
 * ID + clock helpers. Kept tiny and runtime-agnostic (works in RN and node/tests).
 * A future native build can swap uuid() for expo-crypto's randomUUID.
 */
export function uuid(): string {
  // RFC4122-ish v4 using Math.random — adequate for local client ids / clientMutationId.
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function nowIso(): string {
  return new Date().toISOString();
}
