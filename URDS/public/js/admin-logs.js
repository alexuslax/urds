// admin-logs.js
(() => {
  "use strict";

  const STORAGE_KEY = "logs";

  const TYPE_META = {
    "User Accounts": {
      icon: "👤",
      iconClass: "bg-blue-50 text-blue-600",
      badgeClass: "bg-blue-50 text-blue-700"
    },
    "System Changes": {
      icon: "🏛️",
      iconClass: "bg-emerald-50 text-emerald-600",
      badgeClass: "bg-emerald-50 text-emerald-700"
    },
    Permissions: {
      icon: "🔐",
      iconClass: "bg-orange-50 text-orange-600",
      badgeClass: "bg-orange-50 text-orange-700"
    },
    Proposals: {
      icon: "📄",
      iconClass: "bg-purple-50 text-purple-600",
      badgeClass: "bg-purple-50 text-purple-700"
    },
    Default: {
      icon: "📋",
      iconClass: "bg-gray-100 text-gray-600",
      badgeClass: "bg-gray-100 text-gray-700"
    }
  };

  const sampleLogs = [
    {
      id: Date.now() - 1000 * 60 * 60 * 2,
      title: "New user added: Dr. Santos",
      detail: "A new user account was created by the administrator.",
      user: "Administrator",
      type: "User Accounts",
      date: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString()
    },
    {
      id: Date.now() - 1000 * 60 * 60 * 5,
      title: "College of Engineering dean updated",
      detail: "College information was modified in the administration panel.",
      user: "Admin User",
      type: "System Changes",
      date: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString()
    },
    {
      id: Date.now() - 1000 * 60 * 60 * 24,
      title: "Proposal reviewed and forwarded to URDS",
      detail: "A research proposal was reviewed and moved to the next routing stage.",
      user: "CRC Officer",
      type: "Proposals",
      date: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString()
    },
    {
      id: Date.now() - 1000 * 60 * 60 * 48,
      title: "User permissions updated for Evaluator role",
      detail: "Access permissions were modified for evaluator accounts.",
      user: "Administrator",
      type: "Permissions",
      date: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString()
    }
  ];

  function qs(id) {
    return document.getElementById(id);
  }

  function escapeHtml(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function safeNumber(value) {
    const number = Number(value);
    return Number.isFinite(number) ? number : 0;
  }

  function normalizeText(value) {
    return String(value || "")
      .toLowerCase()
      .replace(/\s+/g, " ")
      .trim();
  }

  function loadLogs() {
    try {
      const logs = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
      return Array.isArray(logs) ? logs : [];
    } catch (error) {
      console.error("Failed to load logs:", error);
      return [];
    }
  }

  function saveLogs(logs) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(logs));
  }

  function getLogs() {
    const logs = loadLogs();

    if (logs.length) {
      return logs;
    }

    saveLogs(sampleLogs);
    return sampleLogs;
  }

  function getLogDate(log) {
    const value =
      log.date ||
      log.created_at ||
      log.createdAt ||
      log.timestamp ||
      log.time ||
      log.id;

    if (!value) return null;

    const date = typeof value === "number" ? new Date(value) : new Date(value);

    return Number.isNaN(date.getTime()) ? null : date;
  }

  function formatDateTime(log) {
    const date = getLogDate(log);

    if (!date) {
      return log.date || "Unknown date";
    }

    return date.toLocaleString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit"
    });
  }

  function formatRelativeTime(log) {
    const date = getLogDate(log);

    if (!date) {
      return log.date || "Unknown date";
    }

    const now = new Date();
    const diffMs = date.getTime() - now.getTime();
    const diffSeconds = Math.round(diffMs / 1000);
    const diffMinutes = Math.round(diffSeconds / 60);
    const diffHours = Math.round(diffMinutes / 60);
    const diffDays = Math.round(diffHours / 24);

    const formatter = new Intl.RelativeTimeFormat(undefined, {
      numeric: "auto"
    });

    if (Math.abs(diffSeconds) < 60) {
      return formatter.format(diffSeconds, "second");
    }

    if (Math.abs(diffMinutes) < 60) {
      return formatter.format(diffMinutes, "minute");
    }

    if (Math.abs(diffHours) < 24) {
      return formatter.format(diffHours, "hour");
    }

    if (Math.abs(diffDays) < 30) {
      return formatter.format(diffDays, "day");
    }

    return formatDateTime(log);
  }

  function isToday(date) {
    const now = new Date();

    return (
      date &&
      date.getFullYear() === now.getFullYear() &&
      date.getMonth() === now.getMonth() &&
      date.getDate() === now.getDate()
    );
  }

  function isThisWeek(date) {
    if (!date) return false;

    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = diffMs / (1000 * 60 * 60 * 24);

    return diffDays >= 0 && diffDays <= 7;
  }

  function isThisMonth(date) {
    const now = new Date();

    return (
      date &&
      date.getFullYear() === now.getFullYear() &&
      date.getMonth() === now.getMonth()
    );
  }

  function matchesDateFilter(log, filterValue) {
    if (!filterValue) return true;

    const date = getLogDate(log);

    if (filterValue === "today") {
      return isToday(date);
    }

    if (filterValue === "week") {
      return isThisWeek(date);
    }

    if (filterValue === "month") {
      return isThisMonth(date);
    }

    return true;
  }

  function getTypeMeta(type) {
    return TYPE_META[type] || TYPE_META.Default;
  }

  function getFilteredLogs() {
    const searchInput = qs("search") || qs("logSearch");
    const typeFilter = qs("typeFilter") || qs("logFilter");
    const dateFilter = qs("dateFilter");

    const query = normalizeText(searchInput?.value || "");
    const selectedType = typeFilter?.value || "";
    const selectedDate = dateFilter?.value || "";

    return getLogs()
      .slice()
      .sort((a, b) => {
        const dateA = getLogDate(a);
        const dateB = getLogDate(b);

        return safeNumber(dateB?.getTime()) - safeNumber(dateA?.getTime());
      })
      .filter((log) => {
        const type = log.type || "System Changes";

        if (selectedType && type !== selectedType) {
          return false;
        }

        if (!matchesDateFilter(log, selectedDate)) {
          return false;
        }

        if (!query) {
          return true;
        }

        const searchableText = normalizeText(
          [
            log.title,
            log.detail,
            log.user,
            log.type,
            log.date,
            log.created_at
          ].join(" ")
        );

        return searchableText.includes(query);
      });
  }

  function createLogCard(log) {
    const type = log.type || "System Changes";
    const meta = getTypeMeta(type);

    return `
      <article class="log-item p-5 hover:bg-gray-50 transition" data-type="${escapeHtml(type)}">
        <div class="flex items-start gap-4">
          <div class="w-11 h-11 rounded-2xl ${meta.iconClass} flex items-center justify-center text-xl shrink-0">
            ${meta.icon}
          </div>

          <div class="flex-1 min-w-0">
            <div class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
              <div class="min-w-0">
                <h4 class="font-semibold text-gray-900">
                  ${escapeHtml(log.title || "Untitled Log")}
                </h4>

                ${
                  log.detail
                    ? `
                      <p class="text-sm text-gray-500 mt-1">
                        ${escapeHtml(log.detail)}
                      </p>
                    `
                    : ""
                }
              </div>

              <span class="inline-flex w-fit items-center px-3 py-1 rounded-full ${meta.badgeClass} text-xs font-bold shrink-0">
                ${escapeHtml(type)}
              </span>
            </div>

            <div class="flex flex-wrap items-center gap-2 text-xs text-gray-400 mt-3">
              <span>${escapeHtml(log.user || "System")}</span>
              <span>•</span>
              <span title="${escapeHtml(formatDateTime(log))}">
                ${escapeHtml(formatRelativeTime(log))}
              </span>
            </div>
          </div>
        </div>
      </article>
    `;
  }

  function renderCounts(allLogs, filteredLogs) {
    const totalLogsCount = qs("totalLogsCount");
    const todayLogsCount = qs("todayLogsCount");
    const logCount = qs("logCount");

    const todayCount = allLogs.filter((log) => isToday(getLogDate(log))).length;

    if (totalLogsCount) {
      totalLogsCount.textContent = allLogs.length.toLocaleString();
    }

    if (todayLogsCount) {
      todayLogsCount.textContent = todayCount.toLocaleString();
    }

    if (logCount) {
      logCount.textContent = `${filteredLogs.length.toLocaleString()} of ${allLogs.length.toLocaleString()} logs shown`;
    }
  }

  function renderLogs() {
    const logList = qs("logList") || qs("logsList");
    const emptyLogs = qs("emptyLogs");

    if (!logList) return;

    const allLogs = getLogs();
    const filteredLogs = getFilteredLogs();

    renderCounts(allLogs, filteredLogs);

    if (!filteredLogs.length) {
      logList.innerHTML = "";

      if (emptyLogs) {
        emptyLogs.classList.remove("hidden");
      } else {
        logList.innerHTML = `
          <div class="p-10 text-center text-sm text-gray-500">
            No logs found.
          </div>
        `;
      }

      return;
    }

    if (emptyLogs) {
      emptyLogs.classList.add("hidden");
    }

    logList.innerHTML = filteredLogs.map(createLogCard).join("");
  }

  function clearFilters() {
    const searchInput = qs("search") || qs("logSearch");
    const typeFilter = qs("typeFilter") || qs("logFilter");
    const dateFilter = qs("dateFilter");

    if (searchInput) searchInput.value = "";
    if (typeFilter) typeFilter.value = "";
    if (dateFilter) dateFilter.value = "";

    renderLogs();
  }

  function bindEvents() {
    const searchInput = qs("search") || qs("logSearch");
    const typeFilter = qs("typeFilter") || qs("logFilter");
    const dateFilter = qs("dateFilter");
    const clearFiltersBtn = qs("clearFilters");

    if (searchInput) {
      searchInput.addEventListener("input", renderLogs);
    }

    if (typeFilter) {
      typeFilter.addEventListener("change", renderLogs);
    }

    if (dateFilter) {
      dateFilter.addEventListener("change", renderLogs);
    }

    if (clearFiltersBtn) {
      clearFiltersBtn.addEventListener("click", clearFilters);
    }
  }

  function init() {
    bindEvents();
    renderLogs();
  }

  document.addEventListener("DOMContentLoaded", init);

  window.URDSLogs = {
    add(log) {
      const logs = loadLogs();

      logs.push({
        id: Date.now(),
        date: new Date().toISOString(),
        user: "System",
        type: "System Changes",
        title: "New system log",
        detail: "",
        ...log
      });

      saveLogs(logs);
      renderLogs();
    },

    clear() {
      saveLogs([]);
      renderLogs();
    },

    all() {
      return getLogs();
    }
  };
})();