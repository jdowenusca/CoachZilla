export function qs(selector, scope = document) {
  return scope.querySelector(selector);
}

export function qsa(selector, scope = document) {
  return Array.from(scope.querySelectorAll(selector));
}

export function escapeHtml(value = "") {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function setMessage(element, message, isError = false) {
  if (!element) return;
  element.textContent = message;
  element.style.color = isError ? "#b42318" : "#1d4ed8";
}

export function clearMessage(element) {
  if (!element) return;
  element.textContent = "";
}

export function formatHoursToMinutes(hours = 0) {
  const totalMinutes = Math.round(Number(hours || 0) * 60);
  if (totalMinutes <= 0) return "0 minutes";
  if (totalMinutes < 60) return `${totalMinutes} minute${totalMinutes === 1 ? "" : "s"}`;
  const wholeHours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (minutes === 0) return `${wholeHours} hour${wholeHours === 1 ? "" : "s"}`;
  return `${wholeHours}h ${minutes}m`;
}

export function getPageName() {
  const fileName = window.location.pathname.split("/").pop();
  return fileName || "index.html";
}

export function navigateTo(pageName) {
  window.location.href = pageName;
}

export function readJson(key, fallback = []) {
  try {
    const rawValue = localStorage.getItem(key);
    return rawValue ? JSON.parse(rawValue) : fallback;
  } catch (error) {
    console.error(`Failed to read localStorage key: ${key}`, error);
    return fallback;
  }
}

export function writeJson(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}
