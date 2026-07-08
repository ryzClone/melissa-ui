const STORE_KEY = "__MELISA_TOAST_STORE__";
const MAX_TOASTS = 5;
export const AUTO_DISMISS_MS = 3000;
export const EXIT_ANIMATION_MS = 240;

function createStoreState() {
  return {
    notifications: [],
    listeners: new Set(),
    autoDismissTimers: new Map(),
    exitTimers: new Map(),
  };
}

function getStore() {
  if (typeof globalThis !== "undefined") {
    if (!globalThis[STORE_KEY]) {
      globalThis[STORE_KEY] = createStoreState();
    }
    return globalThis[STORE_KEY];
  }

  return createStoreState();
}

const notifyListeners = () => {
  const store = getStore();
  store.listeners.forEach((listener) => listener());
};

export function getToastSnapshot() {
  return getStore().notifications;
}

export function subscribeToasts(onStoreChange) {
  const store = getStore();
  store.listeners.add(onStoreChange);

  return () => {
    store.listeners.delete(onStoreChange);
  };
}

export function pushToast(message, type = "info") {
  if (!message) return;

  const store = getStore();
  const id = `${Date.now()}-${Math.random()}`;

  store.notifications = [
    ...store.notifications,
    { id, message, type, exiting: false },
  ];

  if (store.notifications.length > MAX_TOASTS) {
    const removed = store.notifications.slice(0, store.notifications.length - MAX_TOASTS);
    removed.forEach((item) => {
      clearTimeout(store.autoDismissTimers.get(item.id));
      store.autoDismissTimers.delete(item.id);
    });
    store.notifications = store.notifications.slice(-MAX_TOASTS);
  }

  notifyListeners();

  const timer = setTimeout(() => {
    removeToast(id);
  }, AUTO_DISMISS_MS);

  store.autoDismissTimers.set(id, timer);
}

export function removeToast(id) {
  const store = getStore();

  clearTimeout(store.autoDismissTimers.get(id));
  store.autoDismissTimers.delete(id);

  if (!store.notifications.some((item) => item.id === id)) return;

  store.notifications = store.notifications.map((item) =>
    item.id === id ? { ...item, exiting: true } : item
  );
  notifyListeners();

  const exitTimer = setTimeout(() => {
    store.notifications = store.notifications.filter((item) => item.id !== id);
    store.exitTimers.delete(id);
    notifyListeners();
  }, EXIT_ANIMATION_MS);

  store.exitTimers.set(id, exitTimer);
}

export function addNotification(input, messageArg) {
  if (input && typeof input === "object") {
    pushToast(input.message, input.type || "info");
    return;
  }

  if (messageArg !== undefined) {
    pushToast(messageArg, input || "info");
    return;
  }

  pushToast(input, "info");
}
