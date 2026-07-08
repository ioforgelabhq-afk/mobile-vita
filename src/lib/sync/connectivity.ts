/**
 * Connectivity state for offline-first behavior (Constitution Principle VIII).
 *
 * The core onboarding flow works fully offline against local storage, so this is only consulted
 * by features that genuinely need the network (account link, draining the sync queue). It
 * exposes a simple observable online/offline flag and a helper for graceful-degradation copy
 * (FR-022). A native build wires this to @react-native-community/netinfo; the default assumes
 * online and lets callers set state.
 */
type Listener = (online: boolean) => void;

class Connectivity {
  private online = true;
  private readonly listeners = new Set<Listener>();

  isOnline(): boolean {
    return this.online;
  }

  set(online: boolean): void {
    if (online === this.online) return;
    this.online = online;
    for (const l of this.listeners) l(online);
  }

  subscribe(l: Listener): () => void {
    this.listeners.add(l);
    return () => this.listeners.delete(l);
  }

  /** Graceful-degradation message for a feature that needs connectivity (FR-022). */
  offlineNotice(feature: string): string {
    return `${feature} estará disponible cuando te reconectes. Tu información se guardó en tu dispositivo.`;
  }
}

export const connectivity = new Connectivity();
