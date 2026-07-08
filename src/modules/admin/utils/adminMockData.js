import {
  MOCK_ANNOUNCEMENTS,
  MOCK_IMPORTANT_MESSAGES,
} from "@/modules/dashboard/utils/dashboardHomeData";

const PRIORITY_BY_TONE = {
  warning: "Yuqori",
  alert: "Yuqori",
  feature: "O‘rta",
  internal: "O‘rta",
};

function createNewsSeed() {
  return MOCK_ANNOUNCEMENTS.map((item) => ({
    id: item.id,
    title: item.title,
    shortDescription: item.shortDescription,
    fullDescription: item.fullDescription,
    status: item.status,
    image: item.image,
    createdAt: item.date,
  }));
}

function createMessagesSeed() {
  return MOCK_IMPORTANT_MESSAGES.map((item) => ({
    id: item.id,
    title: item.title,
    content: item.description,
    priority: PRIORITY_BY_TONE[item.tone] || "O‘rta",
    status: "Faol",
    createdAt: item.date,
  }));
}

export function getInitialAdminNews() {
  return createNewsSeed();
}

export function getInitialAdminMessages() {
  return createMessagesSeed();
}

export function createEmptyNews() {
  return {
    title: "",
    shortDescription: "",
    fullDescription: "",
    status: "Yangi",
    image: "",
  };
}

export function createEmptyMessage() {
  return {
    title: "",
    content: "",
    priority: "O‘rta",
    status: "Faol",
  };
}

export function getNextId(items = []) {
  const maxId = items.reduce(
    (max, item) => Math.max(max, Number(item.id) || 0),
    0
  );
  return maxId + 1;
}

export function formatCreatedDate(date = new Date()) {
  const value = date instanceof Date ? date : new Date(date);
  if (Number.isNaN(value.getTime())) return "—";

  return new Intl.DateTimeFormat("uz-UZ", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(value);
}
