type Listener = () => void;

const listeners = new Map<string, Set<Listener>>();

export const appEvents = {
  emit(event: string) {
    listeners.get(event)?.forEach((fn) => fn());
  },

  on(event: string, fn: Listener) {
    if (!listeners.has(event)) listeners.set(event, new Set());
    listeners.get(event)!.add(fn);
    return () => { listeners.get(event)?.delete(fn); };
  },
};

// Event names
export const DATA_CHANGED = 'data:changed';
