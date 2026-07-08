import {
  showError,
  showInfo,
  showNotification,
  showSuccess,
  showWarning,
  resolveToastMessage,
} from "@/services/notificationI18n";

export {
  showError,
  showInfo,
  showNotification,
  showSuccess,
  showWarning,
  resolveToastMessage,
};

export const globalNotificationService = {
  showNotification(message, type = "info", options) {
    showNotification(message, type, options);
  },

  notifySuccess(message, options) {
    showSuccess(message, options);
  },

  notifyError(message, options) {
    showError(message, options);
  },

  notifyWarning(message, options) {
    showWarning(message, options);
  },

  notifyInfo(message, options) {
    showInfo(message, options);
  },

  showSuccess,
  showError,
  showWarning,
  showInfo,
};

export default globalNotificationService;
