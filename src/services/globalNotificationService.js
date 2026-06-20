let handler = null;

export const globalNotificationService = {
  setNotificationHandler(nextHandler) {
    handler = nextHandler;
  },

  showNotification(message, type = "info") {
    handler?.showNotification?.(message, type);
  },

  notifySuccess(message) {
    handler?.success?.(message);
  },

  notifyError(message) {
    handler?.error?.(message);
  },

  notifyWarning(message) {
    handler?.warning?.(message);
  },

  notifyInfo(message) {
    handler?.info?.(message);
  },

  removeNotification(id) {
    handler?.removeNotification?.(id);
  },
};

export default globalNotificationService;
